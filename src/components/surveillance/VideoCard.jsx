import React, { useState, useEffect, useRef } from 'react';
import {
    Camera, Smartphone, Monitor, Video, Check, X, Maximize, Minimize,
    Battery, BatteryCharging, Volume2, ZoomIn, ZoomOut, Focus, Moon, Aperture,
    Edit2, AlertTriangle, Mic, Circle, Square, ChevronUp
} from 'lucide-react';

const QUALITY_PRESETS = {
    '480p':  { width: 854,   height: 480,  bitrate: 1_500_000,  fps: 30, label: '480p',  sublabel: 'SD',  color: 'text-slate-400',   ring: 'ring-slate-400'  },
    '720p':  { width: 1280,  height: 720,  bitrate: 3_000_000,  fps: 30, label: '720p',  sublabel: 'HD',  color: 'text-blue-400',    ring: 'ring-blue-400'   },
    '1080p': { width: 1920,  height: 1080, bitrate: 8_000_000,  fps: 30, label: '1080p', sublabel: 'FHD', color: 'text-emerald-400', ring: 'ring-emerald-400'},
    '4K':    { width: 3840,  height: 2160, bitrate: 20_000_000, fps: 30, label: '4K',    sublabel: 'UHD', color: 'text-orange-400',  ring: 'ring-orange-400' },
};

