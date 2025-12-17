'use client';

import { useState, useEffect } from 'react';
import { supabase } from '@/app/lib/supabase';
import { Fioretto } from '@/app/types';
import { Check, X, ShieldAlert, Loader2, Eye, Edit } from 'lucide-react';
import { useRouter } from 'next/navigation';
import EditFiorettoModal from '@/app/components/EditFiorettoModal';


const TYPE_CONFIG: Record<string, { icon: string; label: string; bg: string; border: string; text: string }> = {
    grace: { icon: '✨', label: 'Grâce', bg: '#FFFBEB', border: '#FEF3C7', text: '#78350F' },
    priere: { icon: '🙏', label: 'Prière', bg: '#EFF6FF', border: '#DBEAFE', text: '#1E3A8A' },
    ecriture: { icon: '📖', label: 'Écriture', bg: '#ECFDF5', border: '#D1FAE5', text: '#065F46' },
    parole: { icon: '🕊️', label: 'Parole', bg: '#F0F9FF', border: '#E0F2FE', text: '#075985' },
    rencontre: { icon: '🤝', label: 'Rencontre', bg: '#FFF7ED', border: '#FED7AA', text: '#92400E' }
};

export default function ModerationPage() {
    const [pendingFioretti, setPendingFioretti] = useState<Fioretto[]>([]);
    const [loading, setLoading] = useState(true);
    const [filter, setFilter] = useState<'all' | 'grace' | 'priere' | 'ecriture' | 'parole' | 'rencontre'>('all');
    const [previewFioretto, setPreviewFioretto] = useState<Fioretto | null>(null);
    const [editingFioretto, setEditingFioretto] = useState<Fioretto | null>(null);
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

            // Vérifier rôle
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
                .order('created_at', { ascending: true });

            if (error) throw error;
            setPendingFioretti(data as Fioretto[]);

        } catch (err) {
            console.error('Admin error:', err);
        } finally {
            setLoading(false);
        }
    };

    const handleModeration = async (id: string, decision: 'approuve' | 'refuse') => {
        if (!confirm(`Êtes-vous sûr de vouloir ${decision === 'approuve' ? 'approuver' : 'refuser'} ce fioretto ?`)) return;

        try {
            const fioretto = pendingFioretti.find(f => f.id === id);
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
            checkAdminAndFetch();
        }
    };

    const handleEdit = async (id: string, editedText: string, moderatorMessage?: string) => {
        try {
            const fioretto = pendingFioretti.find(f => f.id === id);
            if (!fioretto) return;

            setPendingFioretti(prev => prev.filter(f => f.id !== id));
            setEditingFioretto(null);

            const { data: { user } } = await supabase.auth.getUser();

            // Parse le contenu actuel
            const currentContent = typeof fioretto.contenu_affiche === 'string'
                ? JSON.parse(fioretto.contenu_affiche)
                : fioretto.contenu_affiche;

            // Crée le nouveau contenu avec le texte modifié
            const updatedContent = {
                ...currentContent,
                texte: editedText,
                sujet: editedText // Pour les prières
            };

            // 1. Update Fioretto avec backup de l'original
            await supabase
                .from('fioretti')
                .update({
                    statut: 'approuve',
                    moderateur_id: user?.id,
                    date_publication: new Date().toISOString(),
                    date_moderation: new Date().toISOString(),
                    contenu_original: fioretto.contenu_affiche, // Backup
                    contenu_affiche: updatedContent,
                    message_moderateur: moderatorMessage || null
                })
                .eq('id', id);

            // 2. Update Original Element Status
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
                    .update({ statut_partage: 'approuve' })
                    .eq('id', fioretto.element_id);
            }

            // 3. Créer notification pour l'auteur
            await supabase.from('notifications').insert({
                user_id: fioretto.user_id,
                type: moderatorMessage ? 'message_moderateur' : 'fioretto_approuve',
                fioretto_id: id,
                message: moderatorMessage || `Votre fioretto a été approuvé et publié dans le jardin !`
            });

        } catch (err) {
            console.error('Edit error:', err);
            alert("Erreur lors de l'édition");
            checkAdminAndFetch();
        }
    };

    const filteredFioretti = filter === 'all'
        ? pendingFioretti
        : pendingFioretti.filter(f => f.element_type === filter);

    const getCounts = () => {
        const counts: Record<string, number> = {
            all: pendingFioretti.length,
            grace: 0,
            priere: 0,
            ecriture: 0,
            parole: 0,
            rencontre: 0
        };
        pendingFioretti.forEach(f => {
            counts[f.element_type] = (counts[f.element_type] || 0) + 1;
        });
        return counts;
    };

    const counts = getCounts();

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

                {/* Filters */}
                <div style={{
                    display: 'flex',
                    flexWrap: 'wrap',
                    gap: '0.75rem',
                    marginBottom: '2rem'
                }}>
                    <FilterButton
                        active={filter === 'all'}
                        onClick={() => setFilter('all')}
                        label={`Tout (${counts.all})`}
                        emoji="🌸"
                    />
                    {Object.entries(TYPE_CONFIG).map(([key, config]) => (
                        <FilterButton
                            key={key}
                            active={filter === key}
                            onClick={() => setFilter(key as any)}
                            label={`${config.label} (${counts[key] || 0})`}
                            emoji={config.icon}
                        />
                    ))}
                </div>

                {/* Content */}
                {filteredFioretti.length === 0 ? (
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
                            Aucune demande en attente.
                        </p>
                    </div>
                ) : (
                    <div style={{
                        display: 'grid',
                        gridTemplateColumns: 'repeat(auto-fill, minmax(380px, 1fr))',
                        gap: '1.5rem'
                    }}>
                        {filteredFioretti.map((fioretto) => (
                            <FiorettoModerationCard
                                key={fioretto.id}
                                fioretto={fioretto}
                                onApprove={() => handleModeration(fioretto.id, 'approuve')}
                                onReject={() => handleModeration(fioretto.id, 'refuse')}
                                onPreview={() => setPreviewFioretto(fioretto)}
                                onEdit={() => setEditingFioretto(fioretto)}
                            />
                        ))}
                    </div>
                )}

                {/* Preview Modal */}
                {previewFioretto && (
                    <PreviewModal
                        fioretto={previewFioretto}
                        onClose={() => setPreviewFioretto(null)}
                    />
                )}

                {/* Edit Modal */}
                {editingFioretto && (
                    <EditFiorettoModal
                        fioretto={editingFioretto}
                        onSave={(editedText, moderatorMessage) => handleEdit(editingFioretto.id, editedText, moderatorMessage)}
                        onClose={() => setEditingFioretto(null)}
                    />
                )}
            </div>
        </div>
    );
}

