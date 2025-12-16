'use client';

import { useState } from 'react';
import { supabase } from '@/app/lib/supabase';
import { Heart, Sun } from 'lucide-react';
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

    const handleInteraction = async (type: 'soutien' | 'action_grace') => {
        const key = type === 'soutien' ? 'soutien' : 'grace';
        if (hasInteracted[key]) return;

        setCounts(prev => ({
            ...prev,
            [key]: prev[key] + 1
        }));
        setHasInteracted(prev => ({
            ...prev,
            [key]: true
        }));

        try {
            const { data: { user } } = await supabase.auth.getUser();
            if (!user) return;

            await supabase.from('fioretti_interactions').insert({
                fioretto_id: fioretto.id,
                user_id: user.id,
                type_interaction: type
            });
        } catch (err) {
            console.error('Interaction error:', err);
        }
    };

    return (
        <div style={{
            background: 'white',
            borderRadius: '1rem',
            boxShadow: '0 4px 6px rgba(0, 0, 0, 0.05)',
            overflow: 'hidden',
            border: '1px solid #F3F4F6'
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
                        fontStyle: 'italic'
                    }}>
                        « {content.texte || "..."} »
                    </p>
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

                {fioretto.message_ajout && (
                    <div style={{
                        marginTop: '1rem',
                        paddingTop: '1rem',
                        borderTop: '1px solid #FEF3C7'
                    }}>
                        <p style={{
                            fontSize: '0.95rem',
                            color: '#78350F',
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
                    onClick={() => handleInteraction('soutien')}
                    disabled={hasInteracted.soutien}
                    style={{
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'center',
                        gap: '0.5rem',
                        padding: '0.75rem 1.25rem',
                        borderRadius: '0.75rem',
                        border: 'none',
                        background: hasInteracted.soutien ? '#EDE9FE' : '#6366F1',
                        color: hasInteracted.soutien ? '#A78BFA' : 'white',
                        cursor: hasInteracted.soutien ? 'default' : 'pointer',
                        boxShadow: hasInteracted.soutien ? 'none' : '0 2px 4px rgba(99, 102, 241, 0.3)',
                        transition: 'all 0.2s',
                        fontWeight: '500'
                    }}
                    onMouseEnter={(e) => {
                        if (!hasInteracted.soutien) {
                            e.currentTarget.style.transform = 'translateY(-2px)';
                            e.currentTarget.style.boxShadow = '0 4px 8px rgba(99, 102, 241, 0.4)';
                        }
                    }}
                    onMouseLeave={(e) => {
                        if (!hasInteracted.soutien) {
                            e.currentTarget.style.transform = 'translateY(0)';
                            e.currentTarget.style.boxShadow = '0 2px 4px rgba(99, 102, 241, 0.3)';
                        }
                    }}
                >
                    <Heart size={20} />
                    <span style={{ fontSize: '0.75rem' }}>
                        {counts.soutien} {counts.soutien > 1 ? 'prières' : 'prière'}
                    </span>
                </button>

                {/* Bouton Rendre Grâce */}
                <button
                    onClick={() => handleInteraction('action_grace')}
                    disabled={hasInteracted.grace}
                    style={{
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'center',
                        gap: '0.5rem',
                        padding: '0.75rem 1.25rem',
                        borderRadius: '0.75rem',
                        border: 'none',
                        background: hasInteracted.grace ? '#FEF3C7' : '#FBBF24',
                        color: hasInteracted.grace ? '#FCD34D' : 'white',
                        cursor: hasInteracted.grace ? 'default' : 'pointer',
                        boxShadow: hasInteracted.grace ? 'none' : '0 2px 4px rgba(251, 191, 36, 0.3)',
                        transition: 'all 0.2s',
                        fontWeight: '500'
                    }}
                    onMouseEnter={(e) => {
                        if (!hasInteracted.grace) {
                            e.currentTarget.style.transform = 'translateY(-2px)';
                            e.currentTarget.style.boxShadow = '0 4px 8px rgba(251, 191, 36, 0.4)';
                        }
                    }}
                    onMouseLeave={(e) => {
                        if (!hasInteracted.grace) {
                            e.currentTarget.style.transform = 'translateY(0)';
                            e.currentTarget.style.boxShadow = '0 2px 4px rgba(251, 191, 36, 0.3)';
                        }
                    }}
                >
                    <Sun size={20} />
                    <span style={{ fontSize: '0.75rem' }}>
                        {counts.grace} {counts.grace > 1 ? 'grâces' : 'grâce'}
                    </span>
                </button>
            </div>
        </div>
    );
}
