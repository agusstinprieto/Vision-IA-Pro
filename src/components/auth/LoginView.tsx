
import React, { useState } from 'react';

import { useTranslation } from 'react-i18next';
import { UserRole, Company } from '../../types';
import { supabase } from '../../services/auth/supabase';

interface LoginViewProps {
    onLogin: (user: string, role: UserRole, company: Company) => void;
}

export const LoginView: React.FC<LoginViewProps> = ({ onLogin }) => {
    const { t } = useTranslation();
    const [user, setUser] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [isLoading, setIsLoading] = useState(false);

    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);
        setError('');

        try {
            // Attempt to fetch user from real database first
            const { data, error } = await supabase
                .from('users')
                .select('*')
                .eq('username', user.toLowerCase())
                .eq('password', password) // Note: In prod, verify hash
                .single();

            if (data) {
                // Fetch company details
                const { data: companyData } = await supabase
                    .from('companies')
                    .select('*')
                    .eq('id', data.company_id)
                    .single();

                if (companyData) {
                    onLogin(data.full_name, data.role as UserRole, companyData);
                    return;
                }
            }

            // Fallback for Demo/Hardcoded access
            // CRITICAL: We must fetch the REAL SIMSA company ID so FK constraints don't fail
            const { data: simsaCompany } = await supabase
                .from('companies')
                .select('*')
                .eq('slug', 'simsa')
                .single();

            const FALLBACK_COMPANY: Company = simsaCompany || {
                id: '00000000-0000-0000-0000-000000000000', // This will fail FKs but prevents crash
                name: 'SIMSA',
                slug: 'simsa'
            };

            // Keep existing hardcoded check as fallback for now
            if ((user === 'admin' || user === 'ia.agus') && password === 'admin2026') {
                onLogin(user, 'MASTER', FALLBACK_COMPANY);
            }
            else if (user === 'gerente' && password === 'gerente2026') {
                onLogin('Gerente Ops', 'MANAGER', FALLBACK_COMPANY);
            }
            else if (user === 'empleado' && password === 'empleado2026') {
                onLogin('Operador #402', 'EMPLOYEE', FALLBACK_COMPANY);
            }
            else if (user === 'supervisor' && password === 'super2026') {
                onLogin('Supervisor Patio', 'SUPERVISOR', FALLBACK_COMPANY);
            }
            else if (password === 'ia.agus.dev') {
                onLogin('Agus Dev', 'DEVELOPER', FALLBACK_COMPANY);
            }
            else {
                setError(t('login.error_auth'));
            }
        } catch (err) {
            console.error("Login Error:", err);
            setError('Error de conexión. Intente nuevamente.');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-black flex items-center justify-center p-6 relative overflow-hidden">
            {/* Animated Background Elements */}
            <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-[#EA492E]/20 blur-[120px] rounded-full animate-pulse" />
            <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-zinc-800/30 blur-[120px] rounded-full" />

            <div className="w-full max-w-md relative z-10">
                {/* Logo & Branding */}
                <div className="text-center mb-10">
                    <div className="inline-flex items-center justify-center w-20 h-20 bg-white rounded-3xl mb-6 shadow-[0_0_40px_rgba(234,73,46,0.3)]">
                        <svg xmlns="http://www.w3.org/2000/svg" width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="#EA492E" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" /></svg>
                    </div>
                    <h1 className="text-4xl font-black text-white uppercase tracking-tighter mb-2">
                        VISION <span className="text-[#EA492E]">IA</span> PRO
                    </h1>
                    <p className="text-zinc-500 font-mono text-xs uppercase tracking-[0.3em] font-bold italic">
                        Terminal Security Hub
                    </p>
                </div>

                {/* Login Form */}
                <form onSubmit={handleLogin} className="space-y-4">
                    <div className="bg-white/5 backdrop-blur-xl border border-white/10 p-8 rounded-[2.5rem] shadow-2xl">
                        {error && (
                            <div className="mb-6 p-4 bg-red-500/10 border border-red-500/20 rounded-2xl text-red-400 text-xs font-bold text-center animate-shake">
                                {error}
                            </div>
                        )}

                        <div className="space-y-5">
                            <div className="border-b border-white/5 pb-4 mb-4">
                                <h2 className="text-xl font-bold text-white text-center">{t('login.welcome')}</h2>
                                <p className="text-xs text-zinc-500 text-center mt-1">{t('login.subtitle')}</p>
                            </div>

                            <div className="space-y-1">
                                <label className="text-[10px] uppercase font-black text-zinc-500 ml-4 tracking-widest">ID</label>
                                <input
                                    type="text"
                                    value={user}
                                    title="Usuario"
                                    onChange={(e) => setUser(e.target.value)}
                                    className="w-full bg-white/5 border border-white/10 rounded-2xl p-4 text-white focus:border-[#EA492E]/50 outline-none transition-all placeholder:text-zinc-700"
                                    placeholder={t('login.user_placeholder')}
                                    required
                                    autoFocus
                                />
                            </div>

                            <div className="space-y-1">
                                <label className="text-[10px] uppercase font-black text-zinc-500 ml-4 tracking-widest">Pass</label>
                                <input
                                    type="password"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    className="w-full bg-white/5 border border-white/10 rounded-2xl p-4 text-white focus:border-[#EA492E]/50 outline-none transition-all placeholder:text-zinc-700"
                                    placeholder={t('login.password_placeholder')}
                                    required
                                />
                            </div>

                            <button
                                type="submit"
                                disabled={isLoading}
                                className="w-full py-5 bg-[#EA492E] text-white rounded-2xl font-black uppercase tracking-[0.2em] shadow-[0_10px_30px_rgba(234,73,46,0.3)] hover:scale-[1.02] active:scale-95 transition-all disabled:opacity-50 flex items-center justify-center gap-3"
                            >
                                {isLoading ? (
                                    <div className="flex items-center gap-3">
                                        <div className="w-5 h-5 border-3 border-white/20 border-t-white rounded-full animate-spin" />
                                        <span className="text-[10px]">{t('login.scanning')}</span>
                                    </div>
                                ) : (
                                    <>
                                        {t('login.login_button')}
                                        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><line x1="5" y1="12" x2="19" y2="12"></line><polyline points="12 5 19 12 12 19"></polyline></svg>
                                    </>
                                )}
                            </button>
                        </div>
                    </div>

                    <p className="text-center text-zinc-600 text-[10px] font-bold uppercase tracking-widest pt-4">
                        Powered by IA.AGUS & Google Gemini 2.5
                    </p>
                </form>
            </div>
        </div>
    );
};
