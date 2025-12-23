'use client'

import { use, useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { supabase } from '@/app/lib/supabase'
import { Calendar, MapPin, Tag, ArrowLeft, Sparkles, Save } from 'lucide-react'

interface Grace {
  id: string
  texte: string
  date: string
  lieu: string | null
  tags: string[]
  visibilite: string
  statut_partage: string
}

export default function ModifierGracePage({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = use(params)
  const router = useRouter()
  const [grace, setGrace] = useState<Grace | null>(null)
  const [texte, setTexte] = useState('')
  const [date, setDate] = useState('')
  const [lieu, setLieu] = useState('')
  const [tagInput, setTagInput] = useState('')
  const [tags, setTags] = useState<string[]>([])

  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    fetchGrace()
  }, [resolvedParams.id])

  const fetchGrace = async () => {
    try {
      const { data, error } = await supabase
        .from('graces')
        .select('*')
        .eq('id', resolvedParams.id)
        .single()

      if (error) throw error

      setGrace(data)
      setTexte(data.texte)
      setDate(data.date)
      setLieu(data.lieu || '')
      setTags(data.tags || [])
    } catch (error) {
      console.error('Erreur:', error)
      router.push('/graces')
    } finally {
      setLoading(false)
    }
  }

  const handleAddTag = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && tagInput.trim()) {
      e.preventDefault()
      if (!tags.includes(tagInput.trim())) {
        setTags([...tags, tagInput.trim()])
      }
      setTagInput('')
    }
  }

  const removeTag = (tagToRemove: string) => {
    setTags(tags.filter(tag => tag !== tagToRemove))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!texte.trim()) {
      setError('Veuillez décrire la grâce reçue')
      return
    }

    setSaving(true)
    setError('')

    try {
      const { error } = await supabase
        .from('graces')
        .update({
          texte: texte.trim(),
          date,
          lieu: lieu.trim() || null,
          tags
        })
        .eq('id', resolvedParams.id)

      if (error) throw error

      router.push(`/graces/${resolvedParams.id}`)
    } catch (error) {
      console.error('Erreur:', error)
      setError('Une erreur est survenue lors de la modification')
    } finally {
      setSaving(false)
    }
  }

  if (loading) {
    return (
      <div style={{
        minHeight: '100vh',
        backgroundColor: '#FFFBEB',
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
          <div style={{ fontSize: '2rem', marginBottom: '1rem', textAlign: 'center' }}>✨</div>
          <p style={{ color: '#78350F' }}>Chargement...</p>
        </div>
      </div>
    )
  }

  if (!grace) return null

  return (
    <div style={{
      minHeight: '100vh',
      backgroundColor: '#FFFBEB',
      padding: '2rem 1rem'
    }}>
      <div style={{ maxWidth: '800px', margin: '0 auto' }}>
        <div style={{
          background: 'white',
          borderRadius: '1rem',
          boxShadow: '0 4px 6px rgba(0, 0, 0, 0.05)',
          overflow: 'hidden'
        }}>
          {/* En-tête jaune pastel */}
          <div style={{
            background: 'linear-gradient(135deg, #FEF3C7, #FDE68A)',
            padding: '2rem',
            color: '#78350F'
          }}>
            <Link href={`/graces/${resolvedParams.id}`} style={{
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
              Retour à la grâce
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
                Modifier la grâce
              </h1>
            </div>
          </div>

          {/* Formulaire */}
          <form onSubmit={handleSubmit} style={{ padding: '2rem' }}>
            {error && (
              <div style={{
                background: '#FEE2E2',
                color: '#991B1B',
                padding: '1rem',
                borderRadius: '0.5rem',
                marginBottom: '1.5rem'
              }}>
                {error}
              </div>
            )}

            {/* Texte de la grâce */}
            <div style={{ marginBottom: '1.5rem' }}>
              <label style={{
                display: 'block',
                marginBottom: '0.5rem',
                fontWeight: '500',
                color: '#78350F'
              }}>
                Description de la grâce
              </label>
              <textarea
                value={texte}
                onChange={(e) => setTexte(e.target.value)}
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
              />
            </div>

            {/* Date et lieu */}
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
              gap: '1rem',
              marginBottom: '1.5rem'
            }}>
              <div>
                <label style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.5rem',
                  marginBottom: '0.5rem',
                  fontWeight: '500',
                  color: '#78350F'
                }}>
                  <Calendar size={20} />
                  Date
                </label>
                <input
                  type="date"
                  value={date}
                  onChange={(e) => setDate(e.target.value)}
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
                <label style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.5rem',
                  marginBottom: '0.5rem',
                  fontWeight: '500',
                  color: '#78350F'
                }}>
                  <MapPin size={20} />
                  Lieu (optionnel)
                </label>
                <input
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

            {/* Tags */}
            <div style={{ marginBottom: '1.5rem' }}>
              <label style={{
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem',
                marginBottom: '0.5rem',
                fontWeight: '500',
                color: '#78350F'
              }}>
                <Tag size={20} />
                Tags (optionnel)
              </label>
              <input
                type="text"
                value={tagInput}
                onChange={(e) => setTagInput(e.target.value)}
                onKeyDown={handleAddTag}
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
                placeholder="Appuyez sur Entrée pour ajouter un tag"
              />
              {tags.length > 0 && (
                <div style={{
                  display: 'flex',
                  gap: '0.5rem',
                  flexWrap: 'wrap',
                  marginTop: '0.75rem'
                }}>
                  {tags.map(tag => (
                    <span
                      key={tag}
                      style={{
                        background: '#FEF3C7',
                        color: '#78350F',
                        padding: '0.25rem 0.75rem',
                        borderRadius: '1rem',
                        fontSize: '0.875rem',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '0.5rem'
                      }}
                    >
                      {tag}
                      <button
                        type="button"
                        onClick={() => removeTag(tag)}
                        style={{
                          background: 'none',
                          border: 'none',
                          color: '#92400E',
                          cursor: 'pointer',
                          padding: '0',
                          fontSize: '1.25rem',
                          lineHeight: '1'
                        }}
                      >
                        ×
                      </button>
                    </span>
                  ))}
                </div>
              )}
            </div>

            {/* Boutons */}
            <div style={{
              display: 'flex',
              gap: '1rem',
              justifyContent: 'flex-end'
            }}>
              <Link
                href={`/graces/${resolvedParams.id}`}
                style={{
                  padding: '0.75rem 1.5rem',
                  borderRadius: '0.5rem',
                  border: '2px solid #FDE68A',
                  color: '#78350F',
                  textDecoration: 'none',
                  fontWeight: '500',
                  transition: 'all 0.2s',
                  display: 'inline-block',
                  backgroundColor: 'transparent'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.backgroundColor = '#FEF3C7'
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.backgroundColor = 'transparent'
                }}
              >
                Annuler
              </Link>

              <button
                type="submit"
                disabled={saving}
                style={{
                  padding: '0.75rem 1.5rem',
                  borderRadius: '0.5rem',
                  background: '#FCD34D',
                  color: '#78350F',
                  border: 'none',
                  fontWeight: '500',
                  cursor: saving ? 'not-allowed' : 'pointer',
                  opacity: saving ? 0.7 : 1,
                  transition: 'all 0.2s',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.5rem',
                  boxShadow: '0 2px 4px rgba(0, 0, 0, 0.1)',
                  transform: 'translateY(0)'
                }}
                onMouseEnter={(e) => {
                  if (!saving) {
                    e.currentTarget.style.transform = 'translateY(-1px)'
                    e.currentTarget.style.boxShadow = '0 4px 8px rgba(0, 0, 0, 0.15)'
                  }
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.transform = 'translateY(0)'
                  e.currentTarget.style.boxShadow = '0 2px 4px rgba(0, 0, 0, 0.1)'
                }}
              >
                <Save size={20} />
                {saving ? 'Enregistrement...' : 'Enregistrer les modifications'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  )
}