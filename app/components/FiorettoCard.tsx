'use client';

import { useState } from 'react';
import { supabase } from '@/app/lib/supabase';
import { Fioretto } from '@/app/types';

interface FiorettoCardProps {
    fioretto: Fioretto;
}

const TYPE_CONFIG: Record<string, { icon: string; label: string; color: string; bgColor: string }> = {
    grace: { icon: '✨', label: 'Grâce', color: '#78350F', bgColor: '#FEF3C7' },
    priere: { icon: '🙏', label: 'Prière', color: '#4338CA', bgColor: '#EDE9FE' },
    ecriture: { icon: '📖', label: 'Écriture', color: '#065F46', bgColor: '#D1FAE5' },
    parole: { icon: '🕊️', label: 'Parole', color: '#0369A1', bgColor: '#E0F2FE' },
    rencontre: { icon: '🤝', label: 'Rencontre', color: '#BE123C', bgColor: '#FFE4E6' },
};

export default function FiorettoCard({ fioretto }: FiorettoCardProps) {
    const [counts, setCounts] = useState({
        soutien: fioretto._count?.soutien || 0,
        grace: fioretto._count?.action_grace || 0
    });
    const [hasInteracted, setHasInteracted] = useState({ soutien: false, grace: false });

    const config = TYPE_CONFIG[fioretto.element_type] || TYPE_CONFIG.grace;
    const content = typeof fioretto.contenu_affiche === 'string'
        ? JSON.parse(fioretto.contenu_affiche)
        : fioretto.contenu_affiche;

    const handleInteraction = async (e: React.MouseEvent, type: 'soutien' | 'action_grace') => {
        e.stopPropagation(); // Empêche l'ouverture du fioretto parent

        const key = type === 'soutien' ? 'soutien' : 'grace';
        const isRemoving = hasInteracted[key];

        // Optimistic UI update
        setCounts(prev => ({
            ...prev,
            [key]: isRemoving ? Math.max(0, prev[key] - 1) : prev[key] + 1
        }));
        setHasInteracted(prev => ({
            ...prev,
            [key]: !isRemoving
        }));

        try {
            const { data: { user } } = await supabase.auth.getUser();
            if (!user) return;

            if (isRemoving) {
                // Supprimer l'interaction
                await supabase.from('fioretti_interactions')
                    .delete()
                    .match({
                        fioretto_id: fioretto.id,
                        user_id: user.id,
                        type_interaction: type
                    });
            } else {
                // Ajouter l'interaction
                await supabase.from('fioretti_interactions').insert({
                    fioretto_id: fioretto.id,
                    user_id: user.id,
                    type_interaction: type
                });
            }
        } catch (err) {
            console.error('Interaction error:', err);
            // Revert on error (optionnel pour l'instant)
        }
    };

    return (
        <div
            className="fioretto-card"
            style={{
                background: 'white',
                borderRadius: '1rem',
                boxShadow: '0 4px 6px rgba(0, 0, 0, 0.05)',
                overflow: 'hidden',
                border: '1px solid #F3F4F6',
                transition: 'border-color 0.3s ease, border-width 0.3s ease'
            }}>
            {/* Bandeau supérieur */}
            <div style={{
                background: config.bgColor,
                padding: '1rem 1.5rem',
                borderBottom: `2px solid ${config.color}20`,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between'
            }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                    <span style={{ fontSize: '1.5rem' }}>{config.icon}</span>
                    <div>
                        <span style={{
                            fontWeight: '600',
                            fontSize: '0.875rem',
                            color: config.color,
                            textTransform: 'uppercase',
                            letterSpacing: '0.05em'
                        }}>
                            {config.label}
                        </span>
                    </div>
                </div>
                <span style={{
                    fontSize: '0.75rem',
                    color: '#6B7280',
                    opacity: 0.7
                }}>
                    {new Date(fioretto.date_publication || fioretto.created_at).toLocaleDateString('fr-FR', {
                        day: 'numeric',
                        month: 'long'
                    })}
                </span>
            </div>

            {/* Contenu principal */}
            <div style={{ padding: '1.5rem' }}>
                {/* Zone texte principal - hauteur fixe */}
                <div style={{
                    background: '#FFFEF7',
                    border: '2px solid #FEF3C7',
                    borderRadius: '0.75rem',
                    padding: '1.25rem',
                    marginBottom: '1rem',
                    height: '140px',
                    overflow: 'hidden',
                    position: 'relative'
                }}>
                    <p style={{
                        fontSize: '1.125rem',
                        lineHeight: '1.8',
                        color: '#1F2937',
                        fontStyle: 'italic',
                        margin: 0,
                        display: '-webkit-box',
                        WebkitLineClamp: 4,
                        WebkitBoxOrient: 'vertical',
                        overflow: 'hidden'
                    }}>
                        « {content.texte || content.sujet || "..."} »
                    </p>

                    {/* Indicateur de troncature */}
                    {(content.texte || content.sujet || "").length > 150 && (
                        <div style={{
                            position: 'absolute',
                            bottom: '12px',
                            right: '16px',
                            fontSize: '1rem',
                            color: '#92400E',
                            fontStyle: 'italic',
                            fontWeight: '500',
                            textShadow: '0 0 8px rgba(255, 255, 255, 0.9)'
                        }}>
                            (...)
                        </div>
                    )}
                </div>

                {content.detail && (
                    <p style={{
                        fontSize: '0.875rem',
                        color: '#6B7280',
                        marginBottom: '1rem'
                    }}>
                        📍 {content.detail}
                    </p>
                )}

                {/* Message utilisateur - espace réservé fixe */}
                {fioretto.message_ajout && (
                    <div style={{
                        minHeight: '60px',
                        maxHeight: '80px',
                        overflow: 'hidden',
                        paddingTop: '1rem',
                        borderTop: '1px solid rgba(254, 243, 199, 0.6)'
                    }}>
                        <p style={{
                            fontSize: '0.95rem',
                            color: '#78350F',
                            fontStyle: 'italic',
                            lineHeight: '1.6',
                            margin: 0,
                            display: '-webkit-box',
                            WebkitLineClamp: 2,
                            WebkitBoxOrient: 'vertical',
                            overflow: 'hidden'
                        }}>
                            "{fioretto.message_ajout}"
                        </p>
                        <p style={{
                            fontSize: '0.75rem',
                            color: '#92400E',
                            marginTop: '0.5rem',
                            opacity: 0.7
                        }}>
                            — {fioretto.anonyme ? "Anonyme" : "Un frère/une sœur"}
                        </p>
                    </div>
                )}
            </div>

            {/* Footer - Actions */}
            <div style={{
                background: '#FFFBEB',
                padding: '1rem 1.5rem',
                borderTop: '1px solid #FEF3C7',
                display: 'flex',
                justifyContent: 'center',
                gap: '1.5rem'
            }}>
                {/* Bouton Prier */}
                <button
                    onClick={(e) => handleInteraction(e, 'soutien')}
                    style={{
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'center',
                        gap: '0.5rem',
                        padding: '0.75rem 1.25rem',
                        borderRadius: '0.75rem',
                        border: hasInteracted.soutien ? 'none' : '1px solid #E0E7FF',
                        background: hasInteracted.soutien ? '#6366F1' : 'white',
                        color: hasInteracted.soutien ? 'white' : '#6366F1',
                        cursor: 'pointer',
                        boxShadow: hasInteracted.soutien ? '0 4px 6px rgba(99, 102, 241, 0.2)' : '0 1px 2px rgba(0, 0, 0, 0.05)',
                        transition: 'all 0.2s',
                        fontWeight: '500'
                    }}
                    onMouseEnter={(e) => {
                        e.currentTarget.style.transform = 'translateY(-2px)';
                        if (hasInteracted.soutien) {
                            e.currentTarget.style.boxShadow = '0 6px 12px rgba(99, 102, 241, 0.3)';
                        } else {
                            e.currentTarget.style.background = '#EEF2FF';
                        }
                    }}
                    onMouseLeave={(e) => {
                        e.currentTarget.style.transform = 'translateY(0)';
                        if (hasInteracted.soutien) {
                            e.currentTarget.style.boxShadow = '0 4px 6px rgba(99, 102, 241, 0.2)';
                        } else {
                            e.currentTarget.style.background = 'white';
                        }
                    }}
                >
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                        <span style={{ fontSize: '1.25rem' }}>🙏</span>
                        <span style={{ fontSize: '0.875rem', fontWeight: '600' }}>Prier pour</span>
                    </div>
                    <span style={{ fontSize: '0.75rem', opacity: 0.9 }}>
                        {counts.soutien} {counts.soutien > 1 ? 'prières' : 'prière'}
                    </span>
                </button>

                {/* Bouton Rendre Grâce */}
                <button
                    onClick={(e) => handleInteraction(e, 'action_grace')}
                    style={{
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'center',
                        gap: '0.5rem',
                        padding: '0.75rem 1.25rem',
                        borderRadius: '0.75rem',
                        border: hasInteracted.grace ? 'none' : '1px solid #FEF3C7',
                        background: hasInteracted.grace ? '#FBBF24' : 'white',
                        color: hasInteracted.grace ? 'white' : '#D97706',
                        cursor: 'pointer',
                        boxShadow: hasInteracted.grace ? '0 4px 6px rgba(251, 191, 36, 0.2)' : '0 1px 2px rgba(0, 0, 0, 0.05)',
                        transition: 'all 0.2s',
                        fontWeight: '500'
                    }}
                    onMouseEnter={(e) => {
                        e.currentTarget.style.transform = 'translateY(-2px)';
                        if (hasInteracted.grace) {
                            e.currentTarget.style.boxShadow = '0 6px 12px rgba(251, 191, 36, 0.3)';
                        } else {
                            e.currentTarget.style.background = '#FFFBEB';
                        }
                    }}
                    onMouseLeave={(e) => {
                        e.currentTarget.style.transform = 'translateY(0)';
                        if (hasInteracted.grace) {
                            e.currentTarget.style.boxShadow = '0 4px 6px rgba(251, 191, 36, 0.2)';
                        } else {
                            e.currentTarget.style.background = 'white';
                        }
                    }}
                >
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                        <span style={{ fontSize: '1.25rem' }}>✨</span>
                        <span style={{ fontSize: '0.875rem', fontWeight: '600' }}>Rendre grâce</span>
                    </div>
                    <span style={{ fontSize: '0.75rem', opacity: 0.9 }}>
                        {counts.grace} {counts.grace > 1 ? 'grâces' : 'grâce'}
                    </span>
                </button>
            </div>
        </div>
    );
}
