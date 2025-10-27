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
    const [isDarkMode, setIsDarkMode] = useState(false); // Sempre tema claro

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
            // Erro silencioso para otimização
        }
        return {
            highContrast: false,
            largeText: false,
            reducedMotion: false,
            focusVisible: true
        };
    });

    // Aplicar tema claro apenas uma vez ao carregar
    useEffect(() => {
        // Garantir que sempre esteja claro
        document.documentElement.classList.remove('dark');
    }, []);

    useEffect(() => {
        try {
            localStorage.setItem('accessibility', JSON.stringify(accessibility));
            
            // Aplicar classes de acessibilidade
            document.documentElement.classList.toggle('high-contrast', accessibility.highContrast);
            document.documentElement.classList.toggle('large-text', accessibility.largeText);
            document.documentElement.classList.toggle('reduced-motion', accessibility.reducedMotion);
            document.documentElement.classList.toggle('focus-visible', accessibility.focusVisible);
        } catch (error) {
            // Erro silencioso para otimização
        }
    }, [accessibility]);

    const toggleDarkMode = () => {
        // Simplesmente alterna o estado visual sem aplicar CSS
        setIsDarkMode(prev => !prev);
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

    // Função para reset completo do tema - simplificada
    const resetTheme = () => {
        setIsDarkMode(false);
        document.documentElement.classList.remove('dark');
    };

    // Função para debug do tema - simplificada
    const debugTheme = () => {
        // Debug removido para otimização
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
