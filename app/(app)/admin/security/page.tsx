'use client'

import { useState, useEffect } from 'react'
import { supabase } from '@/app/lib/supabase'
import { useRouter } from 'next/navigation'
import { Shield, Search, Download, Filter, Clock, MapPin, Monitor, User as UserIcon, AlertTriangle } from 'lucide-react'
import { isAdmin } from '@/app/lib/auth-helpers'

interface SecurityLog {
    id: string
    user_id: string
    action: string
    ip_address: string | null
    user_agent: string | null
    details: any
    created_at: string
}

interface UserProfile {
    id: string
    email: string
    prenom: string
    nom: string | null
}

interface LogWithUser extends SecurityLog {
    user?: UserProfile
}

const actionLabels: Record<string, { label: string; color: string; icon: string }> = {
    login: { label: 'Connexion', color: '#10B981', icon: '✅' },
    password_change: { label: 'Mot de passe modifié', color: '#F59E0B', icon: '🔐' },
    email_change: { label: 'Email modifié', color: '#F59E0B', icon: '📧' },
    profile_update: { label: 'Profil mis à jour', color: '#3B82F6', icon: '✏️' },
    failed_login: { label: 'Tentative échouée', color: '#EF4444', icon: '⚠️' },
    account_created: { label: 'Compte créé', color: '#8B5CF6', icon: '🎉' },
    account_deleted: { label: 'Compte supprimé', color: '#DC2626', icon: '🗑️' }
}