function FilterButton({ active, onClick, label, emoji }: { active: boolean; onClick: () => void; label: string; emoji: string }) {
    return (
        <button
            onClick={onClick}
            style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '0.5rem',
                padding: '0.625rem 1rem',
                borderRadius: '9999px',
                border: active ? 'none' : '2px solid #E2E8F0',
                background: active ? '#3B82F6' : 'white',
                color: active ? 'white' : '#475569',
                fontWeight: active ? '600' : '500',
                cursor: 'pointer',
                fontSize: '0.875rem',
                boxShadow: active ? '0 2px 4px rgba(59, 130, 246, 0.3)' : 'none',
                transition: 'all 0.2s'
            }}
        >
            <span>{emoji}</span>
            <span>{label}</span>
        </button>
    );
}

function FiorettoModerationCard({
    fioretto,
    onApprove,
    onReject,
    onPreview,
    onEdit
}: {
    fioretto: Fioretto;
    onApprove: () => void;
    onReject: () => void;
    onPreview: () => void;
    onEdit: () => void;
}) {
    const config = TYPE_CONFIG[fioretto.element_type] || TYPE_CONFIG.grace;
    const content = typeof fioretto.contenu_affiche === 'string'
        ? JSON.parse(fioretto.contenu_affiche)
        : fioretto.contenu_affiche;

    return (
        <div style={{
            background: 'white',
            borderRadius: '1rem',
            boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)',
            overflow: 'hidden',
            border: `2px solid ${config.border}`,
            display: 'flex',
            flexDirection: 'column'
        }}>
            {/* Header */}
            <div style={{
                background: config.bg,
                padding: '1rem 1.25rem',
                borderBottom: `2px solid ${config.border}`,
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center'
            }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <span style={{ fontSize: '1.25rem' }}>{config.icon}</span>
                    <span style={{
                        fontWeight: '600',
                        fontSize: '0.875rem',
                        color: config.text,
                        textTransform: 'uppercase',
                        letterSpacing: '0.05em'
                    }}>
                        {config.label}
                    </span>
                </div>
                <span style={{ fontSize: '0.75rem', color: '#64748B' }}>
                    {new Date(fioretto.created_at).toLocaleDateString('fr-FR', {
                        day: 'numeric',
                        month: 'long'
                    })}
                </span>
            </div>

            {/* Content */}
            <div style={{ padding: '1.25rem', flex: 1 }}>
                <div
                    onClick={onPreview}
                    style={{
                        background: '#FFFEF7',
                        border: '2px solid #FEF3C7',
                        borderRadius: '0.75rem',
                        padding: '1rem',
                        marginBottom: '1rem',
                        position: 'relative',
                        cursor: 'pointer'
                    }}
                >
                    <p style={{
                        fontSize: '1rem',
                        lineHeight: '1.6',
                        color: '#1F2937',
                        fontStyle: 'italic',
                        whiteSpace: 'pre-wrap',
                        maxHeight: '150px',
                        overflow: 'hidden',
                        marginBottom: 0,
                        paddingRight: '2rem'
                    }}>
                        « {content.texte || content.sujet || "..."} »
                    </p>

                    {/* Ellipsis in bottom right */}
                    <div style={{
                        position: 'absolute',
                        bottom: '0.75rem',
                        right: '0.75rem',
                        fontSize: '1rem',
                        color: '#92400E',
                        fontWeight: 'normal',
                        fontStyle: 'italic',
                        pointerEvents: 'none'
                    }}>
                        (...)
                    </div>
                </div>

                {fioretto.message_ajout && (
                    <div style={{
                        paddingTop: '1rem',
                        borderTop: '1px solid #F1F5F9',
                        marginBottom: '1rem'
                    }}>
                        <p style={{
                            fontSize: '0.875rem',
                            color: config.text,
                            fontStyle: 'italic',
                            lineHeight: '1.5'
                        }}>
                            "{fioretto.message_ajout}"
                        </p>
                    </div>
                )}

                <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.5rem',
                    fontSize: '0.75rem',
                    color: '#64748B'
                }}>
                    <div style={{
                        width: '8px',
                        height: '8px',
                        borderRadius: '50%',
                        background: fioretto.anonyme ? '#F59E0B' : '#3B82F6'
                    }} />
                    <span>
                        {fioretto.anonyme ? 'Anonyme' : fioretto.pseudo || 'Public'}
                    </span>
                </div>
            </div>

            <div style={{
                padding: '1rem 1.25rem',
                background: '#F8FAFC',
                borderTop: '1px solid #E2E8F0',
                display: 'grid',
                gridTemplateColumns: 'auto auto 1fr 1fr',
                gap: '0.75rem'
            }}>
                <button
                    onClick={onPreview}
                    style={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        padding: '0.625rem',
                        borderRadius: '0.5rem',
                        background: 'white',
                        border: '2px solid #E2E8F0',
                        color: '#64748B',
                        cursor: 'pointer',
                        transition: 'all 0.2s'
                    }}
                    title="Prévisualiser le contenu complet"
                >
                    <Eye size={18} />
                </button>
                <button
                    onClick={onEdit}
                    style={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        padding: '0.625rem',
                        borderRadius: '0.5rem',
                        background: 'white',
                        border: '2px solid #DBEAFE',
                        color: '#3B82F6',
                        cursor: 'pointer',
                        transition: 'all 0.2s'
                    }}
                    title="Modifier le contenu"
                >
                    <Edit size={18} />
                </button>
                <button
                    onClick={onReject}
                    style={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        gap: '0.5rem',
                        padding: '0.625rem 1rem',
                        borderRadius: '0.5rem',
                        background: 'white',
                        border: '2px solid #FEE2E2',
                        color: '#DC2626',
                        cursor: 'pointer',
                        fontWeight: '500',
                        fontSize: '0.875rem',
                        transition: 'all 0.2s'
                    }}
                >
                    <X size={16} /> Refuser
                </button>
                <button
                    onClick={onApprove}
                    style={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        gap: '0.5rem',
                        padding: '0.625rem 1rem',
                        borderRadius: '0.5rem',
                        background: '#10B981',
                        border: 'none',
                        color: 'white',
                        cursor: 'pointer',
                        fontWeight: '600',
                        fontSize: '0.875rem',
                        boxShadow: '0 2px 4px rgba(16, 185, 129, 0.3)',
                        transition: 'all 0.2s'
                    }}
                >
                    <Check size={16} /> Valider
                </button>
            </div>
        </div>
    );
}

