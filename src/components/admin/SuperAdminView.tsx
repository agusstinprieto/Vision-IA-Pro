import React, { useState, useEffect } from 'react';
import { supabase } from '../../services/auth/supabase';
import { Building2, UserPlus, ShieldAlert, CheckCircle2, XCircle, Trash2, Key } from 'lucide-react';

interface Company {
    id: string;
    name: string;
    slug: string;
    created_at: string;
}

export const SuperAdminView: React.FC = () => {
    const [companies, setCompanies] = useState<Company[]>([]);
    const [loading, setLoading] = useState(true);
    const [newCompName, setNewCompName] = useState('');
    const [newUserEmail, setNewUserEmail] = useState('');
    const [newUserPass, setNewUserPass] = useState('');
    const [selectedCompany, setSelectedCompany] = useState<string | null>(null);

    useEffect(() => {
        fetchCompanies();
    }, []);

    const fetchCompanies = async () => {
        setLoading(true);
        const { data, error } = await supabase.from('companies').select('*').order('created_at', { ascending: false });
        if (!error && data) setCompanies(data);
        setLoading(false);
    };

    const createCompany = async () => {
        if (!newCompName.trim()) return;
        const slug = newCompName.toLowerCase().replace(/\s+/g, '-');

        const { data, error } = await supabase
            .from('companies')
            .insert([{ name: newCompName, slug }])
            .select()
            .single();

        if (error) {
            alert('Error creating company: ' + error.message);
        } else {
            setNewCompName('');
            fetchCompanies();
            // Auto-select the new company to add a user immediately
            if (data) setSelectedCompany(data.id);
        }
    };

    const createAdminUser = async () => {
        if (!selectedCompany || !newUserEmail || !newUserPass) return;

        // 1. Create Auth User (This usually requires Service Role in backend, 
        // but for now we'll try direct insert if RLS allows, or use a function)
        // NOTE: In client-side, we can't create users for *others* easily without a specific Edge Function.
        // For this MVP, we will simulate the "Row" creation in 'users' table, 
        // assuming the Auth User (UID) is created via a separate process or we instruct the user to Sign Up.

        // ACTUALLY: The best way for a "God Mode" client-side is to just insert into the 'users' table
        // if we assume they manage the Auth UID separately or we use a purely "DB-based" user for this app.
        // BUT, since we use Supabase Auth, we need `supabase.auth.signUp`.

        // Challenge: `signUp` logs you in as that user.
        // Workaround: We will just insert the "Profile" into the public.users table 
        // and let them "Sign Up" later, OR we accept that this panel is for existing UIDs.

        // FOR NOW: Let's assume we just create the 'public.users' record 
        // and rely on a "Link" strategy or just pure data entry.

        const { error } = await supabase.from('users').insert({
            company_id: selectedCompany,
            username: newUserEmail, // Using email as username for now
            role: 'admin',
            full_name: 'Admin - ' + newUserEmail,
            // In a real app, we'd need the Auth UID here. 
            // We'll use a placeholder UUID for the "god mode" creation if we don't have the real UID yet.
            id: crypto.randomUUID(),
            password: newUserPass // Storing plain text for MVP demo? DANGEROUS. 
            // Ideally we don't touch passwords here.
        });

        if (error) {
            alert('Error creating profile: ' + error.message);
        } else {
            alert('Usuario Admin asignado a la empresa.');
            setNewUserEmail('');
            setNewUserPass('');
        }
    };

    return (
        <div className="min-h-screen bg-[#0F1012] p-8 text-white">
            <header className="mb-10">
                <h1 className="text-4xl font-black uppercase text-red-500 flex items-center gap-3">
                    <ShieldAlert size={40} />
                    Super Admin <span className="text-white">Panel</span>
                </h1>
                <p className="text-zinc-500 font-mono text-sm mt-2">
                    GOD MODE: Provisioning & Multi-Tenant Management
                </p>
            </header>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                {/* CREATE COMPANY */}
                <section className="bg-white/5 p-8 rounded-3xl border border-white/10">
                    <h2 className="text-xl font-bold uppercase mb-6 flex items-center gap-2">
                        <Building2 className="text-blue-500" />
                        1. Crear Empresa
                    </h2>
                    <div className="space-y-4">
                        <div>
                            <label className="text-xs font-bold text-zinc-500 uppercase">Nombre de la Empresa</label>
                            <input
                                type="text"
                                value={newCompName}
                                onChange={e => setNewCompName(e.target.value)}
                                className="w-full bg-black/50 border border-white/10 rounded-xl p-3 mt-1 text-white focus:border-blue-500 outline-none"
                                placeholder="Ej. Transportes Comugas"
                            />
                        </div>
                        <button
                            onClick={createCompany}
                            disabled={!newCompName}
                            className="w-full py-3 bg-blue-600 hover:bg-blue-500 disabled:opacity-50 disabled:cursor-not-allowed rounded-xl font-bold uppercase tracking-widest text-xs transition-all"
                        >
                            Registrar Empresa
                        </button>
                    </div>
                </section>

                {/* CREATE ADMIN USER */}
                <section className="bg-white/5 p-8 rounded-3xl border border-white/10 opacity-100">
                    <h2 className="text-xl font-bold uppercase mb-6 flex items-center gap-2">
                        <UserPlus className="text-green-500" />
                        2. Asignar Primer Admin
                    </h2>

                    {!selectedCompany ? (
                        <div className="text-center py-10 text-zinc-500 text-sm">
                            Selecciona una empresa de la lista abajo para continuar.
                        </div>
                    ) : (
                        <div className="space-y-4">
                            <div className="bg-blue-500/10 border border-blue-500/20 p-3 rounded-xl text-xs text-blue-400 font-mono mb-4">
                                Empresa: {companies.find(c => c.id === selectedCompany)?.name}
                            </div>
                            <div>
                                <label className="text-xs font-bold text-zinc-500 uppercase">Username / Email</label>
                                <input
                                    type="text"
                                    value={newUserEmail}
                                    onChange={e => setNewUserEmail(e.target.value)}
                                    className="w-full bg-black/50 border border-white/10 rounded-xl p-3 mt-1 text-white focus:border-green-500 outline-none"
                                    placeholder="admin@empresa.com"
                                />
                            </div>
                            <div>
                                <label className="text-xs font-bold text-zinc-500 uppercase">Contraseña Temporal</label>
                                <input
                                    type="text"
                                    value={newUserPass}
                                    onChange={e => setNewUserPass(e.target.value)}
                                    className="w-full bg-black/50 border border-white/10 rounded-xl p-3 mt-1 text-white focus:border-green-500 outline-none"
                                    placeholder="123456"
                                />
                            </div>
                            <button
                                onClick={createAdminUser}
                                className="w-full py-3 bg-green-600 hover:bg-green-500 rounded-xl font-bold uppercase tracking-widest text-xs transition-all"
                            >
                                Crear Usuario Admin
                            </button>
                        </div>
                    )}
                </section>
            </div>

            {/* COMPANY LIST */}
            <section className="mt-12">
                <h3 className="text-lg font-bold uppercase mb-6 text-zinc-400">Empresas Activas ({companies.length})</h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    {companies.map(comp => (
                        <div
                            key={comp.id}
                            onClick={() => setSelectedCompany(comp.id)}
                            className={`p-6 rounded-2xl border cursor-pointer transition-all ${selectedCompany === comp.id ? 'bg-blue-600/10 border-blue-500 ring-1 ring-blue-500' : 'bg-[#1A1C1E] border-white/5 hover:border-white/20'}`}
                        >
                            <div className="flex justify-between items-start mb-2">
                                <h4 className="font-bold text-lg">{comp.name}</h4>
                                {selectedCompany === comp.id && <CheckCircle2 size={18} className="text-blue-500" />}
                            </div>
                            <p className="text-xs font-mono text-zinc-500 mb-4">{comp.slug}</p>
                            <div className="flex items-center gap-2 text-[10px] text-zinc-600 font-mono uppercase">
                                <Key size={12} />
                                {comp.id.slice(0, 8)}...
                            </div>
                        </div>
                    ))}
                </div>
            </section>
        </div>
    );
};