export default function AdminSecurityPage() {
    const router = useRouter()
    const [loading, setLoading] = useState(true)
    const [logs, setLogs] = useState<LogWithUser[]>([])
    const [users, setUsers] = useState<UserProfile[]>([])
    const [filterUser, setFilterUser] = useState<string>('all')
    const [filterAction, setFilterAction] = useState<string>('all')
    const [filterPeriod, setFilterPeriod] = useState<string>('30')
    const [searchQuery, setSearchQuery] = useState('')
    const [currentPage, setCurrentPage] = useState(1)
    const itemsPerPage = 50

    useEffect(() => {
        checkAdminAndLoadData()
    }, [])

    const checkAdminAndLoadData = async () => {
        try {
            const adminAccess = await isAdmin()
            if (!adminAccess) {
                router.push('/dashboard')
                return
            }

            await Promise.all([loadLogs(), loadUsers()])
        } catch (error) {
            console.error('Error:', error)
        } finally {
            setLoading(false)
        }
    }

    const loadLogs = async () => {
        try {
            console.log('Loading all security logs for admin...')

            const { data, error } = await supabase
                .from('security_logs')
                .select('*')
                .neq('action', 'logout') // Exclure les logs de logout
                .order('created_at', { ascending: false })
                .limit(1000)

            if (error) {
                console.error('Error loading logs:', error)
                throw error
            }

            console.log('Admin security logs loaded:', data?.length || 0)
            setLogs(data || [])
        } catch (error) {
            console.error('Error loading logs:', error)
        }
    }

    const loadUsers = async () => {
        try {
            const { data, error } = await supabase
                .from('profiles')
                .select('id, email, prenom, nom')
                .order('prenom')

            if (error) throw error
            setUsers(data || [])
        } catch (error) {
            console.error('Error loading users:', error)
        }
    }

    const getUserInfo = (userId: string): UserProfile | undefined => {
        return users.find(u => u.id === userId)
    }

    // Fonction pour trouver un user par email (pour failed_login)
    const getUserByEmail = (email: string): UserProfile | undefined => {
        return users.find(u => u.email === email)
    }

    const formatDate = (dateStr: string) => {
        const date = new Date(dateStr)
        return date.toLocaleDateString('fr-FR', {
            day: '2-digit',
            month: 'short',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        })
    }

    const getDeviceInfo = (userAgent: string | null) => {
        if (!userAgent) return 'Appareil inconnu'
        if (userAgent.includes('iPhone') || userAgent.includes('iPad')) return '📱 iOS'
        if (userAgent.includes('Android')) return '📱 Android'
        if (userAgent.includes('Windows')) return '💻 Windows'
        if (userAgent.includes('Macintosh')) return '🖥️ Mac'
        if (userAgent.includes('Linux')) return '🐧 Linux'
        return '💻 Ordinateur'
    }

    // Filtrage
    const filteredLogs = logs.filter(log => {
        // Filtre par utilisateur
        if (filterUser !== 'all' && log.user_id !== filterUser) return false

        // Filtre par action
        if (filterAction !== 'all' && log.action !== filterAction) return false

        // Filtre par période
        if (filterPeriod !== 'all') {
            const logDate = new Date(log.created_at)
            const now = new Date()
            const daysDiff = Math.floor((now.getTime() - logDate.getTime()) / (1000 * 60 * 60 * 24))

            if (filterPeriod === '7' && daysDiff > 7) return false
            if (filterPeriod === '30' && daysDiff > 30) return false
            if (filterPeriod === '90' && daysDiff > 90) return false
        }

        // Recherche textuelle
        if (searchQuery) {
            const user = getUserInfo(log.user_id)
            const searchLower = searchQuery.toLowerCase()
            const matchUser = user?.email.toLowerCase().includes(searchLower) ||
                user?.prenom.toLowerCase().includes(searchLower) ||
                user?.nom?.toLowerCase().includes(searchLower)
            const matchIP = log.ip_address?.includes(searchQuery)

            if (!matchUser && !matchIP) return false
        }

        return true
    })

    // Pagination
    const totalPages = Math.ceil(filteredLogs.length / itemsPerPage)
    const paginatedLogs = filteredLogs.slice(
        (currentPage - 1) * itemsPerPage,
        currentPage * itemsPerPage
    )

    const exportToCSV = () => {
        const headers = ['Date', 'Utilisateur', 'Email', 'Action', 'IP', 'Appareil']
        const rows = filteredLogs.map(log => {
            const user = getUserInfo(log.user_id)
            const config = actionLabels[log.action]
            return [
                formatDate(log.created_at),
                `${user?.prenom || ''} ${user?.nom || ''}`.trim(),
                user?.email || '',
                config?.label || log.action,
                log.ip_address || '',
                getDeviceInfo(log.user_agent)
            ]
        })

        const csv = [headers, ...rows].map(row => row.join(',')).join('\n')
        const blob = new Blob([csv], { type: 'text/csv' })
        const url = URL.createObjectURL(blob)
        const a = document.createElement('a')
        a.href = url
        a.download = `security-logs-${new Date().toISOString().split('T')[0]}.csv`
        a.click()
    }

    if (loading) {
        return (
            <div style={{
                minHeight: '100vh',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                backgroundColor: '#F8FAFC'
            }}>
                <div style={{
                    background: 'white',
                    borderRadius: '1rem',
                    padding: '2rem',
                    boxShadow: '0 4px 6px rgba(0, 0, 0, 0.05)'
                }}>
                    <div style={{ fontSize: '2rem', marginBottom: '1rem', textAlign: 'center' }}>🔐</div>
                    <p style={{ color: '#6b7280' }}>Chargement des logs de sécurité...</p>
                </div>
            </div>
        )
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
                    justifyContent: 'space-between',
                    marginBottom: '2rem',
                    flexWrap: 'wrap',
                    gap: '1rem'
                }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                        <Shield size={32} color="#475569" />
                        <div>
                            <h1 style={{
                                fontSize: '1.875rem',
                                fontWeight: 'bold',
                                color: '#1E293B',
                                marginBottom: '0.25rem'
                            }}>
                                Sécurité - Logs Globaux
                            </h1>
                            <p style={{ color: '#64748B', fontSize: '0.875rem' }}>
                                {filteredLogs.length} événement{filteredLogs.length > 1 ? 's' : ''} trouvé{filteredLogs.length > 1 ? 's' : ''}
                            </p>
                        </div>
                    </div>

                    <button
                        onClick={exportToCSV}
                        style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: '0.5rem',
                            padding: '0.75rem 1.25rem',
                            background: '#10B981',
                            color: 'white',
                            border: 'none',
                            borderRadius: '0.5rem',
                            fontSize: '0.875rem',
                            fontWeight: '500',
                            cursor: 'pointer',
                            transition: 'background 0.2s'
                        }}
                        onMouseEnter={(e) => e.currentTarget.style.background = '#059669'}
                        onMouseLeave={(e) => e.currentTarget.style.background = '#10B981'}
                    >
                        <Download size={16} />
                        Exporter CSV
                    </button>
                </header>

                {/* Filtres */}
                <div style={{
                    background: 'white',
                    borderRadius: '1rem',
                    padding: '1.5rem',
                    marginBottom: '1.5rem',
                    boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)',
                    border: '1px solid #E2E8F0'
                }}>
                    {/* Recherche */}
                    <div style={{ marginBottom: '1.5rem' }}>
                        <div style={{ position: 'relative', maxWidth: '500px' }}>
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
                                placeholder="Rechercher par nom, email ou IP..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                style={{
                                    width: '100%',
                                    padding: '0.75rem 1rem 0.75rem 3rem',
                                    border: '2px solid #E2E8F0',
                                    borderRadius: '0.5rem',
                                    fontSize: '0.875rem',
                                    outline: 'none'
                                }}
                            />
                        </div>
                    </div>

                    <div style={{
                        display: 'grid',
                        gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
                        gap: '1rem'
                    }}>
                        {/* Filtre utilisateur */}
                        <div>
                            <label style={{
                                display: 'block',
                                fontSize: '0.75rem',
                                fontWeight: '500',
                                color: '#64748B',
                                marginBottom: '0.5rem'
                            }}>
                                Utilisateur
                            </label>
                            <select
                                value={filterUser}
                                onChange={(e) => setFilterUser(e.target.value)}
                                style={{
                                    width: '100%',
                                    padding: '0.5rem',
                                    border: '2px solid #E2E8F0',
                                    borderRadius: '0.5rem',
                                    fontSize: '0.875rem',
                                    cursor: 'pointer'
                                }}
                            >
                                <option value="all">Tous les utilisateurs</option>
                                {users.map(user => (
                                    <option key={user.id} value={user.id}>
                                        {user.prenom} {user.nom} ({user.email})
                                    </option>
                                ))}
                            </select>
                        </div>

                        {/* Filtre action */}
                        <div>
                            <label style={{
                                display: 'block',
                                fontSize: '0.75rem',
                                fontWeight: '500',
                                color: '#64748B',
                                marginBottom: '0.5rem'
                            }}>
                                Type d'action
                            </label>
                            <select
                                value={filterAction}
                                onChange={(e) => setFilterAction(e.target.value)}
                                style={{
                                    width: '100%',
                                    padding: '0.5rem',
                                    border: '2px solid #E2E8F0',
                                    borderRadius: '0.5rem',
                                    fontSize: '0.875rem',
                                    cursor: 'pointer'
                                }}
                            >
                                <option value="all">Toutes les actions</option>
                                {Object.entries(actionLabels).map(([action, config]) => (
                                    <option key={action} value={action}>
                                        {config.icon} {config.label}
                                    </option>
                                ))}
                            </select>
                        </div>

                        {/* Filtre période */}
                        <div>
                            <label style={{
                                display: 'block',
                                fontSize: '0.75rem',
                                fontWeight: '500',
                                color: '#64748B',
                                marginBottom: '0.5rem'
                            }}>
                                Période
                            </label>
                            <select
                                value={filterPeriod}
                                onChange={(e) => setFilterPeriod(e.target.value)}
                                style={{
                                    width: '100%',
                                    padding: '0.5rem',
                                    border: '2px solid #E2E8F0',
                                    borderRadius: '0.5rem',
                                    fontSize: '0.875rem',
                                    cursor: 'pointer'
                                }}
                            >
                                <option value="all">Toute la période</option>
                                <option value="7">7 derniers jours</option>
                                <option value="30">30 derniers jours</option>
                                <option value="90">90 derniers jours</option>
                            </select>
                        </div>
                    </div>
                </div>

                {/* Liste des logs */}
                {paginatedLogs.length === 0 ? (
                    <div style={{
                        background: 'white',
                        padding: '3rem',
                        borderRadius: '1rem',
                        boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)',
                        textAlign: 'center',
                        border: '1px solid #E2E8F0'
                    }}>
                        <Shield size={48} style={{ color: '#D6E5F5', margin: '0 auto 1rem' }} />
                        <p style={{ color: '#94A3B8', fontSize: '1rem' }}>
                            Aucun événement trouvé
                        </p>
                    </div>
                ) : (
                    <>
                        <div style={{
                            background: 'white',
                            borderRadius: '1rem',
                            overflow: 'hidden',
                            boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)',
                            border: '1px solid #E2E8F0'
                        }}>
                            {paginatedLogs.map((log, index) => {
                                const user = getUserInfo(log.user_id)
                                const config = actionLabels[log.action] || { label: log.action, color: '#6B7280', icon: '❓' }

                                return (
                                    <div
                                        key={log.id}
                                        style={{
                                            padding: '1.25rem',
                                            borderBottom: index < paginatedLogs.length - 1 ? '1px solid #F3F4F6' : 'none',
                                            display: 'grid',
                                            gridTemplateColumns: '40px 1fr',
                                            gap: '1rem',
                                            transition: 'background 0.2s'
                                        }}
                                        onMouseEnter={(e) => e.currentTarget.style.background = '#F9FAFB'}
                                        onMouseLeave={(e) => e.currentTarget.style.background = 'white'}
                                    >
                                        <div style={{ fontSize: '1.5rem' }}>
                                            {config.icon}
                                        </div>

                                        <div>
                                            <div style={{
                                                display: 'flex',
                                                alignItems: 'center',
                                                gap: '1rem',
                                                marginBottom: '0.5rem',
                                                flexWrap: 'wrap'
                                            }}>
                                                <span style={{
                                                    fontWeight: '600',
                                                    color: '#1F2937',
                                                    fontSize: '0.875rem'
                                                }}>
                                                    {config.label}
                                                </span>
                                                <span style={{
                                                    display: 'flex',
                                                    alignItems: 'center',
                                                    gap: '0.25rem',
                                                    fontSize: '0.875rem',
                                                    color: '#64748B'
                                                }}>                                                    <UserIcon size={14} />
                                                    {(() => {
                                                        if (log.action === 'failed_login') {
                                                            const attemptedEmail = log.details?.email
                                                            const matchedUser = attemptedEmail ? getUserByEmail(attemptedEmail) : undefined
                                                            if (matchedUser) {
                                                                return `${matchedUser.prenom} ${matchedUser.nom || ''} (${matchedUser.email}) - Échec connexion`
                                                            } else {
                                                                return `Email inconnu: ${attemptedEmail || 'N/A'} - Tentative suspecte`
                                                            }
                                                        } else if (log.action === 'account_deleted') {
                                                            const deletedName = log.details?.deleted_user_name || 'Utilisateur'
                                                            const deletedEmail = log.details?.deleted_user_email || 'N/A'
                                                            const deletedBy = log.details?.deleted_by_admin || 'Admin'
                                                            return `${deletedName} (${deletedEmail}) - Supprimé par ${deletedBy}`
                                                        } else {
                                                            return `${user?.prenom} ${user?.nom} (${user?.email})`
                                                        }
                                                    })()}
                                                </span>
                                            </div>

                                            <div style={{
                                                display: 'flex',
                                                gap: '1.5rem',
                                                fontSize: '0.75rem',
                                                color: '#6B7280',
                                                flexWrap: 'wrap'
                                            }}>
                                                <span style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                                                    <Clock size={12} />
                                                    {formatDate(log.created_at)}
                                                </span>
                                                {log.ip_address && (
                                                    <span style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                                                        <MapPin size={12} />
                                                        {log.ip_address}
                                                    </span>
                                                )}
                                                {log.user_agent && (
                                                    <span style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                                                        <Monitor size={12} />
                                                        {getDeviceInfo(log.user_agent)}
                                                    </span>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                )
                            })}
                        </div>

                        {/* Pagination */}
                        {totalPages > 1 && (
                            <div style={{
                                display: 'flex',
                                justifyContent: 'center',
                                alignItems: 'center',
                                gap: '1rem',
                                marginTop: '2rem'
                            }}>
                                <button
                                    onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                                    disabled={currentPage === 1}
                                    style={{
                                        padding: '0.5rem 1rem',
                                        background: currentPage === 1 ? '#F1F5F9' : 'white',
                                        border: '2px solid #E2E8F0',
                                        borderRadius: '0.5rem',
                                        fontSize: '0.875rem',
                                        cursor: currentPage === 1 ? 'not-allowed' : 'pointer',
                                        color: currentPage === 1 ? '#94A3B8' : '#475569'
                                    }}
                                >
                                    ← Précédent
                                </button>

                                <span style={{ fontSize: '0.875rem', color: '#64748B' }}>
                                    Page {currentPage} sur {totalPages}
                                </span>

                                <button
                                    onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                                    disabled={currentPage === totalPages}
                                    style={{
                                        padding: '0.5rem 1rem',
                                        background: currentPage === totalPages ? '#F1F5F9' : 'white',
                                        border: '2px solid #E2E8F0',
                                        borderRadius: '0.5rem',
                                        fontSize: '0.875rem',
                                        cursor: currentPage === totalPages ? 'not-allowed' : 'pointer',
                                        color: currentPage === totalPages ? '#94A3B8' : '#475569'
                                    }}
                                >
                                    Suivant →
                                </button>
                            </div>
                        )}
                    </>
                )}
            </div>
        </div>
    )
}
