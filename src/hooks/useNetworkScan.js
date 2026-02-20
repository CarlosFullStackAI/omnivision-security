import { useState, useCallback } from 'react';

export const useNetworkScan = () => {
    const [isScanning, setIsScanning] = useState(false);
    const [scanProgress, setScanProgress] = useState(0);

    const startScan = useCallback(async () => {
        setIsScanning(true);
        setScanProgress(0);

        // Simular progreso visual mientras espera la API
        let progress = 0;
        const progressInterval = setInterval(() => {
            progress = Math.min(progress + 1.5, 88);
            setScanProgress(progress);
        }, 120);

        try {
            const response = await fetch('/api/scan');
            if (!response.ok) throw new Error('API no disponible');
            const data = await response.json();
            clearInterval(progressInterval);
            setScanProgress(100);
            return data.devices || [];
        } catch {
            // Fallback simulado si el servidor API no esta corriendo
            clearInterval(progressInterval);
            setScanProgress(100);
            return [];
        } finally {
            setTimeout(() => setIsScanning(false), 600);
        }
    }, []);

    return { isScanning, scanProgress, startScan };
};
