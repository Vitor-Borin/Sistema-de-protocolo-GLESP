/**
 * Serviço de Logs para registrar atividades do sistema
 * Mantém histórico de todas as alterações feitas no sistema
 * OTIMIZADO: Debounce + Batch operations + Cache
 */

class LogService {
  static KEYS = {
    LOGS: 'glesp_system_logs'
  };

  // Cache em memória para evitar leituras desnecessárias
  static _cache = {
    logs: null,
    lastModified: 0,
    pendingWrites: new Set()
  };

  // Debounce para operações de escrita
  static _writeTimeout = null;

  // Tipos de ações disponíveis
  static ACTION_TYPES = {
    CREATE: 'create',
    EDIT: 'edit',
    DELETE: 'delete',
    SETTINGS: 'settings'
  };

  // Adicionar um novo log - OTIMIZADO com debounce
  static addLog(action, type, details = '', documentNumber = '', user = 'Sistema') {
    try {
      const logs = this.getLogs();
      const newLog = {
        id: `log_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        timestamp: new Date().toISOString(),
        action,
        type,
        details,
        documentNumber,
        user
      };

      logs.unshift(newLog); // Adiciona no início da lista
      
      // Manter apenas os últimos 1000 logs para não sobrecarregar o localStorage
      if (logs.length > 1000) {
        logs.splice(1000);
      }

      // Atualizar cache
      this._cache.logs = logs;
      this._cache.lastModified = Date.now();

      // Debounce para escrita no localStorage
      this._debouncedWrite(logs);
      
      return newLog;
    } catch (error) {
      return null;
    }
  }

  // Debounce para operações de escrita
  static _debouncedWrite(logs) {
    if (this._writeTimeout) {
      clearTimeout(this._writeTimeout);
    }
    
    this._writeTimeout = setTimeout(() => {
      try {
        localStorage.setItem(this.KEYS.LOGS, JSON.stringify(logs));
      } catch (error) {
        // Silenciar erro
      }
    }, 300); // 300ms de debounce
  }

  // Obter todos os logs - OTIMIZADO com cache
  static getLogs() {
    try {
      // Verificar cache primeiro
      if (this._cache.logs !== null) {
        return this._cache.logs;
      }

      const saved = localStorage.getItem(this.KEYS.LOGS);
      const logs = saved ? JSON.parse(saved) : [];
      
      // Atualizar cache
      this._cache.logs = logs;
      this._cache.lastModified = Date.now();
      
      return logs;
    } catch (error) {
      return [];
    }
  }

  // Limpar todos os logs
  static clearLogs() {
    try {
      localStorage.removeItem(this.KEYS.LOGS);
      return true;
    } catch (error) {
      return false;
    }
  }

  // Remover logs duplicados
  static removeDuplicateLogs() {
    try {
      const logs = this.getLogs();
      const uniqueLogs = [];
      const seen = new Set();
      
      for (const log of logs) {
        const key = `${log.action}_${log.user}_${log.timestamp}`;
        if (!seen.has(key)) {
          seen.add(key);
          uniqueLogs.push(log);
        }
      }
      
      localStorage.setItem(this.KEYS.LOGS, JSON.stringify(uniqueLogs));
      return uniqueLogs.length;
    } catch (error) {
      return 0;
    }
  }

  // Métodos específicos para diferentes tipos de ações

  // Log para criação de protocolo
  static logProtocolCreate(protocolNumber, details = '') {
    return this.addLog(
      'Protocolo criado',
      this.ACTION_TYPES.CREATE,
      details,
      protocolNumber
    );
  }

  // Log para edição de protocolo
  static logProtocolEdit(protocolNumber, details = '') {
    return this.addLog(
      'Protocolo editado',
      this.ACTION_TYPES.EDIT,
      details,
      protocolNumber
    );
  }

  // Log para exclusão de protocolo
  static logProtocolDelete(protocolNumber, details = '') {
    return this.addLog(
      'Protocolo excluído',
      this.ACTION_TYPES.DELETE,
      details,
      protocolNumber
    );
  }

  // Log para alterações de configurações
  static logSettingsChange(action, details = '') {
    return this.addLog(
      action,
      this.ACTION_TYPES.SETTINGS,
      details
    );
  }

  // Log para login/logout
  static logUserAction(action, user, details = '') {
    return this.addLog(
      action,
      'user',
      details,
      '',
      user
    );
  }

  // Exportar logs
  static exportLogs() {
    try {
      const logs = this.getLogs();
      const exportData = {
        logs,
        exportDate: new Date().toISOString(),
        version: '1.0'
      };
      return JSON.stringify(exportData, null, 2);
    } catch (error) {
      return null;
    }
  }

  // Importar logs
  static importLogs(jsonData) {
    try {
      const data = JSON.parse(jsonData);
      if (data.logs && Array.isArray(data.logs)) {
        localStorage.setItem(this.KEYS.LOGS, JSON.stringify(data.logs));
        return true;
      }
      return false;
    } catch (error) {
      return false;
    }
  }
}

export default LogService;

