import React, { useEffect, useRef, useState } from 'react';
import { X, Wifi, AlertTriangle } from 'lucide-react';

const NIGHT_THRESHOLD  = 80;   // luminancia promedio < 80/255 → modo nocturno
const MOTION_THRESHOLD = 0.015; // 1.5% de píxeles cambian → movimiento
const PIXEL_DIFF_SENS  = 20;   // diferencia mínima por canal para contar un píxel

const WebRTCCard = ({ camera, onRemove }) => {
    const videoRef     = useRef(null);
    const prevFrameRef = useRef(null);
    const intervalRef  = useRef(null);
    const motionTimer  = useRef(null);

    const [isNightMode,     setIsNightMode]     = useState(false);
    const [motionDetected,  setMotionDetected]  = useState(false);
    const [lastMotionTime,  setLastMotionTime]  = useState(null);

    // Asignar stream al elemento video
    useEffect(() => {
        if (videoRef.current && camera.stream) {
            videoRef.current.srcObject = camera.stream;
        }
    }, [camera.stream]);

    // Análisis de frames: modo nocturno + detección de movimiento
    useEffect(() => {
        if (!camera.stream) return;

        const canvas = document.createElement('canvas');
        canvas.width  = 160;
        canvas.height = 90;
        const ctx = canvas.getContext('2d', { willReadFrequently: true });

        const analyze = () => {
            const video = videoRef.current;
            if (!video || video.readyState < 2 || video.paused) return;

            ctx.drawImage(video, 0, 0, 160, 90);
            const { data } = ctx.getImageData(0, 0, 160, 90);
            const pixelCount = data.length / 4;

            // ── Luminancia promedio → modo nocturno ──────────────────
            let totalLum = 0;
            for (let i = 0; i < data.length; i += 4) {
                totalLum += 0.299 * data[i] + 0.587 * data[i + 1] + 0.114 * data[i + 2];
            }
            setIsNightMode((totalLum / pixelCount) < NIGHT_THRESHOLD);

            // ── Diferencia de frames → movimiento ────────────────────
            if (prevFrameRef.current) {
                const prev = prevFrameRef.current;
                let changed = 0;
                for (let i = 0; i < data.length; i += 4) {
                    if (
                        (Math.abs(data[i]     - prev[i])     +
                         Math.abs(data[i + 1] - prev[i + 1]) +
                         Math.abs(data[i + 2] - prev[i + 2])) / 3 > PIXEL_DIFF_SENS
                    ) changed++;
                }
                if (changed / pixelCount > MOTION_THRESHOLD) {
                    setMotionDetected(true);
                    setLastMotionTime(new Date().toLocaleTimeString());
                    clearTimeout(motionTimer.current);
                    motionTimer.current = setTimeout(() => setMotionDetected(false), 3000);
                }
            }

            prevFrameRef.current = new Uint8ClampedArray(data);
        };

        intervalRef.current = setInterval(analyze, 500);

        return () => {
            clearInterval(intervalRef.current);
            clearTimeout(motionTimer.current);
            prevFrameRef.current = null;
        };
    }, [camera.stream]);

    // Filtro modo nocturno: aumenta brillo/contraste + tinte verde suave tipo NVG
    const nightFilter = 'brightness(3.5) contrast(1.4) saturate(0.1) sepia(1) hue-rotate(80deg)';

    return (
        <div className={`bg-white/80 dark:bg-slate-900/80 backdrop-blur-sm rounded-2xl overflow-hidden border-2 transition-all duration-500 flex flex-col relative
            ${motionDetected
                ? 'border-red-500 shadow-[0_0_35px_rgba(239,68,68,0.6)]'
                : isNightMode
                    ? 'border-indigo-400/70 dark:border-indigo-500/50 shadow-[0_0_25px_rgba(99,102,241,0.3)]'
                    : 'border-emerald-400/60 dark:border-emerald-500/40 shadow-[0_0_25px_rgba(16,185,129,0.2)]'
            }`}>

            {/* Parpadeo rojo cuando hay movimiento */}
            {motionDetected && (
                <div className="absolute inset-0 z-40 pointer-events-none rounded-2xl border-4 border-red-500 animate-pulse" />
            )}

            {/* Header */}
            <div className="p-3 bg-white/90 dark:bg-slate-900/90 backdrop-blur border-b border-emerald-200 dark:border-emerald-500/20 flex justify-between items-center z-10 relative">
                <div className="flex items-center gap-2 flex-wrap">
                    <div className="relative">
                        <div className="absolute w-3 h-3 rounded-full bg-emerald-500 animate-ping opacity-40"></div>
                        <div className="relative w-2 h-2 rounded-full bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,1)]"></div>
                    </div>
                    <span className="font-semibold text-sm text-slate-800 dark:text-slate-200 truncate max-w-[110px]">
                        {camera.name}
                    </span>
                    <span className="text-[9px] font-bold bg-emerald-100 dark:bg-emerald-500/20 text-emerald-700 dark:text-emerald-400 px-1.5 py-0.5 rounded-full border border-emerald-200 dark:border-emerald-500/30">
                        WebRTC
                    </span>
                    {isNightMode && (
                        <span className="text-[9px] font-bold bg-indigo-100 dark:bg-indigo-500/20 text-indigo-700 dark:text-indigo-300 px-1.5 py-0.5 rounded-full border border-indigo-300 dark:border-indigo-500/40">
                            🌙 Nocturno
                        </span>
                    )}
                </div>
                <button onClick={() => onRemove(camera.id)} className="p-1.5 text-slate-400 hover:text-red-500 transition-colors rounded-lg hover:bg-red-50 dark:hover:bg-red-500/10 shrink-0">
                    <X size={16} />
                </button>
            </div>

            {/* Video */}
            <div className="relative aspect-video bg-black flex items-center justify-center">
                <video
                    ref={videoRef}
                    autoPlay
                    playsInline
                    muted
                    webkit-playsinline="true"
                    className="w-full h-full object-cover transition-all duration-700"
                    style={{ filter: isNightMode ? nightFilter : 'none' }}
                />

                {!camera.stream && (
                    <div className="absolute inset-0 flex flex-col items-center justify-center gap-3">
                        <div className="w-8 h-8 border-2 border-emerald-500 border-t-transparent rounded-full animate-spin"></div>
                        <span className="text-xs text-slate-400 font-mono">Conectando...</span>
                    </div>
                )}

                {/* Badges izquierda */}
                <div className="absolute top-2 left-2 flex flex-col gap-1">
                    <div className="flex items-center gap-1.5 bg-black/60 backdrop-blur-md px-2 py-0.5 rounded text-[10px] font-mono text-white border border-white/10">
                        <span className="w-1.5 h-1.5 bg-red-500 rounded-full animate-pulse shadow-[0_0_5px_rgba(239,68,68,0.8)]"></span> LIVE
                    </div>
                    <div className="flex items-center gap-1 bg-emerald-500/80 backdrop-blur-md text-white text-[9px] font-bold px-2 py-0.5 rounded">
                        <Wifi size={9} /> P2P
                    </div>
                </div>

                {/* Alerta movimiento (esquina superior derecha) */}
                {motionDetected && (
                    <div className="absolute top-2 right-2 flex items-center gap-1.5 bg-red-500/90 backdrop-blur-md px-2.5 py-1 rounded-lg border border-red-400 shadow-[0_0_15px_rgba(239,68,68,0.7)] animate-pulse">
                        <AlertTriangle size={12} className="text-white" />
                        <span className="text-white text-[11px] font-bold tracking-wide">MOVIMIENTO</span>
                    </div>
                )}

                {/* Indicador modo nocturno (parte inferior) */}
                {isNightMode && (
                    <div className="absolute bottom-2 left-2 flex items-center gap-1.5 bg-indigo-700/80 backdrop-blur-md px-2.5 py-1 rounded-lg border border-indigo-400/40 text-[10px] font-mono text-indigo-100">
                        🌙 Visión nocturna activa
                    </div>
                )}
            </div>

            {/* Footer */}
            <div className="p-2.5 bg-white/90 dark:bg-slate-900 border-t border-emerald-100 dark:border-emerald-500/10 flex items-center justify-between gap-2">
                <span className={`text-[11px] font-medium truncate ${motionDetected ? 'text-red-500 font-bold' : 'text-slate-500 dark:text-slate-400'}`}>
                    {motionDetected
                        ? `⚠ Movimiento ${lastMotionTime || ''}`
                        : isNightMode
                            ? '🌙 Poca luz detectada'
                            : 'Cámara del dispositivo'
                    }
                </span>
                <span className="text-[10px] font-mono font-bold text-emerald-500 dark:text-emerald-400 shrink-0">WebRTC • P2P</span>
            </div>
        </div>
    );
};

export default WebRTCCard;
