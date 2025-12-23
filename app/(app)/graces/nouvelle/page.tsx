'use client'

import { useState } from 'react'
import { supabase } from '@/app/lib/supabase'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { ArrowLeft, Sparkles } from 'lucide-react'

export default function NouvelleGracePage() {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const [texte, setTexte] = useState('')
  const [date, setDate] = useState(new Date().toISOString().split('T')[0])
  const [lieu, setLieu] = useState('')
  const [tags, setTags] = useState('')


  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError(null)

    try {
      const { data: { user } } = await supabase.auth.getUser()

      if (!user) {
        router.push('/login')
        return
      }

      const tagsArray = tags
        .split(',')
        .map(tag => tag.trim())
        .filter(tag => tag.length > 0)

      const { error } = await supabase
        .from('graces')
        .insert({
          user_id: user.id,
          texte,
          date,
          lieu: lieu || null,
          tags: tagsArray,
          visibilite: 'prive',
          statut_partage: 'brouillon'
        })

      if (error) throw error

      router.push('/graces')
    } catch (error: any) {
      setError(error.message || 'Une erreur est survenue')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div style={{
      minHeight: '100vh',
      backgroundColor: '#FFFBEB',
      padding: '2rem 1rem'
    }}>
      <div style={{ maxWidth: '800px', margin: '0 auto' }}>
        <div style={{
          background: 'linear-gradient(135deg, #FEF3C7, #FDE68A)',
          borderRadius: '1rem',
          padding: '2rem',
          marginBottom: '2rem',
          boxShadow: '0 4px 6px rgba(0, 0, 0, 0.05)'
        }}>
          <Link href="/graces" style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '0.5rem',
            color: '#78350F',
            textDecoration: 'none',
            marginBottom: '1rem',
            fontSize: '0.875rem',
            opacity: 0.8,
            transition: 'opacity 0.2s'
          }}
            onMouseEnter={(e) => e.currentTarget.style.opacity = '1'}
            onMouseLeave={(e) => e.currentTarget.style.opacity = '0.8'}>
            <ArrowLeft size={16} />
            Retour aux grâces
          </Link>

          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '1rem'
          }}>
            <div style={{
              background: 'white',
              width: '60px',
              height: '60px',
              borderRadius: '50%',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '2rem',
              boxShadow: '0 2px 4px rgba(0, 0, 0, 0.1)'
            }}>
              ✨
            </div>
            <h1 style={{
              fontSize: '2rem',
              fontWeight: 'bold',
              color: '#78350F'
            }}>
              Noter une grâce reçue
            </h1>
          </div>
        </div>

        <form onSubmit={handleSubmit} style={{
          background: 'white',
          borderRadius: '1rem',
          padding: '2rem',
          boxShadow: '0 2px 4px rgba(0, 0, 0, 0.05)'
        }}>
          {error && (
            <div style={{
              background: '#FEE2E2',
              color: '#991B1B',
              padding: '1rem',
              borderRadius: '0.5rem',
              marginBottom: '1.5rem',
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem'
            }}>
              <span>⚠️</span>
              {error}
            </div>
          )}

          <div style={{ marginBottom: '1.5rem' }}>
            <label htmlFor="texte" style={{
              display: 'block',
              marginBottom: '0.5rem',
              fontWeight: '500',
              color: '#78350F',
              fontSize: '1rem'
            }}>
              Quelle grâce avez-vous reçue ? ✨
            </label>
            <textarea
              id="texte"
              value={texte}
              onChange={(e) => setTexte(e.target.value)}
              required
              rows={4}
              style={{
                width: '100%',
                padding: '0.75rem',
                border: '2px solid #FEF3C7',
                borderRadius: '0.5rem',
                fontSize: '1rem',
                resize: 'vertical',
                outline: 'none',
                transition: 'border-color 0.2s',
                backgroundColor: '#FFFEF7'
              }}
              onFocus={(e) => e.target.style.borderColor = '#FDE68A'}
              onBlur={(e) => e.target.style.borderColor = '#FEF3C7'}
              placeholder="Décrivez la grâce que Dieu vous a donnée..."
            />
          </div>

          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
            gap: '1rem',
            marginBottom: '1.5rem'
          }}>
            <div>
              <label htmlFor="date" style={{
                display: 'block',
                marginBottom: '0.5rem',
                fontWeight: '500',
                color: '#78350F'
              }}>
                Date
              </label>
              <input
                id="date"
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                required
                style={{
                  width: '100%',
                  padding: '0.75rem',
                  border: '2px solid #FEF3C7',
                  borderRadius: '0.5rem',
                  fontSize: '1rem',
                  outline: 'none',
                  transition: 'border-color 0.2s',
                  backgroundColor: '#FFFEF7'
                }}
                onFocus={(e) => e.target.style.borderColor = '#FDE68A'}
                onBlur={(e) => e.target.style.borderColor = '#FEF3C7'}
              />
            </div>

            <div>
              <label htmlFor="lieu" style={{
                display: 'block',
                marginBottom: '0.5rem',
                fontWeight: '500',
                color: '#78350F'
              }}>
                Lieu (optionnel)
              </label>
              <input
                id="lieu"
                type="text"
                value={lieu}
                onChange={(e) => setLieu(e.target.value)}
                style={{
                  width: '100%',
                  padding: '0.75rem',
                  border: '2px solid #FEF3C7',
                  borderRadius: '0.5rem',
                  fontSize: '1rem',
                  outline: 'none',
                  transition: 'border-color 0.2s',
                  backgroundColor: '#FFFEF7'
                }}
                onFocus={(e) => e.target.style.borderColor = '#FDE68A'}
                onBlur={(e) => e.target.style.borderColor = '#FEF3C7'}
                placeholder="Où étiez-vous ?"
              />
            </div>
          </div>

          <div style={{ marginBottom: '1.5rem' }}>
            <label htmlFor="tags" style={{
              display: 'block',
              marginBottom: '0.5rem',
              fontWeight: '500',
              color: '#78350F'
            }}>
              Étiquettes (séparées par des virgules)
            </label>
            <input
              id="tags"
              type="text"
              value={tags}
              onChange={(e) => setTags(e.target.value)}
              style={{
                width: '100%',
                padding: '0.75rem',
                border: '2px solid #FEF3C7',
                borderRadius: '0.5rem',
                fontSize: '1rem',
                outline: 'none',
                transition: 'border-color 0.2s',
                backgroundColor: '#FFFEF7'
              }}
              onFocus={(e) => e.target.style.borderColor = '#FDE68A'}
              onBlur={(e) => e.target.style.borderColor = '#FEF3C7'}
              placeholder="joie, guérison, conversion..."
            />
          </div>

          <div style={{
            display: 'flex',
            gap: '1rem',
            justifyContent: 'flex-end'
          }}>
            <Link href="/graces" style={{
              padding: '0.75rem 1.5rem',
              borderRadius: '0.5rem',
              border: '2px solid #FDE68A',
              color: '#78350F',
              textDecoration: 'none',
              fontWeight: '500',
              transition: 'all 0.2s',
              display: 'inline-block'
            }}
              onMouseEnter={(e) => {
                e.currentTarget.style.backgroundColor = '#FEF3C7'
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor = 'transparent'
              }}>
              Annuler
            </Link>

            <button
              type="submit"
              disabled={loading}
              style={{
                background: '#FCD34D',
                color: '#78350F',
                padding: '0.75rem 1.5rem',
                borderRadius: '0.5rem',
                border: 'none',
                fontWeight: '500',
                cursor: loading ? 'not-allowed' : 'pointer',
                opacity: loading ? 0.7 : 1,
                transition: 'all 0.2s',
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem',
                boxShadow: '0 2px 4px rgba(0, 0, 0, 0.1)'
              }}
              onMouseEnter={(e) => {
                if (!loading) {
                  e.currentTarget.style.transform = 'translateY(-1px)'
                  e.currentTarget.style.boxShadow = '0 4px 8px rgba(0, 0, 0, 0.15)'
                }
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = 'translateY(0)'
                e.currentTarget.style.boxShadow = '0 2px 4px rgba(0, 0, 0, 0.1)'
              }}
            >
              {loading ? (
                <>
                  <div style={{
                    width: '16px',
                    height: '16px',
                    border: '2px solid #78350F',
                    borderTopColor: 'transparent',
                    borderRadius: '50%',
                    animation: 'spin 0.8s linear infinite'
                  }}></div>
                  Enregistrement...
                </>
              ) : (
                <>
                  <Sparkles size={20} />
                  Enregistrer la grâce
                </>
              )}
            </button>
          </div>
        </form>
      </div>

      <style jsx>{`
        @keyframes spin {
          to { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  )
}
