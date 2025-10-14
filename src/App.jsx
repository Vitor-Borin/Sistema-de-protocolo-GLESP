import React, { useState, useEffect } from 'react';
import AuthComponent from './components/AuthComponent';
import Dashboard from './components/Dashboard';
import { Loader, AlertCircle } from 'lucide-react';
import { ThemeProvider } from './contexts/ThemeContext';
import { AccessibilityProvider } from './components/AccessibilityAnnouncer';
import './index.css';

export default function App() {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    const handleLogin = (userData) => {
        try {
            setUser(userData);
            setError(null);
        } catch (err) {
            console.error('Erro no login:', err);
            setError('Erro ao fazer login. Tente novamente.');
        }
    };

    const handleLogout = () => {
        try {
            setUser(null);
            setError(null);
        } catch (err) {
            console.error('Erro no logout:', err);
            setError('Erro ao fazer logout.');
        }
    };

    // Componente de erro
    const ErrorBoundary = ({ error, onRetry }) => (
        <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex flex-col justify-center items-center p-4">
            <div className="max-w-md w-full bg-white dark:bg-gray-800 rounded-xl shadow-lg p-8 text-center">
                <AlertCircle className="mx-auto h-16 w-16 text-red-500 mb-4" />
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
                    Ops! Algo deu errado
                </h2>
                <p className="text-gray-600 dark:text-gray-300 mb-6">
                    {error || 'Ocorreu um erro inesperado. Tente recarregar a página.'}
                </p>
                <button
                    onClick={onRetry}
                    className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                >
                    Tentar Novamente
                </button>
            </div>
        </div>
    );

    if (loading) {
        return (
            <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex justify-center items-center">
                <div className="text-center">
                    <Loader className="animate-spin h-12 w-12 text-blue-600 mx-auto mb-4" />
                    <p className="text-gray-600 dark:text-gray-300">Carregando...</p>
                </div>
            </div>
        );
    }

    if (error) {
        return <ErrorBoundary error={error} onRetry={() => setError(null)} />;
    }
    
    return (
        <ThemeProvider>
            <AccessibilityProvider>
                {user ? (
                    <Dashboard user={user} onLogout={handleLogout} />
                ) : (
                    <AuthComponent onLogin={handleLogin} />
                )}
            </AccessibilityProvider>
        </ThemeProvider>
    );
}
