import { useState, useEffect } from 'react';

export default function Toast({ message, type = 'success', onClose, duration = 4000 }) {
    const [visible, setVisible] = useState(true);

    useEffect(() => {
        const timer = setTimeout(() => {
            setVisible(false);
            setTimeout(onClose, 300);
        }, duration);
        return () => clearTimeout(timer);
    }, [duration, onClose]);

    if (!visible) return null;

    const bgColor = type === 'success' ? 'bg-emerald-500' : 'bg-red-500';
    const icon = type === 'success' ? '✓' : '✕';

    return (
        <div
            className={`fixed bottom-6 right-6 px-5 py-3.5 rounded-xl text-white text-sm font-medium shadow-lg z-[2000] animate-slide-in-right flex items-center gap-2 ${bgColor}`}
        >
            <span>{icon}</span>
            <span>{message}</span>
            <button
                className="ml-2 text-white/80 hover:text-white text-lg"
                onClick={onClose}
            >
                ×
            </button>
        </div>
    );
}
