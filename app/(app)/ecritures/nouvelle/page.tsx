'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { supabase } from '@/app/lib/supabase'
import { Calendar, Book, Heart, User, Sparkles, ArrowLeft, Plus, BookOpen } from 'lucide-react'
import BibleSearch from '@/app/components/BibleSearch'

export default function NouvelleEcriturePage() {
  const router = useRouter()
  const [reference, setReference] = useState('')
  const [texteComplet, setTexteComplet] = useState('')
  const [traduction, setTraduction] = useState('Bible de Jérusalem')
  const [contexte, setContexte] = useState<'messe' | 'lectio' | 'retraite' | 'groupe' | 'personnel'>('personnel')
  const [dateReception, setDateReception] = useState(new Date().toISOString().split('T')[0])
  const [ceQuiMaTouche, setCeQuiMaTouche] = useState('')
  const [pourQui, setPourQui] = useState('moi')
  const [fruits, setFruits] = useState('')
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')
  const [showBibleSearch, setShowBibleSearch] = useState(false)

  const contexteOptions = [
    { value: 'messe', label: 'Messe' },
    { value: 'lectio', label: 'Lectio Divina' },
    { value: 'retraite', label: 'Retraite' },
    { value: 'groupe', label: 'Groupe de prière' },
    { value: 'personnel', label: 'Personnel' }
  ]

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!reference.trim()) {
      setError('Veuillez indiquer la référence biblique')
      return
    }

    if (!texteComplet.trim()) {
      setError('Veuillez saisir le texte biblique')
      return
    }

    setSaving(true)
    setError('')

    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) throw new Error('Non authentifié')

      // Parser les fruits correctement
      const fruitsArray = fruits.trim()
        ? fruits.split(',').map(f => f.trim()).filter(f => f.length > 0)
        : []

      const insertData = {
        user_id: user.id,
        reference: reference.trim(),
        texte_complet: texteComplet.trim(),
        traduction: traduction.trim(),
        contexte,
        date_reception: dateReception,
        ce_qui_ma_touche: ceQuiMaTouche.trim() || '',
        pour_qui: pourQui.trim() || 'moi',
        fruits: fruitsArray
      }

      console.log('Données à insérer:', insertData)

      const { error } = await supabase
        .from('paroles_ecriture')
        .insert(insertData)

      if (error) {
        console.error('Erreur Supabase:', error)
        throw new Error(error.message || 'Erreur base de données')
      }

      router.push('/ecritures')
    } catch (error: any) {
      console.error('Erreur complète:', error)
      setError(error?.message || 'Une erreur est survenue lors de l\'enregistrement')
    } finally {
      setSaving(false)
    }
  }

  const handleBibleImport = ({ text, reference }: { text: string; reference: string }) => {
    // Formater le texte avec la référence à la fin
    const formattedText = `${text} (${reference})`

    setReference(reference)
    setTexteComplet(formattedText)
    setTraduction('Bible liturgique AELF')
    setShowBibleSearch(false)
  }

  return (
    <div style={{
      minHeight: '100vh', padding: '2rem 1rem'
    }}>
      <div style={{ maxWidth: '800px', margin: '0 auto' }}>
        <div style={{
          background: 'white',
          borderRadius: '1rem',
          boxShadow: '0 4px 6px rgba(0, 0, 0, 0.05)',
          overflow: 'hidden'
        }}>
          {/* En-tête vert pastel */}
          <div style={{
            background: 'linear-gradient(135deg, #D1FAE5, #A7F3D0)',
            padding: '2rem',
            color: '#064E3B'
          }}>
            <Link href="/ecritures" style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '0.5rem',
              color: '#064E3B',
              textDecoration: 'none',
              marginBottom: '1rem',
              fontSize: '0.875rem',
              opacity: 0.8,
              transition: 'opacity 0.2s'
            }}>
              <ArrowLeft size={16} />
              Retour aux écritures
            </Link>

            <h1 style={{
              fontSize: '2rem',
              fontWeight: 'bold',
              display: 'flex',
              alignItems: 'center',
              gap: '0.75rem'
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
                📖
              </div>
              Nouveau passage biblique
            </h1>
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

            {/* Référence et traduction */}
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
              gap: '1rem',
              marginBottom: '1.5rem'
            }}>
              <div>
                <label style={{
                  display: 'block',
                  marginBottom: '0.5rem',
                  fontWeight: '500',
                  color: '#064E3B'
                }}>
                  Référence biblique
                </label>
                <input
                  type="text"
                  value={reference}
                  onChange={(e) => setReference(e.target.value)}
                  placeholder="Ex: Jean 3, 16-17"
                  style={{
                    width: '100%',
                    padding: '0.75rem',
                    border: '2px solid #D1FAE5',
                    borderRadius: '0.5rem',
                    fontSize: '1rem',
                    outline: 'none',
                    transition: 'border-color 0.2s',
                    backgroundColor: '#F0FDF4',
                    fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif'
                  }}
                  onFocus={(e) => e.target.style.borderColor = '#A7F3D0'}
                  onBlur={(e) => e.target.style.borderColor = '#D1FAE5'}
                />
              </div>

              <div>
                <label style={{
                  display: 'block',
                  marginBottom: '0.5rem',
                  fontWeight: '500',
                  color: '#064E3B'
                }}>
                  Traduction
                </label>
                <input
                  type="text"
                  value={traduction}
                  onChange={(e) => setTraduction(e.target.value)}
                  placeholder="Ex: Bible de Jérusalem, TOB..."
                  style={{
                    width: '100%',
                    padding: '0.75rem',
                    border: '2px solid #D1FAE5',
                    borderRadius: '0.5rem',
                    fontSize: '1rem',
                    outline: 'none',
                    transition: 'border-color 0.2s',
                    backgroundColor: '#F0FDF4',
                    fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif'
                  }}
                  onFocus={(e) => e.target.style.borderColor = '#A7F3D0'}
                  onBlur={(e) => e.target.style.borderColor = '#D1FAE5'}
                />
              </div>
            </div>

            {/* Bouton Recherche Bible */}
            <div style={{ marginBottom: '1.5rem' }}>
              <button
                type="button"
                onClick={() => setShowBibleSearch(true)}
                style={{
                  width: '100%',
                  padding: '1rem',
                  background: '#D1FAE5',
                  border: '2px solid #A7F3D0',
                  borderRadius: '0.75rem',
                  color: '#064E3B',
                  fontWeight: '600',
                  fontSize: '1rem',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '0.75rem',
                  transition: 'all 0.2s',
                  boxShadow: '0 2px 4px rgba(0, 0, 0, 0.05)'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.background = '#A7F3D0'
                  e.currentTarget.style.transform = 'translateY(-2px)'
                  e.currentTarget.style.boxShadow = '0 4px 8px rgba(16, 185, 129, 0.2)'
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.background = '#D1FAE5'
                  e.currentTarget.style.transform = 'translateY(0)'
                  e.currentTarget.style.boxShadow = '0 2px 4px rgba(0, 0, 0, 0.05)'
                }}
              >
                <BookOpen size={24} />
                Rechercher dans la Bible AELF
              </button>
            </div>

            {/* Texte complet */}
            <div style={{ marginBottom: '1.5rem' }}>
              <label style={{
                display: 'block',
                marginBottom: '0.5rem',
                fontWeight: '500',
                color: '#064E3B'
              }}>
                Texte biblique
              </label>
              <textarea
                value={texteComplet}
                onChange={(e) => setTexteComplet(e.target.value)}
                placeholder="Copiez ou tapez le passage biblique complet..."
                rows={6}
                style={{
                  width: '100%',
                  padding: '0.75rem',
                  border: '2px solid #D1FAE5',
                  borderRadius: '0.5rem',
                  fontSize: '1rem',
                  resize: 'vertical',
                  outline: 'none',
                  transition: 'border-color 0.2s',
                  backgroundColor: '#F0FDF4',
                  fontFamily: 'Georgia, serif',
                  lineHeight: '1.6'
                }}
                onFocus={(e) => e.target.style.borderColor = '#A7F3D0'}
                onBlur={(e) => e.target.style.borderColor = '#D1FAE5'}
              />
            </div>

            {/* Contexte et date */}
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
              gap: '1rem',
              marginBottom: '1.5rem'
            }}>
              <div>
                <label style={{
                  display: 'block',
                  marginBottom: '0.5rem',
                  fontWeight: '500',
                  color: '#064E3B'
                }}>
                  Contexte de réception
                </label>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                  {contexteOptions.map(option => (
                    <label
                      key={option.value}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '0.5rem',
                        cursor: 'pointer',
                        padding: '0.5rem 0.75rem',
                        borderRadius: '0.5rem',
                        background: contexte === option.value ? '#D1FAE5' : 'transparent',
                        transition: 'all 0.2s'
                      }}
                    >
                      <input
                        type="radio"
                        name="contexte"
                        value={option.value}
                        checked={contexte === option.value}
                        onChange={(e) => setContexte(e.target.value as typeof contexte)}
                        style={{ marginRight: '0.25rem' }}
                      />
                      <span style={{ color: contexte === option.value ? '#064E3B' : '#4B5563' }}>
                        {option.label}
                      </span>
                    </label>
                  ))}
                </div>
              </div>

              <div>
                <label style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.5rem',
                  marginBottom: '0.5rem',
                  fontWeight: '500',
                  color: '#064E3B'
                }}>
                  <Calendar size={20} />
                  Date de réception
                </label>
                <input
                  type="date"
                  value={dateReception}
                  onChange={(e) => setDateReception(e.target.value)}
                  style={{
                    width: '100%',
                    padding: '0.75rem',
                    border: '2px solid #D1FAE5',
                    borderRadius: '0.5rem',
                    fontSize: '1rem',
                    outline: 'none',
                    transition: 'border-color 0.2s',
                    backgroundColor: '#F0FDF4',
                    fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif'
                  }}
                  onFocus={(e) => e.target.style.borderColor = '#A7F3D0'}
                  onBlur={(e) => e.target.style.borderColor = '#D1FAE5'}
                />
              </div>
            </div>

            {/* Ce qui m'a touché */}
            <div style={{ marginBottom: '1.5rem' }}>
              <label style={{
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem',
                marginBottom: '0.5rem',
                fontWeight: '500',
                color: '#064E3B'
              }}>
                <Heart size={20} />
                Ce qui m'a touché (optionnel)
              </label>
              <textarea
                value={ceQuiMaTouche}
                onChange={(e) => setCeQuiMaTouche(e.target.value)}
                placeholder="Qu'est-ce qui vous a particulièrement marqué dans ce passage ?"
                rows={3}
                style={{
                  width: '100%',
                  padding: '0.75rem',
                  border: '2px solid #D1FAE5',
                  borderRadius: '0.5rem',
                  fontSize: '1rem',
                  resize: 'vertical',
                  outline: 'none',
                  transition: 'border-color 0.2s',
                  backgroundColor: '#F0FDF4',
                  fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif'
                }}
                onFocus={(e) => e.target.style.borderColor = '#A7F3D0'}
                onBlur={(e) => e.target.style.borderColor = '#D1FAE5'}
              />
            </div>

            {/* Pour qui et fruits */}
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
                  color: '#064E3B'
                }}>
                  <User size={20} />
                  Pour qui ? (optionnel)
                </label>
                <input
                  type="text"
                  value={pourQui}
                  onChange={(e) => setPourQui(e.target.value)}
                  placeholder="Moi, une personne, un groupe..."
                  style={{
                    width: '100%',
                    padding: '0.75rem',
                    border: '2px solid #D1FAE5',
                    borderRadius: '0.5rem',
                    fontSize: '1rem',
                    outline: 'none',
                    transition: 'border-color 0.2s',
                    backgroundColor: '#F0FDF4',
                    fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif'
                  }}
                  onFocus={(e) => e.target.style.borderColor = '#A7F3D0'}
                  onBlur={(e) => e.target.style.borderColor = '#D1FAE5'}
                />
              </div>

              <div>
                <label style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.5rem',
                  marginBottom: '0.5rem',
                  fontWeight: '500',
                  color: '#064E3B'
                }}>
                  <Sparkles size={20} />
                  Fruits spirituels (optionnel)
                </label>
                <input
                  type="text"
                  value={fruits}
                  onChange={(e) => setFruits(e.target.value)}
                  placeholder="Paix, joie, conversion... (séparez par des virgules)"
                  style={{
                    width: '100%',
                    padding: '0.75rem',
                    border: '2px solid #D1FAE5',
                    borderRadius: '0.5rem',
                    fontSize: '1rem',
                    outline: 'none',
                    transition: 'border-color 0.2s',
                    backgroundColor: '#F0FDF4',
                    fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif'
                  }}
                  onFocus={(e) => e.target.style.borderColor = '#A7F3D0'}
                  onBlur={(e) => e.target.style.borderColor = '#D1FAE5'}
                />
              </div>
            </div>

            {/* Boutons */}
            <div style={{
              display: 'flex',
              gap: '1rem',
              justifyContent: 'flex-end'
            }}>
              <Link
                href="/ecritures"
                style={{
                  padding: '0.75rem 1.5rem',
                  borderRadius: '0.5rem',
                  border: '2px solid #A7F3D0',
                  color: '#064E3B',
                  textDecoration: 'none',
                  fontWeight: '500',
                  transition: 'all 0.2s',
                  display: 'inline-block',
                  background: 'white'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.background = '#F0FDF4'
                  e.currentTarget.style.borderColor = '#6EE7B7'
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.background = 'white'
                  e.currentTarget.style.borderColor = '#A7F3D0'
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
                  background: '#6EE7B7',
                  color: '#064E3B',
                  border: 'none',
                  fontWeight: '500',
                  cursor: saving ? 'not-allowed' : 'pointer',
                  opacity: saving ? 0.7 : 1,
                  transition: 'all 0.2s',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.5rem',
                  boxShadow: '0 2px 4px rgba(0, 0, 0, 0.1)'
                }}
                onMouseEnter={(e) => {
                  if (!saving) {
                    e.currentTarget.style.background = '#34D399'
                    e.currentTarget.style.transform = 'translateY(-1px)'
                    e.currentTarget.style.boxShadow = '0 4px 8px rgba(0, 0, 0, 0.15)'
                  }
                }}
                onMouseLeave={(e) => {
                  if (!saving) {
                    e.currentTarget.style.background = '#6EE7B7'
                    e.currentTarget.style.transform = 'translateY(0)'
                    e.currentTarget.style.boxShadow = '0 2px 4px rgba(0, 0, 0, 0.1)'
                  }
                }}
              >
                <Plus size={20} />
                {saving ? 'Enregistrement...' : 'Enregistrer le passage'}
              </button>
            </div>
          </form>
        </div>
      </div>

      {/* Modal Bible Search */}
      {showBibleSearch && (
        <BibleSearch
          onImport={handleBibleImport}
          onCancel={() => setShowBibleSearch(false)}
        />
      )}
    </div>
  )
}