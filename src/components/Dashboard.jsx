import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { GlespLogo } from './GlespLogo';
import Footer from './Footer';
import DocumentModal from './DocumentModal';
import ReceiptModal from './ReceiptModal';
import DocumentDetail from './DocumentDetail';
import Settings from './Settings';
import LogPage from './LogPage';
import AllProtocolsPage from './AllProtocolsPage';
import { LogOut, PlusCircle, Search, Settings as SettingsIcon, Home, Clock, FileText, User, Menu, X, ChevronLeft, ChevronRight, History, FileType, Cog, Sun, Moon, List } from 'lucide-react';
import { PREDEFINED_DOC_TYPES, MOCK_DOCUMENTS } from '../data/predefinedData'; // <-- DADOS FALLBACK
import StorageService from '../services/storage';
import LogService from '../services/logService';
import ProtocolService from '../services/protocolService';
import { useTheme } from '../contexts/ThemeContext';
import { useToast } from '../contexts/ToastContext';
import { useAccessibility, SkipLink } from './AccessibilityAnnouncer';
import SimpleConfig from './SimpleConfig';


export default function Dashboard({ user, onLogout }) {
    const { isDarkMode, accessibility, toggleDarkMode } = useTheme();
    const { showSuccess, showError, showWarning } = useToast();
    const [forceRender, setForceRender] = useState(0);

    // Forçar re-renderização quando o tema muda
    useEffect(() => {
        setForceRender(prev => prev + 1);
    }, [isDarkMode]);

    // Escutar evento customizado de mudança de tema
    useEffect(() => {
        const handleThemeChange = () => {
            setForceRender(prev => prev + 1);
            // Forçar re-renderização adicional
            setTimeout(() => {
                setForceRender(prev => prev + 1);
            }, 50);
        };

        window.addEventListener('themeChanged', handleThemeChange);
        window.addEventListener('resize', handleThemeChange);
        
        return () => {
            window.removeEventListener('themeChanged', handleThemeChange);
            window.removeEventListener('resize', handleThemeChange);
        };
    }, []);
    const { announce } = useAccessibility();
    
    // Inicializar com dados do Firestore
    const [documents, setDocuments] = useState([]);
    const [loadingDocuments, setLoadingDocuments] = useState(true);
    
    const [documentTypes, setDocumentTypes] = useState(() => {
        const savedDocTypes = StorageService.loadDocumentTypes();
        return savedDocTypes.length > 0 ? savedDocTypes : PREDEFINED_DOC_TYPES;
    });
    
    const [searchQuery, setSearchQuery] = useState('');
    
    const [currentView, setCurrentView] = useState('list'); // 'list', 'detail', 'settings', 'logs', 'config', 'allProtocols'
    
    // Verificar se usuário é administrador
    const isAdmin = user?.role === 'admin';
    const [selectedDoc, setSelectedDoc] = useState(null);
    
    // Estado para logs
    const [logs, setLogs] = useState(() => LogService.getLogs());
    
    // Estados para paginação
    const [currentPage, setCurrentPage] = useState(1);
    const itemsPerPage = 10;

    // Estados para os modais
    const [isDocModalOpen, setIsDocModalOpen] = useState(false);
    const [isReceiptModalOpen, setIsReceiptModalOpen] = useState(null);
    const [editingDoc, setEditingDoc] = useState(null);
    
    // Estado do Sidebar
    const [isSidebarExpanded, setIsSidebarExpanded] = useState(false);
    const [isSidebarPinned, setIsSidebarPinned] = useState(false);

    const isSidebarOpen = isSidebarExpanded || isSidebarPinned;

    // DocumentTypes ainda salvos no localStorage (configurações locais)
    useEffect(() => {
        const timeoutId = setTimeout(() => {
            StorageService.saveDocumentTypes(documentTypes);
        }, 500); // Aguarda 500ms antes de salvar
        
        return () => clearTimeout(timeoutId);
    }, [documentTypes]);

    // Carregar protocolos do Firestore
    useEffect(() => {
        const loadProtocols = async () => {
            try {
                setLoadingDocuments(true);
                // Carregando protocolos do Firestore
                const result = await ProtocolService.getAllProtocols(100); // Carregar até 100 protocolos
                // Protocolos carregados
                
                // Mapear protocolos do Firestore para o formato da interface
                const validProtocols = result.protocols.map(protocol => {
                    // Logs removidos para otimização
                    
                    // Sempre garantir que createdAt existe e tem o formato correto
                    let createdAt = { seconds: Math.floor(Date.now() / 1000) }; // Default
                    
                    if (protocol.criado_em) {
                        // Se é um Timestamp do Firestore, converter para o formato esperado
                        if (protocol.criado_em.toDate && typeof protocol.criado_em.toDate === 'function') {
                            try {
                                const date = protocol.criado_em.toDate();
                                createdAt = { seconds: Math.floor(date.getTime() / 1000) };
                            } catch (error) {
                                // Erro silencioso para otimização
                                createdAt = { seconds: Math.floor(Date.now() / 1000) };
                            }
                        }
                        // Se já tem seconds, usar diretamente
                        else if (protocol.criado_em.seconds !== undefined) {
                            createdAt = { seconds: protocol.criado_em.seconds };
                        }
                        // Se é um objeto Date
                        else if (protocol.criado_em instanceof Date) {
                            createdAt = { seconds: Math.floor(protocol.criado_em.getTime() / 1000) };
                        }
                    }
                    
                    // Mapear campos do Firestore para o formato da interface
                    const mappedProtocol = {
                        id: protocol.id,
                        docNumber: protocol.numero_protocolo || `GLESP-${new Date().getFullYear()}-${String(Date.now()).slice(-3)}`,
                        shopNumber: protocol.numero_loja || '',
                        deliveredBy: protocol.entregue_por || '',
                        quantity: protocol.quantidade || 0,
                        typeId: protocol.tipo_documento || '',
                        observations: protocol.observacoes || '',
                        protocolledBy: protocol.criado_por_nome || protocol.criado_por || 'Sistema', // Usar nome do usuário se disponível
                        createdAt: createdAt
                    };
                    
                    // Log removido para otimização
                    return mappedProtocol;
                });
                
                setDocuments(validProtocols);
                // Protocolos processados
            } catch (error) {
                // Erro silencioso para otimização
                // Fallback para dados mock em caso de erro
                setDocuments(MOCK_DOCUMENTS);
            } finally {
                setLoadingDocuments(false);
            }
        };

        if (user?.uid) {
            loadProtocols();
        }
    }, [user?.uid]);

    // Log inicial para verificar persistência - APENAS UMA VEZ
    useEffect(() => {
        try {
            // Log de login do usuário - APENAS se não existir log recente
            const recentLogs = LogService.getLogs();
            const currentUserName = user?.displayName || user?.name || user?.email || 'Usuário';
            const hasRecentLogin = recentLogs.some(log => {
                const logUserName = typeof log.user === 'object' 
                    ? log.user.name 
                    : log.user;
                const timeDiff = Date.now() - new Date(log.timestamp).getTime();
                
                return log.type === 'user' && 
                       log.action === 'Login no sistema' &&
                       logUserName === currentUserName &&
                       timeDiff < 30000; // 30 segundos para ser mais seguro
            });
            
            if (!hasRecentLogin) {
                LogService.logUserAction('Login no sistema', user, 'Usuário acessou o sistema');
                // Limpar logs duplicados de login após adicionar novo
                LogService.removeDuplicateLoginLogs();
                setLogs(LogService.getLogs());
            }
            
            // Anunciar login - APENAS UMA VEZ
            announce(`Bem-vindo ao sistema de protocolos, ${user?.displayName || user?.email || 'Usuário'}`);
        } catch (error) {
            console.error('Erro ao inicializar dashboard:', error);
            // Continuar mesmo com erro
        }
    }, [user?.id]); // Usar apenas ID do usuário para evitar loops


    const handleSaveDocument = async (docData) => {
        try {
            console.log('Iniciando criação de protocolo:', docData);
            
            if (editingDoc) {
                // Editar protocolo existente
                await ProtocolService.updateProtocol(editingDoc.id, {
                    ...docData,
                    numero_loja: docData.shopNumber,
                    entregue_por: docData.deliveredBy,
                    quantidade: docData.quantity,
                    tipo_documento: docData.typeId,
                    observacoes: docData.observations || ''
                }, user.uid);
                
                // Atualizar lista local
                setDocuments(docs => docs.map(d => d.id === editingDoc.id ? { ...d, ...docData } : d));
                
                // Log da edição
                LogService.logProtocolEdit(editingDoc.docNumber, `Protocolo editado - Loja: ${docData.shopNumber}`, user);
            } else {
                // Criar novo protocolo
                const protocolData = {
                    numero_loja: docData.shopNumber,
                    entregue_por: docData.deliveredBy,
                    quantidade: docData.quantity,
                    tipo_documento: docData.typeId,
                    observacoes: docData.observations || '',
                    status: 'ativo',
                    criado_por_nome: user.displayName || user.name || user.email || 'Usuário' // Salvar nome do usuário
                };
                
                console.log('Criando protocolo no Firestore:', protocolData);
                const protocolId = await ProtocolService.createProtocol(protocolData, user.uid);
                console.log('Protocolo criado com ID:', protocolId);
                
                // Buscar o protocolo criado para obter o número gerado
                const createdProtocol = await ProtocolService.getProtocolById(protocolId);
                console.log('Protocolo criado:', createdProtocol);
                
                // Adicionar à lista local
                const newDoc = {
                    id: protocolId,
                    docNumber: createdProtocol.numero_protocolo, // Usar o número gerado automaticamente
                    shopNumber: docData.shopNumber,
                    deliveredBy: docData.deliveredBy,
                    quantity: docData.quantity,
                    typeId: docData.typeId,
                    observations: docData.observations || '',
                    protocolledBy: user.displayName || user.name || user.email || 'Usuário',
                    createdAt: { seconds: Math.floor(Date.now() / 1000) } // Usar formato compatível com Firestore
                };
                
                setDocuments(docs => [newDoc, ...docs]);
                
                // Log da criação
                LogService.logProtocolCreate(newDoc.docNumber, `Novo protocolo criado - Loja: ${docData.shopNumber}`, user);
                
                // Notificação de sucesso
                showSuccess('Protocolo criado!', `Protocolo ${newDoc.docNumber} criado com sucesso.`);
            }
            
            setEditingDoc(null);
            setIsDocModalOpen(false);
            // Atualizar logs
            setLogs(LogService.getLogs());
            announce('Protocolo salvo com sucesso');
            
            // Se estivermos na página de todos os protocolos, manter lá
            if (currentView === 'allProtocols') {
                // Não mudar a view, manter na página atual
            }
        } catch (error) {
            console.error('Erro ao salvar documento:', error);
            showError('Erro ao salvar', 'Não foi possível salvar o protocolo. Tente novamente.');
        }
    };

    const handleDeleteDocument = async (docId, keepCurrentView = false) => {
        try {
            const docToDelete = documents.find(d => d.id === docId);
            
            if (!docToDelete) {
                showError('Erro', 'Protocolo não encontrado.');
                return;
            }

            // Confirmar exclusão
            if (!window.confirm(`Tem certeza que deseja excluir o protocolo ${docToDelete.docNumber}? Esta ação não pode ser desfeita.`)) {
                return;
            }

            // Deletar do Firestore
            await ProtocolService.deleteProtocol(docId);
            
            // Remover da lista local
            setDocuments(docs => docs.filter(d => d.id !== docId));
            
            if (!keepCurrentView) {
                setCurrentView('list'); // Volta para a lista após deletar
            }
            
            // Log da exclusão
            LogService.logProtocolDelete(docToDelete.docNumber, `Protocolo excluído permanentemente - Loja: ${docToDelete.shopNumber}`, user);
            setLogs(LogService.getLogs());
            
            // Notificação de exclusão
            showWarning('Protocolo excluído', `Protocolo ${docToDelete.docNumber} foi excluído permanentemente.`);
            announce('Protocolo excluído permanentemente');
            
        } catch (error) {
            console.error('Erro ao deletar protocolo:', error);
            showError('Erro ao excluir', 'Não foi possível excluir o protocolo. Tente novamente.');
        }
    };


    const handleSelectDoc = (doc) => {
        setSelectedDoc(doc);
        setCurrentView('detail');
    };

    const openEditModal = (doc, keepCurrentView = false) => {
        setEditingDoc(doc);
        setIsDocModalOpen(true);
        if (!keepCurrentView) {
            setCurrentView('list'); // Volta para a lista quando abrir o modal de edição
        }
    };

    const handleSaveDocTypes = (newTypes) => {
        setDocumentTypes(newTypes);
        // Log da alteração de configurações
        LogService.logSettingsChange('Tipos de documento atualizados', `Total de tipos: ${newTypes.length}`, user);
        setLogs(LogService.getLogs());
    };

    const handleClearLogs = () => {
        if (window.confirm('Tem certeza que deseja limpar todos os logs? Esta ação não pode ser desfeita.')) {
            LogService.clearLogs();
            setLogs([]);
        }
    };

    const handleDeleteLog = (logId) => {
        if (LogService.deleteLog(logId)) {
            setLogs(LogService.getLogs());
        }
    };


    // Filtrar documentos de hoje para a tela principal
    const todayDocuments = useMemo(() => {
        try {
            const today = new Date();
            today.setHours(0, 0, 0, 0);
            
            return documents.filter(doc => {
                try {
                    if (!doc.createdAt || typeof doc.createdAt !== 'object') {
                        return false;
                    }
                    
                    if (doc.createdAt.seconds !== undefined) {
                        const docDate = new Date(doc.createdAt.seconds * 1000);
                        docDate.setHours(0, 0, 0, 0);
                        return docDate.getTime() === today.getTime();
                    }
                    
                    return false;
                } catch (error) {
                    console.error('Erro ao filtrar documento:', error);
                    return false;
                }
            });
        } catch (error) {
            console.error('Erro ao filtrar documentos de hoje:', error);
            return [];
        }
    }, [documents]);

    // Filtrar documentos
    const filteredDocuments = useMemo(() => {
        // Usar documentos de hoje para a lista principal
        const baseDocuments = todayDocuments;
        
        if (!searchQuery) return baseDocuments;
        
        // Dividir a busca por vírgulas e remover espaços
        const searchTerms = searchQuery.split(',').map(term => term.trim());
        
        return baseDocuments.filter(doc => {
            const shopNumber = doc.shopNumber.toString();
            // Verificar se o número da loja está em qualquer um dos termos de busca
            return searchTerms.some(term => shopNumber.includes(term));
        });
    }, [todayDocuments, searchQuery]);

    // Lógica de paginação otimizada
    const { totalPages, currentDocuments, startIndex, endIndex } = useMemo(() => {
        const total = Math.ceil(filteredDocuments.length / itemsPerPage);
        const startIdx = (currentPage - 1) * itemsPerPage;
        const endIdx = startIdx + itemsPerPage;
        const current = filteredDocuments.slice(startIdx, endIdx);
        
        // Proteção contra páginas inválidas
        const safeTotalPages = Math.max(1, total);
        const safeCurrentPage = Math.min(currentPage, safeTotalPages);
        
        return { 
            totalPages: safeTotalPages, 
            currentDocuments: current,
            startIndex: startIdx,
            endIndex: endIdx
        };
    }, [filteredDocuments, currentPage, itemsPerPage]);

    // Reset página quando pesquisar (otimizado com useCallback)
    const handleSearch = useCallback((query) => {
        setSearchQuery(query);
        setCurrentPage(1);
    }, []);

    // Corrigir página atual se necessário
    useEffect(() => {
        const total = Math.ceil(filteredDocuments.length / itemsPerPage);
        if (currentPage > total && total > 0) {
            setCurrentPage(total);
        }
    }, [filteredDocuments.length, currentPage, itemsPerPage]);

    // Protocolos de hoje - com proteção robusta
    const protocolsToday = useMemo(() => {
        try {
            console.log('Calculando protocolsToday...');
            console.log('Documents:', documents);
            
            if (!documents || documents.length === 0) {
                return 0;
            }
            
            const today = new Date();
            today.setHours(0, 0, 0, 0);
            
            const todayCount = documents.filter(doc => {
                try {
                    // Verificar se doc.createdAt existe e tem seconds
                    if (!doc.createdAt || typeof doc.createdAt !== 'object') {
                        return false;
                    }
                    
                    // Se tem seconds, usar diretamente
                    if (doc.createdAt.seconds !== undefined) {
                        const docDate = new Date(doc.createdAt.seconds * 1000);
                        docDate.setHours(0, 0, 0, 0);
                        return docDate.getTime() === today.getTime();
                    }
                    
                    return false;
                } catch (error) {
                    console.error('Erro ao processar documento para protocolsToday:', error, doc);
                    return false;
                }
            }).length;
            
            console.log('Protocolos de hoje calculados:', todayCount);
            return todayCount;
            
        } catch (error) {
            console.error('Erro ao calcular protocolsToday:', error);
            return 0;
        }
    }, [documents]);




    const renderView = () => {
        switch (currentView) {
            case 'detail':
                return <DocumentDetail 
                            doc={selectedDoc} 
                            documentTypes={documentTypes} 
                            onBack={() => setCurrentView('list')}
                            onDelete={handleDeleteDocument}
                            onEdit={openEditModal}
                            onPrint={() => setIsReceiptModalOpen(selectedDoc)}
                        />;
            case 'allProtocols':
                return <AllProtocolsPage 
                            user={user}
                            documentTypes={documentTypes}
                            onBack={() => setCurrentView('list')}
                            onEdit={(protocol) => {
                                openEditModal(protocol, true); // Manter na página atual
                            }}
                            onDelete={(protocolId) => {
                                handleDeleteDocument(protocolId, true); // Manter na página atual
                            }}
                            onView={(protocol) => {
                                setSelectedDoc(protocol);
                                setCurrentView('detail');
                            }}
                        />;
            case 'settings':
                return <Settings documentTypes={documentTypes} onSave={handleSaveDocTypes} />;
            case 'config':
                return <SimpleConfig user={user} />;
            case 'logs':
                // Apenas administradores podem acessar logs
                if (!isAdmin) {
                    return (
                        <div className="flex flex-col items-center justify-center min-h-[400px] text-center">
                            <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl p-8 max-w-md">
                                <div className="flex items-center justify-center w-16 h-16 bg-red-100 dark:bg-red-900/40 rounded-full mx-auto mb-4">
                                    <Shield className="h-8 w-8 text-red-600 dark:text-red-400" />
                                </div>
                                <h3 className="text-xl font-semibold text-red-800 dark:text-red-200 mb-2">
                                    Acesso Restrito
                                </h3>
                                <p className="text-red-600 dark:text-red-300 mb-4">
                                    Apenas administradores podem visualizar os logs do sistema.
                                </p>
                                <button
                                    onClick={() => setCurrentView('list')}
                                    className="px-6 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg transition-colors"
                                >
                                    Voltar ao Painel
                                </button>
                            </div>
                        </div>
                    );
                }
                return <LogPage logs={logs} onClearLogs={handleClearLogs} onDeleteLog={handleDeleteLog} />;
            case 'list':
            default:
                return (
                    <div className="space-y-6">
                        {/* Cards de Estatísticas */}
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                            <div className="bg-white dark:bg-gray-900 p-8 rounded-2xl shadow-2xl border border-gray-200 dark:border-gray-700 flex items-center space-x-6 transition-all duration-500 hover:shadow-2xl hover:scale-105 hover:border-blue-400 dark:hover:border-blue-500 dark:hover:bg-gray-800 group backdrop-blur-sm">
                                <div className="bg-blue-100 dark:bg-blue-900/40 p-4 rounded-2xl border border-blue-200 dark:border-blue-700 group-hover:scale-110 transition-transform duration-300">
                                    <FileText className="h-8 w-8 text-blue-600 dark:text-blue-400" />
                                </div>
                                <div>
                                    <p className="text-sm text-gray-500 dark:text-gray-300 font-medium">Total de Protocolos</p>
                                    <p className="text-3xl font-bold text-gray-800 dark:text-white group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors duration-300">{documents.length}</p>
                                </div>
                            </div>
                            <div className="bg-white dark:bg-gray-900 p-8 rounded-2xl shadow-2xl border border-gray-200 dark:border-gray-700 flex items-center space-x-6 transition-all duration-500 hover:shadow-2xl hover:scale-105 hover:border-green-400 dark:hover:border-green-500 dark:hover:bg-gray-800 group backdrop-blur-sm">
                                <div className="bg-green-100 dark:bg-green-900/40 p-4 rounded-2xl border border-green-200 dark:border-green-700 group-hover:scale-110 transition-transform duration-300">
                                    <Clock className="h-8 w-8 text-green-600 dark:text-green-400" />
                                </div>
                                <div>
                                    <p className="text-sm text-gray-500 dark:text-gray-300 font-medium">Protocolos Hoje</p>
                                    <p className="text-3xl font-bold text-gray-800 dark:text-white group-hover:text-green-600 dark:group-hover:text-green-400 transition-colors duration-300">{protocolsToday}</p>
                                </div>
                            </div>
                            <div className="bg-white dark:bg-gray-900 p-8 rounded-2xl shadow-2xl border border-gray-200 dark:border-gray-700 flex items-center space-x-6 transition-all duration-500 hover:shadow-2xl hover:scale-105 hover:border-blue-400 dark:hover:border-blue-500 dark:hover:bg-gray-800 group backdrop-blur-sm">
                                <div className="bg-blue-100 dark:bg-blue-900/40 p-4 rounded-2xl border border-blue-200 dark:border-blue-700 group-hover:scale-110 transition-transform duration-300">
                                    <SettingsIcon className="h-8 w-8 text-blue-600 dark:text-blue-400" />
                                </div>
                                <div>
                                    <p className="text-sm text-gray-500 dark:text-gray-300 font-medium">Tipos de Documentos Cadastrados</p>
                                    <p className="text-3xl font-bold text-gray-800 dark:text-white group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors duration-300">{documentTypes.length}</p>
                                </div>
                            </div>
                        </div>

                        {/* Ações e Busca */}
                        <div className="flex flex-col sm:flex-row justify-between items-center mb-6 gap-4 shrink-0">
                             <div className="relative w-full sm:w-1/2 md:w-1/3">
                                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                                <input
                                    type="text"
                                    placeholder="Buscar por N° de Loja (ex: 700, 70, 15)..."
                                    value={searchQuery}
                                    onChange={(e) => handleSearch(e.target.value)}
                                    className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400"
                                />
                            </div>
                            <button 
                                onClick={() => { 
                                    setEditingDoc(null); 
                                    setIsDocModalOpen(true);
                                    announce('Abrindo modal para novo protocolo');
                                }} 
                                className="flex items-center justify-center w-full sm:w-auto space-x-3 px-8 py-4 border border-transparent text-base font-semibold rounded-2xl shadow-2xl text-white bg-gradient-to-r from-blue-600 via-blue-700 to-blue-800 hover:from-blue-700 hover:via-blue-800 hover:to-blue-900 dark:from-blue-500 dark:via-blue-600 dark:to-blue-700 dark:hover:from-blue-600 dark:hover:via-blue-700 dark:hover:to-blue-800 transition-all duration-500 hover:scale-110 hover:shadow-2xl hover:shadow-blue-500/25 group backdrop-blur-sm"
                                aria-label="Criar novo protocolo"
                            >
                                <PlusCircle className="h-6 w-6 group-hover:rotate-90 transition-transform duration-300" />
                                <span className="group-hover:tracking-wide transition-all duration-300">Novo Protocolo</span>
                            </button>
                        </div>

                        {/* Lista de Documentos */}
                        <div className="bg-white dark:bg-gray-900 shadow-2xl rounded-2xl border border-gray-200 dark:border-gray-700 overflow-hidden backdrop-blur-sm">
                            <div className="p-8 border-b border-gray-200 dark:border-gray-700 bg-gradient-to-r  dark:from-gray-800 dark:to-gray-700">
                                <h3 className="text-xl font-bold text-gray-800 dark:text-white">Lista de Protocolos de Hoje</h3>
                                <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">Protocolos criados em {new Date().toLocaleDateString('pt-BR')}</p>
                            </div>
                            <div>
                                {currentDocuments.length === 0 ? (
                                    <div className="flex flex-col items-center justify-center py-12 px-4">
                                        <Clock className="h-16 w-16 text-gray-300 dark:text-gray-600 mb-4" />
                                        <h4 className="text-lg font-semibold text-gray-800 dark:text-gray-200 mb-2">
                                            Nenhum protocolo criado hoje
                                        </h4>
                                        <p className="text-sm text-gray-500 dark:text-gray-400 text-center mb-4">
                                            {searchQuery 
                                                ? 'Nenhum protocolo encontrado com esse número de loja hoje.' 
                                                : 'Clique em "Novo Protocolo" para criar o primeiro protocolo do dia.'}
                                        </p>
                                        {!searchQuery && (
                                            <button 
                                                onClick={() => { 
                                                    setEditingDoc(null); 
                                                    setIsDocModalOpen(true);
                                                }} 
                                                className="flex items-center space-x-2 px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-all duration-200 shadow-md hover:shadow-lg"
                                            >
                                                <PlusCircle className="h-5 w-5" />
                                                <span>Criar Primeiro Protocolo</span>
                                            </button>
                                        )}
                                    </div>
                                ) : (
                                <ul role="list" className="divide-y divide-gray-200 dark:divide-gray-700">
                                {currentDocuments.map((doc) => {
                                    const docType = documentTypes.find(t => t.id === doc.typeId);
                                    return (
                                        <li key={doc.id} 
                                            onClick={() => {
                                                handleSelectDoc(doc);
                                                announce(`Selecionado protocolo ${doc.docNumber}`);
                                            }} 
                                            className="px-8 py-6 hover:bg-gray-50 dark:hover:bg-gray-800 transition-all duration-300 cursor-pointer group hover:shadow-lg"
                                            role="button"
                                            tabIndex={0}
                                            onKeyDown={(e) => {
                                                if (e.key === 'Enter' || e.key === ' ') {
                                                    e.preventDefault();
                                                    handleSelectDoc(doc);
                                                    announce(`Selecionado protocolo ${doc.docNumber}`);
                                                }
                                            }}
                                            aria-label={`Protocolo ${doc.docNumber} - ${docType ? docType.name : "Tipo Desconhecido"}`}
                                        >
                                            <div className="flex items-center justify-between">
                                                <div className="truncate flex-1">
                                                    <p className="font-semibold text-blue-600 dark:text-blue-400 truncate group-hover:text-blue-700 dark:group-hover:text-blue-300 transition-colors duration-300 text-lg">{docType ? docType.name : "Tipo Desconhecido"}</p>
                                                    <p className="text-sm text-gray-500 dark:text-gray-400 font-medium">{doc.docNumber}</p>
                                                </div>
                                                <div className="ml-4 flex-shrink-0">
                                                    <p className="text-sm text-gray-500 dark:text-gray-400 text-right font-medium">Hoje</p>
                                                </div>
                                            </div>
                                        </li>
                                    );
                                })}
                                </ul>
                                )}
                            </div>
                            
                            {/* Paginação */}
                            {totalPages > 1 && currentDocuments.length > 0 && (
                                <div className="px-6 py-4 border-t border-gray-200 dark:border-slate-600 shrink-0 bg-gray-50 dark:bg-slate-700">
                                    <div className="flex items-center justify-between">
                                        <div className="flex items-center text-sm text-gray-500 dark:text-slate-300">
                                            <span>
                                                Mostrando {startIndex + 1} a {Math.min(endIndex, filteredDocuments.length)} de {filteredDocuments.length} protocolos
                                            </span>
                                        </div>
                                        <div className="flex items-center space-x-2">
                                            <button
                                                onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                                                disabled={currentPage === 1}
                                                className="p-2 rounded-lg border border-gray-300 dark:border-slate-500 text-gray-500 dark:text-slate-400 hover:text-gray-700 dark:hover:text-slate-200 hover:border-gray-400 dark:hover:border-slate-400 hover:bg-gray-50 dark:hover:bg-slate-600 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200"
                                            >
                                                <ChevronLeft className="h-4 w-4" />
                                            </button>
                                            
                                            <div className="flex items-center space-x-1">
                                                {[...Array(totalPages)].map((_, index) => {
                                                    const pageNumber = index + 1;
                                                    const isCurrentPage = pageNumber === currentPage;
                                                    const shouldShow = pageNumber === 1 || 
                                                                     pageNumber === totalPages || 
                                                                     (pageNumber >= currentPage - 1 && pageNumber <= currentPage + 1);
                                                    
                                                    if (!shouldShow) {
                                                        if (pageNumber === currentPage - 2 || pageNumber === currentPage + 2) {
                                                            return <span key={`ellipsis_${pageNumber}`} className="px-2 text-gray-400 dark:text-slate-500">...</span>;
                                                        }
                                                        return null;
                                                    }
                                                    
                                                    return (
                                                        <button
                                                            key={`page_${pageNumber}`}
                                                            onClick={() => setCurrentPage(pageNumber)}
                                                            className={`px-3 py-1 rounded-lg text-sm font-medium transition-all duration-200 ${
                                                                isCurrentPage
                                                                    ? 'bg-gradient-to-r from-blue-600 to-blue-700 text-white shadow-lg'
                                                                    : 'text-gray-700 dark:text-slate-300 hover:bg-gray-100 dark:hover:bg-slate-600 hover:text-blue-600 dark:hover:text-blue-400'
                                                            }`}
                                                        >
                                                            {pageNumber}
                                                        </button>
                                                    );
                                                })}
                                            </div>
                                            
                                            <button
                                                onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                                                disabled={currentPage === totalPages}
                                                className="p-2 rounded-lg border border-gray-300 dark:border-slate-500 text-gray-500 dark:text-slate-400 hover:text-gray-700 dark:hover:text-slate-200 hover:border-gray-400 dark:hover:border-slate-400 hover:bg-gray-50 dark:hover:bg-slate-600 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200"
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
    };
    
    // Fallback em caso de erro
    if (!user) {
        return (
            <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex justify-center items-center">
                <div className="text-center">
                    <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
                        Erro: Usuário não encontrado
                    </h2>
                    <button
                        onClick={onLogout}
                        className="px-6 py-3 bg-gradient-to-r from-blue-600 via-blue-700 to-blue-800 hover:from-blue-700 hover:via-blue-800 hover:to-blue-900 text-white rounded-full transition-all duration-200 shadow-lg hover:shadow-xl">
                        Voltar ao Login
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className={`min-h-screen bg-gray-50 dark:bg-gray-900 flex ${accessibility.largeText ? 'large-text' : ''}`}>
            <SkipLink href="#main-content">Pular para o conteúdo principal</SkipLink>
            <SkipLink href="#sidebar">Pular para o menu de navegação</SkipLink>
            {/* Mobile Overlay */}
            {isSidebarOpen && (
                <div 
                    className="fixed inset-0 bg-black bg-opacity-50 z-40 md:hidden"
                    onClick={() => setIsSidebarExpanded(false)}
                />
            )}
            
            {/* Sidebar */}
            <nav 
                id="sidebar"
                role="navigation"
                aria-label="Menu principal"
                className={`
                    bg-white dark:bg-gradient-to-b dark:from-gray-900 dark:to-gray-800 flex flex-col shrink-0 border-r border-gray-200 dark:border-gray-700 transition-all duration-500 ease-in-out shadow-xl dark:shadow-2xl backdrop-blur-xl
                    ${isSidebarOpen ? 'w-64' : 'w-20'}
                    fixed md:relative h-full md:h-auto z-50 md:z-auto
                `}
                onMouseEnter={() => { 
                    if (!isSidebarPinned && window.innerWidth >= 768) {
                        setIsSidebarExpanded(true); 
                    }
                }}
                onMouseLeave={() => { 
                    if (!isSidebarPinned && window.innerWidth >= 768) {
                        setIsSidebarExpanded(false); 
                    }
                }}
            >
                <div className={`flex items-center h-16 border-b border-gray-200 dark:border-gray-700 px-6 shrink-0 overflow-hidden bg-gray-50 dark:bg-gray-900`}>
                    <GlespLogo className="h-10 w-auto" />
                    <span className={`text-xl font-bold text-gray-800 dark:text-white whitespace-nowrap transition-opacity duration-200 ${isSidebarOpen ? 'opacity-100 ml-3' : 'opacity-0'}`}>Protocolos</span>
                </div>

                <ul className="flex flex-col space-y-2 p-3 flex-grow">
                    <li>
                        <button 
                            onClick={() => {
                                setCurrentView('list');
                                announce('Navegando para lista de protocolos');
                                // Fechar sidebar em mobile após clicar
                                if (window.innerWidth < 768) {
                                    setIsSidebarExpanded(false);
                                }
                            }} 
                            className={`flex items-center p-3 rounded-lg w-full text-left font-medium overflow-hidden transition-all duration-200 ${!isSidebarOpen && 'justify-center'}
                                ${currentView === 'list' || currentView === 'detail' ? 'bg-gradient-to-r from-blue-500 to-blue-600 text-white shadow-lg shadow-blue-500/30' : 'text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700/50'}`}
                            aria-current={currentView === 'list' || currentView === 'detail' ? 'page' : undefined}
                            aria-label="Ir para lista de protocolos"
                        >
                            <Home className="h-6 w-6 shrink-0" />
                            <span className={`whitespace-nowrap transition-all duration-200 ${isSidebarOpen ? 'ml-3 opacity-100' : 'opacity-0 w-0'}`}>Protocolos</span>
                        </button>
                    </li>
                    <li>
                        <button 
                            onClick={() => {
                                setCurrentView('allProtocols');
                                announce('Navegando para todos os protocolos');
                                // Fechar sidebar em mobile após clicar
                                if (window.innerWidth < 768) {
                                    setIsSidebarExpanded(false);
                                }
                            }} 
                            className={`flex items-center p-3 rounded-lg w-full text-left font-medium overflow-hidden transition-all duration-200 ${!isSidebarOpen && 'justify-center'}
                                ${currentView === 'allProtocols' ? 'bg-gradient-to-r from-blue-500 to-blue-600 text-white shadow-lg shadow-blue-500/30' : 'text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700/50'}`}
                            aria-current={currentView === 'allProtocols' ? 'page' : undefined}
                            aria-label="Ir para todos os protocolos"
                        >
                            <List className="h-6 w-6 shrink-0" />
                            <span className={`whitespace-nowrap transition-all duration-200 ${isSidebarOpen ? 'ml-3 opacity-100' : 'opacity-0 w-0'}`}>Todos os Protocolos</span>
                        </button>
                    </li>
                    <li>
                        <button 
                            onClick={() => {
                                setCurrentView('settings');
                                announce('Navegando para tipos de documento');
                                // Fechar sidebar em mobile após clicar
                                if (window.innerWidth < 768) {
                                    setIsSidebarExpanded(false);
                                }
                            }} 
                            className={`flex items-center p-3 rounded-lg w-full text-left font-medium overflow-hidden transition-all duration-200 ${!isSidebarOpen && 'justify-center'}
                                ${currentView === 'settings' ? 'bg-gradient-to-r from-blue-500 to-blue-600 text-white shadow-lg shadow-blue-500/30' : 'text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700/50'}`}
                            aria-current={currentView === 'settings' ? 'page' : undefined}
                            aria-label="Ir para tipos de documento"
                        >
                            <FileType className="h-6 w-6 shrink-0" />
                            <span className={`whitespace-nowrap transition-all duration-200 ${isSidebarOpen ? 'ml-3 opacity-100' : 'opacity-0 w-0'}`}>Tipos de Documento</span>
                        </button>
                    </li>
                    <li>
                        <button 
                            onClick={() => {
                                setCurrentView('config');
                                announce('Navegando para configurações');
                                // Fechar sidebar em mobile após clicar
                                if (window.innerWidth < 768) {
                                    setIsSidebarExpanded(false);
                                }
                            }} 
                            className={`flex items-center p-3 rounded-lg w-full text-left font-medium overflow-hidden transition-all duration-200 ${!isSidebarOpen && 'justify-center'}
                                ${currentView === 'config' ? 'bg-gradient-to-r from-blue-500 to-blue-600 text-white shadow-lg shadow-blue-500/30' : 'text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700/50'}`}
                            aria-current={currentView === 'config' ? 'page' : undefined}
                            aria-label="Ir para configurações"
                        >
                            <Cog className="h-6 w-6 shrink-0" />
                            <span className={`whitespace-nowrap transition-all duration-200 ${isSidebarOpen ? 'ml-3 opacity-100' : 'opacity-0 w-0'}`}>Configurações</span>
                        </button>
                    </li>
                    {/* Botão de Logs - Apenas para Administradores */}
                    {isAdmin && (
                        <li>
                            <button 
                                onClick={() => {
                                    setCurrentView('logs');
                                    announce('Navegando para logs');
                                    // Fechar sidebar em mobile após clicar
                                    if (window.innerWidth < 768) {
                                        setIsSidebarExpanded(false);
                                    }
                                }} 
                                className={`flex items-center p-3 rounded-lg w-full text-left font-medium overflow-hidden transition-all duration-200 ${!isSidebarOpen && 'justify-center'}
                                    ${currentView === 'logs' ? 'bg-gradient-to-r from-blue-500 to-blue-600 text-white shadow-lg shadow-blue-500/30' : 'text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700/50'}`}
                                aria-current={currentView === 'logs' ? 'page' : undefined}
                                aria-label="Ir para logs"
                            >
                                <History className="h-6 w-6 shrink-0" />
                                <span className={`whitespace-nowrap transition-all duration-200 ${isSidebarOpen ? 'ml-3 opacity-100' : 'opacity-0 w-0'}`}>Logs</span>
                            </button>
                        </li>
                    )}
                </ul>

                <div className="border-t border-gray-200 dark:border-gray-700 p-3 shrink-0 bg-gray-50 dark:bg-gray-900/50">
                     <button 
                        onClick={() => setIsSidebarPinned(!isSidebarPinned)} 
                        className={`flex items-center p-3 rounded-lg w-full text-left text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700/50 overflow-hidden transition-all duration-200 ${!isSidebarOpen && 'justify-center'}`}
                        title={isSidebarPinned ? "Desafixar menu" : "Afixar menu"}
                    >
                        {isSidebarPinned ? <X className="h-6 w-6 shrink-0" /> : <Menu className="h-6 w-6 shrink-0" />}
                        <span className={`font-medium whitespace-nowrap transition-all duration-200 ${isSidebarOpen ? 'ml-3 opacity-100' : 'opacity-0 w-0'}`}>
                            {isSidebarPinned ? 'Recolher' : 'Expandir'}
                        </span>
                    </button>
                    <div className={`flex items-center p-3 mt-2 overflow-hidden rounded-lg bg-gray-100 dark:bg-gray-800/50 ${isSidebarOpen ? 'space-x-3' : 'justify-center'}`}>
                        <div className="bg-blue-100 dark:bg-blue-900/50 rounded-full p-2 shrink-0">
                            <User className="h-6 w-6 text-blue-600 dark:text-blue-400" />
                        </div>
                        <div className={`overflow-hidden transition-all duration-200 ${isSidebarOpen ? 'w-full opacity-100' : 'w-0 opacity-0'}`}>
                            <p className="font-semibold text-sm text-gray-800 dark:text-white truncate">{user.displayName}</p>
                            <p className="text-xs text-gray-500 dark:text-gray-400 truncate">{user.email}</p>
                        </div>
                    </div>
                    <button onClick={onLogout} className={`flex items-center p-3 mt-2 rounded-lg w-full text-left text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/50 font-medium overflow-hidden transition-all duration-200 ${!isSidebarOpen && 'justify-center'}`}>
                        <LogOut className="h-6 w-6 shrink-0" />
                        <span className={`whitespace-nowrap transition-all duration-200 ${isSidebarOpen ? 'ml-3 opacity-100' : 'opacity-0 w-0'}`}>Sair</span>
                    </button>
                </div>
            </nav>
            
            {/* Main Content */}
            <main id="main-content" className="flex-1 flex flex-col min-w-0 md:ml-0 ml-20" role="main">
                 <header className="bg-white/90 dark:bg-gray-900/90 backdrop-blur-2xl border-b border-gray-200 dark:border-gray-700 shrink-0 shadow-2xl">
                    <div className="px-6 sm:px-8 lg:px-10 py-8">
                       <div className="flex items-center justify-between">
                           <div>
                               <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
                                   {currentView === 'list' && 'Painel de Protocolos'}
                                   {currentView === 'detail' && 'Detalhes do Protocolo'}
                                   {currentView === 'allProtocols' && 'Todos os Protocolos'}
                                   {currentView === 'settings' && 'Tipos de Documento'}
                                   {currentView === 'config' && 'Configurações'}
                                   {currentView === 'logs' && 'Log de Atividades'}
                               </h1>
                               {currentView === 'list' && (
                                    <p className="text-base text-gray-600 dark:text-gray-300">Gerencie todos os protocolos da loja</p>
                               )}
                               {currentView === 'allProtocols' && (
                                   <p className="text-base text-gray-600 dark:text-gray-300">Visualize e gerencie todos os protocolos criados no sistema</p>
                               )}
                               {currentView === 'settings' && (
                                   <p className="text-base text-gray-600 dark:text-gray-300">Gerencie os tipos de documento disponíveis no sistema</p>
                               )}
                               {currentView === 'config' && (
                                   <p className="text-base text-gray-600 dark:text-gray-300">Configure suas preferências pessoais e acessibilidade</p>
                               )}
                               {currentView === 'logs' && (
                                   <p className="text-base text-gray-600 dark:text-gray-300">Histórico completo de todas as alterações no sistema</p>
                               )}
                           </div>
                           
                           {/* Área de Ações Rápidas */}
                           <div className="flex items-center gap-4">
                               {/* Informação do Usuário */}
                               <div className="hidden lg:flex items-center gap-3 px-4 py-2 bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 shadow-lg">
                                   <User className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                                   <div className="text-left">
                                       <p className="text-xs text-gray-500 dark:text-gray-400">Bem-vindo</p>
                                       <p className="text-sm font-bold text-gray-900 dark:text-white">{user?.displayName || user?.email?.split('@')[0] || 'Usuário'}</p>
                                   </div>
                               </div>

                               {/* Data e Hora Atual */}
                               <div className="hidden md:flex items-center gap-2 px-4 py-2 bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 shadow-lg">
                                   <Clock className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                                   <div className="text-left">
                                       <p className="text-xs text-gray-500 dark:text-gray-400">Hoje</p>
                                       <p className="text-sm font-semibold text-gray-900 dark:text-white">
                                           {new Date().toLocaleDateString('pt-BR', { day: '2-digit', month: 'short' })}
                                       </p>
                                   </div>
                               </div>
                               
                               {/* Toggle Tema */}
                               <button
                                   onClick={() => {
                                       toggleDarkMode();
                                       announce(isDarkMode ? 'Modo claro ativado' : 'Modo noturno ativado');
                                   }}
                                   className="group relative flex items-center justify-center p-3 rounded-xl shadow-lg border-2 transition-all duration-300 hover:scale-110 hover:shadow-xl bg-white dark:bg-gray-800 border-gray-400 dark:border-gray-600 hover:border-blue-500 dark:hover:border-blue-400 ring-2 ring-gray-200 dark:ring-gray-700"
                                   aria-label={isDarkMode ? 'Ativar modo claro' : 'Ativar modo noturno'}
                                   title={isDarkMode ? 'Ativar modo claro' : 'Ativar modo noturno'}
                               >
                                   <div className="relative w-5 h-5">
                                       {isDarkMode ? (
                                           <Moon className="h-5 w-5 text-blue-600 transition-transform duration-500" />
                                       ) : (
                                           <Sun className="h-5 w-5 text-yellow-500 transition-transform duration-500" />
                                       )}
                                   </div>
                                   {/* Tooltip */}
                                   <span className="absolute -bottom-10 left-1/2 -translate-x-1/2 px-3 py-1 bg-gray-900 dark:bg-gray-700 text-white text-xs rounded-lg opacity-0 group-hover:opacity-100 transition-opacity duration-200 whitespace-nowrap pointer-events-none z-50">
                                       {isDarkMode ? 'Modo Claro' : 'Modo Noturno'}
                                   </span>
                               </button>

                               {/* Mobile Menu Button */}
                               <button 
                                   onClick={() => setIsSidebarExpanded(!isSidebarExpanded)}
                                   className="md:hidden p-3 rounded-xl text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 transition-all duration-300 hover:scale-110 border-2 border-gray-200 dark:border-gray-600"
                               >
                                   <Menu className="h-5 w-5" />
                               </button>
                           </div>
                       </div>
                    </div>
                </header>

                <section className={`p-4 sm:p-6 lg:p-8 ${currentView === 'settings' ? 'overflow-y-auto' : ''}`} aria-label="Conteúdo principal">
                    {loadingDocuments && currentView === 'list' ? (
                        <div className="flex items-center justify-center min-h-[400px]">
                            <div className="text-center">
                                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
                                <p className="text-gray-600 dark:text-gray-400">Carregando protocolos...</p>
                            </div>
                        </div>
                    ) : (
                        renderView()
                    )}
                </section>
                
                <Footer />
            </main>

            <DocumentModal 
                isOpen={isDocModalOpen}
                onClose={() => {
                    setIsDocModalOpen(false);
                    setEditingDoc(null);
                }}
                onSave={handleSaveDocument}
                documentTypes={documentTypes}
                editingDoc={editingDoc}
            />
            
            <ReceiptModal 
                doc={isReceiptModalOpen}
                onClose={() => setIsReceiptModalOpen(null)}
                documentTypes={documentTypes}
            />
        </div>
    );
}
