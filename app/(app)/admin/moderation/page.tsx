'use client';

import { useState, useEffect } from 'react';
import { supabase } from '@/app/lib/supabase';
import { Fioretto } from '@/app/types';
import { Check, X, ShieldAlert, Loader2 } from 'lucide-react';
import { useRouter } from 'next/navigation';

export default function ModerationPage() {
    const [pendingFioretti, setPendingFioretti] = useState<Fioretto[]>([]);
    const [loading, setLoading] = useState(true);
    const router = useRouter();

    useEffect(() => {
        checkAdminAndFetch();
    }, []);

    const checkAdminAndFetch = async () => {
        try {
            const { data: { user } } = await supabase.auth.getUser();
            if (!user) {
                router.push('/login');
                return;
            }

            // Vérifier rôle (Sécurité frontend, le RLS bloque aussi)
            const { data: profile } = await supabase.from('profiles').select('role').eq('id', user.id).single();
            if (profile?.role !== 'superadmin' && profile?.role !== 'moderateur') {
                router.push('/dashboard');
                return;
            }

            // Fetch pending
            const { data, error } = await supabase
                .from('fioretti')
                .select('*')
                .eq('statut', 'propose')
                .order('created_at', { ascending: true }); // Plus anciens en premier

            if (error) throw error;
            setPendingFioretti(data as Fioretto[]);

        } catch (err) {
            console.error('Admin error:', err);
        } finally {
            setLoading(false);
        }
    };

    const handleModeration = async (id: string, decision: 'approuve' | 'refuse') => {
        try {
            // Optimistic update
            setPendingFioretti(prev => prev.filter(f => f.id !== id));

            const { data: { user } } = await supabase.auth.getUser();

            // 1. Update Fioretto
            await supabase
                .from('fioretti')
                .update({
                    statut: decision,
                    moderateur_id: user?.id,
                    date_publication: decision === 'approuve' ? new Date().toISOString() : null
                })
                .eq('id', id);

            // 2. Update Original Element Status
            // On doit retrouver la table d'origine.
            // Pour éviter de refetcher le fioretto, on cherche dans l'état local
            const fioretto = pendingFioretti.find(f => f.id === id);
            if (fioretto) {
                let tableName = '';
                if (fioretto.element_type === 'grace') tableName = 'graces';
                else if (fioretto.element_type === 'priere') tableName = 'prieres';
                else if (fioretto.element_type === 'ecriture') tableName = 'paroles_ecriture';
                else if (fioretto.element_type === 'parole') tableName = 'paroles_connaissance';
                else if (fioretto.element_type === 'rencontre') tableName = 'rencontres_missionnaires';

                if (tableName) {
                    await supabase
                        .from(tableName)
                        .update({ statut_partage: decision })
                        .eq('id', fioretto.element_id);
                }
            }

        } catch (err) {
            console.error('Moderation error:', err);
            alert("Erreur lors de la modération");
            checkAdminAndFetch(); // Reload
        }
    };

    if (loading) return <div className="flex h-screen items-center justify-center"><Loader2 className="animate-spin" /></div>;

    return (
        <div className="min-h-screen bg-slate-50 p-8">
            <div className="max-w-6xl mx-auto">

                <header className="flex items-center gap-4 mb-8">
                    <ShieldAlert className="text-slate-700" size={32} />
                    <div>
                        <h1 className="text-2xl font-bold text-slate-800">Modération Fioretti</h1>
                        <p className="text-slate-500">Cultivez le jardin : gardez-le beau et saint.</p>
                    </div>
                </header>

                {pendingFioretti.length === 0 ? (
                    <div className="bg-white p-12 rounded-xl shadow-sm text-center border border-slate-200">
                        <Check className="mx-auto text-emerald-500 mb-4" size={48} />
                        <h3 className="text-xl font-medium text-slate-700">Tout est propre !</h3>
                        <p className="text-slate-400">Aucune demande en attente.</p>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                        {pendingFioretti.map((fioretto) => {
                            const content = typeof fioretto.contenu_affiche === 'string'
                                ? JSON.parse(fioretto.contenu_affiche)
                                : fioretto.contenu_affiche;

                            return (
                                <div key={fioretto.id} className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden flex flex-col">
                                    {/* Header Card */}
                                    <div className="bg-slate-50 px-4 py-3 border-b border-slate-100 flex justify-between items-center">
                                        <span className={`uppercase text-xs font-bold px-2 py-1 rounded ${fioretto.element_type === 'grace' ? 'bg-amber-100 text-amber-700' :
                                                fioretto.element_type === 'priere' ? 'bg-indigo-100 text-indigo-700' :
                                                    'bg-slate-200 text-slate-700'
                                            }`}>
                                            {fioretto.element_type}
                                        </span>
                                        <span className="text-xs text-slate-400">
                                            {new Date(fioretto.created_at).toLocaleDateString()}
                                        </span>
                                    </div>

                                    {/* Body */}
                                    <div className="p-4 flex-1 space-y-4">
                                        <div>
                                            <p className="text-xs font-semibold text-slate-400 mb-1 uppercase">Contenu partagé</p>
                                            <div className="bg-slate-50 p-3 rounded border border-slate-100 text-slate-800 text-sm font-serif">
                                                « {content.texte || content.sujet || "..."} »
                                            </div>
                                        </div>

                                        {fioretto.message_ajout && (
                                            <div>
                                                <p className="text-xs font-semibold text-slate-400 mb-1 uppercase">Message ajouté</p>
                                                <p className="text-slate-600 italic text-sm">
                                                    "{fioretto.message_ajout}"
                                                </p>
                                            </div>
                                        )}

                                        <div className="flex items-center gap-2 pt-2 border-t border-slate-50">
                                            <div className={`w-2 h-2 rounded-full ${fioretto.anonyme ? 'bg-amber-400' : 'bg-blue-400'}`}></div>
                                            <span className="text-xs text-slate-500">
                                                {fioretto.anonyme ? 'Anonyme' : 'Public (avec nom)'}
                                            </span>
                                        </div>
                                    </div>

                                    {/* Actions */}
                                    <div className="p-4 bg-slate-50 border-t border-slate-100 grid grid-cols-2 gap-3">
                                        <button
                                            onClick={() => handleModeration(fioretto.id, 'refuse')}
                                            className="flex items-center justify-center gap-2 py-2 px-4 rounded-lg bg-white border border-red-200 text-red-600 hover:bg-red-50 transition-colors font-medium text-sm"
                                        >
                                            <X size={16} /> Refuser
                                        </button>
                                        <button
                                            onClick={() => handleModeration(fioretto.id, 'approuve')}
                                            className="flex items-center justify-center gap-2 py-2 px-4 rounded-lg bg-emerald-600 text-white hover:bg-emerald-700 transition-colors font-medium text-sm shadow-sm"
                                        >
                                            <Check size={16} /> Valider
                                        </button>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                )}
            </div>
        </div>
    );
}
