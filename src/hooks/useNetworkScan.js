import { useState, useCallback } from 'react';

// Simulated network scan
export const scanLocalIPs = async (baseIp = '192.168.1', onProgress) => {
    const foundDevices = [];
    for (let i = 1; i <= 50; i++) {
        if (onProgress) onProgress((i / 50) * 100);
        const ip = `${baseIp}.${i}`;
        await new Promise(r => setTimeout(r, 40));
        if (i === 45 || i === 12) {
            foundDevices.push({
                id: Date.now() + i, name: `Dispositivo .${i}`, type: i === 45 ? 'phone' : 'camera',
                ip, port: '8080', isOnline: true, battery: i === 45 ? Math.floor(Math.random() * 40) + 10 : null
            });
        }
    }
    return foundDevices;
};

export const useNetworkScan = () => {
    const [isScanning, setIsScanning] = useState(false);
    const [scanProgress, setScanProgress] = useState(0);

    const startScan = useCallback(async (baseIp = '192.168.1') => {
        setIsScanning(true);
        setScanProgress(0);
        try {
            const devices = await scanLocalIPs(baseIp, setScanProgress);
            return devices;
        } finally {
            setIsScanning(false);
        }
    }, []);

    return { isScanning, scanProgress, startScan };
};
