'use client';

import { Fioretto } from '@/app/types';
import { formatFiorettoContent } from '@/app/lib/fioretti-helpers';

const TYPE_CONFIG: Record<string, { icon: string; label: string; bg: string; border: string; text: string }> = {
    grace: { icon: '✨', label: 'Grâce', bg: '#FFFBEB', border: '#FEF3C7', text: '#78350F' },
    priere: { icon: '🙏', label: 'Prière', bg: '#EFF6FF', border: '#DBEAFE', text: '#1E3A8A' },
    ecriture: { icon: '📖', label: 'Écriture', bg: '#ECFDF5', border: '#D1FAE5', text: '#065F46' },
    parole: { icon: '🕊️', label: 'Parole', bg: '#F0F9FF', border: '#E0F2FE', text: '#075985' },
    rencontre: { icon: '🤝', label: 'Rencontre', bg: '#FFF7ED', border: '#FED7AA', text: '#92400E' }
};

interface PreviewModalProps {
    fioretto: Fioretto;
    onClose: () => void;
}

export default function PreviewModal({ fioretto, onClose }: PreviewModalProps) {
    const config = TYPE_CONFIG[fioretto.element_type] || TYPE_CONFIG.grace;
    const content = typeof fioretto.contenu_affiche === 'string'
        ? JSON.parse(fioretto.contenu_affiche)
        : fioretto.contenu_affiche;

    const formatted = formatFiorettoContent(fioretto.element_type, content);

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
                zIndex: 50,
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
                    boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.3)'
                }}
            >
                {/* Header */}
                <div style={{
                    background: config.bg,
                    padding: '1.5rem',
                    borderBottom: `2px solid ${config.border}`,
                    position: 'sticky',
                    top: 0,
                    zIndex: 10
                }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.5rem' }}>
                        <span style={{ fontSize: '1.5rem' }}>{config.icon}</span>
                        <h2 style={{
                            fontWeight: '700',
                            fontSize: '1.25rem',
                            color: config.text,
                            margin: 0
                        }}>
                            {config.label}
                        </h2>
                    </div>
                    <p style={{
                        fontSize: '0.875rem',
                        color: '#64748B',
                        fontStyle: 'italic',
                        margin: 0
                    }}>
                        Prévisualisation complète
                    </p>
                </div>

                {/* Content */}
                <div style={{ padding: '2rem' }}>
                    <div style={{
                        background: '#FFFEF7',
                        border: '2px solid #FEF3C7',
                        borderRadius: '0.75rem',
                        padding: '1.5rem',
                        marginBottom: '1.5rem'
                    }}>
                        <p style={{
                            fontSize: '1.125rem',
                            lineHeight: '1.7',
                            color: '#1F2937',
                            fontStyle: 'italic',
                            whiteSpace: 'pre-wrap',
                            margin: 0
                        }}>
                            « {formatted.mainText} »
                        </p>
                    </div>

                    {fioretto.message_ajout && (
                        <div style={{
                            paddingTop: '1rem',
                            marginTop: '1rem',
                            borderTop: '1px solid #F1F5F9',
                            marginBottom: '1.5rem'
                        }}>
                            <p style={{
                                fontSize: '0.875rem',
                                color: config.text,
                                fontStyle: 'italic',
                                lineHeight: '1.5',
                                margin: 0
                            }}>
                                Message de partage : "{fioretto.message_ajout}"
                            </p>
                        </div>
                    )}

                    {/* Metadata */}
                    {formatted.metadata.length > 0 && (
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                            {formatted.metadata.map((meta, idx) => (
                                <div key={idx} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                    <span>{meta.icon}</span>
                                    <span style={{ fontSize: '0.875rem', color: '#64748B', fontWeight: '600' }}>
                                        {meta.label}:
                                    </span>
                                    <span style={{ fontSize: '0.875rem', color: '#1F2937' }}>
                                        {meta.value}
                                    </span>
                                </div>
                            ))}
                        </div>
                    )}
                </div>

                {/* Footer */}
                <div style={{
                    padding: '1rem 2rem',
                    borderTop: '1px solid #E2E8F0',
                    display: 'flex',
                    justifyContent: 'flex-end'
                }}>
                    <button
                        onClick={onClose}
                        style={{
                            padding: '0.5rem 1.5rem',
                            background: config.bg,
                            color: config.text,
                            border: `2px solid ${config.border}`,
                            borderRadius: '0.5rem',
                            fontWeight: '600',
                            cursor: 'pointer',
                            fontSize: '0.875rem'
                        }}
                    >
                        Fermer
                    </button>
                </div>
            </div>
        </div>
    );
}
