import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { Loader, X } from 'lucide-react';

const DocumentModal = React.memo(({ isOpen, onClose, onSave, documentTypes, editingDoc }) => {
    // State for form fields
    const [docCode, setDocCode] = useState('');
    const [docName, setDocName] = useState('');
    const [typeId, setTypeId] = useState('');
    const [shopNumber, setShopNumber] = useState('');
    const [deliveredBy, setDeliveredBy] = useState('');
    const [quantity, setQuantity] = useState(1);
    const [description, setDescription] = useState('');
    
    // State for component logic
    const [isSaving, setIsSaving] = useState(false);
    const [error, setError] = useState('');

    // Effect to populate form when editing
    useEffect(() => {
        if (editingDoc) {
            const docType = documentTypes.find(t => t.id === editingDoc.typeId);
            if (docType) {
                setDocCode(String(docType.id || ''));
                setDocName(docType.name || '');
                setTypeId(docType.id);
            }
            setShopNumber(editingDoc.shopNumber || '');
            setDeliveredBy(editingDoc.deliveredBy || editingDoc.requesterName || '');
            setQuantity(editingDoc.quantity || 1);
            setDescription(editingDoc.description || '');
        } else {
            // Reset form for new entry
            setDocCode('');
            setDocName('');
            setTypeId('');
            setShopNumber('');
            setDeliveredBy('');
            setQuantity(1);
            setDescription('');
        }
    }, [editingDoc, isOpen, documentTypes]);

    // Effect to auto-fill document name based on code
    useEffect(() => {
        const codeToSearch = String(docCode).trim();
        if (codeToSearch) {
            // Corrigido: busca por 'id' em vez de 'code'
            const foundType = documentTypes.find(type => String(type.id) === codeToSearch);
            if (foundType) {
                setDocName(foundType.name);
                setTypeId(foundType.id);
                setError('');
            } else {
                setDocName('Código não encontrado');
                setTypeId('');
            }
        } else {
            setDocName('');
            setTypeId('');
        }
    }, [docCode, documentTypes]);



    const handleSubmit = useCallback((e) => {
        e.preventDefault();
        if (!typeId || !shopNumber || !deliveredBy || quantity < 1) {
            setError("Código do Documento, Nº da Loja, Nome do Entregador e Quantidade são obrigatórios.");
            return;
        }
        setIsSaving(true);
        setError('');
        
        const docData = { typeId, shopNumber, deliveredBy, quantity: Number(quantity), description };
        
        setTimeout(() => {
            onSave(docData);
            setIsSaving(false);
            onClose();
        }, 500);
    }, [typeId, shopNumber, deliveredBy, quantity, description, onSave, onClose]);

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex justify-center items-center p-4 bg-black/60 backdrop-blur-sm animate-scale-in">
            <div className="bg-white dark:bg-[var(--bg-card)] rounded-2xl shadow-2xl w-full max-w-lg p-8 relative animate-scale-in">
                <button 
                    onClick={onClose} 
                    className="absolute top-6 right-6 text-muted-foreground rounded-full hover:text-foreground hover:bg-muted p-2 transition-all duration-200"
                >
                    <X className="h-5 w-5" />
                </button>
                
        <div className="mb-8">
            <h3 className="text-2xl font-bold text-gray-700 dark:text-[var(--text-secondary)] mb-2">
                {editingDoc ? "Editar Protocolo" : "Novo Protocolo"}
            </h3>
            <p className="text-gray-700 dark:text-[var(--text-secondary)]">
                {editingDoc ? "Atualize as informações do protocolo" : "Preencha os dados para criar um novo protocolo"}
            </p>
        </div>
                <form onSubmit={handleSubmit} className="space-y-6">
                    {/* Código do Documento e Nome do Documento */}
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                             <label htmlFor="docCode" className="block text-sm font-medium text-gray-700 dark:text-[var(--text-secondary)] mb-2">
                                Código do Documento
                            </label>
                            <input 
                                type="text"
                                id="docCode"
                                value={String(docCode)}
                                onChange={(e) => setDocCode(e.target.value)}
                                placeholder="Ex: 1"
                                className="block w-full rounded-lg border-0 bg-gray-200 dark:bg-[var(--bg-tertiary)] text-gray-700 dark:text-[var(--text-secondary)] px-3 py-3 text-sm "
                            />
                        </div>
                        <div>
                             <label htmlFor="docName" className="block text-sm font-medium text-gray-700 dark:text-[var(--text-secondary)] mb-2">
                                Nome do Documento
                            </label>
                            <input
                                type="text"
                                id="docName"
                                value={docName}
                                readOnly
                                placeholder="Nome do Documento"
                                className={`block w-full rounded-lg border-0 px-3 py-3 text-sm cursor-not-allowed ${
                                    docName === 'Código não encontrado' 
                                        ? 'bg-red-50 text-red-600' 
                                        : 'bg-gray-100 dark:bg-[var(--bg-tertiary)] text-gray-500'
                                }`}
                            />
                        </div>
                    </div>

                    {/* Nº da Loja e Quantidade */}
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label htmlFor="shopNumber" className="block text-sm font-medium text-gray-700 dark:text-[var(--text-secondary)] mb-1">
                                Nº da Loja
                            </label>
                            <input 
                                type="text" 
                                id="shopNumber" 
                                value={shopNumber} 
                                onChange={(e) => setShopNumber(e.target.value)}
                                className="block w-full rounded-lg border-0 bg-gray-200 dark:bg-[var(--bg-tertiary)] text-gray-700 dark:text-[var(--text-secondary)] px-3 py-3 text-sm " 
                            />
                        </div>
                        <div>
                            <label htmlFor="quantity" className="block text-sm font-medium text-gray-700 dark:text-[var(--text-secondary)] mb-1">
                                Quantidade
                            </label>
                            <input 
                                type="number" 
                                id="quantity" 
                                value={quantity}
                                min="1"
                                onChange={(e) => setQuantity(e.target.value)}
                                className="block w-full rounded-lg border-0 bg-gray-200 dark:bg-[var(--bg-tertiary)] text-gray-700 dark:text-[var(--text-secondary)] px-3 py-3 text-sm " 
                            />
                        </div>
                    </div>

                    {/* Nome do Entregador */}
                     <div>
                        <label htmlFor="deliveredBy" className="block text-sm font-medium text-gray-700 dark:text-[var(--text-secondary)] mb-1">
                            Nome do Entregador
                        </label>
                        <input 
                            type="text" 
                            id="deliveredBy" 
                            value={deliveredBy} 
                            onChange={(e) => setDeliveredBy(e.target.value)}
                            className="block w-full rounded-lg border-0 bg-gray-200 dark:bg-[var(--bg-tertiary)] text-gray-700 dark:text-[var(--text-secondary)] px-3 py-3 text-sm " 
                        />
                    </div>
                    
                    {/* Descrição (Opcional) */}
                    <div>
                        <label htmlFor="description" className="block text-sm font-medium text-gray-700 dark:text-[var(--text-secondary)] mb-1">
                            Descrição (Opcional)
                        </label>
                        <textarea 
                            id="description" 
                            rows="3" 
                            value={description} 
                            onChange={(e) => setDescription(e.target.value)} 
                            placeholder="Descreva detalhes adicionais sobre o protocolo..."
                            className="block w-full rounded-lg border-0 bg-gray-200 dark:bg-[var(--bg-tertiary)] text-gray-700 dark:text-[var(--text-secondary)] px-3 py-3 text-sm  resize-none"
                        ></textarea>
                    </div>

                    {error && <p className="text-sm text-red-600 text-center">{error}</p>}

                    <div className="flex justify-end space-x-3 pt-4">
                        <button 
                            type="button" 
                            onClick={onClose} 
                            className="px-4 py-2 text-sm font-medium text-gray-700 dark:text-[var(--text-secondary)] bg-white dark:bg-[var(--bg-card)] border border-gray-300 dark:border-[var(--border-primary)] rounded-lg shadow-sm hover:bg-gray-50 dark:hover:bg-[var(--bg-secondary)] dark:bg-[var(--bg-secondary)] h-10"
                        >
                            Cancelar
                        </button>
                        <button 
                            type="submit" 
                            disabled={isSaving} 
                            className="inline-flex justify-center items-center px-4 py-2 text-sm font-medium text-white bg-blue-600 border border-transparent rounded-lg shadow-sm hover:bg-blue-700 disabled:bg-blue-300 h-10"
                        >
                            {isSaving ? <Loader className="animate-spin h-5 w-5" /> : 'Salvar'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
});

DocumentModal.displayName = 'DocumentModal';

export default DocumentModal;

