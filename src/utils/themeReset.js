/**
 * Utilitário para reset completo do tema
 * Use este script para resolver problemas de persistência do tema
 */

export const clearThemeData = () => {
    try {
        // Limpar localStorage
        localStorage.removeItem('theme');
        localStorage.removeItem('accessibility');
        localStorage.removeItem('documents');
        localStorage.removeItem('documentTypes');
        localStorage.removeItem('logs');
        
        // Limpar sessionStorage
        sessionStorage.clear();
        
        // Limpar todas as classes do documentElement
        document.documentElement.className = '';
        
        // Forçar reload da página
        window.location.reload();
        
        return true;
    } catch (error) {
        console.error('❌ Erro ao limpar dados do tema:', error);
        return false;
    }
};

export const debugThemeState = () => {
    const debugInfo = {
        localStorage: {
            theme: localStorage.getItem('theme'),
            accessibility: localStorage.getItem('accessibility'),
            hasDocuments: !!localStorage.getItem('documents'),
            hasDocumentTypes: !!localStorage.getItem('documentTypes'),
            hasLogs: !!localStorage.getItem('logs')
        },
        documentElement: {
            classes: document.documentElement.className,
            hasDark: document.documentElement.classList.contains('dark'),
            hasHighContrast: document.documentElement.classList.contains('high-contrast')
        },
        system: {
            prefersDark: window.matchMedia('(prefers-color-scheme: dark)').matches,
            userAgent: navigator.userAgent
        }
    };
    
    console.table(debugInfo);
    
    return {
        localStorage: {
            theme: localStorage.getItem('theme'),
            accessibility: localStorage.getItem('accessibility'),
            hasDocuments: !!localStorage.getItem('documents'),
            hasDocumentTypes: !!localStorage.getItem('documentTypes'),
            hasLogs: !!localStorage.getItem('logs')
        },
        documentElement: {
            classes: document.documentElement.className,
            hasDark: document.documentElement.classList.contains('dark'),
            hasHighContrast: document.documentElement.classList.contains('high-contrast')
        },
        system: {
            prefersDark: window.matchMedia('(prefers-color-scheme: dark)').matches,
            userAgent: navigator.userAgent
        }
    };
};

// Função para aplicar tema forçado
export const forceTheme = (theme = 'light') => {
    try {
        // Limpar classes existentes
        document.documentElement.classList.remove('dark', 'high-contrast', 'large-text', 'reduced-motion', 'focus-visible');
        
        // Aplicar tema
        if (theme === 'dark') {
            document.documentElement.classList.add('dark');
        }
        
        // Salvar no localStorage
        localStorage.setItem('theme', theme);
        
        return true;
    } catch (error) {
        console.error('❌ Erro ao forçar tema:', error);
        return false;
    }
};

// Função para detectar conflitos
export const detectThemeConflicts = () => {
    const conflicts = [];
    
    // Verificar se há classes conflitantes
    const hasDark = document.documentElement.classList.contains('dark');
    const hasHighContrast = document.documentElement.classList.contains('high-contrast');
    const savedTheme = localStorage.getItem('theme');
    
    if (hasDark && savedTheme === 'light') {
        conflicts.push('Conflito: Classe dark aplicada mas tema salvo é light');
    }
    
    if (!hasDark && savedTheme === 'dark') {
        conflicts.push('Conflito: Tema salvo é dark mas classe dark não está aplicada');
    }
    
    if (hasHighContrast && !JSON.parse(localStorage.getItem('accessibility') || '{}').highContrast) {
        conflicts.push('Conflito: Classe high-contrast aplicada mas configuração é false');
    }
    
    if (conflicts.length > 0) {
        console.warn('⚠️ Conflitos detectados:', conflicts);
    }
    
    return conflicts;
};
