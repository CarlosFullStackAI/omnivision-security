import { useState, useEffect, useRef, useCallback } from 'react';

const ICE = { iceServers: [{ urls: 'stun:stun.l.google.com:19302' }] };

const wsUrl = () =>
    `${location.protocol === 'https:' ? 'wss:' : 'ws:'}//${location.host}/ws`;

// ─── VIEWER (Dashboard en PC) ─────────────────────────────────────────────
export const useWebRTCViewer = () => {
    const [cameras, setCameras] = useState([]);
    const wsRef   = useRef(null);
    const peersRef = useRef({});

    const connectToCamera = useCallback((cameraId, cameraName) => {
        const ws = wsRef.current;
        if (!ws || ws.readyState !== WebSocket.OPEN) return;

        peersRef.current[cameraId]?.close();
        const pc = new RTCPeerConnection(ICE);
        peersRef.current[cameraId] = pc;

        pc.ontrack = (e) => {
            const stream = e.streams[0];
            setCameras(prev => {
                if (prev.some(c => c.id === cameraId))
                    return prev.map(c => c.id === cameraId ? { ...c, stream } : c);
                return [...prev, { id: cameraId, name: cameraName, stream }];
            });
        };

        pc.onicecandidate = (e) => {
            if (e.candidate && ws.readyState === WebSocket.OPEN)
                ws.send(JSON.stringify({ type: 'ice-candidate', to: cameraId, candidate: e.candidate }));
        };

        ws.send(JSON.stringify({ type: 'viewer-wants-stream', to: cameraId }));
    }, []);

    useEffect(() => {
        const ws = new WebSocket(wsUrl());
        wsRef.current = ws;

        ws.onopen = () => ws.send(JSON.stringify({ type: 'register-viewer' }));

        ws.onmessage = async (e) => {
            const msg = JSON.parse(e.data);

            if (msg.type === 'cameras-list') {
                msg.cameras.forEach(cam => connectToCamera(cam.id, cam.name));
            }
            if (msg.type === 'camera-joined') {
                connectToCamera(msg.id, msg.name);
            }
            if (msg.type === 'camera-left') {
                peersRef.current[msg.id]?.close();
                delete peersRef.current[msg.id];
                setCameras(prev => prev.filter(c => c.id !== msg.id));
            }
            if (msg.type === 'offer') {
                const pc = peersRef.current[msg.from];
                if (!pc) return;
                await pc.setRemoteDescription(new RTCSessionDescription(msg.sdp));
                const answer = await pc.createAnswer();
                await pc.setLocalDescription(answer);
                ws.send(JSON.stringify({ type: 'answer', to: msg.from, sdp: answer }));
            }
            if (msg.type === 'ice-candidate') {
                try { await peersRef.current[msg.from]?.addIceCandidate(new RTCIceCandidate(msg.candidate)); }
                catch { /* ignorar */ }
            }
        };

        return () => {
            Object.values(peersRef.current).forEach(pc => pc.close());
            ws.close();
        };
    }, [connectToCamera]);

    return { cameras };
};

// ─── BROADCASTER (Telefono / dispositivo con camara) ──────────────────────
export const useCameraShare = () => {
    const [isSharing, setIsSharing]     = useState(false);
    const [error, setError]             = useState(null);
    const [localStream, setLocalStream] = useState(null);
    const wsRef     = useRef(null);
    const streamRef = useRef(null);
    const peersRef  = useRef({});

    // existingStream: si ya tienes el stream (para preview), pasalo aqui
    const startSharing = useCallback(async (name, existingStream = null) => {
        try {
            setError(null);
            const stream = existingStream || await navigator.mediaDevices.getUserMedia({
                video: { facingMode: 'environment', width: { ideal: 1280 }, height: { ideal: 720 } },
                audio: false,
            });
            streamRef.current = stream;
            setLocalStream(stream);

            const ws = new WebSocket(wsUrl());
            wsRef.current = ws;

            ws.onopen = () => ws.send(JSON.stringify({ type: 'register-camera', name }));

            ws.onmessage = async (e) => {
                const msg = JSON.parse(e.data);

                if (msg.type === 'viewer-wants-stream') {
                    const pc = new RTCPeerConnection(ICE);
                    peersRef.current[msg.from] = pc;
                    streamRef.current.getTracks().forEach(t => pc.addTrack(t, streamRef.current));

                    pc.onicecandidate = (ev) => {
                        if (ev.candidate && ws.readyState === WebSocket.OPEN)
                            ws.send(JSON.stringify({ type: 'ice-candidate', to: msg.from, candidate: ev.candidate }));
                    };

                    const offer = await pc.createOffer();
                    await pc.setLocalDescription(offer);
                    ws.send(JSON.stringify({ type: 'offer', to: msg.from, sdp: offer }));
                }
                if (msg.type === 'answer') {
                    try { await peersRef.current[msg.from]?.setRemoteDescription(new RTCSessionDescription(msg.sdp)); }
                    catch { /* ignorar */ }
                }
                if (msg.type === 'ice-candidate') {
                    try { await peersRef.current[msg.from]?.addIceCandidate(new RTCIceCandidate(msg.candidate)); }
                    catch { /* ignorar */ }
                }
            };

            setIsSharing(true);
        } catch (err) {
            setError(err.message.includes('Permission') ? 'Permiso de camara denegado' : err.message);
        }
    }, []);

    const stopSharing = useCallback(() => {
        streamRef.current?.getTracks().forEach(t => t.stop());
        Object.values(peersRef.current).forEach(pc => pc.close());
        wsRef.current?.close();
        peersRef.current = {};
        streamRef.current = null;
        setLocalStream(null);
        setIsSharing(false);
    }, []);

    return { isSharing, startSharing, stopSharing, error, localStream };
};
