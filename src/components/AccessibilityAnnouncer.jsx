import React, { createContext, useContext, useState, useEffect, useRef } from 'react';

const AccessibilityContext = createContext();

export const useAccessibility = () => {
    const context = useContext(AccessibilityContext);
    if (!context) {
        throw new Error('useAccessibility deve ser usado dentro de um AccessibilityProvider');
    }
    return context;
};

export const AccessibilityProvider = ({ children }) => {
    const [announcements, setAnnouncements] = useState([]);

    const announce = (message, priority = 'polite') => {
        const announcement = {
            id: `announce_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
            message,
            priority
        };
        setAnnouncements(prev => [...prev, announcement]);
    };

    const clearAnnouncements = () => {
        setAnnouncements([]);
    };

    return (
        <AccessibilityContext.Provider value={{ announce, clearAnnouncements }}>
            {children}
            <AccessibilityAnnouncer announcements={announcements} />
        </AccessibilityContext.Provider>
    );
};

const AccessibilityAnnouncer = ({ announcements }) => {
    return (
        <div
            aria-live="polite"
            aria-atomic="true"
            className="sr-only"
            role="status"
            aria-label="Anúncios de acessibilidade"
        >
            {announcements.map(announcement => (
                <div key={announcement.id}>
                    {announcement.message}
                </div>
            ))}
        </div>
    );
};

// Componente para melhorar a navegação por teclado
export const SkipLink = ({ href, children }) => {
    return (
        <a
            href={href}
            className="sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 focus:z-50 focus:px-4 focus:py-2 focus:bg-blue-600 focus:text-white focus:rounded-md focus:shadow-lg"
            onClick={(e) => {
                e.preventDefault();
                const target = document.querySelector(href);
                if (target) {
                    target.focus();
                    target.scrollIntoView();
                }
            }}
        >
            {children}
        </a>
    );
};

// Componente para melhorar a semântica
export const VisuallyHidden = ({ children }) => {
    return (
        <span className="sr-only">
            {children}
        </span>
    );
};

// Hook para gerenciar foco
export const useFocusManagement = () => {
    const focusStack = useRef([]);

    const pushFocus = (element) => {
        focusStack.current.push(document.activeElement);
        if (element) {
            element.focus();
        }
    };

    const popFocus = () => {
        const previousElement = focusStack.current.pop();
        if (previousElement) {
            previousElement.focus();
        }
    };

    const clearFocusStack = () => {
        focusStack.current = [];
    };

    return {
        pushFocus,
        popFocus,
        clearFocusStack
    };
};
