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
        const saved = localStorage.getItem('theme');
        if (saved) {
            return saved === 'dark';
        }
        return window.matchMedia('(prefers-color-scheme: dark)').matches;
    });

    const [accessibility, setAccessibility] = useState(() => {
        const saved = localStorage.getItem('accessibility');
        return saved ? JSON.parse(saved) : {
            highContrast: false,
            largeText: false,
            reducedMotion: false,
            focusVisible: true
        };
    });

    useEffect(() => {
        localStorage.setItem('theme', isDarkMode ? 'dark' : 'light');
        document.documentElement.classList.toggle('dark', isDarkMode);
    }, [isDarkMode]);

    useEffect(() => {
        localStorage.setItem('accessibility', JSON.stringify(accessibility));
        
        // Aplicar classes de acessibilidade
        document.documentElement.classList.toggle('high-contrast', accessibility.highContrast);
        document.documentElement.classList.toggle('large-text', accessibility.largeText);
        document.documentElement.classList.toggle('reduced-motion', accessibility.reducedMotion);
        document.documentElement.classList.toggle('focus-visible', accessibility.focusVisible);
    }, [accessibility]); // REMOVIDO isDarkMode das dependências

    const toggleDarkMode = () => {
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

    const value = {
        isDarkMode,
        toggleDarkMode,
        accessibility,
        updateAccessibility,
        resetAccessibility
    };

    return (
        <ThemeContext.Provider value={value}>
            {children}
        </ThemeContext.Provider>
    );
};
