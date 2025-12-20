'use client';

import { useState, useEffect } from 'react';
import { supabase } from '@/app/lib/supabase';
import { Fioretto } from '@/app/types';
import { ShieldAlert, Loader2, Check } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { canModerate } from '@/app/lib/auth-helpers';

// Composants
import StatusFilter from '@/app/components/moderation/StatusFilter';
import TypeFilter from '@/app/components/moderation/TypeFilter';
import FiorettoModerationCard from '@/app/components/moderation/FiorettoModerationCard';
import PreviewModal from '@/app/components/moderation/PreviewModal';
import EditFiorettoModal from '@/app/components/EditFiorettoModal';
import ArchiveToggle from '@/app/components/ArchiveToggle';

export default function ModerationPage() {
    const [fioretti, setFioretti] = useState<Fioretto[]>([]);
    const [loading, setLoading] = useState(true);
    const [statutFilter, setStatutFilter] = useState<'propose' | 'approuve' | 'refuse'>('propose');
    const [typeFilter, setTypeFilter] = useState<'all' | 'grace' | 'priere' | 'ecriture' | 'parole' | 'rencontre'>('all');
    const [showArchived, setShowArchived] = useState(false);
    const [previewFioretto, setPreviewFioretto] = useState<Fioretto | null>(null);
    const [editingFioretto, setEditingFioretto] = useState<Fioretto | null>(null);
    const router = useRouter();

    useEffect(() => {
        checkPermissionsAndFetch();
    }, [statutFilter, showArchived]);

    const checkPermissionsAndFetch = async () => {
        try {
            const { data: { user } } = await supabase.auth.getUser();
            if (!user) {
                router.push('/login');
                return;
            }

            const hasPermission = await canModerate();
            if (!hasPermission) {
                router.push('/dashboard');
                return;
            }

            // Construire la query
            let query = supabase
                .from('fioretti')
                .select('*')
                .eq('statut', statutFilter);

            // Filtrer archivés pour les validés
            if (statutFilter === 'approuve' && !showArchived) {
                query = query.is('archived_at', null);
            }

            const { data, error } = await query.order('created_at', { ascending: false });

            if (error) throw error;
            setFioretti(data as Fioretto[]);

        } catch (err) {
            console.error('Error:', err);
        } finally {
            setLoading(false);
        }
    };

    const handleModeration = async (id: string, decision: 'approuve' | 'refuse') => {
        const action = decision === 'approuve' ? 'approuver' : 'refuser';
        if (!confirm(`Êtes-vous sûr de vouloir ${action} ce fioretto ?`)) return;

        try {
            const fioretto = fioretti.find(f => f.id === id);
            setFioretti(prev => prev.filter(f => f.id !== id));

            const { data: { user } } = await supabase.auth.getUser();

            // Mettre à jour le fioretto
            await supabase
                .from('fioretti')
                .update({
                    statut: decision,
                    moderateur_id: user?.id,
                    date_publication: decision === 'approuve' ? new Date().toISOString() : null
                })
                .eq('id', id);

            // Mettre à jour l'élément source
            if (fioretto) {
                const tableMap: Record<string, string> = {
                    grace: 'graces',
                    priere: 'prieres',
                    ecriture: 'paroles_ecriture',
                    parole: 'paroles_connaissance',
                    rencontre: 'rencontres_missionnaires'
                };

                const tableName = tableMap[fioretto.element_type];
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
            checkPermissionsAndFetch();
        }
    };

    const handleEdit = async (id: string, editedText: string, moderatorMessage?: string) => {
        try {
            const fioretto = fioretti.find(f => f.id === id);
            if (!fioretto) return;

            const content = typeof fioretto.contenu_affiche === 'string'
                ? JSON.parse(fioretto.contenu_affiche)
                : fioretto.contenu_affiche;

            const updatedContent = {
                ...content,
                texte: editedText
            };

            await supabase
                .from('fioretti')
                .update({
                    contenu_affiche: updatedContent,
                    message_moderateur: moderatorMessage || null
                })
                .eq('id', id);

            setEditingFioretto(null);
            checkPermissionsAndFetch();

        } catch (err) {
            console.error('Edit error:', err);
            alert("Erreur lors de la modification");
        }
    };

    // Filtrer par type
    const filteredByType = typeFilter === 'all'
        ? fioretti
        : fioretti.filter(f => f.element_type === typeFilter);

    // Compter par type
    const counts: Record<string, number> = {
        all: fioretti.length,
        grace: fioretti.filter(f => f.element_type === 'grace').length,
        priere: fioretti.filter(f => f.element_type === 'priere').length,
        ecriture: fioretti.filter(f => f.element_type === 'ecriture').length,
        parole: fioretti.filter(f => f.element_type === 'parole').length,
        rencontre: fioretti.filter(f => f.element_type === 'rencontre').length,
    };

    if (loading) {
        return (
            <div style={{
                minHeight: '100vh',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
            }}>
                <Loader2 size={48} style={{ animation: 'spin 1s linear infinite' }} />
            </div>
        );
    }

    return (
        <div style={{
            minHeight: '100vh',
            backgroundColor: '#F8FAFC',
            padding: '2rem 1rem'
        }}>
            <div style={{ maxWidth: '1400px', margin: '0 auto' }}>

                {/* Header */}
                <header style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '1rem',
                    marginBottom: '2rem'
                }}>
                    <ShieldAlert size={32} color="#475569" />
                    <div>
                        <h1 style={{
                            fontSize: '1.875rem',
                            fontWeight: 'bold',
                            color: '#1E293B',
                            marginBottom: '0.25rem'
                        }}>
                            Modération Fioretti
                        </h1>
                        <p style={{ color: '#64748B', fontSize: '0.875rem' }}>
                            Cultivez le jardin : gardez-le beau et saint
                        </p>
                    </div>
                </header>

                {/* Filtres */}
                <div style={{ marginBottom: '2rem' }}>
                    <StatusFilter selected={statutFilter} onSelect={setStatutFilter} />
                    <TypeFilter selected={typeFilter} onSelect={setTypeFilter} counts={counts} />
                </div>

                {/* Toggle archivés (seulement pour validés) */}
                {statutFilter === 'approuve' && (
                    <div style={{ marginBottom: '2rem' }}>
                        <ArchiveToggle showArchived={showArchived} onToggle={setShowArchived} />
                    </div>
                )}

                {/* Liste des fioretti */}
                {filteredByType.length === 0 ? (
                    <div style={{
                        background: 'white',
                        padding: '3rem',
                        borderRadius: '1rem',
                        boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)',
                        textAlign: 'center',
                        border: '1px solid #E2E8F0'
                    }}>
                        <Check size={48} color="#10B981" style={{ margin: '0 auto 1rem' }} />
                        <h3 style={{
                            fontSize: '1.25rem',
                            fontWeight: '600',
                            color: '#475569',
                            marginBottom: '0.5rem'
                        }}>
                            Tout est propre !
                        </h3>
                        <p style={{ color: '#94A3B8' }}>
                            Aucun fioretto dans cette catégorie.
                        </p>
                    </div>
                ) : (
                    <div style={{
                        display: 'grid',
                        gridTemplateColumns: 'repeat(auto-fill, minmax(380px, 1fr))',
                        gap: '1.5rem'
                    }}>
                        {filteredByType.map((fioretto) => (
                            <FiorettoModerationCard
                                key={fioretto.id}
                                fioretto={fioretto}
                                onApprove={() => handleModeration(fioretto.id, 'approuve')}
                                onReject={() => handleModeration(fioretto.id, 'refuse')}
                                onPreview={() => setPreviewFioretto(fioretto)}
                                onEdit={() => setEditingFioretto(fioretto)}
                                onArchiveChange={checkPermissionsAndFetch}
                            />
                        ))}
                    </div>
                )}

                {/* Modales */}
                {previewFioretto && (
                    <PreviewModal
                        fioretto={previewFioretto}
                        onClose={() => setPreviewFioretto(null)}
                    />
                )}

                {editingFioretto && (
                    <EditFiorettoModal
                        fioretto={editingFioretto}
                        onClose={() => setEditingFioretto(null)}
                        onSave={handleEdit}
                    />
                )}
            </div>
        </div>
    );
}
