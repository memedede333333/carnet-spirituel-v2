'use client';

import { useState, useEffect } from 'react';
import { supabase } from '@/app/lib/supabase';
import { Fioretto } from '@/app/types';
import { Loader2, MessageSquare, CheckCircle2, XCircle, Clock } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { formatFiorettoContent } from '@/app/lib/fioretti-helpers';

const TYPE_CONFIG: Record<string, { icon: string; label: string; bg: string; border: string; text: string }> = {
    grace: { icon: '✨', label: 'Grâce', bg: '#FFFBEB', border: '#FEF3C7', text: '#78350F' },
    priere: { icon: '🙏', label: 'Prière', bg: '#EFF6FF', border: '#DBEAFE', text: '#1E3A8A' },
    ecriture: { icon: '📖', label: 'Écriture', bg: '#ECFDF5', border: '#D1FAE5', text: '#065F46' },
    parole: { icon: '🕊️', label: 'Parole', bg: '#F0F9FF', border: '#E0F2FE', text: '#075985' },
    rencontre: { icon: '🤝', label: 'Rencontre', bg: '#FFF7ED', border: '#FED7AA', text: '#92400E' }
};

const STATUT_CONFIG = {
    propose: {
        label: 'En attente',
        icon: Clock,
        color: '#F59E0B',
        bg: '#FEF3C7',
        description: 'Votre fioretto est en cours de modération'
    },
    approuve: {
        label: 'Approuvé',
        icon: CheckCircle2,
        color: '#10B981',
        bg: '#D1FAE5',
        description: 'Publié dans la communauté'
    },
    refuse: {
        label: 'Non retenu',
        icon: XCircle,
        color: '#EF4444',
        bg: '#FEE2E2',
        description: 'Non publié dans la communauté'
    }
};

