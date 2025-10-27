import React, { useState, useEffect, useMemo } from 'react';
import { Search, Filter, Download, Eye, Edit, Trash2, Calendar, User, Building, FileText, ChevronLeft, ChevronRight } from 'lucide-react';
import ProtocolService from '../services/protocolService';
import { useToast } from '../contexts/ToastContext';
// Função para formatar timestamp
const formatTimestamp = (timestamp) => {
    if (!timestamp) return 'Data Indisponível';
    
    try {
        // Se é um timestamp do Firestore (tem propriedade seconds)
        if (timestamp.seconds !== undefined) {
            return new Date(timestamp.seconds * 1000).toLocaleString('pt-BR');
        }
        // Se é um objeto Date
        if (timestamp instanceof Date) {
            return timestamp.toLocaleString('pt-BR');
        }
        // Fallback
        return 'Data Indisponível';
    } catch (error) {
        console.error('Erro ao formatar timestamp:', error);
        return 'Data Indisponível';
    }
};

export default function AllProtocolsPage({ user, documentTypes, onBack, onEdit, onDelete, onView }) {
    const { showSuccess, showError, showWarning } = useToast();
    
    // Estados
    const [protocols, setProtocols] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState('');
    const [filterStatus, setFilterStatus] = useState('all');
    const [filterDate, setFilterDate] = useState('');
    const [currentPage, setCurrentPage] = useState(1);
    const [sortBy, setSortBy] = useState('createdAt');
    const [sortOrder, setSortOrder] = useState('desc');
    
    const itemsPerPage = 20;

    // Carregar todos os protocolos
    useEffect(() => {
        const loadAllProtocols = async () => {
            try {
                setLoading(true);
                console.log('Carregando todos os protocolos...');
                
                // Carregar todos os protocolos (sem limite)
                const result = await ProtocolService.getAllProtocols(1000); // Carregar até 1000 protocolos
                
                // Mapear e normalizar os protocolos
                const mappedProtocols = result.protocols.map(protocol => {
                    // Normalizar createdAt
                    let createdAt = { seconds: Math.floor(Date.now() / 1000) };
                    
                    if (protocol.criado_em) {
                        if (protocol.criado_em.toDate && typeof protocol.criado_em.toDate === 'function') {
                            try {
                                const date = protocol.criado_em.toDate();
                                createdAt = { seconds: Math.floor(date.getTime() / 1000) };
                            } catch (error) {
                                console.error('Erro ao converter timestamp:', error);
                            }
                        } else if (protocol.criado_em.seconds !== undefined) {
                            createdAt = { seconds: protocol.criado_em.seconds };
                        } else if (protocol.criado_em instanceof Date) {
                            createdAt = { seconds: Math.floor(protocol.criado_em.getTime() / 1000) };
                        }
                    }
                    
                    return {
                        id: protocol.id,
                        docNumber: protocol.numero_protocolo || `GLESP-${new Date().getFullYear()}-${String(Date.now()).slice(-3)}`,
                        shopNumber: protocol.numero_loja || '',
                        deliveredBy: protocol.entregue_por || '',
                        quantity: protocol.quantidade || 0,
                        typeId: protocol.tipo_documento || '',
                        observations: protocol.observacoes || '',
                        protocolledBy: protocol.criado_por_nome || protocol.criado_por || 'Sistema',
                        status: protocol.status || 'ativo',
                        createdAt: createdAt
                    };
                });
                
                setProtocols(mappedProtocols);
                console.log('Protocolos carregados:', mappedProtocols.length);
                
            } catch (error) {
                console.error('Erro ao carregar protocolos:', error);
                showError('Erro ao carregar', 'Não foi possível carregar os protocolos.');
            } finally {
                setLoading(false);
            }
        };

        if (user?.uid) {
            loadAllProtocols();
        }
    }, [user?.uid, showError]);

    // Filtrar e ordenar protocolos
    const filteredAndSortedProtocols = useMemo(() => {
        let filtered = protocols;

        // Filtro por busca
        if (searchQuery) {
            const query = searchQuery.toLowerCase();
            filtered = filtered.filter(protocol => 
                protocol.docNumber.toLowerCase().includes(query) ||
                protocol.shopNumber.toString().includes(query) ||
                protocol.deliveredBy.toLowerCase().includes(query) ||
                protocol.protocolledBy.toLowerCase().includes(query)
            );
        }

        // Filtro por status
        if (filterStatus !== 'all') {
            filtered = filtered.filter(protocol => protocol.status === filterStatus);
        }

        // Filtro por data
        if (filterDate) {
            const filterDateObj = new Date(filterDate);
            filtered = filtered.filter(protocol => {
                if (!protocol.createdAt || !protocol.createdAt.seconds) return false;
                const protocolDate = new Date(protocol.createdAt.seconds * 1000);
                return protocolDate.toDateString() === filterDateObj.toDateString();
            });
        }

        // Ordenação
        filtered.sort((a, b) => {
            let aValue, bValue;
            
            switch (sortBy) {
                case 'docNumber':
                    aValue = a.docNumber;
                    bValue = b.docNumber;
                    break;
                case 'shopNumber':
                    aValue = parseInt(a.shopNumber) || 0;
                    bValue = parseInt(b.shopNumber) || 0;
                    break;
                case 'createdAt':
                    aValue = a.createdAt?.seconds || 0;
                    bValue = b.createdAt?.seconds || 0;
                    break;
                default:
                    aValue = a.createdAt?.seconds || 0;
                    bValue = b.createdAt?.seconds || 0;
            }

            if (sortOrder === 'asc') {
                return aValue > bValue ? 1 : -1;
            } else {
                return aValue < bValue ? 1 : -1;
            }
        });

        return filtered;
    }, [protocols, searchQuery, filterStatus, filterDate, sortBy, sortOrder]);

    // Paginação
    const totalPages = Math.ceil(filteredAndSortedProtocols.length / itemsPerPage);
    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    const currentProtocols = filteredAndSortedProtocols.slice(startIndex, endIndex);

    // Função para obter tipo de documento
    const getDocumentType = (typeId) => {
        const docType = documentTypes.find(t => t.id === typeId);
        return docType ? docType.name : 'Tipo Desconhecido';
    };

    // Função para formatar data
    const formatDate = (createdAt) => {
        if (!createdAt || !createdAt.seconds) return 'Data Indisponível';
        return new Date(createdAt.seconds * 1000).toLocaleString('pt-BR');
    };

    // Função para obter status badge
    const getStatusBadge = (status) => {
        const statusConfig = {
            'ativo': { color: 'bg-green-100 text-green-800', label: 'Ativo' },
            'arquivado': { color: 'bg-gray-100 text-gray-800', label: 'Arquivado' },
            'inativo': { color: 'bg-red-100 text-red-800', label: 'Inativo' }
        };
        
        const config = statusConfig[status] || { color: 'bg-gray-100 text-gray-800', label: status };
        
        return (
            <span className={`px-2 py-1 rounded-full text-xs font-medium ${config.color}`}>
                {config.label}
            </span>
        );
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-[400px]">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
                    <p className="text-gray-600 dark:text-gray-400">Carregando protocolos...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            {/* Cabeçalho */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div>
                    <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Todos os Protocolos</h1>
                    <p className="text-gray-600 dark:text-gray-300 mt-1">
                        {filteredAndSortedProtocols.length} protocolo(s) encontrado(s)
                    </p>
                </div>
                <button
                    onClick={onBack}
                    className="flex items-center gap-2 px-4 py-2 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
                >
                    <ChevronLeft className="h-4 w-4" />
                    Voltar
                </button>
            </div>

            {/* Filtros e Busca */}
            <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                    {/* Busca */}
                    <div className="relative">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                        <input
                            type="text"
                            placeholder="Buscar protocolos..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-blue-500 focus:border-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                        />
                    </div>

                    {/* Filtro por Status */}
                    <select
                        value={filterStatus}
                        onChange={(e) => setFilterStatus(e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-blue-500 focus:border-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                    >
                        <option value="all">Todos os Status</option>
                        <option value="ativo">Ativo</option>
                        <option value="arquivado">Arquivado</option>
                        <option value="inativo">Inativo</option>
                    </select>

                    {/* Filtro por Data */}
                    <input
                        type="date"
                        value={filterDate}
                        onChange={(e) => setFilterDate(e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-blue-500 focus:border-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                    />

                    {/* Ordenação */}
                    <select
                        value={`${sortBy}-${sortOrder}`}
                        onChange={(e) => {
                            const [field, order] = e.target.value.split('-');
                            setSortBy(field);
                            setSortOrder(order);
                        }}
                        className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-blue-500 focus:border-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                    >
                        <option value="createdAt-desc">Mais Recentes</option>
                        <option value="createdAt-asc">Mais Antigos</option>
                        <option value="docNumber-asc">Número (A-Z)</option>
                        <option value="docNumber-desc">Número (Z-A)</option>
                        <option value="shopNumber-asc">Loja (Menor)</option>
                        <option value="shopNumber-desc">Loja (Maior)</option>
                    </select>
                </div>
            </div>

            {/* Lista de Protocolos */}
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700 overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full">
                        <thead className="bg-gray-50 dark:bg-gray-700">
                            <tr>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                                    Protocolo
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                                    Tipo
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                                    Loja
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                                    Entregue por
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                                    Status
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                                    Data
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                                    Ações
                                </th>
                            </tr>
                        </thead>
                        <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                            {currentProtocols.map((protocol) => (
                                <tr key={protocol.id} className="hover:bg-gray-50 dark:hover:bg-gray-700">
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <div>
                                            <div className="text-sm font-medium text-gray-900 dark:text-white">
                                                {protocol.docNumber}
                                            </div>
                                            <div className="text-sm text-gray-500 dark:text-gray-400">
                                                Qtd: {protocol.quantity}
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <div className="text-sm text-gray-900 dark:text-white">
                                            {getDocumentType(protocol.typeId)}
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <div className="text-sm text-gray-900 dark:text-white">
                                            {protocol.shopNumber}
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <div className="text-sm text-gray-900 dark:text-white">
                                            {protocol.deliveredBy}
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        {getStatusBadge(protocol.status)}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <div className="text-sm text-gray-900 dark:text-white">
                                            {formatDate(protocol.createdAt)}
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                                        <div className="flex items-center gap-2">
                                            <button
                                                onClick={() => onView(protocol)}
                                                className="text-blue-600 hover:text-blue-900 dark:text-blue-400 dark:hover:text-blue-300"
                                                title="Visualizar"
                                            >
                                                <Eye className="h-4 w-4" />
                                            </button>
                                            <button
                                                onClick={() => onEdit(protocol)}
                                                className="text-green-600 hover:text-green-900 dark:text-green-400 dark:hover:text-green-300"
                                                title="Editar"
                                            >
                                                <Edit className="h-4 w-4" />
                                            </button>
                                            <button
                                                onClick={() => onDelete(protocol.id)}
                                                className="text-red-600 hover:text-red-900 dark:text-red-400 dark:hover:text-red-300"
                                                title="Excluir"
                                            >
                                                <Trash2 className="h-4 w-4" />
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>

                {/* Paginação */}
                {totalPages > 1 && (
                    <div className="px-6 py-4 border-t border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-700">
                        <div className="flex items-center justify-between">
                            <div className="text-sm text-gray-500 dark:text-gray-300">
                                Mostrando {startIndex + 1} a {Math.min(endIndex, filteredAndSortedProtocols.length)} de {filteredAndSortedProtocols.length} protocolos
                            </div>
                            <div className="flex items-center gap-2">
                                <button
                                    onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                                    disabled={currentPage === 1}
                                    className="p-2 rounded-lg border border-gray-300 dark:border-gray-500 text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 hover:border-gray-400 dark:hover:border-gray-400 hover:bg-gray-50 dark:hover:bg-gray-600 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200"
                                >
                                    <ChevronLeft className="h-4 w-4" />
                                </button>
                                
                                <span className="text-sm text-gray-700 dark:text-gray-300">
                                    Página {currentPage} de {totalPages}
                                </span>
                                
                                <button
                                    onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                                    disabled={currentPage === totalPages}
                                    className="p-2 rounded-lg border border-gray-300 dark:border-gray-500 text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 hover:border-gray-400 dark:hover:border-gray-400 hover:bg-gray-50 dark:hover:bg-gray-600 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200"
                                >
                                    <ChevronRight className="h-4 w-4" />
                                </button>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
