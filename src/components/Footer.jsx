import React from 'react';

const Footer = React.memo(() => {
    const currentYear = new Date().getFullYear();
    
    return (
        <footer className="bg-white dark:bg-[var(--bg-card)] mt-auto">
            <div className="max-w-7xl mx-auto py-4 px-4 sm:px-6 lg:px-8 text-center text-sm text-gray-500">
                <p>&copy; {currentYear} Grande Loja Maçônica do Estado de São Paulo</p>
            </div>
        </footer>
    );
});

export default Footer;
