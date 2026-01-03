'use client'

import { useState, useEffect } from 'react'
import { supabase } from '@/app/lib/supabase'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { ArrowLeft, Shield, Clock, MapPin, Monitor, AlertTriangle } from 'lucide-react'

interface SecurityLog {
  id: string
  action: string
  ip_address: string | null
  user_agent: string | null
  details: any
  created_at: string
}

const actionLabels: Record<string, { label: string; color: string; icon: any }> = {
  login: { label: 'Connexion', color: '#10B981', icon: '✅' }, password_change: { label: 'Mot de passe modifié', color: '#F59E0B', icon: '🔐' },
  email_change: { label: 'Email modifié', color: '#F59E0B', icon: '📧' },
  profile_update: { label: 'Profil mis à jour', color: '#3B82F6', icon: '✏️' },
  failed_login: { label: 'Tentative échouée', color: '#EF4444', icon: '⚠️' }
}

export default function SecurityPage() {
  const router = useRouter()
  const [loading, setLoading] = useState(true)
  const [logs, setLogs] = useState<SecurityLog[]>([])
  const [filter, setFilter] = useState<string | null>(null)

  useEffect(() => {
    loadSecurityLogs()
  }, [])

  const loadSecurityLogs = async () => {
    try {
      const { data: { user }, error: userError } = await supabase.auth.getUser()

      if (userError) {
        console.error('Auth error:', userError)
        // Si erreur d'auth (refresh token), rediriger vers login
        if (userError.message.includes('Refresh Token')) {
          router.push('/login')
          return
        }
      }

      if (!user) {
        router.push('/login')
        return
      }

      console.log('Loading security logs for user:', user.id)

      const { data, error } = await supabase
        .from('security_logs')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })
        .limit(100)

      if (error) {
        console.error('Error loading security logs:', error)
        throw error
      }

      console.log('Security logs loaded:', data?.length || 0)
      setLogs(data || [])
    } catch (error) {
      console.error('Erreur:', error)
    } finally {
      setLoading(false)
    }
  }

  const filteredLogs = filter ? logs.filter(log => log.action === filter) : logs

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr)
    return date.toLocaleDateString('fr-FR', {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  const getDeviceInfo = (userAgent: string | null) => {
    if (!userAgent) return 'Appareil inconnu'

    if (userAgent.includes('Mobile')) return '📱 Mobile'
    if (userAgent.includes('Tablet')) return '📱 Tablette'
    if (userAgent.includes('Windows')) return '💻 Windows'
    if (userAgent.includes('Mac')) return '🖥️ Mac'
    if (userAgent.includes('Linux')) return '🐧 Linux'
    return '💻 Ordinateur'
  }

  if (loading) {
    return (
      <div style={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center'
      }}>
        <div style={{
          background: 'white',
          borderRadius: '1rem',
          padding: '2rem',
          boxShadow: '0 4px 6px rgba(0, 0, 0, 0.05)'
        }}>
          <div style={{ fontSize: '2rem', marginBottom: '1rem', textAlign: 'center' }}>🔐</div>
          <p style={{ color: '#6b7280' }}>Chargement de l\'historique...</p>
        </div>
      </div>
    )
  }

  return (
    <div style={{
      minHeight: '100vh',
      padding: '2rem 1rem'
    }}>
      <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
        {/* En-tête */}
        <div style={{
          background: 'linear-gradient(135deg, #E6EDFF, #D6E5F5)',
          borderRadius: '1rem',
          padding: '2rem',
          marginBottom: '2rem',
          boxShadow: '0 4px 6px rgba(0, 0, 0, 0.05)'
        }}>
          <Link href="/profile" style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '0.5rem',
            color: '#4338CA',
            textDecoration: 'none',
            marginBottom: '1rem',
            fontSize: '0.875rem',
            opacity: 0.8,
            transition: 'opacity 0.2s'
          }}>
            <ArrowLeft size={16} />
            Retour au profil
          </Link>

          <div style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            flexWrap: 'wrap',
            gap: '1rem'
          }}>
            <div>
              <h1 style={{
                fontSize: '2rem',
                fontWeight: 'bold',
                color: '#7F1D1D',
                marginBottom: '0.5rem',
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem'
              }}>
                <div style={{ display: 'flex', alignItems: 'center' }}>
                  <div style={{
                    background: 'white',
                    width: '60px',
                    height: '60px',
                    borderRadius: '50%',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: '2rem',
                    boxShadow: '0 2px 4px rgba(0, 0, 0, 0.1)',
                    marginRight: '1rem'
                  }}>
                    🔐
                  </div>
                  Historique de sécurité
                </div>
              </h1>
              <p style={{ color: '#4338CA', opacity: 0.9 }}>
                {logs.length} activité{logs.length > 1 ? 's' : ''} enregistrée{logs.length > 1 ? 's' : ''}
              </p>
            </div>
          </div>
        </div>

        {/* Filtres */}
        <div style={{
          background: 'white',
          borderRadius: '1rem',
          padding: '1.5rem',
          marginBottom: '2rem',
          boxShadow: '0 2px 4px rgba(0, 0, 0, 0.05)'
        }}>
          <div style={{
            display: 'flex',
            gap: '0.5rem',
            alignItems: 'center',
            flexWrap: 'wrap'
          }}>
            <Shield size={16} style={{ color: '#4338CA', opacity: 0.7 }} />
            <button
              onClick={() => setFilter(null)}
              style={{
                padding: '0.5rem 1rem',
                borderRadius: '2rem',
                border: 'none',
                background: !filter ? '#D6E5F5' : '#E6EDFF',
                color: '#7F1D1D',
                fontSize: '0.875rem',
                cursor: 'pointer',
                transition: 'all 0.2s'
              }}
            >
              Toutes
            </button>
            {Object.entries(actionLabels).map(([action, config]) => (
              <button
                key={action}
                onClick={() => setFilter(action)}
                style={{
                  padding: '0.5rem 1rem',
                  borderRadius: '2rem',
                  border: 'none',
                  background: filter === action ? '#D6E5F5' : '#E6EDFF',
                  color: '#7F1D1D',
                  fontSize: '0.875rem',
                  cursor: 'pointer',
                  transition: 'all 0.2s',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.25rem'
                }}
              >
                {config.icon} {config.label}
              </button>
            ))}
          </div>
        </div>

        {/* Liste des activités */}
        {filteredLogs.length === 0 ? (
          <div style={{
            background: 'white',
            borderRadius: '1rem',
            padding: '3rem',
            textAlign: 'center',
            boxShadow: '0 2px 4px rgba(0, 0, 0, 0.05)'
          }}>
            <Shield size={48} style={{ color: '#D6E5F5', margin: '0 auto 1rem' }} />
            <p style={{ color: '#4338CA', fontSize: '1.125rem' }}>
              Aucune activité enregistrée
            </p>
          </div>
        ) : (
          <div style={{
            background: 'white',
            borderRadius: '1rem',
            overflow: 'hidden',
            boxShadow: '0 2px 4px rgba(0, 0, 0, 0.05)'
          }}>
            {filteredLogs.map((log, index) => {
              const config = actionLabels[log.action] || { label: log.action, color: '#6B7280', icon: '❓' }

              return (
                <div
                  key={log.id}
                  style={{
                    padding: '1.5rem',
                    borderBottom: index < filteredLogs.length - 1 ? '1px solid #F3F4F6' : 'none',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '1rem',
                    transition: 'background 0.2s'
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.background = '#F9FAFB'
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.background = 'white'
                  }}
                >
                  <div style={{
                    fontSize: '2rem',
                    flexShrink: 0
                  }}>
                    {config.icon}
                  </div>

                  <div style={{ flex: 1 }}>
                    <div style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '0.5rem',
                      marginBottom: '0.25rem'
                    }}>
                      <span style={{
                        fontWeight: '500',
                        color: '#1F2937'
                      }}>
                        {config.label}
                      </span>
                      {log.action === 'failed_login' && (
                        <span style={{
                          background: '#E6EDFF',
                          color: '#6366f1',
                          padding: '0.125rem 0.5rem',
                          borderRadius: '0.25rem',
                          fontSize: '0.75rem',
                          fontWeight: '500'
                        }}>
                          Échec
                        </span>
                      )}
                    </div>

                    <div style={{
                      display: 'flex',
                      gap: '1rem',
                      fontSize: '0.875rem',
                      color: '#6B7280',
                      flexWrap: 'wrap'
                    }}>
                      <span style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                        <Clock size={14} />
                        {formatDate(log.created_at)}
                      </span>
                      {log.user_agent && (
                        <span style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                          <Monitor size={14} />
                          {getDeviceInfo(log.user_agent)}
                        </span>
                      )}
                      {log.ip_address && (
                        <span style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                          <MapPin size={14} />
                          {log.ip_address}
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        )}

        {/* Message de sécurité */}
        <div style={{
          marginTop: '2rem',
          padding: '1.5rem',
          background: '#FEF3C7',
          borderRadius: '0.5rem',
          display: 'flex',
          alignItems: 'flex-start',
          gap: '0.75rem'
        }}>
          <AlertTriangle size={20} style={{ color: '#92400E', flexShrink: 0 }} />
          <div style={{ fontSize: '0.875rem', color: '#92400E' }}>
            <strong>Conseil de sécurité :</strong> Si vous remarquez une activité suspecte, changez immédiatement votre mot de passe et contactez-nous.
          </div>
        </div>
      </div>
    </div>
  )
}
