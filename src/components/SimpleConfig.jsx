import React, { useState, useCallback } from 'react';
import { useTheme } from '../contexts/ThemeContext';
import { clearThemeData, debugThemeState, forceTheme, detectThemeConflicts } from '../utils/themeReset';
import { User, Moon, Sun, Edit3, Save, X, Settings, Palette, RefreshCw, AlertTriangle } from 'lucide-react';

const SimpleConfig = React.memo(({ user }) => {
    const { isDarkMode, toggleDarkMode, resetTheme, debugTheme } = useTheme();
    const [isEditingProfile, setIsEditingProfile] = useState(false);
    const [userInfo, setUserInfo] = useState({
        displayName: user?.displayName || user?.name || 'Usuário',
        email: user?.email || 'email@exemplo.com',
        department: 'Administração',
        role: 'Usuário'
    });

    const handleSaveProfile = useCallback(() => {
        // Implementar salvamento real do perfil no backend quando necessário
        setIsEditingProfile(false);
    }, []);

    return (
        <div className="space-y-8">
            {/* Perfil do Usuário - Design Moderno */}
            <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg border border-gray-200 dark:border-gray-700 overflow-hidden">
                {/* Header com gradiente */}
                <div className="bg-gradient-to-r from-blue-500 via-blue-600 to-blue-700 h-24 relative">
                    <div className="absolute inset-0 bg-black/10"></div>
                </div>
                
                {/* Conteúdo do perfil */}
                <div className="px-6 pb-6 -mt-12 relative">
                    {/* Avatar */}
                    <div className="flex items-end space-x-4">
                        <div className="bg-white dark:bg-gray-800 rounded-full p-2 shadow-lg border-4 border-white dark:border-gray-800">
                            <div className="w-20 h-20 bg-gradient-to-br from-blue-500 to-blue-600 rounded-full flex items-center justify-center">
                                <User className="h-10 w-10 text-white" />
                            </div>
                        </div>
                        
                        {/* Botão de editar */}
                        <button
                            onClick={() => setIsEditingProfile(!isEditingProfile)}
                            className="mb-2 bg-white dark:bg-gray-700 hover:bg-gray-50 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-300 px-4 py-2 rounded-lg shadow-md border border-gray-200 dark:border-gray-600 transition-all duration-200 flex items-center space-x-2 hover:shadow-lg"
                        >
                            <Edit3 className="h-4 w-4" />
                            <span className="text-sm font-medium">{isEditingProfile ? 'Cancelar' : 'Editar'}</span>
                        </button>
                    </div>
                    
                    {/* Informações do usuário */}
                    <div className="mt-4 space-y-2">
                        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
                            {userInfo.displayName}
                        </h1>
                        <div className="flex items-center space-x-2 text-gray-600 dark:text-gray-400">
                            <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                            <span className="text-sm font-medium">{userInfo.email}</span>
                        </div>
                        <div className="flex items-center space-x-4 text-sm text-gray-500 dark:text-gray-400">
                            <span className="bg-gray-100 dark:bg-gray-700 px-3 py-1 rounded-full">
                                {userInfo.department}
                            </span>
                            <span className="bg-gray-100 dark:bg-gray-700 px-3 py-1 rounded-full">
                                {userInfo.role}
                            </span>
                        </div>
                    </div>
                </div>
            </div>

            {/* Edição de Perfil - Design Moderno */}
            {isEditingProfile && (
                <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg border border-gray-200 dark:border-gray-700 overflow-hidden">
                    {/* Header da edição */}
                    <div className="bg-gray-50 dark:bg-gray-700 px-6 py-4 border-b border-gray-200 dark:border-gray-600">
                        <h3 className="text-lg font-semibold text-gray-800 dark:text-white flex items-center">
                            <Edit3 className="h-5 w-5 mr-2 text-blue-600 dark:text-blue-400" />
                            Editar Informações do Perfil
                        </h3>
                        <p className="text-sm text-gray-600 dark:text-gray-300 mt-1">
                            Atualize suas informações pessoais
                        </p>
                    </div>
                    
                    {/* Formulário */}
                    <div className="p-6">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="space-y-2">
                                <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300">
                                    Nome Completo
                                </label>
                                <input
                                    type="text"
                                    value={userInfo.displayName}
                                    onChange={(e) => setUserInfo({...userInfo, displayName: e.target.value})}
                                    className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-xl bg-white dark:bg-gray-900 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:focus:ring-blue-400 transition-all duration-200 shadow-sm"
                                    placeholder="Digite seu nome completo"
                                />
                            </div>
                            <div className="space-y-2">
                                <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300">
                                    Email
                                </label>
                                <input
                                    type="email"
                                    value={userInfo.email}
                                    onChange={(e) => setUserInfo({...userInfo, email: e.target.value})}
                                    className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-xl bg-white dark:bg-gray-900 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:focus:ring-blue-400 transition-all duration-200 shadow-sm"
                                    placeholder="Digite seu email"
                                />
                            </div>
                            <div className="space-y-2">
                                <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300">
                                    Departamento
                                </label>
                                <input
                                    type="text"
                                    value={userInfo.department}
                                    onChange={(e) => setUserInfo({...userInfo, department: e.target.value})}
                                    className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-xl bg-white dark:bg-gray-900 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:focus:ring-blue-400 transition-all duration-200 shadow-sm"
                                    placeholder="Digite seu departamento"
                                />
                            </div>
                            <div className="space-y-2">
                                <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300">
                                    Cargo
                                </label>
                                <input
                                    type="text"
                                    value={userInfo.role}
                                    onChange={(e) => setUserInfo({...userInfo, role: e.target.value})}
                                    className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-xl bg-white dark:bg-gray-900 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:focus:ring-blue-400 transition-all duration-200 shadow-sm"
                                    placeholder="Digite seu cargo"
                                />
                            </div>
                        </div>
                        
                        {/* Botões de ação */}
                        <div className="flex justify-end space-x-3 mt-8 pt-6 border-t border-gray-200 dark:border-gray-600">
                            <button
                                onClick={() => setIsEditingProfile(false)}
                                className="px-6 py-3 text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200 transition-colors font-medium"
                            >
                                Cancelar
                            </button>
                            <button
                                onClick={handleSaveProfile}
                                className="px-6 py-3 bg-gradient-to-r from-blue-600 via-blue-700 to-blue-800 hover:from-blue-700 hover:via-blue-800 hover:to-blue-900 text-white rounded-full transition-all duration-200 flex items-center space-x-2 shadow-lg hover:shadow-xl font-medium"
                            >
                                <Save className="h-4 w-4" />
                                <span>Salvar Alterações</span>
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Configurações de Aparência */}
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 border border-gray-200 dark:border-gray-700">
                <div className="flex items-center mb-6">
                    <div className="bg-blue-100 dark:bg-blue-900/40 rounded-lg p-3 mr-4">
                        <Palette className="h-6 w-6 text-blue-600 dark:text-blue-400" />
                    </div>
                    <div>
                        <h2 className="text-2xl font-bold text-gray-800 dark:text-white">Aparência</h2>
                        <p className="text-gray-600 dark:text-gray-400">Personalize a aparência do sistema</p>
                    </div>
                </div>

                {/* Modo Noturno */}
                <div className="bg-gray-50 dark:bg-gray-700 rounded-xl p-6 border border-gray-200 dark:border-gray-600">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-4">
                            <div className="bg-blue-100 dark:bg-blue-900/50 rounded-lg p-3">
                                {isDarkMode ? (
                                    <Moon className="h-6 w-6 text-blue-600 dark:text-blue-400" />
                                ) : (
                                    <Sun className="h-6 w-6 text-yellow-600" />
                                )}
                            </div>
                            <div>
                                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Modo Noturno</h3>
                                <p className="text-sm text-gray-600 dark:text-gray-300">
                                    {isDarkMode ? 'Tema escuro ativado' : 'Tema claro ativado'}
                                </p>
                            </div>
                        </div>
                        <div className="flex-shrink-0 w-12 h-7">
                            <button
                                onClick={toggleDarkMode}
                                className={`relative w-full h-full rounded-full transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 dark:focus:ring-offset-gray-800 ${
                                    isDarkMode ? 'bg-blue-600 shadow-lg shadow-blue-500/30' : 'bg-gray-300'
                                }`}
                            >
                                <span
                                    className={`absolute top-1 left-1 h-5 w-5 rounded-full bg-white shadow-lg transition-transform duration-300 ${
                                        isDarkMode ? 'translate-x-5' : 'translate-x-0'
                                    }`}
                                />
                            </button>
                        </div>
                    </div>
                </div>
            </div>

        </div>
    );
});

export default SimpleConfig;
