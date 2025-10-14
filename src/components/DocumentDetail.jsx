import React, { useMemo } from 'react';
import { ChevronLeft, Printer, Edit, Trash2 } from 'lucide-react';

const DetailItem = React.memo(({ label, value }) => (
    <div>
        <p className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-2">{label}</p>
        <p className="text-md text-gray-900 dark:text-white font-medium">{value || '-'}</p>
    </div>
));

const DocumentDetail = React.memo(({ doc, documentTypes, onBack, onDelete, onEdit, onPrint }) => {
    if (!doc) return null;

    const docType = useMemo(() => 
        documentTypes.find(t => t.id === doc.typeId), 
        [documentTypes, doc.typeId]
    );
    
    const protocolDate = useMemo(() => 
        doc.createdAt ? new Date(doc.createdAt.seconds * 1000).toLocaleString('pt-BR') : 'Data Indisponível',
        [doc.createdAt]
    );

    return (
        <div className="bg-white dark:bg-gray-800 p-6 sm:p-8 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700">
            {/* Cabeçalho */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 border-b border-gray-200 dark:border-gray-700 pb-4">
                <button 
                    onClick={onBack}
                    className="flex items-center space-x-2 text-sm font-medium text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white mb-4 sm:mb-0 transition-colors duration-200"
                >
                    <ChevronLeft className="h-5 w-5" />
                    <span>Voltar para a lista</span>
                </button>
                <div className="flex items-center gap-2 flex-wrap">
                     <button 
                        onClick={() => onPrint(doc)}
                        className="flex items-center space-x-2 px-4 py-2 border border-gray-300 dark:border-gray-600 text-sm font-medium rounded-lg text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-900 hover:bg-gray-50 dark:hover:bg-gray-700 transition-all duration-200"
                    >
                        <Printer className="h-4 w-4" />
                        <span>Imprimir</span>
                    </button>
                    <button 
                        onClick={() => onEdit(doc)}
                        className="flex items-center space-x-2 px-4 py-2 border border-gray-300 dark:border-gray-600 text-sm font-medium rounded-lg text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-900 hover:bg-gray-50 dark:hover:bg-gray-700 transition-all duration-200"
                    >
                        <Edit className="h-4 w-4" />
                        <span>Editar</span>
                    </button>
                    <button 
                        onClick={() => onDelete(doc.id)}
                        className="flex items-center space-x-2 px-4 py-2 border border-transparent text-sm font-medium rounded-lg text-white bg-red-600 dark:bg-red-500 hover:bg-red-700 dark:hover:bg-red-600 transition-all duration-200 shadow-md"
                    >
                        <Trash2 className="h-4 w-4" />
                        <span>Excluir</span>
                    </button>
                </div>
            </div>

            {/* Título Principal */}
            <div>
                <h2 className="text-2xl font-bold text-gray-800 dark:text-white">{docType ? docType.name : "Tipo Desconhecido"}</h2>
                <p className="mt-1 text-sm text-gray-500 dark:text-gray-400 font-mono">{doc.docNumber}</p>
            </div>
            
            {/* Detalhes */}
            <div className="mt-6 grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-6 border-t border-gray-200 dark:border-gray-700 pt-6">
                <DetailItem label="Data e Hora do Protocolo" value={protocolDate} />
                <DetailItem label="Quantidade" value={doc.quantity} />
                <DetailItem label="Nº da Loja" value={doc.shopNumber} />
                <DetailItem label="Entregue por" value={doc.deliveredBy} />
                <DetailItem label="Protocolado por" value={doc.protocolledBy} />
                <div className="col-span-2">
                    <p className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-2">Descrição / Observações</p>
                    <p className="text-md text-gray-900 dark:text-white bg-gray-50 dark:bg-gray-900 p-4 rounded-lg border border-gray-200 dark:border-gray-700 min-h-[80px]">
                        {doc.description || '-'}
                    </p>
                </div>
            </div>
        </div>
    );
});

export default DocumentDetail;
