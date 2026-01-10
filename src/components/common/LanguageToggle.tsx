import React from 'react';
import { useTranslation } from 'react-i18next';

export const LanguageToggle: React.FC = () => {
    const { i18n } = useTranslation();

    const changeLanguage = (lng: string) => {
        i18n.changeLanguage(lng);
    };

    return (
        <div className="flex bg-[#121214] rounded-2xl p-1 border border-white/10 h-10 md:h-12">
            <button
                onClick={() => changeLanguage('es')}
                className={`px-4 rounded-xl text-[10px] font-black transition-all ${i18n.language === 'es'
                    ? 'bg-brand text-white shadow-lg shadow-brand/20'
                    : 'text-zinc-500 hover:text-white'
                    }`}
            >
                ES
            </button>
            <button
                onClick={() => changeLanguage('en')}
                className={`px-4 rounded-xl text-[10px] font-black transition-all ${i18n.language === 'en'
                    ? 'bg-brand text-white shadow-lg shadow-brand/20'
                    : 'text-zinc-500 hover:text-white'
                    }`}
            >
                EN
            </button>
        </div>
    );
};
