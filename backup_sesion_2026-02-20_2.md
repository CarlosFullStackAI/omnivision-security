# Backup de Sesion - 2026-02-20 (copia #2)
**Proyecto:** OmniVision Security PRO
**Repo:** https://github.com/CarlosFullStackAI/omnivision-security

## Ultimo fix aplicado
- **Bug pantalla negra en WebRTC**: `setPreviewStream(null)` disparaba el cleanup
  de React que detenia los tracks del stream ANTES de que el hook los tomara.
  **Fix**: `transferredRef = useRef(false)` en `CameraModePage.jsx` — marca el
  stream como transferido para que el cleanup no lo detenga.

## Estado del servidor
- Corriendo en http://localhost:5173 (Vite) y http://localhost:3001 (API + WS)
- Red local: 192.168.50.x | PC: 192.168.50.247
- QR apunta a: http://192.168.50.247:5173/#camera
- Chrome flag requerido en movil: chrome://flags/#unsafely-treat-insecure-origin-as-secure

## Funcionalidades completas y funcionando
1. Login (carlos45335@gmail.com / test123456)
2. Dashboard con tabs Home / Radar / Groq IA / Alertas / Ajustes
3. Escaneo real de red (ARP + ping sweep)
4. Grabacion con calidad 480p / 720p / 1080p / 4K
5. WebRTC P2P: tablet escanea QR → modo camara → PC ve el video en vivo
6. Proxy de stream IP para evitar CORS
7. Modo nocturno, tracking, zoom, snapshot en VideoCards
