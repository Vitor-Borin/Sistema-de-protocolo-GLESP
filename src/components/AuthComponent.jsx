import React, { useState, useCallback } from 'react';
import { GlespLogo } from './GlespLogo';
import { Loader, LogIn, Shield, Users } from 'lucide-react';
import { signInWithEmailAndPassword } from 'firebase/auth';
import { doc, getDoc } from 'firebase/firestore';
import { auth, db } from '../config/firebase';

const AuthComponent = React.memo(({ onLogin }) => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    const handleLogin = useCallback(async (e) => {
        e.preventDefault();
        setLoading(true);
        setError('');

        try {
            // Autenticar com Firebase
            const userCredential = await signInWithEmailAndPassword(auth, email, password);
            const user = userCredential.user;

            // Buscar dados do usuário no Firestore
            const userDoc = await getDoc(doc(db, 'users', user.uid));
            
            if (userDoc.exists()) {
                const userData = userDoc.data();
                const userWithRole = {
                    uid: user.uid,
                    email: user.email,
                    displayName: userData.displayName || user.displayName,
                    role: userData.role || 'user',
                    department: userData.department || 'N/A'
                };
                
                onLogin(userWithRole);
            } else {
                setError('Usuário não encontrado no sistema. Contate o administrador.');
            }
        } catch (error) {
            console.error('Erro no login:', error);
            if (error.code === 'auth/user-not-found') {
                setError('Usuário não encontrado.');
            } else if (error.code === 'auth/wrong-password') {
                setError('Senha incorreta.');
            } else if (error.code === 'auth/invalid-email') {
                setError('Email inválido.');
            } else {
                setError('Erro ao fazer login. Tente novamente.');
            }
        } finally {
            setLoading(false);
        }
    }, [email, password, onLogin]);

    return (
        <div className="min-h-screen bg-gray-50 dark:bg-[var(--bg-secondary)] flex flex-col justify-center items-center p-4">
            <div className="max-w-md w-full bg-white dark:bg-[var(--bg-card)] rounded-xl shadow-lg p-8 space-y-6">
                <div className="text-center">
                    <GlespLogo className="mx-auto h-24 w-auto" />
                    <h2 
                        className="
                            mt-4 text-3xl font-extrabold text-gray-900 dark:text-white"
                    >
                        GLESP - Sistema de Protocolo
                    </h2>
                    <p 
                        className="
                            mt-2 text-sm text-gray-600 dark:text-[var(--text-secondary)]"
                    >
                        Faça login para continuar
                    </p>
                    
                    {/* Informações sobre perfis */}
                    <div className="mt-4 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-800">
                        <div className="flex items-center justify-center space-x-4 text-sm">
                            <div className="flex items-center space-x-1 text-blue-600 dark:text-blue-400">
                                <Shield className="h-4 w-4" />
                                <span>Administrador</span>
                            </div>
                            <div className="flex items-center space-x-1 text-gray-600 dark:text-gray-400">
                                <Users className="h-4 w-4" />
                                <span>Usuário</span>
                            </div>
                        </div>
                        <p className="text-xs text-gray-500 dark:text-gray-400 mt-2">
                            Contas criadas pelo administrador
                        </p>
                    </div>
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
                                    border border-gray-300 dark:border-gray-600 placeholder-gray-500 text-gray-900 dark:text-white rounded-t-md 
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
                                    border border-gray-300 dark:border-gray-600 placeholder-gray-500 text-gray-900 dark:text-white rounded-b-md 
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
                                text-sm font-medium rounded-full text-white bg-gradient-to-r from-blue-600 via-blue-700 to-blue-800 hover:from-blue-700 hover:via-blue-800 hover:to-blue-900 shadow-lg hover:shadow-xl transition-all duration-200 
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
                    <p>Sistema de usuários gerenciado pelo administrador</p>
                </div>
            </div>
        </div>
    );
});

AuthComponent.displayName = 'AuthComponent';

export default AuthComponent;
