import React from 'react';
import { Shield, Aperture } from 'lucide-react';

const OmniLogo = ({ size = "lg" }) => {
    const dimensions = size === "lg" ? "w-20 h-20" : "w-10 h-10";
    const shieldSize = size === "lg" ? 56 : 28;
    const apertureSize = size === "lg" ? 28 : 14;
    const dotSize = size === "lg" ? "w-2 h-2" : "w-1 h-1";

    return (
        <div className={`relative flex items-center justify-center ${dimensions} rounded-2xl bg-gradient-to-br from-emerald-50 dark:from-emerald-500/10 to-white dark:to-emerald-900/20 border border-emerald-200 dark:border-emerald-500/30 shadow-[0_0_30px_rgba(16,185,129,0.2)] dark:shadow-[0_0_30px_rgba(16,185,129,0.15)] backdrop-blur-md overflow-hidden group`}>
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_120%,rgba(16,185,129,0.2),transparent)] opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>

            {/* Elementos del logo */}
            <Shield size={shieldSize} className="absolute text-emerald-200 dark:text-emerald-600/40 drop-shadow-md" strokeWidth={1.5} />
            <Aperture size={apertureSize} className="absolute text-emerald-600 dark:text-emerald-400 animate-[spin_12s_linear_infinite]" strokeWidth={2} />
            <div className={`absolute ${dotSize} bg-emerald-500 dark:bg-white rounded-full shadow-[0_0_10px_rgba(16,185,129,0.8)]`}></div>

            {/* Efecto de láser escaneando */}
            <div className="absolute top-0 left-0 w-full h-[2px] bg-emerald-400/80 dark:bg-emerald-400/50 shadow-[0_0_8px_rgba(16,185,129,1)] animate-scanline"></div>
        </div>
    );
};

export default OmniLogo;
