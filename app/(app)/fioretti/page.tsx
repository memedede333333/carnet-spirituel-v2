'use client';

import { useState, useEffect } from 'react';
import { supabase } from '@/app/lib/supabase';
import { Fioretto } from '@/app/types';
import FiorettoCard from '@/app/components/FiorettoCard';
import { Loader2, X } from 'lucide-react';

const TYPE_CONFIG: Record<string, { icon: string; label: string; bg: string; border: string; text: string }> = {
    grace: { icon: '✨', label: 'Grâce', bg: '#FFFBEB', border: '#FEF3C7', text: '#78350F' },
    priere: { icon: '🙏', label: 'Prière', bg: '#EFF6FF', border: '#DBEAFE', text: '#1E3A8A' },
    ecriture: { icon: '📖', label: 'Écriture', bg: '#ECFDF5', border: '#D1FAE5', text: '#065F46' },
    parole: { icon: '🕊️', label: 'Parole', bg: '#F0F9FF', border: '#E0F2FE', text: '#075985' },
    rencontre: { icon: '🤝', label: 'Rencontre', bg: '#FFF7ED', border: '#FED7AA', text: '#92400E' }
};

export default function FiorettiPage() {
    const [fioretti, setFioretti] = useState<Fioretto[]>([]);
    const [loading, setLoading] = useState(true);
    const [filter, setFilter] = useState<'all' | 'grace' | 'priere' | 'ecriture' | 'parole' | 'rencontre'>('all');
    const [selectedFioretto, setSelectedFioretto] = useState<Fioretto | null>(null);

    useEffect(() => {
        fetchFioretti();
    }, []);

    const fetchFioretti = async () => {
        try {
            const { data, error } = await supabase
                .from('fioretti')
                .select(`
          *,
          interactions:fioretti_interactions(type_interaction)
        `)
                .eq('statut', 'approuve')
                .order('date_publication', { ascending: false })
                .limit(50);

            if (error) throw error;

            const formattedData = (data || []).map((item: any) => ({
                ...item,
                _count: {
                    soutien: item.interactions.filter((i: any) => i.type_interaction === 'soutien').length,
                    action_grace: item.interactions.filter((i: any) => i.type_interaction === 'action_grace').length
                }
            }));

            setFioretti(formattedData);
        } catch (err) {
            console.error('Erreur chargement jardin:', err);
        } finally {
            setLoading(false);
        }
    };

    const filteredFioretti = filter === 'all'
        ? fioretti
        : fioretti.filter(f => f.element_type === filter);

    return (
        <div style={{
            minHeight: '100vh',
            backgroundColor: '#FFFBEB',
            padding: '2rem 1rem'
        }}>
            <div style={{ maxWidth: '1200px', margin: '0 auto' }}>

                {/* Header avec shimmer effet "lumière divine" */}
                <div style={{ textAlign: 'center', marginBottom: '3rem' }} className="fade-in">
                    <div className="shimmer-background" style={{
                        display: 'inline-flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        width: '120px',
                        height: '120px',
                        borderRadius: '50%',
                        marginBottom: '1.5rem',
                        boxShadow: '0 8px 16px rgba(251, 191, 36, 0.2)'
                    }}>
                        <span style={{ fontSize: '4rem' }}>🌸</span>
                    </div>

                    <h1 style={{
                        fontSize: '3rem',
                        fontWeight: 'bold',
                        background: 'linear-gradient(135deg, #78350F, #F59E0B)',
                        WebkitBackgroundClip: 'text',
                        WebkitTextFillColor: 'transparent',
                        marginBottom: '1rem',
                        fontFamily: 'Crimson Text, Georgia, serif'
                    }}>
                        Les Fioretti de la Communauté
                    </h1>

                    <p style={{
                        fontSize: '1.125rem',
                        color: '#92400E',
                        fontStyle: 'italic',
                        maxWidth: '600px',
                        margin: '0 auto',
                        opacity: 0.85,
                        fontFamily: 'Crimson Text, Georgia, serif'
                    }}>
                        « Partageons ensemble les grâces reçues, cultivons la joie de croire »
                    </p>
                </div>

                {/* Filtres */}
                <div style={{
                    display: 'flex',
                    flexWrap: 'wrap',
                    justifyContent: 'center',
                    gap: '0.75rem',
                    marginBottom: '2.5rem'
                }}>
                    <FilterButton active={filter === 'all'} onClick={() => setFilter('all')} label="Tous les fioretti" emoji="🌸" />
                    <FilterButton active={filter === 'grace'} onClick={() => setFilter('grace')} label="Grâces" emoji="✨" />
                    <FilterButton active={filter === 'priere'} onClick={() => setFilter('priere')} label="Prières" emoji="🙏" />
                    <FilterButton active={filter === 'ecriture'} onClick={() => setFilter('ecriture')} label="Écritures" emoji="📖" />
                    <FilterButton active={filter === 'parole'} onClick={() => setFilter('parole')} label="Paroles" emoji="🕊️" />
                    <FilterButton active={filter === 'rencontre'} onClick={() => setFilter('rencontre')} label="Rencontres" emoji="🤝" />
                </div>

                {/* Grille de cartes avec FLOAT */}
                {loading ? (
                    <div style={{
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'center',
                        justifyContent: 'center',
                        padding: '4rem 0'
                    }}>
                        <Loader2 size={48} color="#D97706" style={{ marginBottom: '1rem' }} />
                        <p style={{ color: '#92400E', fontStyle: 'italic' }}>Les fioretti s'éveillent...</p>
                    </div>
                ) : filteredFioretti.length === 0 ? (
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
                            La communauté attend ses premiers fioretti
                        </h3>
                        <p style={{ color: '#92400E', fontStyle: 'italic' }}>
                            Soyez le premier à partager une grâce !
                        </p>
                    </div>
                ) : (
                    <div style={{
                        display: 'grid',
                        gridTemplateColumns: 'repeat(auto-fill, minmax(350px, 1fr))',
                        gap: '2rem',
                        marginBottom: '2rem'
                    }}>
                        {filteredFioretti.map((fioretto, index) => {
                            const config = TYPE_CONFIG[fioretto.element_type] || TYPE_CONFIG.grace;

                            return (
                                <div
                                    key={fioretto.id}
                                    className="fade-in float-gentle"
                                    style={{
                                        animationDelay: `${index * 0.1}s`,
                                        animationDuration: `${6 + (index % 3)}s`,
                                        cursor: 'pointer',
                                        transition: 'all 0.3s ease',
                                        borderRadius: '1rem',
                                        padding: '2px',
                                        background: 'transparent',
                                        position: 'relative'
                                    }}
                                    onClick={() => setSelectedFioretto(fioretto)}
                                    onMouseEnter={(e) => {
                                        e.currentTarget.style.transform = 'translateY(-12px)';
                                        e.currentTarget.style.filter = 'drop-shadow(0 20px 25px rgba(0, 0, 0, 0.15))';
                                        e.currentTarget.style.background = `linear-gradient(135deg, ${config.bg}, transparent)`;
                                        // Ajouter une bordure colorée subtile
                                        const card = e.currentTarget.querySelector('.fioretto-card') as HTMLElement;
                                        if (card) {
                                            card.style.borderColor = config.border;
                                            card.style.borderWidth = '2px';
                                        }
                                    }}
                                    onMouseLeave={(e) => {
                                        e.currentTarget.style.transform = '';
                                        e.currentTarget.style.filter = '';
                                        e.currentTarget.style.background = 'transparent';
                                        const card = e.currentTarget.querySelector('.fioretto-card') as HTMLElement;
                                        if (card) {
                                            card.style.borderColor = '#F3F4F6';
                                            card.style.borderWidth = '1px';
                                        }
                                    }}
                                >
                                    <FiorettoCard fioretto={fioretto} />
                                </div>
                            );
                        })}
                    </div>
                )}

                {/* Citation spirituelle */}
                {!loading && filteredFioretti.length > 0 && (
                    <div className="fade-in" style={{
                        marginTop: '3rem',
                        textAlign: 'center',
                        paddingTop: '2rem',
                        borderTop: '1px solid #FEF3C7',
                        animationDelay: '0.5s'
                    }}>
                        <p style={{
                            fontSize: '1rem',
                            color: '#92400E',
                            fontStyle: 'italic',
                            maxWidth: '600px',
                            margin: '0 auto',
                            opacity: 0.7,
                            fontFamily: 'Crimson Text, Georgia, serif'
                        }}>
                            « Que toute la vie devienne louange et que chaque instant soit une petite fleur offerte au Seigneur »
                        </p>
                    </div>
                )}
            </div>

            {/* Modal Détail Immersive */}
            {selectedFioretto && (
                <FiorettoDetailModal
                    fioretto={selectedFioretto}
                    onClose={() => setSelectedFioretto(null)}
                />
            )}
        </div>
    );
}

