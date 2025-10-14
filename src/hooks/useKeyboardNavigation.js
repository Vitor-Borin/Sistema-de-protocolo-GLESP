import { useEffect, useRef } from 'react';

export const useKeyboardNavigation = () => {
    const focusableElements = 'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])';
    
    const trapFocus = (element) => {
        const focusableContent = element.querySelectorAll(focusableElements);
        const firstFocusableElement = focusableContent[0];
        const lastFocusableElement = focusableContent[focusableContent.length - 1];

        const handleTabKey = (e) => {
            if (e.key === 'Tab') {
                if (e.shiftKey) {
                    if (document.activeElement === firstFocusableElement) {
                        lastFocusableElement.focus();
                        e.preventDefault();
                    }
                } else {
                    if (document.activeElement === lastFocusableElement) {
                        firstFocusableElement.focus();
                        e.preventDefault();
                    }
                }
            }
        };

        element.addEventListener('keydown', handleTabKey);
        return () => element.removeEventListener('keydown', handleTabKey);
    };

    const focusFirstElement = (container) => {
        const firstElement = container.querySelector(focusableElements);
        if (firstElement) {
            firstElement.focus();
        }
    };

    const focusLastElement = (container) => {
        const focusableContent = container.querySelectorAll(focusableElements);
        const lastElement = focusableContent[focusableContent.length - 1];
        if (lastElement) {
            lastElement.focus();
        }
    };

    const handleArrowKeys = (container, direction = 'vertical') => {
        const focusableContent = Array.from(container.querySelectorAll(focusableElements));
        const currentIndex = focusableContent.indexOf(document.activeElement);

        const handleKeyDown = (e) => {
            if (direction === 'vertical') {
                if (e.key === 'ArrowDown') {
                    e.preventDefault();
                    const nextIndex = (currentIndex + 1) % focusableContent.length;
                    focusableContent[nextIndex]?.focus();
                } else if (e.key === 'ArrowUp') {
                    e.preventDefault();
                    const prevIndex = currentIndex === 0 ? focusableContent.length - 1 : currentIndex - 1;
                    focusableContent[prevIndex]?.focus();
                }
            } else if (direction === 'horizontal') {
                if (e.key === 'ArrowRight') {
                    e.preventDefault();
                    const nextIndex = (currentIndex + 1) % focusableContent.length;
                    focusableContent[nextIndex]?.focus();
                } else if (e.key === 'ArrowLeft') {
                    e.preventDefault();
                    const prevIndex = currentIndex === 0 ? focusableContent.length - 1 : currentIndex - 1;
                    focusableContent[prevIndex]?.focus();
                }
            }
        };

        container.addEventListener('keydown', handleKeyDown);
        return () => container.removeEventListener('keydown', handleKeyDown);
    };

    return {
        trapFocus,
        focusFirstElement,
        focusLastElement,
        handleArrowKeys
    };
};

export const useKeyboardShortcuts = (shortcuts) => {
    useEffect(() => {
        const handleKeyDown = (e) => {
            const key = e.key.toLowerCase();
            const ctrlKey = e.ctrlKey || e.metaKey;
            const shiftKey = e.shiftKey;
            const altKey = e.altKey;

            // Construir a combinação de teclas
            let combination = '';
            if (ctrlKey) combination += 'ctrl+';
            if (altKey) combination += 'alt+';
            if (shiftKey) combination += 'shift+';
            combination += key;

            // Verificar se existe um atalho para esta combinação
            if (shortcuts[combination]) {
                e.preventDefault();
                shortcuts[combination]();
            }
        };

        document.addEventListener('keydown', handleKeyDown);
        return () => document.removeEventListener('keydown', handleKeyDown);
    }, [shortcuts]);
};
