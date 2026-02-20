import React, { useEffect, useRef } from 'react';
import { X, Wifi } from 'lucide-react';

const WebRTCCard = ({ camera, onRemove }) => {
    const videoRef = useRef(null);

    useEffect(() => {
        if (videoRef.current && camera.stream) {
            videoRef.current.srcObject = camera.stream;
        }
    }, [camera.stream]);

    return (
        <div className="bg-white/80 dark:bg-slate-900/80 backdrop-blur-sm rounded-2xl overflow-hidden border-2 border-emerald-400/60 dark:border-emerald-500/40 shadow-[0_0_25px_rgba(16,185,129,0.2)] flex flex-col relative">
            {/* Badge WebRTC */}
            <div className="absolute top-12 left-2 z-30 flex items-center gap-1 bg-emerald-500 text-white text-[9px] font-bold px-2 py-0.5 rounded-full shadow-lg">
                <Wifi size={9} /> P2P LIVE
            </div>

            {/* Header */}
            <div className="p-3 bg-white/90 dark:bg-slate-900/90 backdrop-blur border-b border-emerald-200 dark:border-emerald-500/20 flex justify-between items-center">
                <div className="flex items-center gap-2">
                    <div className="relative">
                        <div className="absolute w-3 h-3 rounded-full bg-emerald-500 animate-ping opacity-40"></div>
                        <div className="relative w-2 h-2 rounded-full bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,1)]"></div>
                    </div>
                    <span className="font-semibold text-sm text-slate-800 dark:text-slate-200 truncate max-w-[150px]">
                        {camera.name}
                    </span>
                    <span className="text-[10px] font-bold bg-emerald-100 dark:bg-emerald-500/20 text-emerald-700 dark:text-emerald-400 px-2 py-0.5 rounded-full border border-emerald-200 dark:border-emerald-500/30">
                        WebRTC
                    </span>
                </div>
                <button onClick={() => onRemove(camera.id)} className="p-1.5 text-slate-400 hover:text-red-500 transition-colors rounded-lg hover:bg-red-50 dark:hover:bg-red-500/10">
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
                    className="w-full h-full object-cover"
                />
                {!camera.stream && (
                    <div className="absolute inset-0 flex flex-col items-center justify-center gap-3">
                        <div className="w-8 h-8 border-2 border-emerald-500 border-t-transparent rounded-full animate-spin"></div>
                        <span className="text-xs text-slate-400 font-mono">Conectando...</span>
                    </div>
                )}
                {/* LIVE badge */}
                <div className="absolute top-2 left-2 flex items-center gap-1.5 bg-black/60 backdrop-blur-md px-2 py-0.5 rounded text-[10px] font-mono text-white border border-white/10">
                    <span className="w-1.5 h-1.5 bg-red-500 rounded-full animate-pulse shadow-[0_0_5px_rgba(239,68,68,0.8)]"></span> LIVE
                </div>
            </div>

            {/* Footer */}
            <div className="p-2.5 bg-white/90 dark:bg-slate-900 border-t border-emerald-100 dark:border-emerald-500/10 flex items-center justify-between">
                <span className="text-[11px] text-slate-500 dark:text-slate-400 font-medium">Camara del dispositivo</span>
                <span className="text-[10px] font-mono font-bold text-emerald-500 dark:text-emerald-400">WebRTC • P2P</span>
            </div>
        </div>
    );
};

export default WebRTCCard;
