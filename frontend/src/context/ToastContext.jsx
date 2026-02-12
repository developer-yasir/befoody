import React, { createContext, useContext, useState, useCallback } from 'react';

const ToastContext = createContext();

export const useToast = () => {
    const context = useContext(ToastContext);
    if (!context) {
        throw new Error('useToast must be used within ToastProvider');
    }
    return context;
};

export const ToastProvider = ({ children }) => {
    const [toasts, setToasts] = useState([]);

    const addToast = useCallback((message, type = 'success') => {
        const id = Date.now();
        setToasts(prev => [...prev, { id, message, type }]);

        setTimeout(() => {
            setToasts(prev => prev.filter(toast => toast.id !== id));
        }, 3000);
    }, []);

    const removeToast = useCallback((id) => {
        setToasts(prev => prev.filter(toast => toast.id !== id));
    }, []);

    return (
        <ToastContext.Provider value={{ addToast, removeToast }}>
            {children}
            <div className="fixed top-20 right-4 z-50 space-y-2">
                {toasts.map(toast => (
                    <div
                        key={toast.id}
                        className={`min-w-[300px] px-6 py-4 rounded-lg shadow-2xl animate-slide-down ${toast.type === 'success' ? 'bg-green-500' :
                                toast.type === 'error' ? 'bg-red-500' :
                                    toast.type === 'warning' ? 'bg-yellow-500' :
                                        'bg-blue-500'
                            } text-white font-medium flex items-center gap-3`}
                    >
                        <span className="text-2xl">
                            {toast.type === 'success' ? '✓' :
                                toast.type === 'error' ? '✕' :
                                    toast.type === 'warning' ? '⚠' : 'ℹ'}
                        </span>
                        <span>{toast.message}</span>
                        <button
                            onClick={() => removeToast(toast.id)}
                            className="ml-auto text-white/80 hover:text-white"
                        >
                            ✕
                        </button>
                    </div>
                ))}
            </div>
        </ToastContext.Provider>
    );
};