function FilterButton({ active, onClick, label, emoji }: any) {
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
            <span style={{ fontSize: '1.1rem' }}>{emoji}</span>
            <span>{label}</span>
        </button>
    );
}

function FiorettoDetailModal({ fioretto, onClose }: { fioretto: Fioretto; onClose: () => void }) {
    const config = TYPE_CONFIG[fioretto.element_type] || TYPE_CONFIG.grace;
    const content = typeof fioretto.contenu_affiche === 'string'
        ? JSON.parse(fioretto.contenu_affiche)
        : fioretto.contenu_affiche;

    // Fermer au clic Échap
    useEffect(() => {
        const handleEsc = (e: KeyboardEvent) => {
            if (e.key === 'Escape') onClose();
        };
        document.addEventListener('keydown', handleEsc);
        return () => document.removeEventListener('keydown', handleEsc);
    }, [onClose]);

    return (
        <div
            onClick={onClose}
            style={{
                position: 'fixed',
                inset: 0,
                background: 'rgba(0, 0, 0, 0.6)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                zIndex: 1000,
                padding: '2rem',
                backdropFilter: 'blur(8px)'
            }}
        >
            <div
                onClick={(e) => e.stopPropagation()}
                className="fade-in"
                style={{
                    background: 'white',
                    borderRadius: '1.5rem',
                    maxWidth: '700px',
                    width: '100%',
                    maxHeight: '90vh',
                    overflow: 'auto',
                    boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
                    border: `3px solid ${config.border}`
                }}
            >
                {/* Header avec dégradé */}
                <div style={{
                    background: `linear-gradient(135deg, ${config.bg}, white)`,
                    padding: '2rem',
                    borderBottom: `3px solid ${config.border}`,
                    position: 'relative'
                }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '0.5rem' }}>
                        <span style={{ fontSize: '2.5rem' }}>{config.icon}</span>
                        <div>
                            <h2 style={{
                                fontSize: '1.5rem',
                                fontWeight: 'bold',
                                color: config.text,
                                marginBottom: '0.25rem',
                                fontFamily: 'Crimson Text, Georgia, serif'
                            }}>
                                {config.label}
                            </h2>
                            <p style={{ fontSize: '0.875rem', color: '#6B7280' }}>
                                {new Date(fioretto.date_publication || fioretto.created_at).toLocaleDateString('fr-FR', {
                                    day: 'numeric',
                                    month: 'long',
                                    year: 'numeric'
                                })}
                            </p>
                        </div>
                    </div>

                    {/* Bouton fermer */}
                    <button
                        onClick={onClose}
                        style={{
                            position: 'absolute',
                            top: '1.5rem',
                            right: '1.5rem',
                            width: '2.5rem',
                            height: '2.5rem',
                            borderRadius: '50%',
                            border: '2px solid ' + config.border,
                            background: 'white',
                            cursor: 'pointer',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            color: config.text,
                            transition: 'all 0.2s'
                        }}
                        onMouseEnter={(e) => {
                            e.currentTarget.style.background = config.bg;
                            e.currentTarget.style.transform = 'scale(1.1)';
                        }}
                        onMouseLeave={(e) => {
                            e.currentTarget.style.background = 'white';
                            e.currentTarget.style.transform = 'scale(1)';
                        }}
                    >
                        <X size={20} />
                    </button>
                </div>

                {/* Contenu complet */}
                <div style={{ padding: '2rem' }}>
                    <div style={{
                        background: '#FFFEF7',
                        border: '3px solid #FEF3C7',
                        borderRadius: '1rem',
                        padding: '2rem',
                        marginBottom: '1.5rem',
                        position: 'relative'
                    }}>
                        <p style={{
                            fontSize: '1.25rem',
                            lineHeight: '1.8',
                            color: '#1F2937',
                            fontStyle: 'italic',
                            whiteSpace: 'pre-wrap',
                            fontFamily: 'Crimson Text, Georgia, serif'
                        }}>
                            « {content.texte || content.sujet || "..."} »
                        </p>
                    </div>

                    {/* Message ajout */}
                    {fioretto.message_ajout && (
                        <div style={{
                            padding: '1.5rem',
                            background: config.bg,
                            borderRadius: '1rem',
                            marginBottom: '1.5rem',
                            borderLeft: `4px solid ${config.border}`
                        }}>
                            <p style={{
                                fontSize: '1rem',
                                color: config.text,
                                fontStyle: 'italic',
                                lineHeight: '1.7',
                                marginBottom: '0.75rem'
                            }}>
                                "{fioretto.message_ajout}"
                            </p>
                            <p style={{
                                fontSize: '0.875rem',
                                color: config.text,
                                opacity: 0.7
                            }}>
                                — {fioretto.anonyme ? "Anonyme" : fioretto.pseudo || "Un frère/une sœur"}
                            </p>
                        </div>
                    )}

                    {/* Note : Les interactions sont déjà gérées dans FiorettoCard */}
                    <div style={{
                        textAlign: 'center',
                        padding: '1rem',
                        background: '#F9FAFB',
                        borderRadius: '0.5rem',
                        fontSize: '0.875rem',
                        color: '#6B7280',
                        fontStyle: 'italic'
                    }}>
                        ✨ Fermez cette fenêtre pour retourner aux fioretti
                    </div>
                </div>
            </div>
        </div>
    );
}
