'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { ShieldCheck, Users, Search, Loader2, Crown, Shield, User as UserIcon, Trash2 } from 'lucide-react';
import { getAllUsers, isAdmin, UserProfile, updateUserRole, UserRole } from '@/app/lib/auth-helpers';
import { supabase } from '@/app/lib/supabase';
import DeleteWarningModal from './DeleteWarningModal';
import ConfirmDeleteModal from './ConfirmDeleteModal';
import { generateConfirmationCode, deleteUser } from './deleteUserUtils';

const ROLE_CONFIG = {
    user: {
        icon: '👤',
        label: 'Utilisateur',
        bg: '#EFF6FF',
        border: '#DBEAFE',
        text: '#1E40AF',
        filterBg: '#3B82F6'
    },
    moderateur: {
        icon: '🛡️',
        label: 'Modérateur',
        bg: '#FEF3C7',
        border: '#FDE68A',
        text: '#92400E',
        filterBg: '#F59E0B'
    },
    superadmin: {
        icon: '👑',
        label: 'Admin',
        bg: '#FEE2E2',
        border: '#FECACA',
        text: '#991B1B',
        filterBg: '#EF4444'
    }
};

export default function UsersManagementPage() {
    const [users, setUsers] = useState<UserProfile[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState('');
    const [filterRole, setFilterRole] = useState<'all' | 'user' | 'moderateur' | 'superadmin'>('all');
    const [editingUserId, setEditingUserId] = useState<string | null>(null);
    const [updatingRole, setUpdatingRole] = useState(false);
    const [currentPage, setCurrentPage] = useState(1);
    const itemsPerPage = 30;
    const router = useRouter();

    // États pour la suppression
    const [userToDelete, setUserToDelete] = useState<UserProfile | null>(null);
    const [showDeleteWarning, setShowDeleteWarning] = useState(false);
    const [showConfirmModal, setShowConfirmModal] = useState(false);
    const [confirmationCode, setConfirmationCode] = useState('');

    useEffect(() => {
        checkAdminAndLoadUsers();
    }, []);

    const checkAdminAndLoadUsers = async () => {
        try {
            const adminAccess = await isAdmin();
            if (!adminAccess) {
                router.push('/dashboard');
                return;
            }

            const usersData = await getAllUsers();
            if (usersData) {
                // Enrichir avec le statut de confirmation email
                try {
                    const { data: { user: currentUser } } = await supabase.auth.getUser();
                    if (currentUser) {
                        const response = await fetch('/api/admin/users-email-status', {
                            method: 'POST',
                            headers: { 'Content-Type': 'application/json' },
                            body: JSON.stringify({ currentUserId: currentUser.id })
                        });

                        if (response.ok) {
                            const { emailStatusMap } = await response.json();
                            const enrichedUsers = usersData.map(user => ({
                                ...user,
                                emailConfirmed: emailStatusMap[user.id] ?? undefined
                            }));
                            setUsers(enrichedUsers);
                        } else {
                            setUsers(usersData);
                        }
                    } else {
                        setUsers(usersData);
                    }
                } catch (err) {
                    console.error('Erreur enrichissement email status:', err);
                    setUsers(usersData);
                }
            }
        } catch (error) {
            console.error('Error loading users:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleRoleChange = async (userId: string, newRole: UserRole) => {
        setUpdatingRole(true);
        try {
            const success = await updateUserRole(userId, newRole);
            if (success) {
                await checkAdminAndLoadUsers();
                setEditingUserId(null);
            } else {
                alert('Erreur lors de la mise à jour du rôle. Il s\'agit peut-être du dernier superadmin.');
            }
        } catch (error) {
            console.error('Error updating role:', error);
            alert('Erreur lors de la mise à jour du rôle');
        } finally {
            setUpdatingRole(false);
        }
    };

    // Gestion de la suppression d'utilisateur
    const handleDeleteClick = (user: UserProfile) => {
        setUserToDelete(user);
        setShowDeleteWarning(true);
    };

    const handleContinueToConfirm = () => {
        setShowDeleteWarning(false);
        setConfirmationCode(generateConfirmationCode());
        setShowConfirmModal(true);
    };

    const handleConfirmDelete = async () => {
        if (!userToDelete) return;

        const result = await deleteUser(userToDelete.id);

        if (result.success) {
            alert(result.message);
            setShowConfirmModal(false);
            setUserToDelete(null);
            await checkAdminAndLoadUsers();
        } else {
            alert('Erreur : ' + result.message);
        }
    };

    const handleCancelDelete = () => {
        setShowDeleteWarning(false);
        setShowConfirmModal(false);
        setUserToDelete(null);
    };


    // Filtrage des utilisateurs
    const filteredUsers = users.filter(user => {
        const matchesSearch =
            user.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
            user.prenom.toLowerCase().includes(searchQuery.toLowerCase()) ||
            (user.nom && user.nom.toLowerCase().includes(searchQuery.toLowerCase()));

        const matchesRole = filterRole === 'all' || user.role === filterRole;

        return matchesSearch && matchesRole;
    });

    // Pagination
    const totalUsers = filteredUsers.length;
    const totalPages = Math.ceil(totalUsers / itemsPerPage);
    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    const paginatedUsers = filteredUsers.slice(startIndex, endIndex);
    const showPagination = totalUsers > 50;

    // Reset à la page 1 quand on change de filtre
    useEffect(() => {
        setCurrentPage(1);
    }, [searchQuery, filterRole]);

    const getRoleCounts = () => {
        return {
            all: users.length,
            user: users.filter(u => u.role === 'user').length,
            moderateur: users.filter(u => u.role === 'moderateur').length,
            superadmin: users.filter(u => u.role === 'superadmin').length,
        };
    };

    const counts = getRoleCounts();

    if (loading) {
        return (
            <div style={{
                minHeight: '100vh',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                backgroundColor: '#F8FAFC'
            }}>
                <Loader2 size={48} style={{ animation: 'spin 1s linear infinite', color: '#3B82F6' }} />
            </div>
        );
    }

    return (
        <div style={{
            minHeight: '100vh',
            backgroundColor: '#F8FAFC',
            padding: '2rem 1rem'
        }}>
            <div style={{ maxWidth: '1400px', margin: '0 auto' }}>
                {/* Header */}
                <header style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '1rem',
                    marginBottom: '2rem'
                }}>
                    <ShieldCheck size={32} color="#475569" />
                    <div>
                        <h1 style={{
                            fontSize: '1.875rem',
                            fontWeight: 'bold',
                            color: '#1E293B',
                            marginBottom: '0.25rem'
                        }}>
                            Gestion des Utilisateurs
                        </h1>
                        <p style={{ color: '#64748B', fontSize: '0.875rem' }}>
                            Gérez les rôles et permissions des utilisateurs
                        </p>
                    </div>
                </header>

                {/* Filters & Search */}
                <div style={{
                    background: 'white',
                    borderRadius: '1rem',
                    padding: '1.5rem',
                    marginBottom: '1.5rem',
                    boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)',
                    border: '1px solid #E2E8F0'
                }}>
                    {/* Search */}
                    <div style={{ marginBottom: '1rem' }}>
                        <div style={{
                            position: 'relative',
                            maxWidth: '500px'
                        }}>
                            <Search
                                size={20}
                                style={{
                                    position: 'absolute',
                                    left: '1rem',
                                    top: '50%',
                                    transform: 'translateY(-50%)',
                                    color: '#94A3B8'
                                }}
                            />
                            <input
                                type="text"
                                placeholder="Rechercher par nom ou email..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                style={{
                                    width: '100%',
                                    padding: '0.75rem 1rem 0.75rem 3rem',
                                    border: '2px solid #E2E8F0',
                                    borderRadius: '0.5rem',
                                    fontSize: '0.875rem',
                                    outline: 'none',
                                    transition: 'border-color 0.2s'
                                }}
                                onFocus={(e) => e.currentTarget.style.borderColor = '#3B82F6'}
                                onBlur={(e) => e.currentTarget.style.borderColor = '#E2E8F0'}
                            />
                        </div>
                    </div>

                    {/* Role Filters */}
                    <div style={{
                        display: 'flex',
                        flexWrap: 'wrap',
                        gap: '0.75rem'
                    }}>
                        <FilterButton
                            active={filterRole === 'all'}
                            onClick={() => setFilterRole('all')}
                            label={`Tous (${counts.all})`}
                            emoji="🌸"
                            color="#8B5CF6"
                        />
                        <FilterButton
                            active={filterRole === 'user'}
                            onClick={() => setFilterRole('user')}
                            label={`Utilisateurs (${counts.user})`}
                            emoji="👤"
                            color="#3B82F6"
                        />
                        <FilterButton
                            active={filterRole === 'moderateur'}
                            onClick={() => setFilterRole('moderateur')}
                            label={`Modérateurs (${counts.moderateur})`}
                            emoji="🛡️"
                            color="#F59E0B"
                        />
                        <FilterButton
                            active={filterRole === 'superadmin'}
                            onClick={() => setFilterRole('superadmin')}
                            label={`Admins (${counts.superadmin})`}
                            emoji="👑"
                            color="#EF4444"
                        />
                    </div>
                </div>

                {/* Users List */}
                {filteredUsers.length === 0 ? (
                    <div style={{
                        background: 'white',
                        padding: '3rem',
                        borderRadius: '1rem',
                        boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)',
                        textAlign: 'center',
                        border: '1px solid #E2E8F0'
                    }}>
                        <p style={{ color: '#94A3B8', fontSize: '1rem' }}>
                            Aucun utilisateur trouvé
                        </p>
                    </div>
                ) : (
                    <>
                        {/* Pagination info (si activée) */}
                        {showPagination && (
                            <div style={{
                                display: 'flex',
                                justifyContent: 'space-between',
                                alignItems: 'center',
                                marginBottom: '1rem',
                                padding: '0 0.5rem'
                            }}>
                                <p style={{ fontSize: '0.875rem', color: '#64748B' }}>
                                    Affichage {startIndex + 1}-{Math.min(endIndex, totalUsers)} sur {totalUsers} utilisateurs
                                </p>
                                <p style={{ fontSize: '0.875rem', color: '#64748B' }}>
                                    Page {currentPage} sur {totalPages}
                                </p>
                            </div>
                        )}

                        <div style={{
                            display: 'grid',
                            gap: '1rem',
                            gridTemplateColumns: 'repeat(auto-fill, minmax(400px, 1fr))'
                        }}>
                            {paginatedUsers.map((user) => (
                                <UserCard
                                    key={user.id}
                                    user={user}
                                    isEditing={editingUserId === user.id}
                                    onEdit={() => setEditingUserId(user.id)}
                                    onCancel={() => setEditingUserId(null)}
                                    onRoleChange={(newRole) => handleRoleChange(user.id, newRole)}
                                    isUpdating={updatingRole}
                                    onDelete={handleDeleteClick}
                                />
                            ))}
                        </div>

                        {/* Pagination controls (si activée) */}
                        {showPagination && (
                            <div style={{
                                display: 'flex',
                                justifyContent: 'center',
                                alignItems: 'center',
                                gap: '1rem',
                                marginTop: '2rem',
                                padding: '1rem'
                            }}>
                                <button
                                    onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                                    disabled={currentPage === 1}
                                    style={{
                                        display: 'flex',
                                        alignItems: 'center',
                                        gap: '0.5rem',
                                        padding: '0.75rem 1.25rem',
                                        background: currentPage === 1 ? '#F1F5F9' : 'white',
                                        border: '2px solid #E2E8F0',
                                        borderRadius: '0.5rem',
                                        fontSize: '0.875rem',
                                        fontWeight: '500',
                                        color: currentPage === 1 ? '#94A3B8' : '#475569',
                                        cursor: currentPage === 1 ? 'not-allowed' : 'pointer',
                                        transition: 'all 0.2s'
                                    }}
                                    onMouseEnter={(e) => {
                                        if (currentPage !== 1) {
                                            e.currentTarget.style.borderColor = '#3B82F6';
                                            e.currentTarget.style.background = '#F8FAFC';
                                        }
                                    }}
                                    onMouseLeave={(e) => {
                                        if (currentPage !== 1) {
                                            e.currentTarget.style.borderColor = '#E2E8F0';
                                            e.currentTarget.style.background = 'white';
                                        }
                                    }}
                                >
                                    ← Précédent
                                </button>

                                <div style={{
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: '0.5rem',
                                    padding: '0.5rem 1rem',
                                    background: '#F8FAFC',
                                    borderRadius: '0.5rem',
                                    fontSize: '0.875rem',
                                    fontWeight: '500',
                                    color: '#475569'
                                }}>
                                    Page <strong style={{ color: '#1E293B', margin: '0 0.25rem' }}>{currentPage}</strong> sur {totalPages}
                                </div>

                                <button
                                    onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                                    disabled={currentPage === totalPages}
                                    style={{
                                        display: 'flex',
                                        alignItems: 'center',
                                        gap: '0.5rem',
                                        padding: '0.75rem 1.25rem',
                                        background: currentPage === totalPages ? '#F1F5F9' : 'white',
                                        border: '2px solid #E2E8F0',
                                        borderRadius: '0.5rem',
                                        fontSize: '0.875rem',
                                        fontWeight: '500',
                                        color: currentPage === totalPages ? '#94A3B8' : '#475569',
                                        cursor: currentPage === totalPages ? 'not-allowed' : 'pointer',
                                        transition: 'all 0.2s'
                                    }}
                                    onMouseEnter={(e) => {
                                        if (currentPage !== totalPages) {
                                            e.currentTarget.style.borderColor = '#3B82F6';
                                            e.currentTarget.style.background = '#F8FAFC';
                                        }
                                    }}
                                    onMouseLeave={(e) => {
                                        if (currentPage !== totalPages) {
                                            e.currentTarget.style.borderColor = '#E2E8F0';
                                            e.currentTarget.style.background = 'white';
                                        }
                                    }}
                                >
                                    Suivant →
                                </button>
                            </div>
                        )}
                    </>
                )}
            </div>

            {/* Modals de suppression */}
            {showDeleteWarning && userToDelete && (
                <DeleteWarningModal
                    user={userToDelete}
                    onCancel={handleCancelDelete}
                    onContinue={handleContinueToConfirm}
                />
            )}

            {showConfirmModal && userToDelete && (
                <ConfirmDeleteModal
                    user={userToDelete}
                    confirmationCode={confirmationCode}
                    onCancel={handleCancelDelete}
                    onConfirm={handleConfirmDelete}
                />
            )}

            <style jsx global>{`
        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
      `}</style>
        </div>
    );
}

