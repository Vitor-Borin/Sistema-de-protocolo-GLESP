import React, { useState, useCallback } from 'react';
import { useTheme } from '../contexts/ThemeContext';
import { User, Moon, Sun, Eye, Type, Zap, Focus, Edit3, Save, X, Settings, Palette } from 'lucide-react';

const SimpleConfig = React.memo(({ user }) => {
    const { isDarkMode, toggleDarkMode, accessibility, updateAccessibility, resetAccessibility } = useTheme();
    const [isEditingProfile, setIsEditingProfile] = useState(false);
    const [userInfo, setUserInfo] = useState({
        displayName: user?.displayName || user?.name || 'Usuário',
        email: user?.email || 'email@exemplo.com',
        department: 'Administração',
        role: 'Usuário'
    });

    const handleSaveProfile = useCallback(() => {
        // TODO: Implementar salvamento real do perfil no backend
        setIsEditingProfile(false);
    }, []);

    return (
        <div className="space-y-8">
            {/* Cabeçalho com Perfil do Usuário */}
            <div className="bg-gradient-to-r from-blue-600 to-blue-700 dark:from-gray-800 dark:to-gray-900 rounded-xl shadow-xl p-8 text-white border border-blue-500 dark:border-gray-700">
                <div className="flex flex-col sm:flex-row items-start sm:items-center gap-6">
                    <div className="bg-white/20 dark:bg-blue-900/30 backdrop-blur-sm rounded-full p-4 border border-white/20 dark:border-blue-500/30">
                        <User className="h-12 w-12" />
                    </div>
                    <div className="flex-1">
                        <h1 className="text-3xl font-bold mb-2">
                            {userInfo.displayName}
                        </h1>
                        <p className="text-blue-100 dark:text-gray-300 text-lg">
                            {userInfo.email}
                        </p>
                        <p className="text-blue-200 dark:text-gray-400">
                            {userInfo.department} • {userInfo.role}
                        </p>
                    </div>
                    <button
                        onClick={() => setIsEditingProfile(!isEditingProfile)}
                        className="bg-white/20 hover:bg-white/30 dark:bg-gray-700 dark:hover:bg-gray-600 backdrop-blur-sm px-6 py-3 rounded-lg transition-all duration-200 flex items-center space-x-2 border border-white/20 dark:border-gray-600"
                    >
                        <Edit3 className="h-4 w-4" />
                        <span>{isEditingProfile ? 'Cancelar' : 'Editar'}</span>
                    </button>
                </div>
            </div>

            {/* Edição de Perfil */}
            {isEditingProfile && (
                <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 border border-gray-200 dark:border-gray-700">
                    <h3 className="text-xl font-semibold text-gray-800 dark:text-white mb-4 flex items-center">
                        <Edit3 className="h-5 w-5 mr-2 text-blue-600 dark:text-blue-400" />
                        Editar Perfil
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                Nome Completo
                            </label>
                            <input
                                type="text"
                                value={userInfo.displayName}
                                onChange={(e) => setUserInfo({...userInfo, displayName: e.target.value})}
                                className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-900 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:focus:ring-blue-400 transition-all"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                Departamento
                            </label>
                            <input
                                type="text"
                                value={userInfo.department}
                                onChange={(e) => setUserInfo({...userInfo, department: e.target.value})}
                                className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-900 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:focus:ring-blue-400 transition-all"
                            />
                        </div>
                    </div>
                    <div className="flex justify-end space-x-3 mt-6">
                        <button
                            onClick={() => setIsEditingProfile(false)}
                            className="px-6 py-2 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-all duration-200"
                        >
                            Cancelar
                        </button>
                        <button
                            onClick={handleSaveProfile}
                            className="px-6 py-2 bg-blue-600 hover:bg-blue-700 dark:bg-blue-500 dark:hover:bg-blue-600 text-white rounded-lg transition-all duration-200 flex items-center space-x-2 shadow-lg hover:shadow-xl"
                        >
                            <Save className="h-4 w-4" />
                            <span>Salvar</span>
                        </button>
                    </div>
                </div>
            )}

            {/* Configurações de Aparência */}
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 border border-gray-200 dark:border-gray-700">
                <div className="flex items-center mb-6">
                    <div className="bg-purple-100 dark:bg-purple-900/40 rounded-lg p-3 mr-4">
                        <Palette className="h-6 w-6 text-purple-600 dark:text-purple-400" />
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

            {/* Configurações de Acessibilidade */}
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 border border-gray-200 dark:border-gray-700">
                <div className="flex items-center mb-6">
                    <div className="bg-green-100 dark:bg-green-900/40 rounded-lg p-3 mr-4">
                        <Settings className="h-6 w-6 text-green-600 dark:text-green-400" />
                    </div>
                    <div>
                        <h2 className="text-2xl font-bold text-gray-800 dark:text-white">Acessibilidade</h2>
                        <p className="text-gray-600 dark:text-gray-400">Configure opções para melhorar sua experiência</p>
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* Alto Contraste */}
                    <div className="bg-gray-50 dark:bg-gray-700 rounded-xl p-6 border border-gray-200 dark:border-gray-600">
                        <div className="flex items-center justify-between">
                            <div className="flex items-center space-x-4">
                                <div className="bg-purple-100 dark:bg-purple-900/50 rounded-lg p-3">
                                    <Eye className="h-6 w-6 text-purple-600 dark:text-purple-400" />
                                </div>
                                <div>
                                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Alto Contraste</h3>
                                    <p className="text-sm text-gray-600 dark:text-gray-300">
                                        Aumenta o contraste das cores
                                    </p>
                                </div>
                            </div>
                            <div className="flex-shrink-0 w-12 h-7">
                                <button
                                    onClick={() => updateAccessibility({ highContrast: !accessibility.highContrast })}
                                    className={`relative w-full h-full rounded-full transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-offset-2 dark:focus:ring-offset-gray-800 ${
                                        accessibility.highContrast ? 'bg-purple-600 shadow-lg shadow-purple-500/30' : 'bg-gray-300 dark:bg-gray-600'
                                    }`}
                                >
                                    <span
                                        className={`absolute top-1 left-1 h-5 w-5 rounded-full bg-white shadow-lg transition-transform duration-300 ${
                                            accessibility.highContrast ? 'translate-x-5' : 'translate-x-0'
                                        }`}
                                    />
                                </button>
                            </div>
                        </div>
                    </div>

                    {/* Texto Grande */}
                    <div className="bg-gray-50 dark:bg-gray-700 rounded-xl p-6 border border-gray-200 dark:border-gray-600">
                        <div className="flex items-center justify-between">
                            <div className="flex items-center space-x-4">
                                <div className="bg-green-100 dark:bg-green-900/50 rounded-lg p-3">
                                    <Type className="h-6 w-6 text-green-600 dark:text-green-400" />
                                </div>
                                <div>
                                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Texto Grande</h3>
                                    <p className="text-sm text-gray-600 dark:text-gray-300">
                                        Aumenta o tamanho da fonte
                                    </p>
                                </div>
                            </div>
                            <div className="flex-shrink-0 w-12 h-7">
                                <button
                                    onClick={() => updateAccessibility({ largeText: !accessibility.largeText })}
                                    className={`relative w-full h-full rounded-full transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2 dark:focus:ring-offset-gray-800 ${
                                        accessibility.largeText ? 'bg-green-600 shadow-lg shadow-green-500/30' : 'bg-gray-300 dark:bg-gray-600'
                                    }`}
                                >
                                    <span
                                        className={`absolute top-1 left-1 h-5 w-5 rounded-full bg-white shadow-lg transition-transform duration-300 ${
                                            accessibility.largeText ? 'translate-x-5' : 'translate-x-0'
                                        }`}
                                    />
                                </button>
                            </div>
                        </div>
                    </div>

                    {/* Movimento Reduzido */}
                    <div className="bg-gray-50 dark:bg-gray-700 rounded-xl p-6 border border-gray-200 dark:border-gray-600">
                        <div className="flex items-center justify-between">
                            <div className="flex items-center space-x-4">
                                <div className="bg-orange-100 dark:bg-orange-900/50 rounded-lg p-3">
                                    <Zap className="h-6 w-6 text-orange-600 dark:text-orange-400" />
                                </div>
                                <div>
                                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Movimento Reduzido</h3>
                                    <p className="text-sm text-gray-600 dark:text-gray-300">
                                        Reduz animações e transições
                                    </p>
                                </div>
                            </div>
                            <div className="flex-shrink-0 w-12 h-7">
                                <button
                                    onClick={() => updateAccessibility({ reducedMotion: !accessibility.reducedMotion })}
                                    className={`relative w-full h-full rounded-full transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:ring-offset-2 dark:focus:ring-offset-gray-800 ${
                                        accessibility.reducedMotion ? 'bg-orange-600 shadow-lg shadow-orange-500/30' : 'bg-gray-300 dark:bg-gray-600'
                                    }`}
                                >
                                    <span
                                        className={`absolute top-1 left-1 h-5 w-5 rounded-full bg-white shadow-lg transition-transform duration-300 ${
                                            accessibility.reducedMotion ? 'translate-x-5' : 'translate-x-0'
                                        }`}
                                    />
                                </button>
                            </div>
                        </div>
                    </div>

                    {/* Indicador de Foco */}
                    <div className="bg-gray-50 dark:bg-gray-700 rounded-xl p-6 border border-gray-200 dark:border-gray-600">
                        <div className="flex items-center justify-between">
                            <div className="flex items-center space-x-4">
                                <div className="bg-indigo-100 dark:bg-indigo-900/50 rounded-lg p-3">
                                    <Focus className="h-6 w-6 text-indigo-600 dark:text-indigo-400" />
                                </div>
                                <div>
                                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Indicador de Foco</h3>
                                    <p className="text-sm text-gray-600 dark:text-gray-300">
                                        Destaca elementos em foco
                                    </p>
                                </div>
                            </div>
                            <div className="flex-shrink-0 w-12 h-7">
                                <button
                                    onClick={() => updateAccessibility({ focusVisible: !accessibility.focusVisible })}
                                    className={`relative w-full h-full rounded-full transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 dark:focus:ring-offset-gray-800 ${
                                        accessibility.focusVisible ? 'bg-indigo-600 shadow-lg shadow-indigo-500/30' : 'bg-gray-300 dark:bg-gray-600'
                                    }`}
                                >
                                    <span
                                        className={`absolute top-1 left-1 h-5 w-5 rounded-full bg-white shadow-lg transition-transform duration-300 ${
                                            accessibility.focusVisible ? 'translate-x-5' : 'translate-x-0'
                                        }`}
                                    />
                                </button>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Botão Reset */}
                <div className="mt-8 pt-6 border-t border-gray-200 dark:border-gray-700">
                    <button
                        onClick={resetAccessibility}
                        className="w-full px-6 py-3 text-sm font-medium text-gray-700 dark:text-gray-300 bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 rounded-xl transition-all duration-200 flex items-center justify-center space-x-2 border border-gray-200 dark:border-gray-600"
                    >
                        <X className="h-4 w-4" />
                        <span>Restaurar Configurações Padrão</span>
                    </button>
                </div>
            </div>
        </div>
    );
});

export default SimpleConfig;
