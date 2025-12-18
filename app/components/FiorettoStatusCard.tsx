'use client';

import { useState, useEffect } from 'react';
import { supabase } from '@/app/lib/supabase';
import { Share2, CheckCircle2, Clock, XCircle, Eye } from 'lucide-react';
import Link from 'next/link';
import ShareFiorettoModal from './ShareFiorettoModal';

interface Props {
    elementType: 'grace' | 'priere' | 'ecriture' | 'parole' | 'rencontre';
    elementId: string;
    element: any;
    formattedContent: string;
}

const STATUT_CONFIG = {
    propose: {
        label: 'En attente de modération',
        icon: Clock,
        color: '#F59E0B',
        bg: '#FEF3C7'
    },
    approuve: {
        label: 'Publié dans la communauté',
        icon: CheckCircle2,
        color: '#10B981',
        bg: '#D1FAE5'
    },
    refuse: {
        label: 'Non retenu',
        icon: XCircle,
        color: '#EF4444',
        bg: '#FEE2E2'
    }
};

export default function FiorettoStatusCard({ elementType, elementId, element, formattedContent }: Props) {
    const [fioretto, setFioretto] = useState<any | null>(null);
    const [loading, setLoading] = useState(true);
    const [showShareModal, setShowShareModal] = useState(false);

    useEffect(() => {
        checkFiorettoStatus();
    }, [elementType, elementId]);

    const checkFiorettoStatus = async () => {
        try {
            const { data: { user } } = await supabase.auth.getUser();
            if (!user) {
                setLoading(false);
                return;
            }

            const { data, error } = await supabase
                .from('fioretti')
                .select('*')
                .eq('user_id', user.id)
                .eq('element_type', elementType)
                .eq('element_id', elementId)
                .order('created_at', { ascending: false })
                .limit(1)
                .maybeSingle();

            if (error) throw error;
            setFioretto(data);
        } catch (err) {
            console.error('Erreur vérification fioretto:', err);
        } finally {
            setLoading(false);
        }
    };

    if (loading) return null;

    // Cas 1 : Jamais partagé - Bouton original avec fleur
    if (!fioretto) {
        return (
            <>
                <div style={{
                    marginTop: '2rem',
                    display: 'flex',
                    justifyContent: 'center'
                }}>
                    <button
                        onClick={() => setShowShareModal(true)}
                        style={{
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: '0.75rem',
                            padding: '1rem 2rem',
                            background: 'linear-gradient(135deg, #FEF3C7, #FDE68A)',
                            color: '#78350F',
                            border: '2px solid #F59E0B',
                            borderRadius: '9999px',
                            fontSize: '1rem',
                            fontWeight: '600',
                            cursor: 'pointer',
                            transition: 'all 0.2s',
                            boxShadow: '0 4px 6px rgba(0, 0, 0, 0.05)'
                        }}
                        onMouseEnter={(e) => {
                            e.currentTarget.style.background = 'linear-gradient(135deg, #FDE68A, #FCD34D)';
                            e.currentTarget.style.transform = 'translateY(-2px)';
                            e.currentTarget.style.boxShadow = '0 6px 12px rgba(245, 158, 11, 0.2)';
                        }}
                        onMouseLeave={(e) => {
                            e.currentTarget.style.background = 'linear-gradient(135deg, #FEF3C7, #FDE68A)';
                            e.currentTarget.style.transform = 'translateY(0)';
                            e.currentTarget.style.boxShadow = '0 4px 6px rgba(0, 0, 0, 0.05)';
                        }}
                    >
                        <span style={{ fontSize: '1.5rem' }}>🌸</span>
                        <span>Partager ce fioretto</span>
                    </button>
                </div>

                {showShareModal && (
                    <ShareFiorettoModal
                        element={element}
                        elementType={elementType}
                        formattedContent={formattedContent}
                        onClose={() => {
                            setShowShareModal(false);
                            checkFiorettoStatus();
                        }}
                    />
                )}
            </>
        );
    }

    // Cas 2 : Déjà partagé - carte métadonnée intégrée
    const config = STATUT_CONFIG[fioretto.statut as keyof typeof STATUT_CONFIG];
    const Icon = config.icon;

    return (
        <div style={{
            background: config.bg,
            borderRadius: '0.75rem',
            padding: '1rem',
            border: `2px solid ${config.color}40`,
            maxWidth: '400px',
            margin: '2rem auto 0',
        }}>
            <div style={{
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem',
                marginBottom: '0.75rem',
                color: config.color
            }}>
                <span style={{ fontSize: '1.2rem' }}>🌸</span>
                <span style={{
                    fontWeight: '600',
                    fontSize: '0.875rem',
                    textTransform: 'uppercase',
                    letterSpacing: '0.05em'
                }}>
                    Fioretto
                </span>
            </div>

            <div style={{
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem',
                marginBottom: '0.5rem'
            }}>
                <Icon size={20} color={config.color} />
                <span style={{
                    fontSize: '1rem',
                    fontWeight: '600',
                    color: config.color
                }}>
                    {config.label}
                </span>
            </div>

            {fioretto.message_moderateur && (
                <p style={{
                    fontSize: '0.875rem',
                    color: '#6B7280',
                    fontStyle: 'italic',
                    marginBottom: '0.75rem',
                    paddingLeft: '0.5rem',
                    borderLeft: `3px solid ${config.color}`
                }}>
                    "{fioretto.message_moderateur}"
                </p>
            )}

            <div style={{
                display: 'flex',
                gap: '0.5rem',
                marginTop: '1rem'
            }}>
                {fioretto.statut === 'approuve' && (
                    <Link
                        href="/fioretti"
                        style={{
                            flex: 1,
                            display: 'inline-flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            gap: '0.5rem',
                            padding: '0.625rem 1rem',
                            background: config.color,
                            color: 'white',
                            borderRadius: '0.5rem',
                            textDecoration: 'none',
                            fontSize: '0.75rem',
                            fontWeight: '500',
                            transition: 'all 0.2s'
                        }}
                        onMouseEnter={(e) => {
                            e.currentTarget.style.opacity = '0.9';
                            e.currentTarget.style.transform = 'translateY(-2px)';
                        }}
                        onMouseLeave={(e) => {
                            e.currentTarget.style.opacity = '1';
                            e.currentTarget.style.transform = 'translateY(0)';
                        }}
                    >
                        <Eye size={14} />
                        <span>Voir</span>
                    </Link>
                )}
                <Link
                    href="/mes-fioretti"
                    style={{
                        flex: 1,
                        display: 'inline-flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        gap: '0.5rem',
                        padding: '0.625rem 1rem',
                        background: 'white',
                        color: config.color,
                        border: `2px solid ${config.color}`,
                        borderRadius: '0.5rem',
                        textDecoration: 'none',
                        fontSize: '0.75rem',
                        fontWeight: '500',
                        transition: 'all 0.2s'
                    }}
                    onMouseEnter={(e) => {
                        e.currentTarget.style.background = `${config.color}10`;
                    }}
                    onMouseLeave={(e) => {
                        e.currentTarget.style.background = 'white';
                    }}
                >
                    <span>Détails</span>
                </Link>
            </div>
        </div>
    );
}
