import React, { useState, useCallback, useMemo } from 'react';
import { GlespLogo } from './GlespLogo';
import { Loader, LogIn } from 'lucide-react';

const AuthComponent = React.memo(({ onLogin }) => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    // Dados de teste para o login - memoizado
    const MOCK_USER = useMemo(() => ({
        displayName: 'Eduardo',
        email: 'Eduardo@glesp.org.br',
        uid: '12345-test'
    }), []);

    const handleLogin = useCallback((e) => {
        e.preventDefault();
        setLoading(true);
        setError('');

        // Simula um pequeno atraso de rede
        setTimeout(() => {
            if (email === 'Eduardo@glesp.org.br' && password === '123456') {
                onLogin(MOCK_USER);
            } else {
                setError('Credenciais inválidas. Use os dados de teste.');
            }
            setLoading(false);
        }, 500);
    }, [email, password, onLogin, MOCK_USER]);

    return (
        <div className="min-h-screen bg-gray-50 dark:bg-[var(--bg-secondary)] flex flex-col justify-center items-center p-4">
            <div className="max-w-md w-full bg-white dark:bg-[var(--bg-card)] rounded-xl shadow-lg p-8 space-y-6">
                <div className="text-center">
                    <GlespLogo className="mx-auto h-24 w-auto" />
                    <h2 
                        className="
                            mt-4 text-3xl font-extrabold text-gray-900 dark:text-[var(--text-primary)]"
                    >
                        GLESP - Sistema de Protocolo
                    </h2>
                    <p 
                        className="
                            mt-2 text-sm text-gray-600 dark:text-[var(--text-secondary)]"
                    >
                        Faça login para continuar
                    </p>
                </div>
                <form className="space-y-6" onSubmit={handleLogin}>
                    <div className="rounded-md shadow-sm">
                        <div>
                            <input 
                                id="email-address" 
                                name="email" 
                                type="email" 
                                autoComplete="email" 
                                required 
                                className="
                                    appearance-none rounded-none relative block w-full px-3 py-2 
                                    border border-gray-300 dark:border-[var(--border-primary)] placeholder-gray-500 text-gray-900 dark:text-[var(--text-primary)] rounded-t-md 
                                    focus:z-10 sm:text-sm"
                                placeholder="Endereço de e-mail" 
                                value={email} 
                                onChange={(e) => setEmail(e.target.value)} 
                            />
                        </div>
                        <div>
                            <input 
                                id="password" 
                                name="password" 
                                type="password" 
                                autoComplete="current-password" 
                                required 
                                className="
                                    appearance-none rounded-none relative block w-full px-3 py-2 
                                    border border-gray-300 dark:border-[var(--border-primary)] placeholder-gray-500 text-gray-900 dark:text-[var(--text-primary)] rounded-b-md 
                                    focus:z-10 sm:text-sm"
                                placeholder="Senha" 
                                value={password} 
                                onChange={(e) => setPassword(e.target.value)} 
                            />
                        </div>
                    </div>

                    {error && <p className="text-sm text-red-600 text-center">{error}</p>}

                    <div>
                        <button 
                            type="submit" 
                            disabled={loading} 
                            className="
                                group relative w-full flex justify-center py-2 px-4 border border-transparent 
                                text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 
                                disabled:bg-blue-300"
                        >
                            {loading ? (
                                <Loader className="animate-spin h-5 w-5 text-white" />
                            ) : (
                                <>
                                    <span className="absolute left-0 inset-y-0 flex items-center pl-3">
                                        <LogIn className="h-5 w-5 text-blue-400 group-hover:text-blue-300" />
                                    </span>
                                    Entrar
                                </>
                            )}
                        </button>
                    </div>
                </form>
                 <div className="text-sm text-center text-gray-500">
                    <p>Modo de teste: Use as credenciais fornecidas.</p>
                </div>
            </div>
        </div>
    );
});

AuthComponent.displayName = 'AuthComponent';

export default AuthComponent;
