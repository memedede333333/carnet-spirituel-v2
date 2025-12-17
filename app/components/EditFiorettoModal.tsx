'use client';

import { useState } from 'react';
import { X, Save } from 'lucide-react';
import { Fioretto } from '@/app/types';

interface EditFiorettoModalProps {
    fioretto: Fioretto;
    onSave: (editedContent: string, moderatorMessage?: string) => void;
    onClose: () => void;
}

const TYPE_CONFIG: Record<string, { bg: string; border: string; text: string }> = {
    grace: { bg: '#FFFBEB', border: '#FEF3C7', text: '#78350F' },
    priere: { bg: '#EFF6FF', border: '#DBEAFE', text: '#1E3A8A' },
    ecriture: { bg: '#ECFDF5', border: '#D1FAE5', text: '#065F46' },
    parole: { bg: '#F0F9FF', border: '#E0F2FE', text: '#075985' },
    rencontre: { bg: '#FFF7ED', border: '#FED7AA', text: '#92400E' }
};

export default function EditFiorettoModal({ fioretto, onSave, onClose }: EditFiorettoModalProps) {
    const config = TYPE_CONFIG[fioretto.element_type] || TYPE_CONFIG.grace;
    const originalContent = typeof fioretto.contenu_affiche === 'string'
        ? JSON.parse(fioretto.contenu_affiche)
        : fioretto.contenu_affiche;

    const [editedText, setEditedText] = useState(originalContent.texte || originalContent.sujet || '');
    const [moderatorMessage, setModeratorMessage] = useState('');

    const handleSave = () => {
        if (!editedText.trim()) {
            alert('Le contenu ne peut pas être vide');
            return;
        }
        onSave(editedText, moderatorMessage || undefined);
    };

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
                    maxWidth: '700px',
                    width: '100%',
                    maxHeight: '90vh',
                    overflow: 'auto',
                    boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1)'
                }}
            >
                {/* Header */}
                <div style={{
                    padding: '1.5rem',
                    borderBottom: `3px solid ${config.border}`,
                    background: config.bg,
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center'
                }}>
                    <div>
                        <h3 style={{
                            fontSize: '1.25rem',
                            fontWeight: 'bold',
                            color: config.text,
                            marginBottom: '0.25rem'
                        }}>
                            ✏️ Modifier le fioretto
                        </h3>
                        <p style={{ fontSize: '0.875rem', color: '#64748B' }}>
                            Vous pouvez corriger ou améliorer le contenu avant approbation
                        </p>
                    </div>
                    <button
                        onClick={onClose}
                        style={{
                            background: 'transparent',
                            border: 'none',
                            cursor: 'pointer',
                            color: config.text,
                            padding: '0.5rem'
                        }}
                    >
                        <X size={24} />
                    </button>
                </div>

                {/* Content */}
                <div style={{ padding: '1.5rem' }}>
                    {/* Édition du texte */}
                    <div style={{ marginBottom: '1.5rem' }}>
                        <label style={{
                            display: 'block',
                            fontSize: '0.875rem',
                            fontWeight: '600',
                            color: config.text,
                            marginBottom: '0.5rem'
                        }}>
                            Contenu du fioretto
                        </label>
                        <textarea
                            value={editedText}
                            onChange={(e) => setEditedText(e.target.value)}
                            style={{
                                width: '100%',
                                minHeight: '200px',
                                padding: '1rem',
                                border: `2px solid ${config.border}`,
                                borderRadius: '0.5rem',
                                fontSize: '1rem',
                                lineHeight: '1.6',
                                fontFamily: 'inherit',
                                resize: 'vertical',
                                background: config.bg
                            }}
                        />
                    </div>

                    {/* Message au contributeur */}
                    <div style={{ marginBottom: '1.5rem' }}>
                        <label style={{
                            display: 'block',
                            fontSize: '0.875rem',
                            fontWeight: '600',
                            color: config.text,
                            marginBottom: '0.5rem'
                        }}>
                            Message privé au contributeur (optionnel)
                        </label>
                        <textarea
                            value={moderatorMessage}
                            onChange={(e) => setModeratorMessage(e.target.value)}
                            placeholder="Ex: Merci pour ce beau témoignage ! J'ai corrigé quelques fautes d'orthographe."
                            style={{
                                width: '100%',
                                minHeight: '100px',
                                padding: '1rem',
                                border: '2px solid #E2E8F0',
                                borderRadius: '0.5rem',
                                fontSize: '0.875rem',
                                lineHeight: '1.5',
                                fontFamily: 'inherit',
                                resize: 'vertical',
                                background: '#F8FAFC'
                            }}
                        />
                        <p style={{
                            fontSize: '0.75rem',
                            color: '#64748B',
                            marginTop: '0.5rem',
                            fontStyle: 'italic'
                        }}>
                            💡 Ce message sera visible uniquement par l'auteur dans ses notifications
                        </p>
                    </div>

                    {/* Actions */}
                    <div style={{
                        display: 'flex',
                        gap: '1rem',
                        justifyContent: 'flex-end'
                    }}>
                        <button
                            onClick={onClose}
                            style={{
                                padding: '0.75rem 1.5rem',
                                background: 'white',
                                color: '#64748B',
                                border: '2px solid #E2E8F0',
                                borderRadius: '0.5rem',
                                fontWeight: '500',
                                cursor: 'pointer',
                                transition: 'all 0.2s'
                            }}
                        >
                            Annuler
                        </button>
                        <button
                            onClick={handleSave}
                            style={{
                                padding: '0.75rem 1.5rem',
                                background: '#10B981',
                                color: 'white',
                                border: 'none',
                                borderRadius: '0.5rem',
                                fontWeight: '600',
                                cursor: 'pointer',
                                boxShadow: '0 2px 4px rgba(16, 185, 129, 0.3)',
                                transition: 'all 0.2s',
                                display: 'flex',
                                alignItems: 'center',
                                gap: '0.5rem'
                            }}
                        >
                            <Save size={18} />
                            Enregistrer et Approuver
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}
