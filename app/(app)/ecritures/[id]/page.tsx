'use client'

import { use, useState, useEffect } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { supabase } from '@/app/lib/supabase'
import { Calendar, Book, Heart, User, Sparkles, Edit, Trash2, ArrowLeft, Tag, LinkIcon } from 'lucide-react'
import { format } from 'date-fns'
import { fr } from 'date-fns/locale'
import LinksList from '@/app/components/LinksList'
import { loadUserSpiritualLinks } from '@/app/lib/spiritual-links-helpers'
import FiorettiButton from '@/app/components/FiorettiButton'

interface Ecriture {
  id: string
  reference: string
  texte_complet: string
  traduction: string
  contexte: string
  date_reception: string
  ce_qui_ma_touche: string | null
  pour_qui: string
  fruits: string[] | null
  created_at: string
}

const contexteLabels: Record<string, string> = {
  messe: 'Messe',
  lectio: 'Lectio Divina',
  retraite: 'Retraite',
  groupe: 'Groupe de prière',
  personnel: 'Personnel'
}

export default function EcritureDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = use(params)
  const router = useRouter()
  const [ecriture, setEcriture] = useState<Ecriture | null>(null)
  const [loading, setLoading] = useState(true)
  const [deleting, setDeleting] = useState(false)
  const [spiritualLinks, setSpiritualLinks] = useState<any[]>([])
  const [allEntries, setAllEntries] = useState<any[]>([])

  useEffect(() => {
    fetchEcriture()
  }, [resolvedParams.id])

  const fetchEcriture = async () => {
    try {
      const { data, error } = await supabase
        .from('paroles_ecriture')
        .select('*')
        .eq('id', resolvedParams.id)
        .single()

      if (error) throw error
      setEcriture(data)

      // Charger les liens spirituels
      const { data: { user } } = await supabase.auth.getUser()
      if (user?.id) {
        loadUserSpiritualLinks(user.id).then(setSpiritualLinks)
        loadAllEntries(user.id).then(setAllEntries)
      }
    } catch (error) {
      console.error('Erreur:', error)
      router.push('/ecritures')
    } finally {
      setLoading(false)
    }
  }

  const loadAllEntries = async (userId: string) => {
    const allEntriesData: any[] = []

    const tables = [
      { name: 'graces', type: 'grace' },
      { name: 'prieres', type: 'priere' },
      { name: 'paroles_ecriture', type: 'ecriture' },
      { name: 'paroles_connaissance', type: 'parole' },
      { name: 'rencontres_missionnaires', type: 'rencontre' }
    ]

    for (const table of tables) {
      const { data } = await supabase
        .from(table.name)
        .select('*')
        .eq('user_id', userId)

      if (data) {
        allEntriesData.push(...data.map(item => ({ ...item, type: table.type })))
      }
    }

    return allEntriesData
  }

  const handleDelete = async () => {
    if (!confirm('Êtes-vous sûr de vouloir supprimer ce passage biblique ?')) return

    setDeleting(true)
    try {
      const { error } = await supabase
        .from('paroles_ecriture')
        .delete()
        .eq('id', resolvedParams.id)

      if (error) throw error
      router.push('/ecritures')
    } catch (error) {
      console.error('Erreur:', error)
      alert('Erreur lors de la suppression')
    } finally {
      setDeleting(false)
    }
  }

  // Hooks doivent être appelés avant tout return conditionnel
  const [formattedEcritureContent, setFormattedEcritureContent] = useState('');

  useEffect(() => {
    if (!ecriture || loading) return;

    const lines = [];

    // Référence et texte
    lines.push(`📖 ${ecriture.reference}`);
    lines.push('');
    lines.push(`« ${ecriture.texte_complet} »`);
    lines.push('');

    // Date et contexte
    lines.push(`📅 Reçu le ${format(new Date(ecriture.date_reception), 'd MMMM yyyy', { locale: fr })} • ${contexteLabels[ecriture.contexte] || ecriture.contexte}`);
    lines.push('');

    // Ce qui m'a touché
    if (ecriture.ce_qui_ma_touche) {
      lines.push('💡 Ce qui m\'a touché');
      lines.push(ecriture.ce_qui_ma_touche);
      lines.push('');
    }

    // Fruits spirituels
    if (ecriture.fruits && ecriture.fruits.length > 0) {
      lines.push('✨ Fruits spirituels');
      lines.push(ecriture.fruits.join(', '));
    }

    setFormattedEcritureContent(lines.join('\n'));
  }, [ecriture, loading]);

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
            margin: '0 auto 1rem'
          }}>📖</div>
          <p style={{ color: '#064E3B' }}>Chargement...</p>
        </div>
      </div>
    )
  }

  if (!ecriture) return null

  return (
    <div style={{
      minHeight: '100vh',
      padding: '2rem 1rem'
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
            {/* Bouton retour vers le module */}
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

            <div style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'flex-start',
              gap: '1rem'
            }}>
              <div style={{
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
                <div>
                  <h1 style={{
                    fontSize: '1.75rem',
                    fontWeight: 'bold',
                    marginBottom: '0.25rem'
                  }}>
                    {ecriture.reference}
                  </h1>
                  <p style={{
                    fontSize: '0.875rem',
                    opacity: 0.8
                  }}>
                    {ecriture.traduction}
                  </p>
                </div>
              </div>

              <div style={{
                display: 'flex',
                gap: '0.5rem'
              }}>
                <Link
                  href={`/ecritures/${ecriture.id}/modifier`}
                  style={{
                    background: 'white',
                    color: '#064E3B',
                    padding: '0.5rem',
                    borderRadius: '0.5rem',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    textDecoration: 'none',
                    boxShadow: '0 2px 4px rgba(0, 0, 0, 0.1)',
                    transition: 'all 0.2s'
                  }}
                  title="Modifier"
                >
                  <Edit size={20} />
                </Link>
                <button
                  onClick={handleDelete}
                  disabled={deleting}
                  style={{
                    background: 'white',
                    color: '#EF4444',
                    padding: '0.5rem',
                    borderRadius: '0.5rem',
                    border: 'none',
                    cursor: deleting ? 'not-allowed' : 'pointer',
                    opacity: deleting ? 0.5 : 1,
                    boxShadow: '0 2px 4px rgba(0, 0, 0, 0.1)',
                    transition: 'all 0.2s'
                  }}
                  title="Supprimer"
                >
                  <Trash2 size={20} />
                </button>
              </div>
            </div>
          </div>

          {/* Contenu */}
          <div style={{ padding: '2rem' }}>
            {/* Texte biblique */}
            <div style={{
              background: '#F0FDF4',
              border: '2px solid #D1FAE5',
              borderRadius: '0.75rem',
              padding: '1.5rem',
              marginBottom: '2rem'
            }}>
              <p style={{
                fontSize: '1.25rem',
                lineHeight: '1.8',
                color: '#1F2937',
                fontFamily: 'Georgia, serif',
                fontStyle: 'italic',
                whiteSpace: 'pre-line'
              }}>
                {ecriture.texte_complet}
              </p>
            </div>

            {/* Ce qui m'a touché */}
            {ecriture.ce_qui_ma_touche && (
              <div style={{
                background: '#FEF3C7',
                borderRadius: '0.75rem',
                padding: '1.5rem',
                marginBottom: '2rem'
              }}>
                <div style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.5rem',
                  marginBottom: '0.75rem',
                  color: '#78350F'
                }}>
                  <Heart size={20} />
                  <h3 style={{
                    fontSize: '1.125rem',
                    fontWeight: '600',
                    margin: 0
                  }}>
                    Ce qui m'a touché
                  </h3>
                </div>
                <p style={{
                  color: '#92400E',
                  lineHeight: '1.6'
                }}>
                  {ecriture.ce_qui_ma_touche}
                </p>
              </div>
            )}

            {/* Métadonnées */}
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
              gap: '1rem',
              marginBottom: '2rem'
            }}>
              <div style={{
                background: '#F0FDF4',
                borderRadius: '0.75rem',
                padding: '1rem'
              }}>
                <div style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.5rem',
                  marginBottom: '0.5rem',
                  color: '#047857'
                }}>
                  <Calendar size={20} />
                  <span style={{ fontWeight: '500' }}>Date de réception</span>
                </div>
                <p style={{ color: '#064E3B', fontSize: '1.125rem' }}>
                  {format(new Date(ecriture.date_reception), 'd MMMM yyyy', { locale: fr })}
                </p>
              </div>

              <div style={{
                background: '#F0FDF4',
                borderRadius: '0.75rem',
                padding: '1rem'
              }}>
                <div style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.5rem',
                  marginBottom: '0.5rem',
                  color: '#047857'
                }}>
                  <Book size={20} />
                  <span style={{ fontWeight: '500' }}>Contexte</span>
                </div>
                <p style={{ color: '#064E3B', fontSize: '1.125rem' }}>
                  {contexteLabels[ecriture.contexte] || ecriture.contexte}
                </p>
              </div>

              <div style={{
                background: '#F0FDF4',
                borderRadius: '0.75rem',
                padding: '1rem'
              }}>
                <div style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.5rem',
                  marginBottom: '0.5rem',
                  color: '#047857'
                }}>
                  <User size={20} />
                  <span style={{ fontWeight: '500' }}>Pour</span>
                </div>
                <p style={{ color: '#064E3B', fontSize: '1.125rem' }}>
                  {ecriture.pour_qui || 'Moi'}
                </p>
              </div>
            </div>

            {/* Fruits spirituels */}
            {ecriture.fruits && ecriture.fruits.length > 0 && (
              <div>
                <h3 style={{
                  fontSize: '1.125rem',
                  fontWeight: '600',
                  color: '#064E3B',
                  marginBottom: '1rem',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.5rem'
                }}>
                  <Sparkles size={20} />
                  Fruits spirituels
                </h3>
                <div style={{
                  display: 'flex',
                  gap: '0.75rem',
                  flexWrap: 'wrap'
                }}>
                  {ecriture.fruits.map(fruit => (
                    <span
                      key={fruit}
                      style={{
                        background: '#A7F3D0',
                        color: '#064E3B',
                        padding: '0.5rem 1rem',
                        borderRadius: '2rem',
                        fontSize: '0.875rem',
                        fontWeight: '500',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '0.25rem'
                      }}
                    >
                      <Tag size={14} />
                      {fruit}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* Citation en bas */}
            <div style={{
              marginTop: '3rem',
              padding: '1.5rem',
              background: '#F0FDF4',
              borderRadius: '0.75rem',
              textAlign: 'center',
              borderLeft: '4px solid #6EE7B7'
            }}>
              <p style={{
                fontSize: '1rem',
                color: '#064E3B',
                fontStyle: 'italic',
                marginBottom: '0.5rem'
              }}>
                « Ta parole est une lampe à mes pieds, une lumière sur ma route. »
              </p>
              <p style={{
                fontSize: '0.875rem',
                color: '#047857'
              }}>
                Psaume 119, 105
              </p>
            </div>

            {/* Actions de partage */}
            <div style={{
              marginTop: '2rem',
              display: 'flex',
              justifyContent: 'center'
            }}>
              <FiorettiButton
                element={ecriture}
                elementType="ecriture"
                formattedContent={formattedEcritureContent}
              />
            </div>
          </div>
        </div>

        {/* Section Connexions spirituelles */}
        {spiritualLinks.filter(link =>
          link.element_source_id === ecriture.id ||
          link.element_cible_id === ecriture.id
        ).length > 0 && (
            <>
              {/* Espace de respiration */}
              <div style={{ height: '2rem' }} />

              {/* Container connexions */}
              <div style={{ maxWidth: '800px', margin: '0 auto' }}>
                <div style={{
                  background: 'white',
                  borderRadius: '1rem',
                  overflow: 'hidden',
                  boxShadow: '0 2px 8px rgba(0, 0, 0, 0.08)',
                  border: '1px solid rgba(16, 185, 129, 0.1)'
                }}>
                  {/* Barre supérieure décorative */}
                  <div style={{
                    height: '4px',
                    background: 'linear-gradient(90deg, #A7F3D0 0%, #6EE7B7 50%, #A7F3D0 100%)'
                  }} />

                  <div style={{
                    padding: '1.5rem',
                    background: '#F0FDF4'
                  }}>
                    <h3 style={{
                      fontSize: '1.2rem',
                      fontWeight: '600',
                      color: '#064E3B',
                      marginBottom: '1rem',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '0.5rem'
                    }}>
                      🔗 Connexions spirituelles
                    </h3>

                    <LinksList
                      entryId={ecriture.id}
                      links={spiritualLinks}
                      entries={allEntries}
                      onViewEntry={(entryId) => {
                        const entry = allEntries.find(e => e.id === entryId)
                        if (entry) {
                          router.push(`/${entry.type}s/${entry.id}`)
                        }
                      }}
                      onDeleteLink={async (linkId) => {
                        const { error } = await supabase
                          .from('liens_spirituels')
                          .delete()
                          .eq('id', linkId)

                        if (!error) {
                          const { data: { user } } = await supabase.auth.getUser()
                          if (user?.id) {
                            const updatedLinks = await loadUserSpiritualLinks(user.id)
                            setSpiritualLinks(updatedLinks)
                          }
                        }
                      }}
                    />

                    <button
                      onClick={() => router.push(`/relecture?mode=atelier&source=${ecriture.id}&sourceType=ecriture`)}
                      style={{
                        marginTop: '1rem',
                        padding: '0.75rem 1.5rem',
                        background: '#10B981',
                        color: 'white',
                        border: 'none',
                        borderRadius: '0.5rem',
                        cursor: 'pointer',
                        fontSize: '0.875rem',
                        fontWeight: '500',
                        transition: 'all 0.2s',
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '0.5rem'
                      }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.background = '#059669'
                        e.currentTarget.style.transform = 'translateY(-2px)'
                        e.currentTarget.style.boxShadow = '0 4px 12px rgba(16, 185, 129, 0.3)'
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.background = '#10B981'
                        e.currentTarget.style.transform = 'translateY(0)'
                        e.currentTarget.style.boxShadow = 'none'
                      }}
                    >
                      <LinkIcon size={16} />
                      Créer une nouvelle connexion
                    </button>
                  </div>
                </div>
              </div>
            </>
          )}
      </div>
    </div>
  )
}