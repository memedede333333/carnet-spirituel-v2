'use client';

import { useState } from 'react';
import { ChevronDown, Check, AlertCircle } from 'lucide-react';
import { UserProfile, updateUserRole, UserRole } from '@/app/lib/auth-helpers';

interface UserRoleManagerProps {
    user: UserProfile;
    onRoleUpdated: () => void;
}

export default function UserRoleManager({ user, onRoleUpdated }: UserRoleManagerProps) {
    const [isOpen, setIsOpen] = useState(false);
    const [isUpdating, setIsUpdating] = useState(false);
    const [showConfirmModal, setShowConfirmModal] = useState(false);
    const [selectedRole, setSelectedRole] = useState<UserRole | null>(null);

    const roles: { value: UserRole; label: string; emoji: string; description: string }[] = [
        {
            value: 'user',
            label: 'Utilisateur',
            emoji: '👤',
            description: 'Accès standard aux fonctionnalités'
        },
        {
            value: 'moderateur',
            label: 'Modérateur',
            emoji: '🛡️',
            description: 'Peut modérer les fioretti'
        },
        {
            value: 'superadmin',
            label: 'Administrateur',
            emoji: '👑',
            description: 'Accès complet (modération + gestion users)'
        }
    ];

    const handleRoleClick = (role: UserRole) => {
        if (role === user.role) {
            setIsOpen(false);
            return;
        }
        setSelectedRole(role);
        setShowConfirmModal(true);
        setIsOpen(false);
    };

    const confirmRoleChange = async () => {
        if (!selectedRole) return;

        setIsUpdating(true);
        try {
            const success = await updateUserRole(user.id, selectedRole);
            if (success) {
                onRoleUpdated();
                setShowConfirmModal(false);
                setSelectedRole(null);
            } else {
                alert('Erreur lors de la mise à jour du rôle. Il s\'agit peut-être du dernier superadmin.');
            }
        } catch (error) {
            console.error('Error updating role:', error);
            alert('Erreur lors de la mise à jour du rôle');
        } finally {
            setIsUpdating(false);
        }
    };

    const currentRole = roles.find(r => r.value === user.role) || roles[0];

    return (
        <>
            {/* Dropdown */}
            <div style={{ position: 'relative' }}>
                <button
                    onClick={() => setIsOpen(!isOpen)}
                    disabled={isUpdating}
                    style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '0.5rem',
                        padding: '0.5rem 0.75rem',
                        background: 'white',
                        border: '2px solid #E2E8F0',
                        borderRadius: '0.5rem',
                        cursor: isUpdating ? 'not-allowed' : 'pointer',
                        fontSize: '0.875rem',
                        color: '#475569',
                        fontWeight: '500',
                        transition: 'all 0.2s',
                        opacity: isUpdating ? 0.6 : 1
                    }}
                    onMouseEnter={(e) => {
                        if (!isUpdating) {
                            e.currentTarget.style.borderColor = '#3B82F6';
                            e.currentTarget.style.background = '#F8FAFC';
                        }
                    }}
                    onMouseLeave={(e) => {
                        e.currentTarget.style.borderColor = '#E2E8F0';
                        e.currentTarget.style.background = 'white';
                    }}
                >
                    {isUpdating ? 'Mise à jour...' : 'Modifier'}
                    <ChevronDown size={16} />
                </button>

                {/* Dropdown Menu */}
                {isOpen && (
                    <>
                        {/* Backdrop */}
                        <div
                            onClick={() => setIsOpen(false)}
                            style={{
                                position: 'fixed',
                                inset: 0,
                                zIndex: 10
                            }}
                        />

                        <div style={{
                            position: 'absolute',
                            top: 'calc(100% + 0.5rem)',
                            right: 0,
                            minWidth: '280px',
                            background: 'white',
                            borderRadius: '0.75rem',
                            boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)',
                            border: '1px solid #E2E8F0',
                            zIndex: 20,
                            overflow: 'hidden'
                        }}>
                            {roles.map((role) => (
                                <button
                                    key={role.value}
                                    onClick={() => handleRoleClick(role.value)}
                                    style={{
                                        width: '100%',
                                        display: 'flex',
                                        alignItems: 'flex-start',
                                        gap: '0.75rem',
                                        padding: '0.875rem 1rem',
                                        border: 'none',
                                        background: user.role === role.value ? '#F8FAFC' : 'white',
                                        cursor: 'pointer',
                                        textAlign: 'left',
                                        borderBottom: '1px solid #F1F5F9',
                                        transition: 'background 0.2s'
                                    }}
                                    onMouseEnter={(e) => e.currentTarget.style.background = '#F8FAFC'}
                                    onMouseLeave={(e) => {
                                        e.currentTarget.style.background = user.role === role.value ? '#F8FAFC' : 'white';
                                    }}
                                >
                                    <span style={{ fontSize: '1.25rem' }}>{role.emoji}</span>
                                    <div style={{ flex: 1 }}>
                                        <div style={{
                                            display: 'flex',
                                            alignItems: 'center',
                                            gap: '0.5rem',
                                            marginBottom: '0.25rem'
                                        }}>
                                            <span style={{
                                                fontWeight: '600',
                                                fontSize: '0.875rem',
                                                color: '#1E293B'
                                            }}>
                                                {role.label}
                                            </span>
                                            {user.role === role.value && (
                                                <Check size={16} color="#10B981" />
                                            )}
                                        </div>
                                        <p style={{
                                            fontSize: '0.75rem',
                                            color: '#64748B',
                                            margin: 0
                                        }}>
                                            {role.description}
                                        </p>
                                    </div>
                                </button>
                            ))}
                        </div>
                    </>
                )}
            </div>

            {/* Confirmation Modal */}
            {showConfirmModal && selectedRole && (
                <div
                    onClick={() => !isUpdating && setShowConfirmModal(false)}
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
                            maxWidth: '450px',
                            width: '100%',
                            boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1)'
                        }}
                    >
                        <div style={{
                            padding: '1.5rem',
                            borderBottom: '1px solid #F1F5F9'
                        }}>
                            <div style={{
                                display: 'flex',
                                alignItems: 'center',
                                gap: '0.75rem',
                                marginBottom: '0.5rem'
                            }}>
                                <AlertCircle size={24} color="#F59E0B" />
                                <h3 style={{
                                    fontSize: '1.25rem',
                                    fontWeight: 'bold',
                                    color: '#1E293B',
                                    margin: 0
                                }}>
                                    Confirmer le changement de rôle
                                </h3>
                            </div>
                        </div>

                        <div style={{ padding: '1.5rem' }}>
                            <p style={{
                                color: '#475569',
                                lineHeight: '1.6',
                                marginBottom: '1rem'
                            }}>
                                Voulez-vous vraiment changer le rôle de <strong>{user.prenom} {user.nom}</strong> ?
                            </p>

                            <div style={{
                                display: 'flex',
                                gap: '0.75rem',
                                padding: '1rem',
                                background: '#F8FAFC',
                                borderRadius: '0.5rem',
                                marginBottom: '1rem'
                            }}>
                                <div style={{ flex: 1 }}>
                                    <p style={{
                                        fontSize: '0.75rem',
                                        color: '#64748B',
                                        marginBottom: '0.25rem'
                                    }}>
                                        Rôle actuel
                                    </p>
                                    <p style={{
                                        fontWeight: '600',
                                        color: '#1E293B',
                                        fontSize: '0.875rem',
                                        margin: 0
                                    }}>
                                        {currentRole.emoji} {currentRole.label}
                                    </p>
                                </div>
                                <div style={{
                                    display: 'flex',
                                    alignItems: 'center',
                                    color: '#94A3B8'
                                }}>
                                    →
                                </div>
                                <div style={{ flex: 1 }}>
                                    <p style={{
                                        fontSize: '0.75rem',
                                        color: '#64748B',
                                        marginBottom: '0.25rem'
                                    }}>
                                        Nouveau rôle
                                    </p>
                                    <p style={{
                                        fontWeight: '600',
                                        color: '#1E293B',
                                        fontSize: '0.875rem',
                                        margin: 0
                                    }}>
                                        {roles.find(r => r.value === selectedRole)?.emoji}{' '}
                                        {roles.find(r => r.value === selectedRole)?.label}
                                    </p>
                                </div>
                            </div>

                            <div style={{
                                display: 'flex',
                                gap: '0.75rem'
                            }}>
                                <button
                                    onClick={() => !isUpdating && setShowConfirmModal(false)}
                                    disabled={isUpdating}
                                    style={{
                                        flex: 1,
                                        padding: '0.75rem',
                                        background: 'white',
                                        border: '2px solid #E2E8F0',
                                        borderRadius: '0.5rem',
                                        fontSize: '0.875rem',
                                        fontWeight: '500',
                                        color: '#475569',
                                        cursor: isUpdating ? 'not-allowed' : 'pointer',
                                        opacity: isUpdating ? 0.6 : 1,
                                        transition: 'all 0.2s'
                                    }}
                                >
                                    Annuler
                                </button>
                                <button
                                    onClick={confirmRoleChange}
                                    disabled={isUpdating}
                                    style={{
                                        flex: 1,
                                        padding: '0.75rem',
                                        background: isUpdating ? '#94A3B8' : '#EF4444',
                                        border: 'none',
                                        borderRadius: '0.5rem',
                                        fontSize: '0.875rem',
                                        fontWeight: '600',
                                        color: 'white',
                                        cursor: isUpdating ? 'not-allowed' : 'pointer',
                                        boxShadow: '0 2px 4px rgba(239, 68, 68, 0.3)',
                                        transition: 'all 0.2s'
                                    }}
                                >
                                    {isUpdating ? 'Mise à jour...' : 'Confirmer'}
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </>
    );
}