const VideoCard = ({ device, onRemove, useRealVideo, onSnapshot, onEditName }) => {
    const [scanPosition, setScanPosition] = useState(0);
    const [isExpanded, setIsExpanded] = useState(false);
    const [nightMode, setNightMode] = useState(false);
    const [trackingMode, setTrackingMode] = useState(false);
    const [targetPos, setTargetPos] = useState({ x: 40, y: 30 });
    const [zoom, setZoom] = useState(1);
    const [isSpeaking, setIsSpeaking] = useState(false);
    const [flash, setFlash] = useState(false);
    const [isEditingName, setIsEditingName] = useState(false);
    const [tempName, setTempName] = useState(device.name);

    // Grabacion
    const [recordingQuality, setRecordingQuality] = useState('1080p');
    const [isRecording, setIsRecording] = useState(false);
    const [showQualityPicker, setShowQualityPicker] = useState(false);
    const [recordingTime, setRecordingTime] = useState(0);

    const mediaRecorderRef = useRef(null);
    const chunksRef = useRef([]);
    const videoImgRef = useRef(null);
    const animFrameRef = useRef(null);
    const timerRef = useRef(null);

    useEffect(() => {
        if (!device.isOnline || useRealVideo) return;
        const interval = setInterval(() => setScanPosition(p => (p > 100 ? 0 : p + 1.5)), 50);
        return () => clearInterval(interval);
    }, [device.isOnline, useRealVideo]);

    useEffect(() => {
        if (!trackingMode || !device.isOnline) return;
        const interval = setInterval(() => {
            setTargetPos(prev => ({
                x: Math.max(10, Math.min(70, prev.x + (Math.random() - 0.5) * 30)),
                y: Math.max(10, Math.min(60, prev.y + (Math.random() - 0.5) * 30))
            }));
        }, 1000);
        return () => clearInterval(interval);
    }, [trackingMode, device.isOnline]);

    // Cleanup al desmontar
    useEffect(() => {
        return () => {
            cancelAnimationFrame(animFrameRef.current);
            clearInterval(timerRef.current);
            if (mediaRecorderRef.current?.state === 'recording') mediaRecorderRef.current.stop();
        };
    }, []);

    const toggleExpand = () => { setIsExpanded(!isExpanded); if (isExpanded) setZoom(1); };
    const handleSnapshot = () => { setFlash(true); setTimeout(() => setFlash(false), 150); onSnapshot(device.name); };
    const handleZoomIn = () => setZoom(prev => Math.min(prev + 0.5, 3));
    const handleZoomOut = () => setZoom(prev => Math.max(prev - 0.5, 1));
    const handleSaveName = () => {
        setIsEditingName(false);
        if (tempName.trim() !== '' && tempName !== device.name) onEditName(device.id, tempName);
        else setTempName(device.name);
    };

    const formatTime = (s) => `${String(Math.floor(s / 60)).padStart(2, '0')}:${String(s % 60).padStart(2, '0')}`;

    const startRecording = () => {
        if (!device.isOnline) return;
        const quality = QUALITY_PRESETS[recordingQuality];
        const canvas = document.createElement('canvas');
        canvas.width = quality.width;
        canvas.height = quality.height;
        const ctx = canvas.getContext('2d');

        const drawLoop = () => {
            if (useRealVideo && videoImgRef.current) {
                try {
                    ctx.drawImage(videoImgRef.current, 0, 0, canvas.width, canvas.height);
                } catch {
                    // CORS fallback: placeholder con info
                    ctx.fillStyle = '#0f172a';
                    ctx.fillRect(0, 0, canvas.width, canvas.height);
                    ctx.fillStyle = '#10b981';
                    ctx.font = `bold ${Math.round(canvas.height * 0.035)}px monospace`;
                    ctx.fillText(`● REC  ${device.name}  ${device.ip}`, 24, canvas.height * 0.06);
                }
            } else {
                // Simulado: fondo oscuro con grilla y linea de scan
                ctx.fillStyle = '#0f172a';
                ctx.fillRect(0, 0, canvas.width, canvas.height);
                ctx.strokeStyle = 'rgba(16,185,129,0.06)';
                ctx.lineWidth = 1;
                for (let x = 0; x < canvas.width; x += 40) { ctx.beginPath(); ctx.moveTo(x, 0); ctx.lineTo(x, canvas.height); ctx.stroke(); }
                for (let y = 0; y < canvas.height; y += 40) { ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(canvas.width, y); ctx.stroke(); }
                const scanY = (Date.now() / 20) % canvas.height;
                ctx.fillStyle = 'rgba(16,185,129,0.4)';
                ctx.fillRect(0, scanY, canvas.width, 2);
                ctx.fillStyle = '#10b981';
                ctx.font = `bold ${Math.round(canvas.height * 0.035)}px monospace`;
                ctx.fillText(`● REC  ${device.name}`, 24, canvas.height * 0.06);
                ctx.fillStyle = 'rgba(255,255,255,0.3)';
                ctx.font = `${Math.round(canvas.height * 0.025)}px monospace`;
                ctx.fillText(`SIMULADO • ${quality.label} ${quality.sublabel} • ${device.ip}:${device.port}`, 24, canvas.height * 0.92);
            }
            animFrameRef.current = requestAnimationFrame(drawLoop);
        };
        drawLoop();

        const mimeType = MediaRecorder.isTypeSupported('video/webm;codecs=vp9') ? 'video/webm;codecs=vp9' : 'video/webm';
        const stream = canvas.captureStream(quality.fps);
        const recorder = new MediaRecorder(stream, { mimeType, videoBitsPerSecond: quality.bitrate });

        chunksRef.current = [];
        recorder.ondataavailable = (e) => { if (e.data.size > 0) chunksRef.current.push(e.data); };
        recorder.onstop = () => {
            cancelAnimationFrame(animFrameRef.current);
            clearInterval(timerRef.current);
            const blob = new Blob(chunksRef.current, { type: mimeType });
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = `${device.name.replace(/\s+/g, '_')}_${recordingQuality}_${Date.now()}.webm`;
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
            URL.revokeObjectURL(url);
            setRecordingTime(0);
        };

        recorder.start(1000);
        mediaRecorderRef.current = recorder;
        setIsRecording(true);
        setRecordingTime(0);
        timerRef.current = setInterval(() => setRecordingTime(t => t + 1), 1000);
    };

    const stopRecording = () => {
        if (mediaRecorderRef.current?.state === 'recording') mediaRecorderRef.current.stop();
        setIsRecording(false);
    };

    const getIcon = () => {
        const size = isExpanded ? 80 : 48;
        const style = "text-emerald-600/20 dark:text-emerald-500/30";
        switch (device.type) {
            case 'phone': return <Smartphone size={size} className={style} />;
            case 'camera': return <Camera size={size} className={style} />;
            case 'pc': return <Monitor size={size} className={style} />;
            default: return <Video size={size} className={style} />;
        }
    };

    const currentQ = QUALITY_PRESETS[recordingQuality];
    const streamSrc = useRealVideo ? `/api/stream?ip=${device.ip}&port=${device.port}` : null;

    return (
        <div className={`bg-white/80 dark:bg-slate-900/80 backdrop-blur-sm rounded-2xl overflow-hidden border border-slate-200 dark:border-slate-800 shadow-xl dark:shadow-lg flex flex-col group transition-all duration-300 z-10 ${isExpanded ? 'fixed inset-4 z-[60] md:inset-10 shadow-[0_0_50px_rgba(0,0,0,0.5)]' : 'relative hover:border-emerald-500/50 dark:hover:border-emerald-500/50 hover:shadow-[0_0_25px_rgba(16,185,129,0.15)]'}`}>

            {/* Header */}
            <div className="p-3 bg-white/90 dark:bg-slate-900/90 backdrop-blur border-b border-slate-200 dark:border-slate-800 flex justify-between items-center z-20">
                <div className="flex items-center gap-3 overflow-hidden">
                    <div className="relative flex items-center justify-center">
                        <div className={`absolute w-3 h-3 rounded-full ${device.isOnline ? 'bg-emerald-500 animate-ping opacity-30 dark:opacity-20' : 'bg-red-500'}`}></div>
                        <div className={`relative w-2 h-2 rounded-full ${device.isOnline ? 'bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,1)]' : 'bg-red-500 shadow-[0_0_8px_rgba(239,68,68,0.8)]'}`}></div>
                    </div>
                    {isEditingName ? (
                        <div className="flex items-center gap-2">
                            <input autoFocus type="text" value={tempName}
                                onChange={(e) => setTempName(e.target.value)}
                                onBlur={handleSaveName} onKeyDown={(e) => e.key === 'Enter' && handleSaveName()}
                                className="bg-slate-100 dark:bg-slate-950 text-slate-900 dark:text-white text-sm px-2 py-0.5 rounded outline-none border border-emerald-500 w-32 sm:w-40 shadow-[0_0_10px_rgba(16,185,129,0.2)]" />
                            <button onClick={handleSaveName} className="text-emerald-500 hover:text-emerald-600 dark:hover:text-emerald-400"><Check size={16} /></button>
                        </div>
                    ) : (
                        <div className="flex items-center gap-2 cursor-pointer group/title" onClick={() => setIsEditingName(true)} title="Editar nombre">
                            <h3 className="font-semibold text-slate-800 dark:text-slate-200 truncate text-sm max-w-[120px] sm:max-w-[150px]">{device.name}</h3>
                            <Edit2 size={12} className="text-slate-400 dark:text-slate-500 opacity-0 group-hover/title:opacity-100 transition-opacity" />
                        </div>
                    )}
                </div>
                <div className="flex items-center gap-1">
                    <button onClick={toggleExpand} className="p-2 text-slate-400 dark:text-slate-500 hover:text-emerald-500 dark:hover:text-emerald-400 transition-colors">
                        {isExpanded ? <Minimize size={18} /> : <Maximize size={18} />}
                    </button>
                    {!isExpanded && !isRecording && (
                        <button onClick={() => onRemove(device.id)} className="p-2 -mr-2 text-slate-400 dark:text-slate-500 hover:text-red-500 transition-colors">
                            <X size={18} />
                        </button>
                    )}
                </div>
            </div>

            {/* Video Feed */}
            <div className={`relative bg-slate-100 dark:bg-black w-full overflow-hidden flex-1 ${isExpanded ? 'h-full' : 'aspect-[4/3] sm:aspect-video'}`}>
                {flash && <div className="absolute inset-0 bg-white z-50 opacity-90 transition-opacity duration-150"></div>}

                {/* Overlay de grabacion */}
                {isRecording && (
                    <div className="absolute top-2 right-2 z-30 flex items-center gap-1.5 bg-black/70 backdrop-blur-md px-2.5 py-1 rounded-full border border-red-500/50 shadow-[0_0_12px_rgba(239,68,68,0.5)]">
                        <span className="w-2 h-2 bg-red-500 rounded-full animate-pulse shadow-[0_0_6px_rgba(239,68,68,1)]"></span>
                        <span className="text-[10px] font-mono font-bold text-red-400">{formatTime(recordingTime)}</span>
                        <span className="text-[9px] font-bold text-slate-400 ml-1">{currentQ.label}</span>
                    </div>
                )}

                {device.isOnline ? (
                    <>
                        <div className="absolute inset-0 transition-transform duration-300 origin-center" style={{ transform: `scale(${zoom})`, filter: nightMode ? 'sepia(1) hue-rotate(80deg) saturate(2) brightness(0.8) contrast(1.2)' : 'none' }}>
                            {useRealVideo ? (
                                <img
                                    ref={videoImgRef}
                                    src={streamSrc}
                                    alt={`Feed de ${device.name}`}
                                    className="w-full h-full object-cover"
                                    crossOrigin="anonymous"
                                    onError={(e) => {
                                        e.target.onerror = null;
                                        e.target.outerHTML = `<div class="w-full h-full flex flex-col items-center justify-center text-slate-400"><svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="mb-2"><path d="m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3Z"></path><path d="M12 9v4"></path><path d="M12 17h.01"></path></svg><span class="text-xs">Error CORS / Red</span></div>`;
                                    }}
                                />
                            ) : (
                                <>
                                    <div className="absolute inset-0 bg-[linear-gradient(rgba(16,185,129,0.03)_1px,transparent_1px),linear-gradient(90deg,rgba(16,185,129,0.03)_1px,transparent_1px)] bg-[size:20px_20px]"></div>
                                    <div className="absolute inset-0 flex items-center justify-center animate-pulse">{getIcon()}</div>
                                    <div className="absolute left-0 right-0 h-[2px] bg-emerald-500/50 shadow-[0_0_15px_rgba(16,185,129,1)] z-10" style={{ top: `${scanPosition}%` }}></div>
                                </>
                            )}

                            {trackingMode && (
                                <div className="absolute border-2 border-red-500 transition-all duration-700 ease-out pointer-events-none z-20 shadow-[0_0_15px_rgba(239,68,68,0.6)]" style={{ left: `${targetPos.x}%`, top: `${targetPos.y}%`, width: '25%', height: '35%' }}>
                                    <div className="absolute -top-4 left-[-2px] bg-red-500 text-white text-[9px] px-1.5 py-0.5 font-bold tracking-wider rounded-t-sm shadow-md">OBJETIVO DETECTADO</div>
                                    <div className="absolute top-1/2 left-1/2 w-1.5 h-1.5 bg-red-500 rounded-full -translate-x-1/2 -translate-y-1/2 shadow-[0_0_8px_rgba(239,68,68,1)] animate-ping"></div>
                                </div>
                            )}
                        </div>

                        <div className="absolute top-2 left-2 flex flex-col gap-2 z-20 pointer-events-none">
                            <div className="flex items-center gap-2">
                                <div className="flex items-center gap-1 bg-white/80 dark:bg-black/60 px-2 py-0.5 rounded text-[10px] font-mono text-slate-800 dark:text-white backdrop-blur-md border border-slate-200 dark:border-white/10 shadow-sm">
                                    <span className="w-1.5 h-1.5 bg-red-500 rounded-full animate-pulse shadow-[0_0_5px_rgba(239,68,68,0.8)]"></span> REC
                                </div>
                                {device.battery != null && (
                                    <div className={`flex items-center gap-1 bg-white/80 dark:bg-black/60 px-2 py-0.5 rounded text-[10px] font-mono backdrop-blur-md border border-slate-200 dark:border-white/10 shadow-sm ${device.battery < 20 ? 'text-red-500 dark:text-red-400 drop-shadow-[0_0_5px_rgba(239,68,68,0.8)]' : 'text-emerald-600 dark:text-emerald-400 drop-shadow-[0_0_5px_rgba(16,185,129,0.5)]'}`}>
                                        {device.battery < 20 ? <Battery size={12} /> : <BatteryCharging size={12} />} {device.battery}%
                                    </div>
                                )}
                            </div>
                            {zoom > 1 && <div className="bg-emerald-500/90 text-white px-2 py-0.5 rounded text-[10px] font-bold inline-block w-max backdrop-blur-md shadow-[0_0_10px_rgba(16,185,129,0.5)] border border-emerald-400/50">ZOOM {zoom}X</div>}
                        </div>

                        {isSpeaking && (
                            <div className="absolute inset-0 flex items-center justify-center bg-black/40 z-20 backdrop-blur-sm transition-all">
                                <div className="flex flex-col items-center animate-pulse">
                                    <div className="bg-emerald-500 p-4 rounded-full shadow-[0_0_40px_rgba(16,185,129,1)]">
                                        <Volume2 size={32} className="text-white" />
                                    </div>
                                    <span className="mt-3 font-bold text-white tracking-widest text-sm drop-shadow-lg">TRANSMITIENDO AUDIO...</span>
                                </div>
                            </div>
                        )}

                        <div className="absolute bottom-2 right-2 bg-white/80 dark:bg-black/60 border border-slate-200 dark:border-white/10 px-2 py-1 rounded text-[10px] font-mono text-emerald-600 dark:text-emerald-400 flex flex-col items-end backdrop-blur-md z-20 pointer-events-none shadow-sm">
                            <span>{device.ip}:{device.port}</span>
                            <span>{isExpanded ? '60' : '24'} FPS | {useRealVideo ? 'STREAM' : 'SIMULADO'}</span>
                        </div>
                    </>
                ) : (
                    <div className="flex flex-col items-center justify-center h-full text-slate-400 dark:text-slate-600 relative z-10">
                        <AlertTriangle size={32} className="mb-2 opacity-60 text-red-500" />
                        <span className="font-mono text-xs uppercase font-semibold">Sin Conexión</span>
                    </div>
                )}
            </div>

            {/* Controles PANTALLA COMPLETA */}
            {isExpanded && device.isOnline && (
                <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-4 z-30 w-full px-4 max-w-sm">
                    <div className="flex items-center justify-between w-full bg-white/90 dark:bg-slate-900/90 backdrop-blur-xl px-4 py-2 rounded-2xl border border-slate-200/50 dark:border-slate-700/80 shadow-[0_10px_40px_rgba(0,0,0,0.15)] dark:shadow-2xl">
                        <button onClick={handleZoomOut} disabled={zoom <= 1} className="p-2 text-slate-600 dark:text-slate-300 hover:text-emerald-600 dark:hover:text-emerald-400 disabled:opacity-30">
                            <ZoomOut size={20} />
                        </button>
                        <div className="flex gap-2 items-center">
                            <button onClick={() => setTrackingMode(!trackingMode)} className={`p-2 rounded-xl transition-all ${trackingMode ? 'bg-red-500 text-white shadow-[0_0_15px_rgba(239,68,68,0.6)]' : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:text-emerald-500'}`}>
                                <Focus size={18} />
                            </button>
                            <button onClick={() => setNightMode(!nightMode)} className={`p-2 rounded-xl transition-all ${nightMode ? 'bg-emerald-500 text-white shadow-[0_0_15px_rgba(16,185,129,0.6)]' : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:text-emerald-500'}`}>
                                <Moon size={18} />
                            </button>
                            <button onClick={handleSnapshot} className="p-2 rounded-xl transition-all bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:text-emerald-500 active:scale-90">
                                <Aperture size={18} />
                            </button>
                            {/* Boton grabar en expanded */}
                            <button onClick={isRecording ? stopRecording : startRecording}
                                className={`p-2 rounded-xl transition-all ${isRecording ? 'bg-red-500 text-white shadow-[0_0_15px_rgba(239,68,68,0.6)] animate-pulse' : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:text-red-500'}`}
                                title={isRecording ? 'Detener grabacion' : 'Grabar'}>
                                {isRecording ? <Square size={18} /> : <Circle size={18} />}
                            </button>
                        </div>
                        <button onClick={handleZoomIn} disabled={zoom >= 3} className="p-2 text-slate-600 dark:text-slate-300 hover:text-emerald-600 dark:hover:text-emerald-400 disabled:opacity-30">
                            <ZoomIn size={20} />
                        </button>
                    </div>

                    <button
                        onMouseDown={() => setIsSpeaking(true)} onMouseUp={() => setIsSpeaking(false)} onMouseLeave={() => setIsSpeaking(false)}
                        onTouchStart={() => setIsSpeaking(true)} onTouchEnd={() => setIsSpeaking(false)}
                        className={`w-16 h-16 flex items-center justify-center rounded-full shadow-2xl transition-all border-4 ${isSpeaking ? 'bg-emerald-500 border-emerald-300 dark:border-emerald-400 scale-110 shadow-[0_0_40px_rgba(16,185,129,0.8)] text-white' : 'bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700 hover:text-emerald-500'}`}
                    >
                        <Mic size={28} />
                    </button>
                </div>
            )}

            {/* Footer VISTA NORMAL */}
            {!isExpanded && (
                <div className="p-3 bg-white/90 dark:bg-slate-900 border-t border-slate-200 dark:border-slate-800 flex justify-between items-center z-20 relative">

                    {/* Selector de calidad */}
                    <div className="relative">
                        <button
                            onClick={() => setShowQualityPicker(v => !v)}
                            className={`flex items-center gap-1 px-2 py-1 rounded-lg border text-[11px] font-bold transition-all
                                ${showQualityPicker
                                    ? 'bg-slate-100 dark:bg-slate-800 border-emerald-500/50 text-emerald-600 dark:text-emerald-400'
                                    : 'bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:border-slate-300 dark:hover:border-slate-600'
                                }`}
                            title="Seleccionar calidad de grabacion"
                        >
                            <span className={currentQ.color}>{currentQ.label}</span>
                            <span className="text-slate-400 dark:text-slate-500">{currentQ.sublabel}</span>
                            <ChevronUp size={11} className={`transition-transform ${showQualityPicker ? '' : 'rotate-180'} text-slate-400`} />
                        </button>

                        {/* Panel selector de calidad */}
                        {showQualityPicker && (
                            <div className="absolute bottom-full left-0 mb-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-2xl shadow-2xl dark:shadow-[0_0_30px_rgba(0,0,0,0.5)] overflow-hidden z-50 w-44">
                                <div className="p-2 border-b border-slate-100 dark:border-slate-800">
                                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider px-1">Calidad de grabacion</p>
                                </div>
                                {Object.entries(QUALITY_PRESETS).map(([key, q]) => (
                                    <button key={key} onClick={() => { setRecordingQuality(key); setShowQualityPicker(false); }}
                                        className={`w-full flex items-center justify-between px-3 py-2.5 transition-colors text-left
                                            ${recordingQuality === key
                                                ? 'bg-emerald-50 dark:bg-emerald-500/10'
                                                : 'hover:bg-slate-50 dark:hover:bg-slate-800'
                                            }`}>
                                        <div className="flex items-center gap-2">
                                            {recordingQuality === key && <Check size={12} className="text-emerald-500" />}
                                            {recordingQuality !== key && <div className="w-3" />}
                                            <span className={`font-bold text-sm ${q.color}`}>{q.label}</span>
                                            <span className="text-xs text-slate-500 dark:text-slate-400">{q.sublabel}</span>
                                        </div>
                                        <span className="text-[10px] text-slate-400 font-mono">
                                            {q.bitrate >= 1_000_000 ? `${q.bitrate / 1_000_000}M` : `${q.bitrate / 1000}K`}
                                        </span>
                                    </button>
                                ))}
                            </div>
                        )}
                    </div>

                    {/* Controles derecha */}
                    <div className="flex gap-1.5 items-center">
                        {/* Boton grabar */}
                        <button
                            onClick={isRecording ? stopRecording : startRecording}
                            disabled={!device.isOnline}
                            className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-[11px] font-bold border transition-all shadow-sm disabled:opacity-40
                                ${isRecording
                                    ? 'bg-red-500 text-white border-red-400 shadow-[0_0_12px_rgba(239,68,68,0.5)] animate-pulse'
                                    : 'bg-slate-50 dark:bg-slate-800 text-slate-600 dark:text-slate-300 border-slate-200 dark:border-slate-700 hover:border-red-400 hover:text-red-500'
                                }`}
                            title={isRecording ? 'Detener y descargar' : 'Iniciar grabacion'}
                        >
                            {isRecording
                                ? <><Square size={12} /><span>{formatTime(recordingTime)}</span></>
                                : <><Circle size={12} /><span>Grabar</span></>
                            }
                        </button>

                        <div className="w-px h-5 bg-slate-200 dark:bg-slate-700"></div>

                        <button onClick={handleSnapshot}
                            className="p-1.5 rounded-lg bg-slate-50 dark:bg-slate-800 text-slate-500 dark:text-slate-400 border border-slate-200 dark:border-slate-700 hover:border-emerald-500/50 hover:text-emerald-500 dark:hover:text-emerald-400 shadow-sm active:scale-90 transition-all" title="Capturar">
                            <Aperture size={16} />
                        </button>
                        <button onClick={() => setTrackingMode(!trackingMode)}
                            className={`p-1.5 rounded-lg transition-all shadow-sm ${trackingMode ? 'bg-red-50 dark:bg-red-500/20 text-red-600 dark:text-red-400 border border-red-300 dark:border-red-500/30 shadow-[0_0_10px_rgba(239,68,68,0.2)]' : 'bg-slate-50 dark:bg-slate-800 text-slate-500 dark:text-slate-400 border border-slate-200 dark:border-slate-700 hover:border-slate-300 dark:hover:border-slate-600'}`} title="Seguimiento">
                            <Focus size={16} />
                        </button>
                        <button onClick={() => setNightMode(!nightMode)}
                            className={`p-1.5 rounded-lg transition-all shadow-sm ${nightMode ? 'bg-emerald-50 dark:bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 border border-emerald-300 dark:border-emerald-500/30 shadow-[0_0_10px_rgba(16,185,129,0.2)]' : 'bg-slate-50 dark:bg-slate-800 text-slate-500 dark:text-slate-400 border border-slate-200 dark:border-slate-700 hover:border-slate-300 dark:hover:border-slate-600'}`} title="Nocturno">
                            <Moon size={16} />
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
};

export default VideoCard;
