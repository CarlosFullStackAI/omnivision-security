import React from 'react';

const Button = ({ children, onClick, variant = 'primary', className = '', icon: Icon, disabled, type = "button" }) => {
    const baseStyle = "flex items-center justify-center gap-2 px-4 py-3 sm:py-2 rounded-xl sm:rounded-lg font-semibold sm:font-medium transition-all duration-300 active:scale-95 disabled:opacity-50 disabled:active:scale-100 relative overflow-hidden group";

    const variants = {
        primary: "bg-emerald-500 hover:bg-emerald-400 dark:bg-emerald-600 dark:hover:bg-emerald-500 text-white shadow-[0_0_15px_rgba(16,185,129,0.4)] hover:shadow-[0_0_25px_rgba(16,185,129,0.7)] border border-emerald-400/50 dark:border-emerald-500/50",
        secondary: "bg-white dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 border border-slate-200 dark:border-slate-700 shadow-sm",
        danger: "bg-red-500/10 dark:bg-red-600/10 hover:bg-red-500/20 dark:hover:bg-red-600/20 text-red-600 dark:text-red-500 border border-red-500/30 hover:border-red-500/50 shadow-[0_0_10px_rgba(239,68,68,0.2)] hover:shadow-[0_0_20px_rgba(239,68,68,0.4)]",
        outline: "bg-transparent hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-300 dark:border-slate-700",
        ghost: "bg-transparent hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-500 hover:text-emerald-600 dark:text-slate-400 dark:hover:text-emerald-400"
    };

    return (
        <button type={type} onClick={onClick} className={`${baseStyle} ${variants[variant]} ${className}`} disabled={disabled}>
            {variant === 'primary' && <div className="absolute inset-0 bg-[linear-gradient(45deg,transparent_25%,rgba(255,255,255,0.2)_50%,transparent_75%)] bg-[length:250%_250%,100%_100%] bg-no-repeat transition-all duration-1000 ease-out translate-x-[-100%] group-hover:translate-x-[100%]"></div>}
            {Icon && <Icon size={20} className="relative z-10" />}
            <span className="relative z-10">{children}</span>
        </button>
    );
};

export default Button;
