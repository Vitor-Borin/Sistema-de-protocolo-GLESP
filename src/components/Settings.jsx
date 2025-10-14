import React, { useState, useCallback } from 'react';
import DocumentTypes from './DocumentTypes';

const Settings = React.memo(({ documentTypes, onSave }) => {
    const [currentTab, setCurrentTab] = useState('docTypes');

    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-3xl font-bold text-gray-800 dark:text-white">Tipos de Documento</h1>
                <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                    Gerencie os tipos de documento disponíveis para criação de protocolos.
                </p>
            </div>

            <div className="border-b border-gray-200 dark:border-gray-600">
                <nav className="-mb-px flex space-x-6">
                    <button
                        onClick={() => setCurrentTab('docTypes')}
                        className={`
                            py-3 px-1 border-b-2 font-medium text-sm
                            ${currentTab === 'docTypes' 
                                ? 'border-blue-500 text-blue-600 dark:text-blue-400' 
                                : 'border-transparent text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300 hover:border-gray-300 dark:hover:border-gray-500'}
                        `}
                    >
                        Tipos de Documento
                    </button>
                </nav>
            </div>

            <div>
                {currentTab === 'docTypes' && (
                    <DocumentTypes 
                        initialDocTypes={documentTypes} 
                        onSave={onSave} 
                    />
                )}
            </div>
        </div>
    );
});

export default Settings;
