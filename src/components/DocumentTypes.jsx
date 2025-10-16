import React, { useState, useCallback, useMemo } from 'react';
import { PlusCircle, Edit, Trash2 } from 'lucide-react';

// Função para gerar abreviação
const generateAbbreviation = (name) => {
    if (!name) return '';
    const words = name.trim().split(/\s+/);
    if (words.length >= 2) {
        return (words[0][0] + words[1][0]).toUpperCase();
    }
    return name.substring(0, 3).toUpperCase();
};

const DocumentTypes = React.memo(({ initialDocTypes, onSave }) => {
    const [docTypes, setDocTypes] = useState(initialDocTypes);
    const [newTypeName, setNewTypeName] = useState('');
    
    const [editingId, setEditingId] = useState(null);
    const [editingName, setEditingName] = useState('');

    const [error, setError] = useState('');

    const handleAdd = useCallback(() => {
        if (!newTypeName.trim()) {
            setError('O nome do documento é obrigatório.');
            return;
        }
        setError('');
        const nextId = docTypes.length > 0 ? Math.max(...docTypes.map(t => t.id)) + 1 : 1;
        
        const newType = {
            id: nextId,
            name: newTypeName.trim(),
            abbreviation: generateAbbreviation(newTypeName),
        };
        const updatedTypes = [...docTypes, newType];
        setDocTypes(updatedTypes);
        onSave(updatedTypes);
        setNewTypeName('');
    }, [newTypeName, docTypes, onSave]);
    
    const handleDelete = useCallback((id) => {
        const updatedTypes = docTypes.filter(type => type.id !== id);
        setDocTypes(updatedTypes);
        onSave(updatedTypes);
    }, [docTypes, onSave]);

    const startEditing = useCallback((type) => {
        setEditingId(type.id);
        setEditingName(type.name);
    }, []);

    const cancelEditing = useCallback(() => {
        setEditingId(null);
        setEditingName('');
    }, []);

    const handleUpdate = useCallback(() => {
        if (!editingName.trim()) {
            setError('O nome do documento é obrigatório.');
            return;
        }
        setError('');
        const updatedTypes = docTypes.map(type => 
            type.id === editingId 
                ? { ...type, name: editingName.trim(), abbreviation: generateAbbreviation(editingName) } 
                : type
        );
        setDocTypes(updatedTypes);
        onSave(updatedTypes);
        cancelEditing();
    }, [editingName, editingId, docTypes, onSave, cancelEditing]);

    return (
        <div className="space-y-6">
            {/* Formulário de Adição */}
            <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700">
                <h3 className="text-lg font-semibold text-gray-800 dark:text-white mb-4 flex items-center">
                    <PlusCircle className="h-5 w-5 mr-2 text-blue-600 dark:text-blue-400" />
                    Gerenciar Tipos de Documento
                </h3>
                <div className="flex flex-col sm:flex-row gap-4 items-end">
                    <div className="flex-grow">
                        <label htmlFor="doc-name" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                            Nome do Documento
                        </label>
                        <input
                            type="text"
                            id="doc-name"
                            value={newTypeName}
                            onChange={(e) => setNewTypeName(e.target.value)}
                            placeholder="Ex: Prancha de Loja"
                            className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-900 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:focus:ring-blue-400 transition-all"
                        />
                    </div>
                    <button
                        onClick={handleAdd}
                        className="flex items-center justify-center w-full sm:w-auto space-x-2 px-6 py-3 border border-transparent text-sm font-medium rounded-full shadow-lg text-white bg-gradient-to-r from-blue-600 via-blue-700 to-blue-800 hover:from-blue-700 hover:via-blue-800 hover:to-blue-900 transition-all duration-200 hover:shadow-xl"
                    >
                        <PlusCircle className="h-5 w-5" />
                        <span>Adicionar</span>
                    </button>
                </div>
                {error && <p className="text-sm text-red-600 dark:text-red-400 mt-2">{error}</p>}
            </div>

            {/* Lista de Tipos de Documento */}
            <div className="bg-white dark:bg-gray-800 shadow-lg overflow-hidden rounded-xl border border-gray-200 dark:border-gray-700">
                <ul role="list" className="divide-y divide-gray-200 dark:divide-gray-700">
                    {docTypes.map((type) => (
                        <li key={type.id} className="px-6 py-4 hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors duration-150">
                            {editingId === type.id ? (
                                <div className="space-y-3">
                                    <input
                                        type="text"
                                        value={editingName}
                                        onChange={(e) => setEditingName(e.target.value)}
                                        className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-900 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:focus:ring-blue-400 transition-all"
                                    />
                                    <div className="flex justify-end gap-2">
                                        <button onClick={cancelEditing} className="px-4 py-2 text-sm rounded-lg bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-gray-200 hover:bg-gray-300 dark:hover:bg-gray-600 transition-all duration-200">
                                            Cancelar
                                        </button>
                                        <button onClick={handleUpdate} className="px-4 py-2 text-sm rounded-lg bg-green-600 dark:bg-green-500 text-white hover:bg-green-700 dark:hover:bg-green-600 transition-all duration-200 shadow-md">
                                            Salvar
                                        </button>
                                    </div>
                                </div>
                            ) : (
                                <div className="flex items-center justify-between">
                                    <div>
                                        <p className="font-medium text-gray-800 dark:text-white">
                                            <span className="font-mono text-xs text-gray-500 dark:text-gray-400 bg-gray-100 dark:bg-gray-700 px-3 py-1 rounded-full mr-3">{type.id}</span>
                                            {type.name}
                                        </p>
                                        <p className="text-sm text-gray-500 dark:text-gray-400 font-mono mt-1 ml-11">{type.abbreviation}</p>
                                    </div>
                                    <div className="flex items-center space-x-2">
                                        <button 
                                            onClick={() => startEditing(type)}
                                            className="p-2 rounded-lg text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700 hover:text-gray-700 dark:hover:text-gray-200 transition-all duration-200"
                                            title="Editar"
                                        >
                                            <Edit className="h-5 w-5" />
                                        </button>
                                        <button 
                                            onClick={() => handleDelete(type.id)}
                                            className="p-2 rounded-lg text-red-500 dark:text-red-400 hover:bg-red-100 dark:hover:bg-red-900/50 hover:text-red-700 dark:hover:text-red-300 transition-all duration-200"
                                            title="Excluir"
                                        >
                                            <Trash2 className="h-5 w-5" />
                                        </button>
                                    </div>
                                </div>
                            )}
                        </li>
                    ))}
                </ul>
            </div>
        </div>
    );
});

export default DocumentTypes;