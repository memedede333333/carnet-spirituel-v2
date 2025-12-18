'use client';

import { useState, useEffect } from 'react';
import { supabase } from '@/app/lib/supabase';
import { X, CheckCircle2, Clock, XCircle, MessageSquare } from 'lucide-react';
import Link from 'next/link';

interface FiorettoStatus {
    id: string;
    statut: 'propose' | 'approuve' | 'refuse';
    date_publication?: string;
    message_moderateur?: string;
    created_at: string;
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

interface Props {
    elementType: 'grace' | 'priere' | 'ecriture' | 'parole' | 'rencontre';
    elementId: string;
}

export default function FiorettoStatusBadge({ elementType, elementId }: Props) {
    const [fioretto, setFioretto] = useState<FiorettoStatus | null>(null);
    const [loading, setLoading] = useState(true);
    const [showModal, setShowModal] = useState(false);

    useEffect(() => {
        checkFiorettoStatus();
    }, [elementType, elementId]);

    const checkFiorettoStatus = async () => {
        try {
            const { data: { user } } = await supabase.auth.getUser();
            if (!user) return;

            const { data, error } = await supabase
                .from('fioretti')
                .select('id, statut, date_publication, message_moderateur, created_at')
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

    if (loading || !fioretto) return null;

    const config = STATUT_CONFIG[fioretto.statut];
    const Icon = config.icon;

    return (
        <>
            {/* Badge discret */}
            <button
                onClick={() => setShowModal(true)}
                style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '0.5rem',
                    padding: '0.75rem 1rem',
                    marginTop: '1.5rem',
                    background: 'white',
                    border: '2px solid #FEF3C7',
                    borderRadius: '0.75rem',
                    color: '#92400E',
                    fontSize: '0.875rem',
                    cursor: 'pointer',
                    transition: 'all 0.2s',
                    textDecoration: 'none',
                    fontWeight: '500'
                }}
                onMouseEnter={(e) => {
                    e.currentTarget.style.background = '#FFFBEB';
                    e.currentTarget.style.borderColor = '#F59E0B';
                }}
                onMouseLeave={(e) => {
                    e.currentTarget.style.background = 'white';
                    e.currentTarget.style.borderColor = '#FEF3C7';
                }}
            >
                <span style={{ fontSize: '1rem' }}>🌸</span>
                <span>Partagé en fioretto</span>
                <span style={{ opacity: 0.6 }}>→</span>
            </button>

            {/* Modale */}
            {showModal && (
                <div
                    onClick={() => setShowModal(false)}
                    style={{
                        position: 'fixed',
                        inset: 0,
                        background: 'rgba(0, 0, 0, 0.5)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        zIndex: 1000,
                        padding: '1rem',
                        backdropFilter: 'blur(4px)'
                    }}
                >
                    <div
                        onClick={(e) => e.stopPropagation()}
                        className="fade-in"
                        style={{
                            background: 'white',
                            borderRadius: '1rem',
                            maxWidth: '500px',
                            width: '100%',
                            boxShadow: '0 20px 40px rgba(0, 0, 0, 0.2)',
                            border: '3px solid #FEF3C7',
                            overflow: 'hidden'
                        }}
                    >
                        {/* Header */}
                        <div style={{
                            padding: '1.5rem',
                            borderBottom: '2px solid #FEF3C7',
                            display: 'flex',
                            justifyContent: 'space-between',
                            alignItems: 'center'
                        }}>
                            <h3 style={{
                                fontSize: '1.25rem',
                                fontWeight: '600',
                                color: '#78350F',
                                fontFamily: 'Crimson Text, Georgia, serif'
                            }}>
                                Statut du partage
                            </h3>
                            <button
                                onClick={() => setShowModal(false)}
                                style={{
                                    width: '2rem',
                                    height: '2rem',
                                    borderRadius: '50%',
                                    border: '2px solid #FEF3C7',
                                    background: 'white',
                                    cursor: 'pointer',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    color: '#78350F',
                                    transition: 'all 0.2s'
                                }}
                                onMouseEnter={(e) => {
                                    e.currentTarget.style.background = '#FFFBEB';
                                }}
                                onMouseLeave={(e) => {
                                    e.currentTarget.style.background = 'white';
                                }}
                            >
                                <X size={16} />
                            </button>
                        </div>

                        {/* Content */}
                        <div style={{ padding: '1.5rem' }}>
                            {/* Badge statut */}
                            <div style={{
                                display: 'flex',
                                alignItems: 'center',
                                gap: '0.75rem',
                                padding: '1rem',
                                background: config.bg,
                                borderRadius: '0.75rem',
                                border: `2px solid ${config.color}40`,
                                marginBottom: '1.5rem'
                            }}>
                                <Icon size={24} color={config.color} />
                                <div>
                                    <p style={{
                                        fontWeight: '600',
                                        color: config.color,
                                        marginBottom: '0.25rem'
                                    }}>
                                        {config.label}
                                    </p>
                                    <p style={{
                                        fontSize: '0.75rem',
                                        color: '#6B7280'
                                    }}>
                                        {fioretto.statut === 'approuve' && fioretto.date_publication
                                            ? `Publié le ${new Date(fioretto.date_publication).toLocaleDateString('fr-FR')}`
                                            : `Partagé le ${new Date(fioretto.created_at).toLocaleDateString('fr-FR')}`
                                        }
                                    </p>
                                </div>
                            </div>

                            {/* Message modérateur */}
                            {fioretto.message_moderateur && (
                                <div style={{
                                    padding: '1rem',
                                    background: '#EFF6FF',
                                    borderLeft: '4px solid #3B82F6',
                                    borderRadius: '0.5rem',
                                    marginBottom: '1.5rem'
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

                            {/* Actions */}
                            <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap' }}>
                                {fioretto.statut === 'approuve' && (
                                    <Link
                                        href="/fioretti"
                                        style={{
                                            flex: 1,
                                            display: 'inline-flex',
                                            alignItems: 'center',
                                            justifyContent: 'center',
                                            gap: '0.5rem',
                                            padding: '0.75rem 1.5rem',
                                            background: '#F59E0B',
                                            color: 'white',
                                            borderRadius: '0.75rem',
                                            textDecoration: 'none',
                                            fontWeight: '500',
                                            fontSize: '0.875rem',
                                            transition: 'all 0.2s',
                                            border: 'none'
                                        }}
                                        onMouseEnter={(e) => {
                                            e.currentTarget.style.background = '#D97706';
                                            e.currentTarget.style.transform = 'translateY(-2px)';
                                        }}
                                        onMouseLeave={(e) => {
                                            e.currentTarget.style.background = '#F59E0B';
                                            e.currentTarget.style.transform = 'translateY(0)';
                                        }}
                                    >
                                        <span>Voir dans la communauté</span>
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
                                        padding: '0.75rem 1.5rem',
                                        background: 'white',
                                        color: '#78350F',
                                        border: '2px solid #FEF3C7',
                                        borderRadius: '0.75rem',
                                        textDecoration: 'none',
                                        fontWeight: '500',
                                        fontSize: '0.875rem',
                                        transition: 'all 0.2s'
                                    }}
                                    onMouseEnter={(e) => {
                                        e.currentTarget.style.background = '#FFFBEB';
                                        e.currentTarget.style.borderColor = '#F59E0B';
                                    }}
                                    onMouseLeave={(e) => {
                                        e.currentTarget.style.background = 'white';
                                        e.currentTarget.style.borderColor = '#FEF3C7';
                                    }}
                                >
                                    <span>Mes fioretti</span>
                                </Link>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </>
    );
}
