import React, { createContext, useContext, useEffect, useState } from 'react';

const ThemeContext = createContext();

export const useTheme = () => useContext(ThemeContext);

export const ThemeProvider = ({ children }) => {
    const [theme, setTheme] = useState('system');
    const [isDark, setIsDark] = useState(true);

    useEffect(() => {
        const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
        const applyTheme = () => {
            const isDarkMode = theme === 'dark' || (theme === 'system' && mediaQuery.matches);
            setIsDark(isDarkMode);
            if (isDarkMode) {
                document.documentElement.classList.add('dark');
            } else {
                document.documentElement.classList.remove('dark');
            }
        };
        applyTheme();
        const handler = () => { if (theme === 'system') applyTheme(); };
        mediaQuery.addEventListener('change', handler);
        return () => mediaQuery.removeEventListener('change', handler);
    }, [theme]);

    // Ensure dark class is applied to html/body
    useEffect(() => {
        if (isDark) {
            document.documentElement.classList.add('dark');
        } else {
            document.documentElement.classList.remove('dark');
        }
    }, [isDark]);

    return (
        <ThemeContext.Provider value={{ theme, setTheme, isDark }}>
            <div className={`${isDark ? 'dark' : ''} min-h-screen w-full relative`}>
                <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-200 transition-colors duration-500 overflow-x-hidden">
                    {children}
                </div>
            </div>
        </ThemeContext.Provider>
    );
};
