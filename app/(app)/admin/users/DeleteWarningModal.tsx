'use client';

import { UserProfile } from '@/app/lib/auth-helpers';

interface DeleteWarningModalProps {
    user: UserProfile;
    onCancel: () => void;
    onContinue: () => void;
}

export default function DeleteWarningModal({ user, onCancel, onContinue }: DeleteWarningModalProps) {
    return (
        <div
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
            onClick={onCancel}
        >
            <div
                style={{
                    background: 'white',
                    borderRadius: '1rem',
                    padding: '2rem',
                    maxWidth: '500px',
                    width: '100%',
                    boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1)'
                }}
                onClick={(e) => e.stopPropagation()}
            >
                <div style={{ fontSize: '3rem', textAlign: 'center', marginBottom: '1rem' }}>⚠️</div>
                <h2 style={{
                    fontSize: '1.5rem',
                    fontWeight: 'bold',
                    color: '#DC2626',
                    marginBottom: '1rem',
                    textAlign: 'center'
                }}>
                    ATTENTION : Suppression de compte
                </h2>

                <div style={{
                    background: '#FEF2F2',
                    border: '2px solid #FEE2E2',
                    borderRadius: '0.5rem',
                    padding: '1rem',
                    marginBottom: '1.5rem'
                }}>
                    <p style={{ marginBottom: '0.5rem' }}>
                        Vous êtes sur le point de supprimer le compte de :
                    </p>
                    <p style={{ fontWeight: 'bold', fontSize: '1.125rem', color: '#1E293B' }}>
                        👤 {user.prenom} {user.nom} ({user.email})
                    </p>
                </div>

                <div style={{
                    background: '#FFFBEB',
                    border: '1px solid #FCD34D',
                    borderRadius: '0.5rem',
                    padding: '1rem',
                    marginBottom: '1.5rem'
                }}>
                    <p style={{ fontWeight: '600', marginBottom: '0.5rem', color: '#92400E' }}>
                        Cette action est IRRÉVERSIBLE et supprimera :
                    </p>
                    <ul style={{ listStyle: 'none', padding: 0, margin: 0, color: '#78350F' }}>
                        <li>• Le profil utilisateur</li>
                        <li>• Toutes ses grâces reçues</li>
                        <li>• Toutes ses prières</li>
                        <li>• Tous ses Fioretti partagés</li>
                        <li>• Son historique de sécurité</li>
                    </ul>
                </div>

                <div style={{ display: 'flex', gap: '1rem', justifyContent: 'flex-end' }}>
                    <button
                        onClick={onCancel}
                        style={{
                            padding: '0.75rem 1.5rem',
                            border: '2px solid #E2E8F0',
                            borderRadius: '0.5rem',
                            background: 'white',
                            color: '#475569',
                            fontWeight: '500',
                            cursor: 'pointer'
                        }}
                    >
                        Annuler
                    </button>
                    <button
                        onClick={onContinue}
                        style={{
                            padding: '0.75rem 1.5rem',
                            border: 'none',
                            borderRadius: '0.5rem',
                            background: '#F59E0B',
                            color: 'white',
                            fontWeight: '600',
                            cursor: 'pointer'
                        }}
                    >
                        Continuer →
                    </button>
                </div>
            </div>
        </div>
    );
}
