import express from 'express';
import { exec, spawn } from 'child_process';
import os from 'os';
import http from 'http';
import { WebSocketServer } from 'ws';

// ─── Cloudflare Quick Tunnel ───────────────────────────────────────────────
let tunnelUrl = null;

function startCloudflaredTunnel() {
    // En Windows, cloudflared instalado via npm es un .cmd — shell:true lo resuelve
    const isWin = process.platform === 'win32';
    const proc = spawn('cloudflared', ['tunnel', '--url', 'http://localhost:5173'], {
        stdio: ['ignore', 'pipe', 'pipe'],
        shell: isWin,
    });

    const parseUrl = (data) => {
        const text = data.toString();
        const match = text.match(/https:\/\/[a-z0-9-]+\.trycloudflare\.com/);
        if (match && !tunnelUrl) {
            tunnelUrl = match[0];
            console.log(`\n  ✅ Tunnel HTTPS listo: ${tunnelUrl}`);
            console.log(`  👉 Escanea el QR desde tu iPhone con esta URL HTTPS\n`);
        }
    };

    proc.stdout.on('data', parseUrl);
    proc.stderr.on('data', parseUrl);
    proc.on('error', () => console.log('  [Tunnel] cloudflared no encontrado, continuando sin HTTPS externo.'));
    proc.on('close', () => { tunnelUrl = null; });
}

const app = express();
const PORT = 3001;

function getLocalNetwork() {
    const interfaces = os.networkInterfaces();
    for (const iface of Object.values(interfaces)) {
        for (const config of iface) {
            if (config.family === 'IPv4' && !config.internal) {
                const parts = config.address.split('.');
                return { subnet: `${parts[0]}.${parts[1]}.${parts[2]}`, myIp: config.address };
            }
        }
    }
    return { subnet: '192.168.1', myIp: null };
}

function readArpTable() {
    return new Promise(resolve => {
        exec('arp -a', (err, stdout) => {
            if (err) { resolve([]); return; }
            const devices = [];
            const lines = stdout.split('\n');
            for (const line of lines) {
                const match = line.match(/(\d{1,3}\.\d{1,3}\.\d{1,3}\.\d{1,3})\s+([\w-]+)\s+(dynamic)/i);
                if (match) {
                    const ip = match[1];
                    const mac = match[2];
                    if (!ip.endsWith('.255') && !ip.startsWith('224.') && !ip.startsWith('239.')) {
                        devices.push({ ip, mac });
                    }
                }
            }
            resolve(devices);
        });
    });
}

function pingSubnet(subnet) {
    return new Promise(resolve => {
        const ips = Array.from({ length: 254 }, (_, i) => `${subnet}.${i + 1}`);
        const batchSize = 40;
        const batches = [];
        for (let i = 0; i < ips.length; i += batchSize) batches.push(ips.slice(i, i + batchSize));
        const runAll = async () => {
            for (const batch of batches) {
                await Promise.all(batch.map(ip => new Promise(r => exec(`ping -n 1 -w 200 ${ip}`, () => r()))));
            }
            resolve();
        };
        runAll();
    });
}

function getMacVendor(mac) {
    if (!mac) return 'Desconocido';
    const prefix = mac.replace(/-/g, ':').toUpperCase().slice(0, 8);
    const vendors = {
        'B8:27:EB': 'Raspberry Pi', 'DC:A6:32': 'Raspberry Pi', 'E4:5F:01': 'Raspberry Pi',
        'D8:3A:DD': 'Espressif (IoT)', '00:0C:E7': 'Axis Camara', '00:40:8C': 'Axis Camara',
        'AC:CC:8E': 'Xiaomi', '64:09:80': 'Xiaomi', '00:9E:C8': 'Xiaomi',
        '94:65:2D': 'Samsung', '8C:77:12': 'Samsung', 'A0:75:91': 'Samsung',
        '40:4E:36': 'Apple', '3C:22:FB': 'Apple', 'F4:F1:5A': 'Apple',
        '00:1B:63': 'Apple', '18:65:90': 'Apple',
    };
    return vendors[prefix] || 'Dispositivo';
}

function guessDeviceType(mac) {
    if (!mac) return 'camera';
    const prefix = mac.replace(/-/g, ':').toUpperCase().slice(0, 8);
    if (['00:0C:E7', '00:40:8C'].includes(prefix)) return 'camera';
    if (['AC:CC:8E', '64:09:80', '94:65:2D', '8C:77:12', 'A0:75:91', '40:4E:36', '3C:22:FB', 'F4:F1:5A', '00:1B:63', '18:65:90'].includes(prefix)) return 'phone';
    return 'phone';
}

