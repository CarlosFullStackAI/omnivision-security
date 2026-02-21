import React from 'react';

const AnimatedBackground = () => (
    <div className="fixed inset-0 z-0 overflow-hidden pointer-events-none">
        <div className="absolute inset-0 bg-grid-pattern opacity-70"></div>
        <div className="absolute top-[-10%] -left-10 w-96 h-96 bg-emerald-500/20 dark:bg-emerald-600/10 rounded-full animate-blob blob-blur"></div>
        <div className="absolute top-[20%] -right-10 w-96 h-96 bg-teal-500/20 dark:bg-teal-600/10 rounded-full animate-blob animation-delay-2000 blob-blur"></div>
        <div className="absolute -bottom-20 left-[20%] w-96 h-96 bg-emerald-400/20 dark:bg-green-600/10 rounded-full animate-blob animation-delay-4000 blob-blur"></div>
    </div>
);

export default AnimatedBackground;
