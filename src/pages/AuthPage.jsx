import React, { useState } from 'react';
import { Mail, Lock, Key } from 'lucide-react';
import AnimatedBackground from '../components/layout/AnimatedBackground';
import OmniLogo from '../components/ui/OmniLogo';
import Button from '../components/ui/Button';
import Input from '../components/ui/Input';

const AuthPage = ({ onLogin }) => {
    const [view, setView] = useState('login');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [message, setMessage] = useState('');

    const handleAuth = (e) => {
        e.preventDefault();
        setIsLoading(true);
        setMessage('');

        setTimeout(() => {
            setIsLoading(false);
            if (view === 'forgot') {
                setMessage('Enlace enviado a tu correo.');
                setTimeout(() => { setMessage(''); setView('login'); }, 3000);
            } else if (view === 'login') {
                if (email === 'carlos45335@gmail.com' && password === 'test123456') {
                    onLogin({ email, name: 'Carlos' });
                } else {
                    setMessage('Correo o contraseña incorrectos.');
                }
            } else {
                setMessage('Registro en desarrollo.');
                setTimeout(() => { setMessage(''); }, 3000);
            }
        }, 1000);
    };

    return (
        <div className="min-h-screen flex flex-col p-6 relative justify-center z-10">
            <AnimatedBackground />

            <div className="w-full max-w-md mx-auto z-10 animate-in fade-in zoom-in-95 duration-500">
                <div className="flex flex-col items-center mb-10">
                    <OmniLogo size="lg" />
                    <h1 className="text-4xl font-extrabold text-slate-900 dark:text-white tracking-tight drop-shadow-sm mt-6">OMNI<span className="text-emerald-500 drop-shadow-[0_0_15px_rgba(16,185,129,0.4)]">VISION</span></h1>
                    <p className="text-slate-500 dark:text-slate-400 mt-2 tracking-widest text-xs font-mono uppercase">Sistema Central Seguro</p>
                </div>

                <form onSubmit={handleAuth} className="space-y-5 bg-white/70 dark:bg-slate-900/60 p-8 rounded-3xl border border-white dark:border-slate-800/50 backdrop-blur-2xl shadow-[0_20px_50px_rgba(0,0,0,0.1)] dark:shadow-emerald-900/5 transition-all">
                    <Input icon={Mail} type="email" placeholder="Correo electrónico" value={email} onChange={(e) => setEmail(e.target.value)} required />
                    {view !== 'forgot' && <Input icon={Lock} type="password" placeholder="Contraseña" value={password} onChange={(e) => setPassword(e.target.value)} required />}

                    {message && (
                        <div className={`p-3 rounded-xl text-sm font-medium text-center shadow-inner ${message.includes('incorrectos') ? 'bg-red-50 text-red-600 border border-red-200 dark:bg-red-500/10 dark:text-red-400 dark:border-red-500/30 animate-pulse' : 'bg-emerald-50 text-emerald-600 border border-emerald-200 dark:bg-emerald-500/10 dark:text-emerald-400 dark:border-emerald-500/30'}`}>
                            {message}
                        </div>
                    )}

                    <Button type="submit" className="w-full py-4 text-lg rounded-xl mt-4" icon={view === 'forgot' ? Key : Lock} disabled={isLoading}>
                        {isLoading ? 'Conectando...' : (view === 'login' ? 'Acceder al Panel' : view === 'register' ? 'Registrarse' : 'Enviar Enlace')}
                    </Button>
                </form>

                <div className="mt-8 flex flex-col items-center gap-4 text-sm font-medium">
                    {view === 'login' ? (
                        <button onClick={() => setView('register')} className="text-emerald-600 dark:text-emerald-500 hover:text-emerald-700 dark:hover:text-emerald-400 bg-white dark:bg-emerald-500/10 px-6 py-2 rounded-full transition-all border border-emerald-100 dark:border-emerald-500/20 shadow-md hover:shadow-lg">Crear una cuenta nueva</button>
                    ) : (
                        <button onClick={() => setView('login')} className="text-emerald-600 dark:text-emerald-500 hover:text-emerald-700 dark:hover:text-emerald-400 bg-white dark:bg-emerald-500/10 px-6 py-2 rounded-full transition-all border border-emerald-100 dark:border-emerald-500/20 shadow-md hover:shadow-lg">Volver a Iniciar Sesión</button>
                    )}
                </div>
            </div>
        </div>
    );
};

export default AuthPage;