// ─── HTTP Routes ───────────────────────────────────────────────────────────

app.get('/api/scan', async (req, res) => {
    try {
        const { subnet, myIp } = getLocalNetwork();
        let arpDevices = await readArpTable();
        if (arpDevices.length < 3) {
            await pingSubnet(subnet);
            arpDevices = await readArpTable();
        } else {
            pingSubnet(subnet).catch(() => {});
        }
        const devices = arpDevices.filter(d => d.ip !== myIp).map((d, i) => {
            const vendor = getMacVendor(d.mac);
            const type = guessDeviceType(d.mac);
            const lastOctet = d.ip.split('.').pop();
            return { id: Date.now() + i, name: `${vendor} .${lastOctet}`, type, ip: d.ip, port: type === 'phone' ? '8080' : '80', isOnline: true, battery: null, mac: d.mac };
        });
        res.json({ devices, subnet, myIp, total: devices.length });
    } catch (err) {
        res.status(500).json({ error: err.message, devices: [] });
    }
});

app.get('/api/status', (req, res) => {
    const { subnet, myIp } = getLocalNetwork();
    res.json({ ok: true, myIp, subnet, tunnelUrl });
});

app.get('/api/stream', (req, res) => {
    const { ip, port } = req.query;
    if (!ip || !port) return res.status(400).end();
    const camReq = http.get({ host: ip, port: parseInt(port), path: '/video', timeout: 8000 }, (camRes) => {
        res.writeHead(camRes.statusCode, {
            'Content-Type': camRes.headers['content-type'] || 'multipart/x-mixed-replace; boundary=--video',
            'Cache-Control': 'no-cache', 'Connection': 'keep-alive',
        });
        camRes.pipe(res);
    });
    camReq.on('error', () => res.status(503).end());
    req.on('close', () => camReq.destroy());
});

// ─── WebSocket Signaling para WebRTC ──────────────────────────────────────

const clients = new Map(); // id -> { ws, role, name, id }
let idCounter = 0;

const httpServer = http.createServer(app);
const wss = new WebSocketServer({ server: httpServer, path: '/ws' });

wss.on('connection', (ws) => {
    const id = String(++idCounter);
    const client = { ws, role: null, name: null, id };
    clients.set(id, client);

    ws.send(JSON.stringify({ type: 'welcome', id }));

    ws.on('message', (rawData) => {
        try {
            const msg = JSON.parse(rawData.toString());

            if (msg.type === 'register-camera') {
                client.role = 'camera';
                client.name = msg.name || `Camara ${id}`;
                // Notificar a todos los viewers
                clients.forEach(c => {
                    if (c.role === 'viewer' && c.ws.readyState === 1) {
                        c.ws.send(JSON.stringify({ type: 'camera-joined', id, name: client.name }));
                    }
                });
                console.log(`[WS] Camara conectada: ${client.name} (id=${id})`);
            }

            if (msg.type === 'register-viewer') {
                client.role = 'viewer';
                // Enviar lista de camaras activas
                const cameras = [];
                clients.forEach(c => { if (c.role === 'camera') cameras.push({ id: c.id, name: c.name }); });
                ws.send(JSON.stringify({ type: 'cameras-list', cameras }));
                console.log(`[WS] Viewer conectado (id=${id}), camaras activas: ${cameras.length}`);
            }

            // Retransmitir mensajes de señalizacion WebRTC
            if (['viewer-wants-stream', 'offer', 'answer', 'ice-candidate'].includes(msg.type)) {
                const target = clients.get(msg.to);
                if (target && target.ws.readyState === 1) {
                    target.ws.send(JSON.stringify({ ...msg, from: id }));
                }
            }
        } catch (e) { /* ignorar errores de parseo */ }
    });

    ws.on('close', () => {
        if (client.role === 'camera') {
            clients.forEach(c => {
                if (c.role === 'viewer' && c.ws.readyState === 1) {
                    c.ws.send(JSON.stringify({ type: 'camera-left', id }));
                }
            });
            console.log(`[WS] Camara desconectada: ${client.name} (id=${id})`);
        }
        clients.delete(id);
    });
});

httpServer.listen(PORT, () => {
    const { subnet, myIp } = getLocalNetwork();
    console.log(`\n  API + WebSocket corriendo en http://localhost:${PORT}`);
    console.log(`  Red local: ${subnet}.x  |  Este equipo: ${myIp}`);
    console.log(`  Iniciando tunnel HTTPS para iPhone...\n`);
    startCloudflaredTunnel();
});