export default function MesFiorettiPage() {
    const [fioretti, setFioretti] = useState<Fioretto[]>([]);
    const [loading, setLoading] = useState(true);
    const [filter, setFilter] = useState<'all' | 'propose' | 'approuve' | 'refuse'>('all');
    const router = useRouter();

    useEffect(() => {
        checkAuthAndFetch();
    }, []);

    const checkAuthAndFetch = async () => {
        try {
            const { data: { user } } = await supabase.auth.getUser();
            if (!user) {
                router.push('/login');
                return;
            }

            const { data, error } = await supabase
                .from('fioretti')
                .select('*')
                .eq('user_id', user.id)
                .order('created_at', { ascending: false });

            if (error) throw error;
            setFioretti(data as Fioretto[]);

            // Marquer toutes les notifications comme lues
            await supabase
                .from('notifications')
                .update({ lu: true })
                .eq('user_id', user.id)
                .eq('lu', false);

        } catch (err) {
            console.error('Erreur chargement:', err);
        } finally {
            setLoading(false);
        }
    };

    const filteredFioretti = filter === 'all'
        ? fioretti
        : fioretti.filter(f => f.statut === filter);

    const counts = {
        all: fioretti.length,
        propose: fioretti.filter(f => f.statut === 'propose').length,
        approuve: fioretti.filter(f => f.statut === 'approuve').length,
        refuse: fioretti.filter(f => f.statut === 'refuse').length
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
            backgroundColor: '#FFFBEB',
            padding: '2rem 1rem'
        }}>
            <div style={{ maxWidth: '1200px', margin: '0 auto' }}>

                {/* Header */}
                <div className="fade-in" style={{ marginBottom: '2rem' }}>
                    <h1 style={{
                        fontSize: '2.5rem',
                        fontWeight: 'bold',
                        color: '#78350F',
                        marginBottom: '0.5rem',
                        fontFamily: 'Crimson Text, Georgia, serif'
                    }}>
                        Mes Fioretti partagés
                    </h1>
                    <p style={{
                        fontSize: '1rem',
                        color: '#92400E',
                        fontStyle: 'italic',
                        opacity: 0.8
                    }}>
                        Suivez l'état de vos partages et les messages des modérateurs
                    </p>
                </div>

                {/* Filtres */}
                <div style={{
                    display: 'flex',
                    flexWrap: 'wrap',
                    gap: '0.75rem',
                    marginBottom: '2rem'
                }}>
                    <FilterButton
                        active={filter === 'all'}
                        onClick={() => setFilter('all')}
                        label={`Tous (${counts.all})`}
                    />
                    <FilterButton
                        active={filter === 'propose'}
                        onClick={() => setFilter('propose')}
                        label={`En attente (${counts.propose})`}
                    />
                    <FilterButton
                        active={filter === 'approuve'}
                        onClick={() => setFilter('approuve')}
                        label={`Approuvés (${counts.approuve})`}
                    />
                    <FilterButton
                        active={filter === 'refuse'}
                        onClick={() => setFilter('refuse')}
                        label={`Non retenus (${counts.refuse})`}
                    />
                </div>

                {/* Liste des fioretti */}
                {filteredFioretti.length === 0 ? (
                    <div className="fade-in" style={{
                        textAlign: 'center',
                        padding: '4rem 2rem',
                        background: 'white',
                        borderRadius: '1rem',
                        boxShadow: '0 4px 6px rgba(0, 0, 0, 0.05)',
                        border: '2px solid #FEF3C7'
                    }}>
                        <div style={{ fontSize: '4rem', marginBottom: '1rem' }}>🌱</div>
                        <h3 style={{
                            fontSize: '1.5rem',
                            fontWeight: '600',
                            color: '#78350F',
                            marginBottom: '0.5rem'
                        }}>
                            {filter === 'all'
                                ? 'Aucun fioretti partagé'
                                : `Aucun fioretti ${STATUT_CONFIG[filter as keyof typeof STATUT_CONFIG].label.toLowerCase()}`
                            }
                        </h3>
                        <p style={{ color: '#92400E', fontStyle: 'italic' }}>
                            Partagez vos grâces depuis les pages détails
                        </p>
                    </div>
                ) : (
                    <div style={{
                        display: 'grid',
                        gap: '1.5rem'
                    }}>
                        {filteredFioretti.map((fioretto, index) => (
                            <FiorettoCard
                                key={fioretto.id}
                                fioretto={fioretto}
                                index={index}
                            />
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}

function FilterButton({ active, onClick, label }: { active: boolean; onClick: () => void; label: string }) {
    return (
        <button
            onClick={onClick}
            style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '0.5rem',
                padding: '0.625rem 1.25rem',
                borderRadius: '9999px',
                border: active ? 'none' : '2px solid #FEF3C7',
                background: active ? '#FCD34D' : 'white',
                color: active ? '#78350F' : '#92400E',
                fontWeight: active ? '600' : '500',
                cursor: 'pointer',
                fontSize: '0.9rem',
                boxShadow: active ? '0 2px 4px rgba(0, 0, 0, 0.1)' : 'none',
                transition: 'all 0.2s'
            }}
            onMouseEnter={(e) => {
                if (!active) {
                    e.currentTarget.style.background = '#FFFBEB';
                    e.currentTarget.style.borderColor = '#FDE68A';
                }
            }}
            onMouseLeave={(e) => {
                if (!active) {
                    e.currentTarget.style.background = 'white';
                    e.currentTarget.style.borderColor = '#FEF3C7';
                }
            }}
        >
            <span>{label}</span>
        </button>
    );
}

function FiorettoCard({ fioretto, index }: { fioretto: Fioretto; index: number }) {
    const typeConfig = TYPE_CONFIG[fioretto.element_type] || TYPE_CONFIG.grace;
    const statutConfig = STATUT_CONFIG[fioretto.statut as keyof typeof STATUT_CONFIG];
    const StatutIcon = statutConfig.icon;

    const content = typeof fioretto.contenu_affiche === 'string'
        ? JSON.parse(fioretto.contenu_affiche)
        : fioretto.contenu_affiche;

    return (
        <div
            className="fade-in"
            style={{
                background: 'white',
                borderRadius: '1rem',
                boxShadow: '0 4px 6px rgba(0, 0, 0, 0.05)',
                border: `2px solid ${typeConfig.border}`,
                overflow: 'hidden',
                animationDelay: `${index * 0.1}s`
            }}
        >
            {/* Header */}
            <div style={{
                background: typeConfig.bg,
                padding: '1.25rem 1.5rem',
                borderBottom: `2px solid ${typeConfig.border}`,
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                flexWrap: 'wrap',
                gap: '1rem'
            }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                    <span style={{ fontSize: '1.5rem' }}>{typeConfig.icon}</span>
                    <div>
                        <span style={{
                            fontWeight: '600',
                            fontSize: '0.875rem',
                            color: typeConfig.text,
                            textTransform: 'uppercase',
                            letterSpacing: '0.05em'
                        }}>
                            {typeConfig.label}
                        </span>
                        <p style={{
                            fontSize: '0.75rem',
                            color: '#6B7280',
                            marginTop: '0.25rem'
                        }}>
                            {new Date(fioretto.created_at).toLocaleDateString('fr-FR', {
                                day: 'numeric',
                                month: 'long',
                                year: 'numeric'
                            })}
                        </p>
                    </div>
                </div>

                {/* Badge statut */}
                <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.5rem',
                    padding: '0.5rem 1rem',
                    borderRadius: '9999px',
                    background: statutConfig.bg,
                    border: `2px solid ${statutConfig.color}40`
                }}>
                    <StatutIcon size={16} color={statutConfig.color} />
                    <span style={{
                        fontSize: '0.875rem',
                        fontWeight: '600',
                        color: statutConfig.color
                    }}>
                        {statutConfig.label}
                    </span>
                </div>
            </div>

            {/* Contenu */}
            <div style={{ padding: '1.5rem' }}>
                {(() => {
                    const { mainText, metadata } = formatFiorettoContent(fioretto.element_type, content);

                    return (
                        <>
                            {/* Texte principal */}
                            <div style={{
                                background: '#FFFEF7',
                                border: '2px solid #FEF3C7',
                                borderRadius: '0.75rem',
                                padding: '1.25rem',
                                marginBottom: '1.5rem'
                            }}>
                                <p style={{
                                    fontSize: '1.125rem',
                                    lineHeight: '1.7',
                                    color: '#1F2937',
                                    fontStyle: 'italic',
                                    whiteSpace: 'pre-wrap'
                                }}>
                                    « {mainText} »
                                </p>
                            </div>

                            {/* Métadonnées */}
                            {metadata.length > 0 && (
                                <div style={{
                                    display: 'grid',
                                    gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
                                    gap: '0.75rem',
                                    marginBottom: '1.5rem'
                                }}>
                                    {metadata.map((meta, idx) => (
                                        <div key={idx} style={{
                                            background: typeConfig.bg,
                                            borderRadius: '0.5rem',
                                            padding: '0.75rem',
                                            border: `1px solid ${typeConfig.border}`
                                        }}>
                                            <div style={{
                                                fontSize: '0.75rem',
                                                color: '#6B7280',
                                                marginBottom: '0.25rem',
                                                display: 'flex',
                                                alignItems: 'center',
                                                gap: '0.25rem'
                                            }}>
                                                <span>{meta.icon}</span>
                                                <span>{meta.label}</span>
                                            </div>
                                            <p style={{
                                                fontSize: '0.875rem',
                                                color: typeConfig.text,
                                                fontWeight: '500'
                                            }}>
                                                {meta.value}
                                            </p>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </>
                    );
                })()}

                {/* Message modérateur */}
                {fioretto.message_moderateur && (
                    <div style={{
                        marginTop: '1.5rem',
                        padding: '1rem 1.25rem',
                        background: '#EFF6FF',
                        borderLeft: '4px solid #3B82F6',
                        borderRadius: '0.5rem'
                    }}>
                        <div style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: '0.5rem',
                            marginBottom: '0.5rem'
                        }}>
                            <MessageSquare size={16} color="#3B82F6" />
                            <span style={{
                                fontSize: '0.875rem',
                                fontWeight: '600',
                                color: '#1E40AF'
                            }}>
                                Message du modérateur
                            </span>
                        </div>
                        <p style={{
                            fontSize: '0.875rem',
                            color: '#1E40AF',
                            lineHeight: '1.5',
                            fontStyle: 'italic'
                        }}>
                            {fioretto.message_moderateur}
                        </p>
                    </div>
                )}

                {/* Description statut */}
                <p style={{
                    marginTop: '1rem',
                    fontSize: '0.75rem',
                    color: '#6B7280',
                    textAlign: 'center',
                    fontStyle: 'italic'
                }}>
                    {statutConfig.description}
                </p>
            </div>
        </div>
    );
}
