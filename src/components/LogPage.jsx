import React, { useState, useMemo, useCallback } from 'react';
import { Clock, User, FileText, Edit, Trash2, Plus, Settings, Search, Filter, Calendar, X } from 'lucide-react';
import LogService from '../services/logService';

const LogPage = React.memo(({ logs, onClearLogs }) => {
    const [searchQuery, setSearchQuery] = useState('');
    const [filterType, setFilterType] = useState('all');
    const [selectedDate, setSelectedDate] = useState('');

    // Filtrar logs baseado na busca e filtros (otimizado com useMemo)
    const filteredLogs = useMemo(() => logs.filter(log => {
        const matchesSearch = log.action.toLowerCase().includes(searchQuery.toLowerCase()) ||
                            log.details.toLowerCase().includes(searchQuery.toLowerCase()) ||
                            log.user.toLowerCase().includes(searchQuery.toLowerCase());
        
        const matchesType = filterType === 'all' || log.type === filterType;
        
        // Filtro por data específica
        let matchesDate = true;
        if (selectedDate) {
            const filterDate = new Date(selectedDate);
            const logDate = new Date(log.timestamp);
            matchesDate = filterDate.toDateString() === logDate.toDateString();
        }
        
        return matchesSearch && matchesType && matchesDate;
    }), [logs, searchQuery, filterType, selectedDate]);


    // Função para obter ícone baseado no tipo de ação
    const getActionIcon = (type) => {
        switch (type) {
            case 'create': return <Plus className="h-4 w-4 text-green-600 dark:text-green-400" />;
            case 'edit': return <Edit className="h-4 w-4 text-blue-600 dark:text-blue-400" />;
            case 'delete': return <Trash2 className="h-4 w-4 text-red-600 dark:text-red-400" />;
            case 'settings': return <Settings className="h-4 w-4 text-purple-600 dark:text-purple-400" />;
            default: return <FileText className="h-4 w-4 text-gray-600 dark:text-gray-400" />;
        }
    };

    // Função para obter cor do badge baseado no tipo
    const getTypeBadgeColor = (type) => {
        switch (type) {
            case 'create': return 'bg-green-100 dark:bg-green-900/40 text-green-800 dark:text-green-400';
            case 'edit': return 'bg-blue-100 dark:bg-blue-900/40 text-blue-800 dark:text-blue-400';
            case 'delete': return 'bg-red-100 dark:bg-red-900/40 text-red-800 dark:text-red-400';
            case 'settings': return 'bg-purple-100 dark:bg-purple-900/40 text-purple-800 dark:text-purple-400';
            default: return 'bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-300';
        }
    };

    // Função para formatar timestamp
    const formatTimestamp = (timestamp) => {
        const date = new Date(timestamp);
        return {
            date: date.toLocaleDateString('pt-BR'),
            time: date.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })
        };
    };

    // Funções para gerenciar o calendário
    const handleDateChange = (e) => {
        setSelectedDate(e.target.value);
    };

    const clearDateFilter = () => {
        setSelectedDate('');
    };

    // Função para remover logs duplicados
    const handleRemoveDuplicates = useCallback(() => {
        try {
            const removedCount = LogService.removeDuplicateLogs();
            if (removedCount > 0) {
                // Recarregar a página para atualizar os logs
                window.location.reload();
            }
        } catch (error) {
            console.error('Erro ao remover duplicatas:', error);
        }
    }, []);

    return (
        <div className="space-y-6">
            {/* Cabeçalho */}
            <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700">
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                    <div>
                        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Log de Atividades</h1>
                        <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                            Histórico completo de todas as alterações no sistema
                        </p>
                    </div>
                    <div className="flex items-center space-x-2">
                        <span className="text-sm text-gray-500 dark:text-gray-400">
                            {filteredLogs.length} de {logs.length} registros
                        </span>
                        {logs.length > 0 && (
                            <div className="flex items-center space-x-2">
                                <button
                                    onClick={onClearLogs}
                                    className="px-4 py-2 text-sm font-medium text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-900/30 border border-red-200 dark:border-red-800 rounded-lg hover:bg-red-100 dark:hover:bg-red-900/50 transition-all duration-200">
                                    Limpar Logs
                                </button>
                                <button
                                    onClick={handleRemoveDuplicates}
                                    className="px-4 py-2 text-sm font-medium text-orange-600 dark:text-orange-400 bg-orange-50 dark:bg-orange-900/30 border border-orange-200 dark:border-orange-800 rounded-lg hover:bg-orange-100 dark:hover:bg-orange-900/50 transition-all duration-200">
                                    Remover Duplicatas
                                </button>
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* Filtros */}
            <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    {/* Busca */}
                    <div className="relative">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400 dark:text-gray-500" />
                        <input
                            type="text"
                            placeholder="Buscar por ação, usuário ou detalhes..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="w-full pl-10 pr-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-900 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:focus:ring-blue-400 transition-all"
                        />
                    </div>

                    {/* Filtro por tipo */}
                    <div className="relative">
                        <Filter className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400 dark:text-gray-500" />
                        <select
                            value={filterType}
                            onChange={(e) => setFilterType(e.target.value)}
                            className="w-full pl-10 pr-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-900 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:focus:ring-blue-400 appearance-none transition-all"
                        >
                            <option value="all">Todos os tipos</option>
                            <option value="create">Criação</option>
                            <option value="edit">Edição</option>
                            <option value="delete">Exclusão</option>
                            <option value="settings">Configurações</option>
                        </select>
                    </div>

                    {/* Seletor de data */}
                    <div className="relative">
                        <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400 dark:text-gray-500" />
                        <div className="flex items-center space-x-2">
                            <input
                                type="date"
                                value={selectedDate}
                                onChange={handleDateChange}
                                className="w-full pl-10 pr-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-900 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:focus:ring-blue-400 transition-all"
                            />
                            {selectedDate && (
                                <button
                                    onClick={clearDateFilter}
                                    className="p-2 text-gray-400 dark:text-gray-500 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
                                    title="Limpar filtro de data"
                                >
                                    <X className="h-5 w-5" />
                                </button>
                            )}
                        </div>
                    </div>
                </div>

                {/* Indicador de filtro ativo */}
                {selectedDate && (
                    <div className="mt-4 p-4 bg-blue-50 dark:bg-blue-900/30 rounded-lg border border-blue-200 dark:border-blue-800">
                        <div className="flex items-center justify-between">
                            <div className="flex items-center space-x-2">
                                <Calendar className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                                <span className="text-sm font-medium text-blue-800 dark:text-blue-300">
                                    Filtrando por: {new Date(selectedDate).toLocaleDateString('pt-BR')}
                                </span>
                            </div>
                            <button
                                onClick={clearDateFilter}
                                className="text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300 text-sm font-medium transition-colors"
                            >
                                Limpar filtro
                            </button>
                        </div>
                    </div>
                )}
            </div>

            {/* Lista de Logs */}
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700">
                {filteredLogs.length === 0 ? (
                    <div className="p-8 text-center">
                        <FileText className="h-12 w-12 text-gray-400 dark:text-gray-500 mx-auto mb-4" />
                        <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
                            {logs.length === 0 ? 'Nenhum log encontrado' : 'Nenhum log corresponde aos filtros'}
                        </h3>
                        <p className="text-gray-500 dark:text-gray-400">
                            {logs.length === 0 
                                ? 'As atividades do sistema aparecerão aqui conforme você usar o sistema.'
                                : 'Tente ajustar os filtros para ver mais resultados.'
                            }
                        </p>
                    </div>
                ) : (
                    <div className="divide-y divide-gray-200 dark:divide-gray-700">
                        {filteredLogs.map((log) => {
                            const { date, time } = formatTimestamp(log.timestamp);
                            return (
                                <div key={log.id} className="p-6 hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors duration-150">
                                    <div className="flex items-start space-x-4">
                                        {/* Ícone da ação */}
                                        <div className="flex-shrink-0 mt-1">
                                            {getActionIcon(log.type)}
                                        </div>

                                        {/* Conteúdo do log */}
                                        <div className="flex-1 min-w-0">
                                            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
                                                <div className="flex items-center space-x-2 flex-wrap">
                                                    <h4 className="text-sm font-medium text-gray-900 dark:text-white">
                                                        {log.action}
                                                    </h4>
                                                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getTypeBadgeColor(log.type)}`}>
                                                        {log.type}
                                                    </span>
                                                </div>
                                                <div className="flex items-center space-x-4 text-sm text-gray-500 dark:text-gray-400">
                                                    <div className="flex items-center space-x-1">
                                                        <User className="h-4 w-4" />
                                                        <span>{log.user}</span>
                                                    </div>
                                                    <div className="flex items-center space-x-1">
                                                        <Clock className="h-4 w-4" />
                                                        <span>{date} às {time}</span>
                                                    </div>
                                                </div>
                                            </div>
                                            
                                            {log.details && (
                                                <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
                                                    {log.details}
                                                </p>
                                            )}
                                            
                                            {log.documentNumber && (
                                                <p className="mt-1 text-xs text-blue-600 dark:text-blue-400 font-mono">
                                                    Protocolo: {log.documentNumber}
                                                </p>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                )}
            </div>
        </div>
    );
});

export default LogPage;
