/**
 * Serviço de persistência local usando localStorage
 * Mantém protocolos e tipos de documentos salvos no navegador
 * OTIMIZADO: Cache em memória + lazy loading
 */

class StorageService {
  static KEYS = {
    DOCUMENTS: 'glesp_protocolos',
    DOC_TYPES: 'glesp_tipos_documento'
  };

  // Cache em memória para evitar leituras desnecessárias do localStorage
  static _cache = {
    documents: null,
    docTypes: null,
    lastModified: {
      documents: 0,
      docTypes: 0
    }
  };

  // Métodos para Documentos/Protocolos - OTIMIZADOS
  static saveDocuments(documents) {
    try {
      const serialized = JSON.stringify(documents);
      localStorage.setItem(this.KEYS.DOCUMENTS, serialized);
      
      // Atualizar cache
      this._cache.documents = documents;
      this._cache.lastModified.documents = Date.now();
    } catch (error) {
      // Silenciar erro - pode adicionar tratamento de erro se necessário
    }
  }

  static loadDocuments() {
    try {
      // Verificar cache primeiro
      if (this._cache.documents !== null) {
        return this._cache.documents;
      }

      const saved = localStorage.getItem(this.KEYS.DOCUMENTS);
      const documents = saved ? JSON.parse(saved) : [];
      
      // Atualizar cache
      this._cache.documents = documents;
      this._cache.lastModified.documents = Date.now();
      
      return documents;
    } catch (error) {
      return [];
    }
  }

  // Métodos para Tipos de Documentos - OTIMIZADOS
  static saveDocumentTypes(types) {
    try {
      const serialized = JSON.stringify(types);
      localStorage.setItem(this.KEYS.DOC_TYPES, serialized);
      
      // Atualizar cache
      this._cache.docTypes = types;
      this._cache.lastModified.docTypes = Date.now();
    } catch (error) {
      // Silenciar erro - pode adicionar tratamento de erro se necessário
    }
  }

  static loadDocumentTypes() {
    try {
      // Verificar cache primeiro
      if (this._cache.docTypes !== null) {
        return this._cache.docTypes;
      }

      const saved = localStorage.getItem(this.KEYS.DOC_TYPES);
      const docTypes = saved ? JSON.parse(saved) : [];
      
      // Atualizar cache
      this._cache.docTypes = docTypes;
      this._cache.lastModified.docTypes = Date.now();
      
      return docTypes;
    } catch (error) {
      return [];
    }
  }

  // Métodos utilitários - OTIMIZADOS
  static clearAllData() {
    try {
      localStorage.removeItem(this.KEYS.DOCUMENTS);
      localStorage.removeItem(this.KEYS.DOC_TYPES);
      
      // Limpar cache
      this._cache.documents = null;
      this._cache.docTypes = null;
      this._cache.lastModified.documents = 0;
      this._cache.lastModified.docTypes = 0;
    } catch (error) {
      // Silenciar erro - pode adicionar tratamento de erro se necessário
    }
  }

  // Método para limpar cache (útil para desenvolvimento)
  static clearCache() {
    this._cache.documents = null;
    this._cache.docTypes = null;
    this._cache.lastModified.documents = 0;
    this._cache.lastModified.docTypes = 0;
  }

  static exportData() {
    try {
      const documents = this.loadDocuments();
      const docTypes = this.loadDocumentTypes();
      
      const exportData = {
        protocolos: documents,
        tiposDocumento: docTypes,
        exportDate: new Date().toISOString(),
        version: '1.0'
      };

      return JSON.stringify(exportData, null, 2);
    } catch (error) {
      return null;
    }
  }

  static importData(jsonData) {
    try {
      const data = JSON.parse(jsonData);
      
      if (data.protocolos) {
        this.saveDocuments(data.protocolos);
      }
      
      if (data.tiposDocumento) {
        this.saveDocumentTypes(data.tiposDocumento);
      }

      return true;
    } catch (error) {
      return false;
    }
  }

  // Verificar se há dados salvos
  static hasStoredData() {
    const hasDocuments = localStorage.getItem(this.KEYS.DOCUMENTS) !== null;
    const hasDocTypes = localStorage.getItem(this.KEYS.DOC_TYPES) !== null;
    return { hasDocuments, hasDocTypes };
  }
}

export default StorageService;
