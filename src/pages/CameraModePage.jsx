import React, { useState, useEffect, useRef } from 'react';
import { Camera, Wifi, StopCircle, RotateCcw, ShieldCheck } from 'lucide-react';
import { useCameraShare } from '../hooks/useWebRTC';
import OmniLogo from '../components/ui/OmniLogo';
import AnimatedBackground from '../components/layout/AnimatedBackground';

const CameraModePage = () => {
    const { isSharing, startSharing, stopSharing, error, localStream } = useCameraShare();

    const [deviceName, setDeviceName] = useState(() => {
        const ua = navigator.userAgent;
        if (/iPad/.test(ua)) return 'Mi iPad';
        if (/iPhone/.test(ua)) return 'Mi iPhone';
        if (/Android/.test(ua) && /Tablet|Tab/.test(ua)) return 'Mi Tablet';
        if (/Android/.test(ua)) return 'Mi Android';
        return 'Mi Dispositivo';
    });

    const [facingMode, setFacingMode] = useState('environment');
    const [previewStream, setPreviewStream] = useState(null);
    const [previewError, setPreviewError] = useState(null);
    const previewRef     = useRef(null);
    // Evita que el cleanup detenga los tracks cuando se transfieren al hook
    const transferredRef = useRef(false);

    // Iniciar preview de camara (antes de compartir)
    useEffect(() => {
        let active = true;
        const getPreview = async () => {
            try {
                const s = await navigator.mediaDevices.getUserMedia({
                    video: { facingMode, width: { ideal: 1280 }, height: { ideal: 720 } },
                    audio: false,
                });
                if (!active) { s.getTracks().forEach(t => t.stop()); return; }
                setPreviewStream(s);
                setPreviewError(null);
            } catch {
                setPreviewError('No se pudo acceder a la cámara. Verifica los permisos en Chrome flags.');
            }
        };
        if (!isSharing) getPreview();
        return () => { active = false; };
    }, [facingMode, isSharing]);

    // Mostrar stream en el video element
    useEffect(() => {
        const video = previewRef.current;
        if (!video) return;
        const stream = isSharing ? localStream : previewStream;
        if (stream) video.srcObject = stream;
    }, [previewStream, localStream, isSharing]);

    // Limpiar preview stream — respeta la transferencia al hook
    useEffect(() => {
        return () => {
            if (!transferredRef.current) {
                previewStream?.getTracks().forEach(t => t.stop());
            }
            transferredRef.current = false;
        };
    }, [previewStream]);

    const handleStart = async () => {
        if (previewStream) {
            // Marcar como transferido ANTES de limpiar el estado,
            // para que el cleanup no detenga los tracks
            transferredRef.current = true;
            const stream = previewStream;
            setPreviewStream(null);
            await startSharing(deviceName, stream);
        } else {
            await startSharing(deviceName);
        }
    };

    const handleFlip = async () => {
        previewStream?.getTracks().forEach(t => t.stop());
        setPreviewStream(null);
        setFacingMode(prev => prev === 'environment' ? 'user' : 'environment');
    };

    const handleStop = () => {
        stopSharing();
    };

    const hasVideo = isSharing ? !!localStream : !!previewStream;

    return (
        <div className="min-h-screen flex flex-col relative overflow-hidden">
            <AnimatedBackground />

            {/* Header */}
            <header className="relative z-10 flex items-center justify-between px-5 py-4 bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl border-b border-slate-200 dark:border-slate-800">
                <div className="flex items-center gap-3">
                    <OmniLogo size="sm" />
                    <div>
                        <h1 className="text-base font-extrabold text-slate-900 dark:text-white leading-none">
                            OMNI<span className="text-emerald-500">VISION</span>
                        </h1>
                        <p className="text-[11px] font-bold text-emerald-600 dark:text-emerald-400 tracking-wider uppercase">
                            Modo Cámara
                        </p>
                    </div>
                </div>
                <div className="flex items-center gap-1.5 bg-emerald-50 dark:bg-emerald-500/10 px-3 py-1.5 rounded-full border border-emerald-200 dark:border-emerald-500/30">
                    <ShieldCheck size={14} className="text-emerald-500" />
                    <span className="text-xs font-bold text-emerald-700 dark:text-emerald-400">Red Local</span>
                </div>
            </header>

            {/* Contenido */}
            <main className="relative z-10 flex-1 flex flex-col items-center justify-center p-5 gap-5">

                {/* Preview de camara */}
                <div className="w-full max-w-md">
                    <div className={`relative rounded-3xl overflow-hidden bg-slate-900 border-2 transition-all duration-300 shadow-2xl
                        ${isSharing
                            ? 'border-emerald-500 shadow-[0_0_40px_rgba(16,185,129,0.3)]'
                            : 'border-slate-700 dark:border-slate-600'
                        }`}
                        style={{ aspectRatio: '4/3' }}>

                        {hasVideo ? (
                            <video
                                ref={previewRef}
                                autoPlay playsInline muted
                                className="w-full h-full object-cover"
                                style={{ transform: facingMode === 'user' ? 'scaleX(-1)' : 'none' }}
                            />
                        ) : (
                            <div className="absolute inset-0 flex flex-col items-center justify-center gap-3 text-slate-500">
                                {previewError ? (
                                    <>
                                        <Camera size={48} className="opacity-30" />
                                        <p className="text-sm text-center px-6 text-red-400">{previewError}</p>
                                    </>
                                ) : (
                                    <>
                                        <div className="w-10 h-10 border-2 border-emerald-500 border-t-transparent rounded-full animate-spin"></div>
                                        <p className="text-sm text-slate-400">Iniciando cámara...</p>
                                    </>
                                )}
                            </div>
                        )}

                        {/* Badges */}
                        <div className="absolute top-3 left-3 flex gap-2">
                            {isSharing && (
                                <div className="flex items-center gap-1.5 bg-black/70 backdrop-blur-md px-3 py-1 rounded-full border border-red-500/50">
                                    <span className="w-2 h-2 bg-red-500 rounded-full animate-pulse shadow-[0_0_6px_rgba(239,68,68,1)]"></span>
                                    <span className="text-white text-[11px] font-mono font-bold">EN VIVO</span>
                                </div>
                            )}
                            {hasVideo && !isSharing && (
                                <div className="flex items-center gap-1.5 bg-black/60 backdrop-blur-md px-3 py-1 rounded-full">
                                    <span className="w-2 h-2 bg-slate-400 rounded-full"></span>
                                    <span className="text-slate-300 text-[11px] font-mono">PREVIEW</span>
                                </div>
                            )}
                        </div>

                        {/* Boton girar camara */}
                        {!isSharing && hasVideo && (
                            <button onClick={handleFlip}
                                className="absolute bottom-3 right-3 bg-black/60 backdrop-blur-md p-3 rounded-full text-white hover:bg-black/80 transition-all active:scale-90 border border-white/10">
                                <RotateCcw size={20} />
                            </button>
                        )}

                        {/* Indicador de transmision */}
                        {isSharing && (
                            <div className="absolute bottom-3 left-3 right-3 flex items-center justify-center">
                                <div className="bg-black/70 backdrop-blur-md px-4 py-2 rounded-2xl border border-emerald-500/30 flex items-center gap-2">
                                    <Wifi size={14} className="text-emerald-400" />
                                    <span className="text-emerald-400 text-xs font-bold">Transmitiendo a OmniVision PC</span>
                                </div>
                            </div>
                        )}
                    </div>
                </div>

                {/* Panel de control */}
                <div className="w-full max-w-md bg-white/85 dark:bg-slate-900/85 backdrop-blur-xl rounded-3xl border border-slate-200 dark:border-slate-800 shadow-2xl p-6 space-y-4">

                    {!isSharing ? (
                        <>
                            <div>
                                <label className="block text-sm font-bold text-slate-600 dark:text-slate-400 mb-2">
                                    Nombre de este dispositivo
                                </label>
                                <input
                                    type="text"
                                    value={deviceName}
                                    onChange={e => setDeviceName(e.target.value)}
                                    className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-2xl px-4 py-3 text-slate-900 dark:text-white font-medium focus:outline-none focus:border-emerald-500 focus:ring-4 focus:ring-emerald-500/20 transition-all text-base"
                                    placeholder="Mi Tablet"
                                />
                            </div>

                            <button
                                onClick={handleStart}
                                disabled={!!previewError}
                                className="w-full py-4 bg-emerald-500 hover:bg-emerald-600 disabled:opacity-40 disabled:cursor-not-allowed text-white font-extrabold text-lg rounded-2xl shadow-[0_10px_30px_rgba(16,185,129,0.5)] flex items-center justify-center gap-3 active:scale-95 transition-all">
                                <Camera size={22} />
                                Iniciar y Compartir Cámara
                            </button>

                            {error && (
                                <p className="text-red-500 text-sm text-center font-medium">{error}</p>
                            )}
                        </>
                    ) : (
                        <>
                            <div className="flex items-center gap-4 p-4 bg-emerald-50 dark:bg-emerald-500/10 rounded-2xl border border-emerald-200 dark:border-emerald-500/20">
                                <div className="p-3 bg-emerald-100 dark:bg-emerald-500/20 rounded-full shrink-0">
                                    <Wifi size={22} className="text-emerald-600 dark:text-emerald-400" />
                                </div>
                                <div>
                                    <p className="font-extrabold text-slate-800 dark:text-white text-base">Conectado</p>
                                    <p className="text-sm text-emerald-700 dark:text-emerald-400 font-semibold">{deviceName}</p>
                                    <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                                        El PC puede ver tu cámara en tiempo real
                                    </p>
                                </div>
                            </div>

                            <button
                                onClick={handleStop}
                                className="w-full py-4 bg-red-500 hover:bg-red-600 text-white font-extrabold text-lg rounded-2xl shadow-[0_10px_30px_rgba(239,68,68,0.4)] flex items-center justify-center gap-3 active:scale-95 transition-all">
                                <StopCircle size={22} />
                                Detener Transmisión
                            </button>
                        </>
                    )}
                </div>

                <p className="text-xs text-slate-400 dark:text-slate-500 text-center max-w-xs">
                    El video se transmite directamente por tu red local (P2P). Nada sale a internet.
                </p>
            </main>
        </div>
    );
};

export default CameraModePage;
