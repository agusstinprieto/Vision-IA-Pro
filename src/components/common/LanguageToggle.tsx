import React from 'react';
import { useLanguage } from '../../context/LanguageContext';

export const LanguageToggle: React.FC = () => {
    const { language, setLanguage } = useLanguage();

    return (
        <div className="flex bg-[#121214] rounded-2xl p-1 border border-white/10 h-10 md:h-12">
            <button
                onClick={() => setLanguage('es')}
                className={`px-4 rounded-xl text-[10px] font-black transition-all ${language === 'es'
                    ? 'bg-brand text-white shadow-lg shadow-brand/20'
                    : 'text-zinc-500 hover:text-white'
                    }`}
            >
                ES
            </button>
            <button
                onClick={() => setLanguage('en')}
                className={`px-4 rounded-xl text-[10px] font-black transition-all ${language === 'en'
                    ? 'bg-brand text-white shadow-lg shadow-brand/20'
                    : 'text-zinc-500 hover:text-white'
                    }`}
            >
                EN
            </button>
        </div>
    );
};
