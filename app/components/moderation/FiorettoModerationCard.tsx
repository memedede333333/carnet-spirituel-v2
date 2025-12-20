'use client';

import { Fioretto } from '@/app/types';
import { Check, X, Eye, Edit } from 'lucide-react';
import ArchiveManager, { ArchivedBadge } from '@/app/components/ArchiveManager';

const TYPE_CONFIG: Record<string, { icon: string; label: string; bg: string; border: string; text: string }> = {
    grace: { icon: '✨', label: 'Grâce', bg: '#FFFBEB', border: '#FEF3C7', text: '#78350F' },
    priere: { icon: '🙏', label: 'Prière', bg: '#EFF6FF', border: '#DBEAFE', text: '#1E3A8A' },
    ecriture: { icon: '📖', label: 'Écriture', bg: '#ECFDF5', border: '#D1FAE5', text: '#065F46' },
    parole: { icon: '🕊️', label: 'Parole', bg: '#F0F9FF', border: '#E0F2FE', text: '#075985' },
    rencontre: { icon: '🤝', label: 'Rencontre', bg: '#FFF7ED', border: '#FED7AA', text: '#92400E' }
};

interface FiorettoModerationCardProps {
    fioretto: Fioretto;
    onApprove: () => void;
    onReject: () => void;
    onPreview: () => void;
    onEdit: () => void;
    onArchiveChange: () => void;
}

export default function FiorettoModerationCard({
    fioretto,
    onApprove,
    onReject,
    onPreview,
    onEdit,
    onArchiveChange
}: FiorettoModerationCardProps) {
    const config = TYPE_CONFIG[fioretto.element_type] || TYPE_CONFIG.grace;
    const content = typeof fioretto.contenu_affiche === 'string'
        ? JSON.parse(fioretto.contenu_affiche)
        : fioretto.contenu_affiche;

    return (
        <div style={{
            background: 'white',
            borderRadius: '1rem',
            boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)',
            border: '1px solid #E2E8F0',
            overflow: 'hidden',
            display: 'flex',
            flexDirection: 'column'
        }}>
            {/* Header */}
            <div style={{
                padding: '1.25rem',
                background: config.bg,
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
                    {fioretto.archived_at && <ArchivedBadge />}
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

                    {/* Ellipsis */}
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

            {/* Actions */}
            <div style={{
                padding: '1rem 1.25rem',
                background: '#F8FAFC',
                borderTop: '1px solid #E2E8F0',
                display: 'flex',
                gap: '0.75rem',
                flexWrap: 'wrap'
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

                {/* Actions selon statut */}
                {fioretto.statut === 'propose' ? (
                    <>
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
                                transition: 'all 0.2s',
                                flex: 1
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
                                transition: 'all 0.2s',
                                flex: 1
                            }}
                        >
                            <Check size={16} /> Valider
                        </button>
                    </>
                ) : (
                    <div style={{ marginLeft: 'auto' }}>
                        <ArchiveManager fioretto={fioretto} onArchiveChange={onArchiveChange} />
                    </div>
                )}
            </div>
        </div>
    );
}
