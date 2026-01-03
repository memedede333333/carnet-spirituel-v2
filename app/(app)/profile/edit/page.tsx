'use client'

import { useState, useEffect } from 'react'
import { supabase } from '@/app/lib/supabase'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { User, ArrowLeft, Save } from 'lucide-react'
import type { Profile } from '@/app/types'

export default function EditProfilePage() {
  const router = useRouter()
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [profile, setProfile] = useState<Profile | null>(null)
  const [prenom, setPrenom] = useState('')
  const [nom, setNom] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [message, setMessage] = useState<string | null>(null)

  useEffect(() => {
    loadProfile()
  }, [])

  const loadProfile = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser()

      if (!user) {
        router.push('/login')
        return
      }

      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single()

      if (error) throw error

      setProfile(data)
      setPrenom(data.prenom)
      setNom(data.nom || '')
    } catch (error) {
      console.error('Erreur:', error)
      setError('Impossible de charger le profil')
    } finally {
      setLoading(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSaving(true)
    setError(null)
    setMessage(null)

    try {
      if (!prenom.trim()) {
        throw new Error('Le prénom est obligatoire')
      }

      if (prenom === profile?.prenom && nom === (profile?.nom || '')) {
        throw new Error('Aucune modification détectée')
      }

      const { error: updateError } = await supabase
        .from('profiles')
        .update({
          prenom: prenom.trim(),
          nom: nom.trim() || null,
          updated_at: new Date().toISOString()
        })
        .eq('id', profile?.id)

      if (updateError) throw updateError

      // Logger la modification du profil avec user_id
      const { data: { user } } = await supabase.auth.getUser()
      if (user) {
        await supabase
          .from('security_logs')
          .insert({
            user_id: user.id,
            action: 'profile_update',
            user_agent: navigator.userAgent,
            details: {
              fields: ['prenom', 'nom'],
              old_prenom: profile?.prenom,
              new_prenom: prenom.trim(),
              old_nom: profile?.nom || '',
              new_nom: nom.trim() || null
            }
          })
      }

      setMessage('Profil mis à jour avec succès !')

      setTimeout(() => {
        router.push('/profile')
      }, 2000)

    } catch (error: any) {
      setError(error.message || 'Une erreur est survenue')
    } finally {
      setSaving(false)
    }
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
          <div style={{ fontSize: '2rem', marginBottom: '1rem', textAlign: 'center' }}>👤</div>
          <p style={{ color: '#6b7280' }}>Chargement...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="page-container">
      <div className="form-header">
        <Link href="/profile" className="back-link-spiritual">
          <ArrowLeft size={20} />
          <span>Retour au profil</span>
        </Link>
        <div className="form-title-section">
          <div className="page-icon-wrapper" style={{
            background: 'linear-gradient(135deg, #E0E7FF, #C7D2FE)'
          }}>
            <User size={32} style={{ color: '#4338CA' }} />
          </div>
          <h1 className="form-title">Modifier mes informations</h1>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="spiritual-form">
        {error && (
          <div className="alert-error-spiritual">
            <span>⚠️</span>
            {error}
          </div>
        )}

        {message && (
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '0.75rem',
            padding: '1rem 1.5rem',
            background: '#D1FAE5',
            color: '#047857',
            borderRadius: '0.5rem',
            marginBottom: '1.5rem',
            border: '1px solid #A7F3D0'
          }}>
            <span>✅</span>
            {message}
          </div>
        )}

        <div className="form-card">
          <div className="form-grid">
            <div className="form-section-spiritual">
              <label htmlFor="prenom" className="form-label">
                Prénom *
              </label>
              <input
                type="text"
                id="prenom"
                value={prenom}
                onChange={(e) => setPrenom(e.target.value)}
                required
                placeholder="Marie"
                className="input-spiritual"
              />
            </div>

            <div className="form-section-spiritual">
              <label htmlFor="nom" className="form-label">
                Nom
              </label>
              <input
                type="text"
                id="nom"
                value={nom}
                onChange={(e) => setNom(e.target.value)}
                placeholder="Dupont"
                className="input-spiritual"
              />
            </div>
          </div>

          <div className="form-section-spiritual">
            <label className="form-label">
              Email
            </label>
            <input
              type="email"
              value={profile?.email || ''}
              disabled
              className="input-spiritual"
              style={{
                background: '#F3F4F6',
                color: '#9CA3AF',
                cursor: 'not-allowed'
              }}
            />
            <p style={{
              fontSize: '0.75rem',
              color: '#6B7280',
              marginTop: '0.25rem'
            }}>
              Vous ne pouvez pas changer votre email dans ce champs mais dans la page prévue pour cela.
            </p>
          </div>
        </div>

        <div className="form-actions-spiritual">
          <Link href="/profile" className="btn-secondary-spiritual">
            Annuler
          </Link>
          <button
            type="submit"
            disabled={saving}
            className="btn-primary-spiritual"
            style={{
              background: saving ? '#9CA3AF' : '#4338CA'
            }}
          >
            {saving ? (
              <>
                <div className="spinner"></div>
                Enregistrement...
              </>
            ) : (
              <>
                <Save size={20} />
                Enregistrer les modifications
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  )
}