function PreviewModal({ fioretto, onClose }: { fioretto: Fioretto; onClose: () => void }) {
    const config = TYPE_CONFIG[fioretto.element_type] || TYPE_CONFIG.grace;
    const content = typeof fioretto.contenu_affiche === 'string'
        ? JSON.parse(fioretto.contenu_affiche)
        : fioretto.contenu_affiche;

    return (
        <div
            onClick={onClose}
            style={{
                position: 'fixed',
                inset: 0,
                background: 'rgba(0, 0, 0, 0.5)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                zIndex: 1000,
                padding: '1rem'
            }}
        >
            <div
                onClick={(e) => e.stopPropagation()}
                style={{
                    background: 'white',
                    borderRadius: '1rem',
                    maxWidth: '600px',
                    width: '100%',
                    maxHeight: '90vh',
                    overflow: 'auto',
                    boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1)'
                }}
            >
                <div style={{
                    padding: '1.5rem',
                    borderBottom: `3px solid ${config.border}`,
                    background: config.bg
                }}>
                    <h3 style={{
                        fontSize: '1.25rem',
                        fontWeight: 'bold',
                        color: config.text,
                        marginBottom: '0.5rem'
                    }}>
                        👁️ Aperçu dans le Jardin
                    </h3>
                    <p style={{ fontSize: '0.875rem', color: '#64748B' }}>
                        Voici comment ce fioretto apparaîtra aux visiteurs
                    </p>
                </div>

                <div style={{ padding: '1.5rem' }}>
                    <div style={{
                        background: '#FFFEF7',
                        border: '2px solid #FEF3C7',
                        borderRadius: '0.75rem',
                        padding: '1.25rem',
                        marginBottom: '1rem'
                    }}>
                        <p style={{
                            fontSize: '1.125rem',
                            lineHeight: '1.7',
                            color: '#1F2937',
                            fontStyle: 'italic',
                            whiteSpace: 'pre-wrap'
                        }}>
                            « {content.texte || content.sujet || "..."} »
                        </p>
                    </div>

                    {fioretto.message_ajout && (
                        <div style={{
                            marginTop: '1rem',
                            paddingTop: '1rem',
                            borderTop: '1px solid #FEF3C7'
                        }}>
                            <p style={{
                                fontSize: '0.95rem',
                                color: config.text,
                                fontStyle: 'italic',
                                lineHeight: '1.6'
                            }}>
                                "{fioretto.message_ajout}"
                            </p>
                            <p style={{
                                fontSize: '0.75rem',
                                color: '#92400E',
                                marginTop: '0.5rem',
                                opacity: 0.7
                            }}>
                                — {fioretto.anonyme ? "Anonyme" : fioretto.pseudo || "Un frère/une sœur"}
                            </p>
                        </div>
                    )}

                    <button
                        onClick={onClose}
                        style={{
                            marginTop: '1.5rem',
                            width: '100%',
                            padding: '0.75rem',
                            background: config.bg,
                            color: config.text,
                            border: `2px solid ${config.border}`,
                            borderRadius: '0.5rem',
                            fontWeight: '500',
                            cursor: 'pointer'
                        }}
                    >
                        Fermer
                    </button>
                </div>
            </div>
        </div>
    );
}