function FilterButton({ active, onClick, label, emoji, color }: {
    active: boolean;
    onClick: () => void;
    label: string;
    emoji: string;
    color: string;
}) {
    return (
        <button
            onClick={onClick}
            style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '0.5rem',
                padding: '0.625rem 1rem',
                borderRadius: '9999px',
                border: active ? 'none' : '2px solid #E2E8F0',
                background: active ? color : 'white',
                color: active ? 'white' : '#475569',
                fontWeight: active ? '600' : '500',
                cursor: 'pointer',
                fontSize: '0.875rem',
                boxShadow: active ? `0 2px 4px ${color}33` : 'none',
                transition: 'all 0.2s'
            }}
        >
            <span>{emoji}</span>
            <span>{label}</span>
        </button>
    );
}

function UserCard({
    user,
    isEditing,
    onEdit,
    onCancel,
    onRoleChange,
    isUpdating,
    onDelete
}: {
    user: UserProfile;
    isEditing: boolean;
    onEdit: () => void;
    onCancel: () => void;
    onRoleChange: (role: UserRole) => void;
    isUpdating: boolean;
    onDelete: (user: UserProfile) => void;
}) {
    const config = ROLE_CONFIG[user.role];

    return (
        <div style={{
            background: 'white',
            borderRadius: '1rem',
            boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)',
            overflow: 'hidden',
            border: `2px solid ${config.border}`,
            transition: 'all 0.2s'
        }}>
            {/* Header */}
            <div style={{
                background: config.bg,
                padding: '1rem 1.25rem',
                borderBottom: `2px solid ${config.border}`,
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center'
            }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                    <span style={{ fontSize: '1.5rem' }}>{config.icon}</span>
                    <div>
                        <p style={{
                            fontWeight: '600',
                            fontSize: '1rem',
                            color: '#1E293B',
                            marginBottom: '0.125rem'
                        }}>
                            {user.prenom} {user.nom || ''}
                        </p>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                            <p style={{
                                fontSize: '0.75rem',
                                color: '#64748B',
                                margin: 0
                            }}>
                                {user.email}
                            </p>
                            {user.emailConfirmed === false && (
                                <span
                                    style={{
                                        display: 'inline-flex',
                                        alignItems: 'center',
                                        gap: '0.25rem',
                                        padding: '0.125rem 0.5rem',
                                        background: '#FEF3C7',
                                        border: '1px solid #FCD34D',
                                        borderRadius: '9999px',
                                        fontSize: '0.625rem',
                                        fontWeight: '600',
                                        color: '#92400E',
                                        whiteSpace: 'nowrap'
                                    }}
                                    title="L'utilisateur n'a pas encore confirmé son adresse email"
                                >
                                    ⚠️ Email non confirmé
                                </span>
                            )}
                        </div>
                    </div>
                </div>
                <div style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '0.5rem',
                    padding: '0.375rem 0.75rem',
                    background: config.bg,
                    border: `2px solid ${config.border}`,
                    color: config.text,
                    borderRadius: '9999px',
                    fontSize: '0.75rem',
                    fontWeight: '600'
                }}>
                    <span>{config.icon}</span>
                    <span>{config.label}</span>
                </div>
            </div>

            {/* Content */}
            <div style={{ padding: '1.25rem' }}>
                {!isEditing ? (
                    <div style={{ display: 'flex', gap: '0.5rem' }}>
                        <button
                            onClick={onEdit}
                            style={{
                                flex: 1,
                                padding: '0.75rem',
                                background: 'white',
                                border: '2px solid #E2E8F0',
                                borderRadius: '0.5rem',
                                fontSize: '0.875rem',
                                fontWeight: '500',
                                color: '#475569',
                                cursor: 'pointer',
                                transition: 'all 0.2s'
                            }}
                            onMouseEnter={(e) => {
                                e.currentTarget.style.borderColor = '#3B82F6';
                                e.currentTarget.style.background = '#F8FAFC';
                            }}
                            onMouseLeave={(e) => {
                                e.currentTarget.style.borderColor = '#E2E8F0';
                                e.currentTarget.style.background = 'white';
                            }}
                        >
                            Modifier le rôle
                        </button>
                        <button
                            onClick={() => onDelete(user)}
                            style={{
                                padding: '0.625rem',
                                background: '#FEF2F2',
                                border: '1px solid #FECACA',
                                borderRadius: '0.375rem',
                                cursor: 'pointer',
                                transition: 'all 0.2s',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center'
                            }}
                            onMouseEnter={(e) => {
                                e.currentTarget.style.background = '#FEE2E2';
                                e.currentTarget.style.borderColor = '#EF4444';
                            }}
                            onMouseLeave={(e) => {
                                e.currentTarget.style.background = '#FEF2F2';
                                e.currentTarget.style.borderColor = '#FECACA';
                            }}
                            title={`Supprimer ${user.prenom} ${user.nom}`}
                        >
                            <Trash2 size={16} color="#DC2626" />
                        </button>
                    </div>
                ) : (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                        {Object.entries(ROLE_CONFIG).map(([roleKey, roleConfig]) => (
                            <button
                                key={roleKey}
                                onClick={() => {
                                    if (roleKey !== user.role) {
                                        if (confirm(`Voulez-vous vraiment changer le rôle de ${user.prenom} en ${roleConfig.label} ?`)) {
                                            onRoleChange(roleKey as UserRole);
                                        }
                                    }
                                }}
                                disabled={isUpdating || roleKey === user.role}
                                style={{
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: '0.75rem',
                                    padding: '0.875rem 1rem',
                                    border: roleKey === user.role ? `2px solid ${roleConfig.border}` : '2px solid #E2E8F0',
                                    background: roleKey === user.role ? roleConfig.bg : 'white',
                                    borderRadius: '0.5rem',
                                    cursor: roleKey === user.role || isUpdating ? 'not-allowed' : 'pointer',
                                    textAlign: 'left',
                                    opacity: roleKey === user.role || isUpdating ? 0.6 : 1,
                                    transition: 'all 0.2s'
                                }}
                                onMouseEnter={(e) => {
                                    if (roleKey !== user.role && !isUpdating) {
                                        e.currentTarget.style.background = '#F8FAFC';
                                    }
                                }}
                                onMouseLeave={(e) => {
                                    if (roleKey !== user.role) {
                                        e.currentTarget.style.background = 'white';
                                    }
                                }}
                            >
                                <span style={{ fontSize: '1.25rem' }}>{roleConfig.icon}</span>
                                <div style={{ flex: 1 }}>
                                    <div style={{
                                        fontWeight: '600',
                                        fontSize: '0.875rem',
                                        color: '#1E293B',
                                        marginBottom: '0.125rem'
                                    }}>
                                        {roleConfig.label}
                                    </div>
                                    <div style={{
                                        fontSize: '0.75rem',
                                        color: '#64748B'
                                    }}>
                                        {roleKey === 'user' && 'Accès standard aux fonctionnalités'}
                                        {roleKey === 'moderateur' && 'Peut modérer les fioretti'}
                                        {roleKey === 'superadmin' && 'Accès complet (modération + gestion)'}
                                    </div>
                                </div>
                                {roleKey === user.role && (
                                    <span style={{ color: config.text }}>✓</span>
                                )}
                            </button>
                        ))}
                        <button
                            onClick={onCancel}
                            disabled={isUpdating}
                            style={{
                                padding: '0.75rem',
                                background: 'white',
                                border: '2px solid #E2E8F0',
                                borderRadius: '0.5rem',
                                fontSize: '0.875rem',
                                fontWeight: '500',
                                color: '#64748B',
                                cursor: isUpdating ? 'not-allowed' : 'pointer',
                                opacity: isUpdating ? 0.6 : 1,
                                transition: 'all 0.2s'
                            }}
                        >
                            Annuler
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
}
