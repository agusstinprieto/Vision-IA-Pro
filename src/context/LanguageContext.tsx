import React, { createContext, useContext, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { Language, TranslationKey } from '../i18n/translations';

interface LanguageContextType {
    language: Language;
    setLanguage: (lang: Language) => void;
    t: (key: any) => string; // Relaxed type to allow string or TranslationKey
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export const LanguageProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const { t, i18n } = useTranslation();

    const setLanguage = (lang: Language) => {
        i18n.changeLanguage(lang);
        localStorage.setItem('simsa_lang', lang);
    };

    // Sync initial load if needed, though i18n handle it independently
    useEffect(() => {
        const savedLang = localStorage.getItem('simsa_lang') as Language;
        if (savedLang && i18n.language !== savedLang) {
            i18n.changeLanguage(savedLang);
        }
    }, [i18n]);

    const contextValue = {
        language: (i18n.language.startsWith('es') ? 'es' : 'en') as Language,
        setLanguage,
        t: (key: any) => t(key as string)
    };

    return (
        <LanguageContext.Provider value={contextValue}>
            {children}
        </LanguageContext.Provider>
    );
};

export const useLanguage = () => {
    const context = useContext(LanguageContext);
    if (!context) throw new Error('useLanguage must be used within a LanguageProvider');
    return context;
};
