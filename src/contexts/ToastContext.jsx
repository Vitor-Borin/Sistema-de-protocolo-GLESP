import React, { createContext, useContext, useState, useCallback } from 'react';
import Toast from '../components/Toast';

const ToastContext = createContext();

export const useToast = () => {
    const context = useContext(ToastContext);
    if (!context) {
        throw new Error('useToast deve ser usado dentro de um ToastProvider');
    }
    return context;
};

export const ToastProvider = ({ children }) => {
    const [toasts, setToasts] = useState([]);

    const addToast = useCallback((toast) => {
        const id = Date.now() + Math.random();
        const newToast = {
            id,
            type: 'info',
            duration: 5000,
            ...toast
        };
        
        setToasts(prev => [...prev, newToast]);
        return id;
    }, []);

    const removeToast = useCallback((id) => {
        setToasts(prev => prev.filter(toast => toast.id !== id));
    }, []);

    const showSuccess = useCallback((title, message, duration = 4000) => {
        return addToast({ type: 'success', title, message, duration });
    }, [addToast]);

    const showError = useCallback((title, message, duration = 6000) => {
        return addToast({ type: 'error', title, message, duration });
    }, [addToast]);

    const showWarning = useCallback((title, message, duration = 5000) => {
        return addToast({ type: 'warning', title, message, duration });
    }, [addToast]);

    const showInfo = useCallback((title, message, duration = 4000) => {
        return addToast({ type: 'info', title, message, duration });
    }, [addToast]);

    const value = {
        addToast,
        removeToast,
        showSuccess,
        showError,
        showWarning,
        showInfo
    };

    return (
        <ToastContext.Provider value={value}>
            {children}
            <div className="fixed top-4 right-4 z-50 space-y-2">
                {toasts.map(toast => (
                    <Toast
                        key={toast.id}
                        {...toast}
                        onClose={removeToast}
                    />
                ))}
            </div>
        </ToastContext.Provider>
    );
};
