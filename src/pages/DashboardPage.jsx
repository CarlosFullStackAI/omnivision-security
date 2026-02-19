import React, { useState } from 'react';
import {
    Bell, Settings as SettingsIcon, LogOut, Video, Battery, Plus,
    Radar, Search, BrainCircuit, Zap, RefreshCw, CheckCircle2, AlertTriangle,
    Activity, AlertCircle, Sun, Moon, Laptop, Home, ImageIcon, Camera, Smartphone, Monitor
} from 'lucide-react';

import AnimatedBackground from '../components/layout/AnimatedBackground';
import OmniLogo from '../components/ui/OmniLogo';
import Button from '../components/ui/Button';
import VideoCard from '../components/surveillance/VideoCard';
import { useTheme } from '../context/ThemeContext';
import { useNetworkScan } from '../hooks/useNetworkScan';

const DashboardPage = ({ user, onLogout }) => {
    const { theme, setTheme } = useTheme();
    const [activeTab, setActiveTab] = useState('home');
    const [devices, setDevices] = useState([
        { id: 1, name: 'Entrada Principal', type: 'camera', ip: '192.168.1.12', port: '80', isOnline: true, battery: 92 },
        { id: 2, name: 'Samsung Antiguo', type: 'phone', ip: '192.168.1.45', port: '8080', isOnline: true, battery: 85 },
    ]);
    const [showAddModal, setShowAddModal] = useState(false);
    const [newDevice, setNewDevice] = useState({ name: '', type: 'phone', ip: '192.168.1.', port: '8080' });

    const [alerts, setAlerts] = useState([
        { id: 1, message: "Movimiento detectado: Entrada Principal", time: "Hace 5 min", type: "motion" },
        { id: 2, message: "Samsung Antiguo: Batería baja (15%)", time: "Hace 1 hora", type: "system" }
    ]);
    const unreadAlerts = alerts.length;

    const [toastMsg, setToastMsg] = useState('');
    const [useRealVideo, setUseRealVideo] = useState(false);
    const [groqStatus, setGroqStatus] = useState('idle');

    const { isScanning, scanProgress, startScan } = useNetworkScan();

    const showToast = (msg) => { setToastMsg(msg); setTimeout(() => setToastMsg(''), 3000); };

    const startNetworkScan = async () => {
        const found = await startScan('192.168.1');
        found.forEach(newDev => {
            if (!devices.find(d => d.ip === newDev.ip)) { setDevices(prev => [...prev, newDev]); showToast('Nuevos dispositivos'); }
        });
    };

    const handleAddDevice = (e) => {
        e.preventDefault();
        const mockBattery = Math.floor(Math.random() * 60) + 40;
        setDevices([...devices, { ...newDevice, id: Date.now(), isOnline: true, battery: mockBattery }]);
        setShowAddModal(false); setNewDevice({ name: '', type: 'phone', ip: '192.168.1.', port: '8080' });
        setActiveTab('home'); showToast('Cámara añadida');
    };

    const handleEditDeviceName = (id, newName) => {
        setDevices(devices.map(d => d.id === id ? { ...d, name: newName } : d));
        showToast('Nombre actualizado');
    };

    const handleSnapshotEvent = (deviceName) => {
        showToast(`Evidencia: ${deviceName}`);
        setAlerts(prev => [{ id: Date.now(), message: `Captura guardada: ${deviceName}`, time: "Justo ahora", type: "system" }, ...prev]);
    };

    const handleGroqAnalysis = () => {
        setGroqStatus('analyzing');
        setTimeout(() => {
            if (Math.random() > 0.7) {
                setGroqStatus('alert');
                setAlerts(prev => [{ id: Date.now(), message: "⚠️ Groq AI: Persona desconocida detectada.", time: "Justo ahora", type: "critical" }, ...prev]);
                showToast('¡ALERTA DETECTADA!');
                setTimeout(() => setGroqStatus('idle'), 4000);
            } else {
                setGroqStatus('clean'); setTimeout(() => setGroqStatus('idle'), 3000);
            }
        }, 2500);
    };

    return (
        <div className="min-h-screen flex flex-col relative z-10 pb-20 md:pb-0 md:pt-20">
            <AnimatedBackground />

            {/* Toast Notification */}
            {toastMsg && (
                <div className="fixed top-24 left-1/2 -translate-x-1/2 z-50 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-800 dark:text-white px-5 py-3 rounded-full shadow-[0_10px_40px_rgba(16,185,129,0.3)] flex items-center gap-3 animate-in fade-in slide-in-from-top-4 font-semibold">
                    <ImageIcon size={18} className="text-emerald-500" />
                    <span className="text-sm">{toastMsg}</span>
                </div>
            )}

            {/* HEADER TOP */}
            <header className="bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl border-b border-slate-200 dark:border-slate-800 p-4 fixed top-0 w-full flex justify-between items-center shadow-sm dark:shadow-none transition-colors z-50">
                <div className="flex items-center gap-3 max-w-7xl mx-auto w-full">
                    <OmniLogo size="sm" />
                    <h1 className="text-xl font-extrabold text-slate-900 dark:text-white tracking-wide leading-none hidden sm:block">OMNI<span className="text-emerald-500">VISION</span></h1>

                    <div className="ml-auto flex items-center gap-4">
                        <button onClick={() => setActiveTab('alerts')} className="relative p-2 text-slate-500 hover:text-emerald-500 transition-colors md:hidden">
                            <Bell size={24} />
                            {unreadAlerts > 0 && <span className="absolute top-1 right-1 w-2.5 h-2.5 bg-red-500 rounded-full animate-pulse border-2 border-white dark:border-slate-900"></span>}
                        </button>

                        <div className="hidden md:flex items-center gap-4">
                            <Button variant="ghost" icon={Bell} onClick={() => setActiveTab('alerts')} className="!p-2 relative">
                                {unreadAlerts > 0 && <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full animate-pulse"></span>}
                            </Button>
                            <Button variant="ghost" icon={SettingsIcon} onClick={() => setActiveTab('settings')} className="!p-2">Ajustes</Button>
                            <Button variant="ghost" icon={LogOut} onClick={onLogout} className="!p-2 text-slate-500 hover:text-red-500">Salir</Button>
                        </div>
                    </div>
                </div>
            </header>

            {/* CONTENIDO PRINCIPAL */}
            <main className="flex-1 w-full max-w-7xl mx-auto p-4 flex flex-col z-10">

                {/* PESTAÑA: HOME */}
                {activeTab === 'home' && (
                    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-300">
                        <div className="flex gap-4 overflow-x-auto pb-4 pt-2 snap-x hide-scrollbar px-1">
                            <div className="snap-start shrink-0 w-48 bg-white/90 dark:bg-slate-900/90 backdrop-blur-md p-5 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-lg dark:shadow-none transition-colors relative overflow-hidden">
                                <div className="absolute top-0 right-0 w-20 h-20 bg-emerald-500/10 rounded-bl-full"></div>
                                <Video size={24} className="text-emerald-500 mb-3 drop-shadow-[0_0_5px_rgba(16,185,129,0.5)]" />
                                <div className="text-3xl font-extrabold text-slate-800 dark:text-white">{devices.length}</div>
                                <div className="text-xs text-slate-500 dark:text-slate-400 font-bold uppercase mt-1 tracking-wider">Dispositivos</div>
                            </div>
                            <div className="snap-start shrink-0 w-48 bg-white/90 dark:bg-slate-900/90 backdrop-blur-md p-5 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-lg dark:shadow-none transition-colors relative overflow-hidden">
                                <div className="absolute top-0 right-0 w-20 h-20 bg-orange-500/10 rounded-bl-full"></div>
                                <Battery size={24} className="text-orange-500 mb-3 drop-shadow-[0_0_5px_rgba(249,115,22,0.5)]" />
                                <div className="text-3xl font-extrabold text-slate-800 dark:text-white">{devices.filter(d => d.type === 'phone' && d.battery < 20).length}</div>
                                <div className="text-xs text-slate-500 dark:text-slate-400 font-bold uppercase mt-1 tracking-wider">Baterías Bajas</div>
                            </div>
                            <div className="snap-start shrink-0 w-48 bg-emerald-50/90 dark:bg-emerald-900/20 backdrop-blur-md p-5 rounded-3xl border border-emerald-200 dark:border-emerald-500/30 cursor-pointer active:scale-95 transition-all shadow-lg dark:shadow-[0_0_15px_rgba(16,185,129,0.1)] group flex flex-col justify-center items-center text-center" onClick={() => setShowAddModal(true)}>
                                <div className="bg-emerald-500 p-3 rounded-full shadow-[0_0_20px_rgba(16,185,129,0.5)] group-hover:scale-110 transition-transform mb-2">
                                    <Plus size={24} className="text-white" />
                                </div>
                                <div className="text-sm font-bold text-emerald-700 dark:text-emerald-400">Añadir Nueva</div>
                            </div>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                            {devices.map((device) => (
                                <VideoCard key={device.id} device={device} useRealVideo={useRealVideo} onSnapshot={handleSnapshotEvent} onRemove={(id) => setDevices(devices.filter(d => d.id !== id))} onEditName={handleEditDeviceName} />
                            ))}
                        </div>
                    </div>
                )}

                {/* PESTAÑA: RADAR */}
                {activeTab === 'radar' && (
                    <div className="flex flex-col items-center justify-center py-10 animate-in fade-in duration-300 flex-1">
                        <div className="relative w-72 h-72 mb-8">
                            <div className="absolute inset-0 rounded-full border border-emerald-200 dark:border-emerald-900/50 shadow-[inset_0_0_50px_rgba(16,185,129,0.1)]"></div>
                            <div className="absolute inset-8 rounded-full border border-emerald-300 dark:border-emerald-900/40"></div>
                            <div className="absolute inset-16 rounded-full border border-emerald-400/50 dark:border-emerald-900/20"></div>
                            <div className="absolute inset-0 flex items-center justify-center">
                                <Radar size={64} className={`${isScanning ? 'text-emerald-500 drop-shadow-[0_0_25px_rgba(16,185,129,0.8)] animate-pulse' : 'text-slate-300 dark:text-slate-700'}`} />
                            </div>
                            {isScanning && (
                                <div className="absolute top-1/2 left-1/2 w-36 h-36 origin-top-left bg-gradient-to-br from-emerald-500/50 to-transparent animate-[spin_2s_linear_infinite] pointer-events-none rounded-br-full" style={{ transformOrigin: '0 0' }}></div>
                            )}
                        </div>
                        <h2 className="text-2xl font-extrabold text-slate-800 dark:text-white mb-3">Escáner de Red Local</h2>
                        {isScanning ? (
                            <div className="w-full max-w-sm bg-white/80 dark:bg-slate-900/80 backdrop-blur-md p-6 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-xl">
                                <div className="flex justify-between text-xs text-emerald-600 dark:text-emerald-500 font-bold mb-3 tracking-widest">
                                    <span>ANALIZANDO PUERTOS...</span>
                                    <span>{Math.round(scanProgress)}%</span>
                                </div>
                                <div className="h-3 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden shadow-inner">
                                    <div className="h-full bg-emerald-500 transition-all duration-300 shadow-[0_0_15px_rgba(16,185,129,0.8)] relative" style={{ width: `${scanProgress}%` }}>
                                        <div className="absolute inset-0 bg-[linear-gradient(90deg,transparent,rgba(255,255,255,0.4),transparent)] animate-[scanline_1s_infinite]"></div>
                                    </div>
                                </div>
                            </div>
                        ) : (
                            <Button onClick={startNetworkScan} icon={Search} className="px-10 py-4 text-lg rounded-full">
                                Iniciar Escaneo
                            </Button>
                        )}
                    </div>
                )}

                {/* PESTAÑA: GROQ IA */}
                {activeTab === 'groq' && (
                    <div className="flex flex-col py-6 animate-in fade-in duration-300 flex-1 max-w-lg mx-auto w-full">
                        <div className="bg-white/90 dark:bg-slate-900/90 backdrop-blur-xl rounded-3xl p-8 border border-orange-200 dark:border-orange-500/20 shadow-2xl dark:shadow-[0_0_40px_rgba(234,88,12,0.05)] relative overflow-hidden transition-colors">
                            <div className="absolute -top-10 -right-10 p-4 opacity-5 dark:opacity-10 rotate-12"><BrainCircuit size={150} className="text-orange-500" /></div>
                            <div className="inline-flex items-center gap-2 bg-orange-50 dark:bg-orange-500/10 text-orange-600 dark:text-orange-400 px-4 py-2 rounded-full text-xs font-bold mb-6 border border-orange-200 dark:border-orange-500/20 shadow-sm">
                                <Zap size={16} className="drop-shadow-[0_0_5px_rgba(249,115,22,0.8)]" /> POTENCIADO POR GROQ LPU
                            </div>
                            <h2 className="text-3xl font-extrabold text-slate-800 dark:text-white mb-4">Análisis Inteligente</h2>
                            <p className="text-base text-slate-600 dark:text-slate-400 mb-8 leading-relaxed font-medium">
                                Ejecuta modelos visuales Llama 3 sobre todas tus cámaras para detectar intrusos a hiper-velocidad.
                            </p>

                            <Button
                                className={`w-full mt-8 py-5 rounded-2xl text-lg shadow-xl ${groqStatus === 'idle' ? 'bg-orange-500 hover:bg-orange-600 text-white shadow-[0_10px_30px_rgba(249,115,22,0.4)] border border-orange-400' :
                                        groqStatus === 'analyzing' ? 'bg-slate-100 dark:bg-slate-800 text-orange-600 dark:text-orange-400 border border-orange-300 dark:border-orange-500/50' :
                                            groqStatus === 'alert' ? 'bg-red-500 text-white animate-pulse shadow-[0_10px_30px_rgba(239,68,68,0.6)]' :
                                                'bg-emerald-500 text-white shadow-[0_10px_30px_rgba(16,185,129,0.4)]'
                                    }`}
                                icon={groqStatus === 'clean' ? CheckCircle2 : groqStatus === 'analyzing' ? RefreshCw : groqStatus === 'alert' ? AlertTriangle : BrainCircuit}
                                onClick={handleGroqAnalysis}
                                disabled={groqStatus === 'analyzing'}
                            >
                                {groqStatus === 'idle' && 'Ejecutar Inferencia IA'}
                                {groqStatus === 'analyzing' && 'Procesando tensores...'}
                                {groqStatus === 'clean' && 'Análisis Limpio'}
                                {groqStatus === 'alert' && '¡AMENAZA DETECTADA!'}
                            </Button>
                        </div>
                    </div>
                )}

                {/* PESTAÑA: ALERTAS */}
                {activeTab === 'alerts' && (
                    <div className="flex flex-col py-2 animate-in fade-in duration-300 max-w-lg mx-auto w-full">
                        <h2 className="text-2xl font-extrabold text-slate-800 dark:text-white mb-6 flex items-center gap-3"><Bell className="text-emerald-500 drop-shadow-[0_0_5px_rgba(16,185,129,0.5)]" /> Centro de Alertas</h2>
                        <div className="space-y-4">
                            {alerts.length === 0 ? (
                                <p className="text-slate-500 font-medium text-center py-10">No hay alertas recientes.</p>
                            ) : (
                                alerts.map(alert => (
                                    <div key={alert.id} className={`p-5 rounded-3xl border shadow-lg transition-colors bg-white/80 dark:bg-slate-900/80 backdrop-blur-md ${alert.type === 'critical' ? 'border-red-200 dark:border-red-500/30 shadow-[0_5px_20px_rgba(239,68,68,0.1)]' :
                                            alert.type === 'system' ? 'border-orange-200 dark:border-orange-500/30 shadow-[0_5px_20px_rgba(249,115,22,0.1)]' :
                                                'border-slate-200 dark:border-slate-800'
                                        }`}>
                                        <div className="flex items-start gap-4">
                                            <div className={`p-3 rounded-full ${alert.type === 'critical' ? 'bg-red-100 dark:bg-red-500/20' : alert.type === 'system' ? 'bg-orange-100 dark:bg-orange-500/20' : 'bg-emerald-100 dark:bg-emerald-500/20'}`}>
                                                {alert.type === 'critical' ? <AlertTriangle className="text-red-600 dark:text-red-500 drop-shadow-md" size={24} /> :
                                                    alert.type === 'system' ? <AlertCircle className="text-orange-600 dark:text-orange-500 drop-shadow-md" size={24} /> :
                                                        <Activity className="text-emerald-600 dark:text-emerald-500 drop-shadow-md" size={24} />}
                                            </div>
                                            <div className="pt-1">
                                                <p className={`font-bold text-lg leading-tight ${alert.type === 'critical' ? 'text-red-700 dark:text-red-400' : 'text-slate-800 dark:text-slate-200'}`}>{alert.message}</p>
                                                <p className="text-sm font-semibold text-slate-500 dark:text-slate-500 mt-2">{alert.time}</p>
                                            </div>
                                        </div>
                                    </div>
                                ))
                            )}
                        </div>
                    </div>
                )}

                {/* PESTAÑA: AJUSTES */}
                {activeTab === 'settings' && (
                    <div className="flex flex-col py-2 animate-in fade-in duration-300 max-w-lg mx-auto w-full">
                        <h2 className="text-2xl font-extrabold text-slate-800 dark:text-white mb-6 flex items-center gap-3"><SettingsIcon className="text-emerald-500" /> Configuración</h2>
                        <div className="space-y-6">

                            <div className="bg-white/80 dark:bg-slate-900/80 backdrop-blur-md p-6 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-xl dark:shadow-none transition-colors">
                                <h3 className="font-extrabold text-slate-800 dark:text-white text-base mb-5">Apariencia de la Interfaz</h3>
                                <div className="grid grid-cols-3 gap-3 bg-slate-100 dark:bg-slate-950 p-1.5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-inner">
                                    <button onClick={() => setTheme('light')} className={`flex flex-col items-center gap-2 py-3 rounded-xl font-bold text-sm transition-all ${theme === 'light' ? 'bg-white dark:bg-slate-800 text-emerald-600 dark:text-emerald-400 shadow-md border border-slate-200 dark:border-slate-700' : 'text-slate-500 hover:text-slate-700 dark:hover:text-slate-300'}`}>
                                        <Sun size={20} /> Claro
                                    </button>
                                    <button onClick={() => setTheme('dark')} className={`flex flex-col items-center gap-2 py-3 rounded-xl font-bold text-sm transition-all ${theme === 'dark' ? 'bg-white dark:bg-slate-800 text-emerald-600 dark:text-emerald-400 shadow-md border border-slate-200 dark:border-slate-700' : 'text-slate-500 hover:text-slate-700 dark:hover:text-slate-300'}`}>
                                        <Moon size={20} /> Oscuro
                                    </button>
                                    <button onClick={() => setTheme('system')} className={`flex flex-col items-center gap-2 py-3 rounded-xl font-bold text-sm transition-all ${theme === 'system' ? 'bg-white dark:bg-slate-800 text-emerald-600 dark:text-emerald-400 shadow-md border border-slate-200 dark:border-slate-700' : 'text-slate-500 hover:text-slate-700 dark:hover:text-slate-300'}`}>
                                        <Laptop size={20} /> Sistema
                                    </button>
                                </div>
                            </div>

                            <div className="bg-white/80 dark:bg-slate-900/80 backdrop-blur-md p-6 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-xl dark:shadow-none flex justify-between items-center transition-colors">
                                <div className="pr-4">
                                    <h3 className="font-extrabold text-slate-800 dark:text-white text-base">Video Real (MJPEG)</h3>
                                    <p className="text-sm font-medium text-slate-500 mt-1">Cargar flujo IP local (Requiere red).</p>
                                </div>
                                <button onClick={() => setUseRealVideo(!useRealVideo)} className={`w-16 h-8 rounded-full transition-all relative border-2 ${useRealVideo ? 'bg-emerald-500 border-emerald-400 shadow-[0_0_15px_rgba(16,185,129,0.5)]' : 'bg-slate-200 dark:bg-slate-800 border-slate-300 dark:border-slate-700'}`}>
                                    <span className={`absolute top-0.5 w-6 h-6 bg-white rounded-full transition-all shadow-md ${useRealVideo ? 'left-8' : 'left-0.5'}`}></span>
                                </button>
                            </div>

                            <div className="mt-10 pt-8 border-t border-slate-200 dark:border-slate-800 text-center">
                                <OmniLogo size="sm" />
                                <p className="text-sm font-extrabold text-slate-800 dark:text-white mt-4 mb-1">OmniVision Security PRO</p>
                                <p className="text-xs text-slate-500 font-mono mb-6">v2.5.0 • Conectado a Cloudflare</p>
                                <Button variant="danger" className="w-full py-4 text-lg" icon={LogOut} onClick={onLogout}>Cerrar Sesión Segura</Button>
                            </div>
                        </div>
                    </div>
                )}

            </main>

            {/* MODAL AÑADIR DISPOSITIVO */}
            {showAddModal && (
                <div className="fixed inset-0 z-[100] flex flex-col justify-end">
                    <div className="absolute inset-0 bg-slate-900/60 dark:bg-black/80 backdrop-blur-sm transition-opacity" onClick={() => setShowAddModal(false)}></div>
                    <div className="bg-white dark:bg-slate-900 border-t border-slate-200 dark:border-slate-800 rounded-t-[2.5rem] w-full max-h-[90vh] overflow-y-auto relative z-10 animate-in slide-in-from-bottom pb-safe shadow-[0_-20px_50px_rgba(0,0,0,0.3)] transition-colors">
                        <div className="w-16 h-1.5 bg-slate-300 dark:bg-slate-700 rounded-full mx-auto mt-6 mb-4"></div>
                        <div className="p-8 pt-2">
                            <h2 className="text-2xl font-extrabold text-slate-800 dark:text-white mb-8 flex items-center gap-3"><div className="p-2 bg-emerald-100 dark:bg-emerald-500/20 rounded-full"><Plus className="text-emerald-600 dark:text-emerald-400" size={24} /></div> Añadir Dispositivo</h2>
                            <form onSubmit={handleAddDevice} className="space-y-6">
                                <div>
                                    <label className="block text-sm font-bold text-slate-600 dark:text-slate-400 mb-2">Nombre</label>
                                    <input type="text" required className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-2xl px-5 py-4 text-slate-900 dark:text-white focus:outline-none focus:border-emerald-500 focus:ring-4 focus:ring-emerald-500/20 font-medium text-lg transition-all shadow-sm" value={newDevice.name} onChange={(e) => setNewDevice({ ...newDevice, name: e.target.value })} />
                                </div>
                                <div className="grid grid-cols-2 gap-5">
                                    <div>
                                        <label className="block text-sm font-bold text-slate-600 dark:text-slate-400 mb-2">Dirección IP</label>
                                        <input type="text" required className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-2xl px-5 py-4 text-slate-900 dark:text-white font-mono focus:outline-none focus:border-emerald-500 focus:ring-4 focus:ring-emerald-500/20 text-lg transition-all shadow-sm" value={newDevice.ip} onChange={(e) => setNewDevice({ ...newDevice, ip: e.target.value })} />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-bold text-slate-600 dark:text-slate-400 mb-2">Puerto</label>
                                        <input type="text" required className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-2xl px-5 py-4 text-slate-900 dark:text-white font-mono focus:outline-none focus:border-emerald-500 focus:ring-4 focus:ring-emerald-500/20 text-lg transition-all shadow-sm" value={newDevice.port} onChange={(e) => setNewDevice({ ...newDevice, port: e.target.value })} />
                                    </div>
                                </div>
                                <div>
                                    <label className="block text-sm font-bold text-slate-600 dark:text-slate-400 mb-3">Tipo de Dispositivo</label>
                                    <div className="grid grid-cols-3 gap-4">
                                        {[{ id: 'phone', label: 'Celular', icon: Smartphone }, { id: 'camera', label: 'Cámara', icon: Camera }, { id: 'pc', label: 'PC', icon: Monitor }].map((type) => (
                                            <button key={type.id} type="button" onClick={() => setNewDevice({ ...newDevice, type: type.id })} className={`flex flex-col items-center justify-center gap-3 p-5 rounded-2xl border-2 transition-all active:scale-95 shadow-sm ${newDevice.type === type.id ? 'bg-emerald-50 dark:bg-emerald-500/10 border-emerald-500 text-emerald-600 dark:text-emerald-400 shadow-[0_0_20px_rgba(16,185,129,0.2)] scale-105' : 'bg-white dark:bg-slate-950 border-slate-200 dark:border-slate-800 text-slate-500 hover:border-slate-300 dark:hover:border-slate-700'}`}>
                                                <type.icon size={28} /><span className="text-sm font-extrabold">{type.label}</span>
                                            </button>
                                        ))}
                                    </div>
                                </div>
                                <div className="pt-6 mt-8">
                                    <Button type="submit" className="w-full py-5 text-xl rounded-2xl">Conectar Cámara</Button>
                                </div>
                            </form>
                        </div>
                    </div>
                </div>
            )}

            {/* NAVEGACIÓN INFERIOR MÓVIL */}
            <nav className="md:hidden fixed bottom-0 w-full bg-white/90 dark:bg-slate-900/90 backdrop-blur-2xl border-t border-slate-200 dark:border-slate-800 z-50 pb-safe transition-colors shadow-[0_-10px_30px_rgba(0,0,0,0.1)] dark:shadow-none">
                <div className="flex justify-around items-center h-20 px-2">
                    <button onClick={() => setActiveTab('home')} className={`flex flex-col items-center justify-center w-full h-full space-y-1.5 transition-all ${activeTab === 'home' ? 'text-emerald-600 dark:text-emerald-400 drop-shadow-[0_0_8px_rgba(16,185,129,0.5)] -translate-y-1' : 'text-slate-400 dark:text-slate-500 hover:text-slate-600 dark:hover:text-slate-300'}`}>
                        <Home size={24} />
                    </button>
                    <button onClick={() => setActiveTab('radar')} className={`flex flex-col items-center justify-center w-full h-full space-y-1.5 transition-all ${activeTab === 'radar' ? 'text-emerald-600 dark:text-emerald-400 drop-shadow-[0_0_8px_rgba(16,185,129,0.5)] -translate-y-1' : 'text-slate-400 dark:text-slate-500 hover:text-slate-600 dark:hover:text-slate-300'}`}>
                        <Radar size={24} />
                    </button>

                    <div className="relative -top-8 flex justify-center w-full">
                        <button onClick={() => setShowAddModal(true)} className="bg-emerald-500 dark:bg-emerald-600 text-white p-4 rounded-full shadow-[0_15px_35px_rgba(16,185,129,0.6)] border-[6px] border-slate-50 dark:border-slate-950 active:scale-90 transition-transform">
                            <Plus size={32} strokeWidth={3} />
                        </button>
                    </div>

                    <button onClick={() => setActiveTab('groq')} className={`flex flex-col items-center justify-center w-full h-full space-y-1.5 transition-all ${activeTab === 'groq' ? 'text-orange-500 drop-shadow-[0_0_8px_rgba(249,115,22,0.5)] -translate-y-1' : 'text-slate-400 dark:text-slate-500 hover:text-slate-600 dark:hover:text-slate-300'}`}>
                        <BrainCircuit size={24} />
                    </button>

                    <button onClick={() => setActiveTab('alerts')} className={`flex flex-col items-center justify-center w-full h-full space-y-1.5 relative transition-all ${activeTab === 'alerts' ? 'text-emerald-600 dark:text-emerald-400 drop-shadow-[0_0_8px_rgba(16,185,129,0.5)] -translate-y-1' : 'text-slate-400 dark:text-slate-500 hover:text-slate-600 dark:hover:text-slate-300'}`}>
                        <Bell size={24} />
                        {unreadAlerts > 0 && <span className="absolute top-3 right-5 w-3 h-3 bg-red-500 rounded-full animate-pulse border-2 border-white dark:border-slate-900"></span>}
                    </button>
                </div>
            </nav>
        </div>
    );
};

export default DashboardPage;
