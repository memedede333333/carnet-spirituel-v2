'use client';

import { useState } from 'react';
import { UserProfile } from '@/app/lib/auth-helpers';

interface ConfirmDeleteModalProps {
    user: UserProfile;
    confirmationCode: string;
    onCancel: () => void;
    onConfirm: () => Promise<void>;
}

export default function ConfirmDeleteModal({
    user,
    confirmationCode,
    onCancel,
    onConfirm
}: ConfirmDeleteModalProps) {
    const [userInput, setUserInput] = useState('');
    const [isDeleting, setIsDeleting] = useState(false);

    const handleConfirm = async () => {
        if (userInput.toUpperCase() !== confirmationCode.toUpperCase()) {
            alert('Code de confirmation incorrect');
            return;
        }

        setIsDeleting(true);
        try {
            await onConfirm();
        } finally {
            setIsDeleting(false);
        }
    };

    return (
        <div
            style={{
                position: 'fixed',
                inset: 0,
                background: 'rgba(0, 0, 0, 0.6)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                zIndex: 1001,
                padding: '1rem'
            }}
            onClick={onCancel}
        >
            <div
                style={{
                    background: 'white',
                    borderRadius: '1rem',
                    padding: '2rem',
                    maxWidth: '450px',
                    width: '100%',
                    boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.2)'
                }}
                onClick={(e) => e.stopPropagation()}
            >
                <div style={{ fontSize: '3rem', textAlign: 'center', marginBottom: '1rem' }}>🔴</div>
                <h2 style={{
                    fontSize: '1.5rem',
                    fontWeight: 'bold',
                    color: '#DC2626',
                    marginBottom: '1rem',
                    textAlign: 'center'
                }}>
                    Confirmation Finale
                </h2>

                <p style={{ marginBottom: '1rem', color: '#475569', textAlign: 'center' }}>
                    Pour confirmer la suppression de <strong>{user.prenom} {user.nom}</strong> ({user.email}),
                    recopiez exactement ce code de confirmation :
                </p>

                <div style={{
                    background: '#FEF2F2',
                    border: '3px dashed #DC2626',
                    borderRadius: '0.5rem',
                    padding: '1.5rem',
                    textAlign: 'center',
                    marginBottom: '1.5rem'
                }}>
                    <div style={{
                        fontSize: '2rem',
                        fontWeight: 'bold',
                        color: '#DC2626',
                        fontFamily: 'monospace',
                        letterSpacing: '0.1em'
                    }}>
                        {confirmationCode}
                    </div>
                </div>

                <input
                    type="text"
                    value={userInput}
                    onChange={(e) => setUserInput(e.target.value)}
                    placeholder="Tapez le code ici"
                    disabled={isDeleting}
                    style={{
                        width: '100%',
                        padding: '0.75rem',
                        border: '2px solid #E2E8F0',
                        borderRadius: '0.5rem',
                        fontSize: '1rem',
                        marginBottom: '1.5rem',
                        textAlign: 'center',
                        fontFamily: 'monospace',
                        textTransform: 'uppercase'
                    }}
                    onKeyDown={(e) => {
                        if (e.key === 'Enter' && !isDeleting) {
                            handleConfirm();
                        }
                    }}
                />

                <div style={{ display: 'flex', gap: '1rem', justifyContent: 'flex-end' }}>
                    <button
                        onClick={onCancel}
                        disabled={isDeleting}
                        style={{
                            padding: '0.75rem 1.5rem',
                            border: '2px solid #E2E8F0',
                            borderRadius: '0.5rem',
                            background: 'white',
                            color: '#475569',
                            fontWeight: '500',
                            cursor: isDeleting ? 'not-allowed' : 'pointer',
                            opacity: isDeleting ? 0.5 : 1
                        }}
                    >
                        Annuler
                    </button>
                    <button
                        onClick={handleConfirm}
                        disabled={isDeleting || !userInput}
                        style={{
                            padding: '0.75rem 1.5rem',
                            border: 'none',
                            borderRadius: '0.5rem',
                            background: isDeleting || !userInput ? '#CBD5E1' : '#DC2626',
                            color: 'white',
                            fontWeight: '600',
                            cursor: isDeleting || !userInput ? 'not-allowed' : 'pointer'
                        }}
                    >
                        {isDeleting ? 'Suppression...' : 'SUPPRIMER DÉFINITIVEMENT'}
                    </button>
                </div>
            </div>
        </div>
    );
}
