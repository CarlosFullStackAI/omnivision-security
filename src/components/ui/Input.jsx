import React from 'react';

const Input = ({ icon: Icon, type = "text", placeholder, value, onChange, required }) => (
    <div className="relative group">
        <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none transition-colors group-focus-within:text-emerald-500">
            {Icon && <Icon size={20} className="text-slate-400 dark:text-slate-500 group-focus-within:text-emerald-500 dark:group-focus-within:text-emerald-400 transition-colors" />}
        </div>
        <input
            type={type}
            className={`w-full bg-white/80 focus:bg-white dark:bg-slate-900/80 border border-slate-200 dark:border-slate-700/80 rounded-xl ${Icon ? 'pl-12' : 'pl-4'} pr-4 py-3.5 text-slate-900 dark:text-white focus:outline-none focus:border-emerald-500 dark:focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 dark:focus:ring-emerald-500/40 transition-all placeholder-slate-400 dark:placeholder-slate-500 text-[16px] shadow-sm focus:shadow-[0_0_15px_rgba(16,185,129,0.15)] backdrop-blur-sm`}
            placeholder={placeholder}
            value={value}
            onChange={onChange}
            required={required}
        />
    </div>
);

export default Input;
