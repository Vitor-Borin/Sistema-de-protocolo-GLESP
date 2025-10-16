import React, { createContext, useContext, useState, useEffect } from 'react';

const ThemeContext = createContext();

export const useTheme = () => {
    const context = useContext(ThemeContext);
    if (!context) {
        throw new Error('useTheme deve ser usado dentro de um ThemeProvider');
    }
    return context;
};

export const ThemeProvider = ({ children }) => {
    const [isDarkMode, setIsDarkMode] = useState(() => {
        try {
            const saved = localStorage.getItem('theme');
            if (saved === 'dark' || saved === 'light') {
                return saved === 'dark';
            }
            // Se não há valor salvo ou é inválido, usar preferência do sistema
            return window.matchMedia('(prefers-color-scheme: dark)').matches;
        } catch (error) {
            console.warn('Erro ao acessar localStorage:', error);
            return false; // Default para modo claro
        }
    });

    const [accessibility, setAccessibility] = useState(() => {
        try {
            const saved = localStorage.getItem('accessibility');
            if (saved) {
                const parsed = JSON.parse(saved);
                return {
                    highContrast: Boolean(parsed.highContrast),
                    largeText: Boolean(parsed.largeText),
                    reducedMotion: Boolean(parsed.reducedMotion),
                    focusVisible: Boolean(parsed.focusVisible)
                };
            }
        } catch (error) {
            console.warn('Erro ao carregar configurações de acessibilidade:', error);
        }
        return {
            highContrast: false,
            largeText: false,
            reducedMotion: false,
            focusVisible: true
        };
    });

    // Aplicar tema imediatamente ao carregar
    useEffect(() => {
        try {
            localStorage.setItem('theme', isDarkMode ? 'dark' : 'light');
            
            // Forçar remoção e adição da classe para evitar bugs de renderização
            document.documentElement.classList.remove('dark');
            if (isDarkMode) {
                document.documentElement.classList.add('dark');
            }
            
            // Forçar re-renderização completa da página
            const forceRerender = () => {
                // Método 1: Forçar reflow
                document.body.style.display = 'none';
                document.body.offsetHeight;
                document.body.style.display = '';
                
                // Método 2: Forçar repaint
                document.body.style.transform = 'translateZ(0)';
                setTimeout(() => {
                    document.body.style.transform = '';
                }, 0);
                
                // Método 3: Disparar evento customizado
                window.dispatchEvent(new Event('resize'));
                
                // Método 4: Forçar re-renderização do React
                const event = new CustomEvent('themeChanged', { 
                    detail: { isDarkMode } 
                });
                window.dispatchEvent(event);
            };
            
            // Aplicar imediatamente
            forceRerender();
            
            // Aplicar novamente após um pequeno delay para garantir
            setTimeout(forceRerender, 10);
            
        } catch (error) {
            console.error('Erro ao aplicar tema:', error);
        }
    }, [isDarkMode]);

    useEffect(() => {
        try {
            localStorage.setItem('accessibility', JSON.stringify(accessibility));
            
            // Aplicar classes de acessibilidade
            document.documentElement.classList.toggle('high-contrast', accessibility.highContrast);
            document.documentElement.classList.toggle('large-text', accessibility.largeText);
            document.documentElement.classList.toggle('reduced-motion', accessibility.reducedMotion);
            document.documentElement.classList.toggle('focus-visible', accessibility.focusVisible);
        } catch (error) {
            console.error('Erro ao aplicar configurações de acessibilidade:', error);
        }
    }, [accessibility]);

    const toggleDarkMode = () => {
        setIsDarkMode(prev => {
            const newMode = !prev;
            
            // Limpar logs duplicados antes da mudança
            try {
                const logs = JSON.parse(localStorage.getItem('logs') || '[]');
                const uniqueLogs = logs.filter((log, index, self) => 
                    index === self.findIndex(l => l.id === log.id)
                );
                localStorage.setItem('logs', JSON.stringify(uniqueLogs));
            } catch (error) {
                console.warn('Erro ao limpar logs duplicados:', error);
            }
            
            // Aplicar mudança imediatamente para evitar delay
            setTimeout(() => {
                document.documentElement.classList.remove('dark');
                if (newMode) {
                    document.documentElement.classList.add('dark');
                }
                
                // Forçar re-renderização
                document.body.style.display = 'none';
                document.body.offsetHeight;
                document.body.style.display = '';
            }, 0);
            
            return newMode;
        });
    };

    const updateAccessibility = (updates) => {
        setAccessibility(prev => ({ ...prev, ...updates }));
    };

    const resetAccessibility = () => {
        setAccessibility({
            highContrast: false,
            largeText: false,
            reducedMotion: false,
            focusVisible: true
        });
    };

    // Função para reset completo do tema
    const resetTheme = () => {
        try {
            // Limpar localStorage
            localStorage.removeItem('theme');
            localStorage.removeItem('accessibility');
            
            // Resetar estado
            setIsDarkMode(false);
            setAccessibility({
                highContrast: false,
                largeText: false,
                reducedMotion: false,
                focusVisible: true
            });
            
            // Limpar classes do documentElement
            document.documentElement.classList.remove('dark', 'high-contrast', 'large-text', 'reduced-motion', 'focus-visible');
            
        } catch (error) {
            console.error('Erro ao resetar tema:', error);
        }
    };

    // Função para debug do tema
    const debugTheme = () => {
        const debugInfo = {
            isDarkMode,
            localStorageTheme: localStorage.getItem('theme'),
            localStorageAccessibility: localStorage.getItem('accessibility'),
            documentElementClasses: document.documentElement.className,
            prefersColorScheme: window.matchMedia('(prefers-color-scheme: dark)').matches
        };
        console.table(debugInfo);
    };

    const value = {
        isDarkMode,
        toggleDarkMode,
        accessibility,
        updateAccessibility,
        resetAccessibility,
        resetTheme,
        debugTheme
    };

    return (
        <ThemeContext.Provider value={value}>
            {children}
        </ThemeContext.Provider>
    );
};
