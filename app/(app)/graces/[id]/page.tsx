'use client'

import { use, useState, useEffect } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { supabase } from '@/app/lib/supabase'
import { Calendar, MapPin, Tag, Edit, Trash2, ArrowLeft, Sparkles, LinkIcon } from 'lucide-react'
import { format } from 'date-fns'
import { fr } from 'date-fns/locale'
import LinksList from '@/app/components/LinksList'
import { loadUserSpiritualLinks } from '@/app/lib/spiritual-links-helpers'
import FiorettiButton from '@/app/components/FiorettiButton'

interface Grace {
  id: string
  texte: string
  date: string
  lieu: string | null
  tags: string[]
  visibilite: string
  statut_partage: string
  created_at: string
}

export default function GraceDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = use(params)
  const router = useRouter()
  const [grace, setGrace] = useState<Grace | null>(null)
  const [loading, setLoading] = useState(true)
  const [deleting, setDeleting] = useState(false)
  const [spiritualLinks, setSpiritualLinks] = useState<any[]>([])
  const [allEntries, setAllEntries] = useState<any[]>([])

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

      // Charger les liens spirituels
      const { data: { user } } = await supabase.auth.getUser()
      if (user?.id) {
        loadUserSpiritualLinks(user.id).then(setSpiritualLinks)
        loadAllEntries(user.id).then(setAllEntries)
      }
    } catch (error) {
      console.error('Erreur:', error)
      router.push('/graces')
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
    if (!confirm('Êtes-vous sûr de vouloir supprimer cette grâce ?')) return

    setDeleting(true)
    try {
      const { error } = await supabase
        .from('graces')
        .delete()
        .eq('id', resolvedParams.id)

      if (error) throw error
      router.push('/graces')
    } catch (error) {
      console.error('Erreur:', error)
      alert('Erreur lors de la suppression')
    } finally {
      setDeleting(false)
    }
  }

  // Hooks doivent être appelés avant tout return conditionnel
  const [formattedGraceContent, setFormattedGraceContent] = useState('');

  useEffect(() => {
    if (!grace || loading) return;

    const lines = [];

    // Titre
    lines.push(`✨ Grâce reçue`);
    lines.push('');

    // Texte principal
    lines.push(grace.texte);
    lines.push('');

    // Date et lieu
    lines.push(`📅 ${format(new Date(grace.date), 'd MMMM yyyy', { locale: fr })}`);
    if (grace.lieu) {
      lines.push(`📍 ${grace.lieu}`);
    }

    // Tags
    if (grace.tags && grace.tags.length > 0) {
      lines.push('');
      lines.push(`🏷️ ${grace.tags.join(' • ')}`);
    }

    setFormattedGraceContent(lines.join('\n'));
  }, [grace, loading]);

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
            {/* Bouton retour vers le module */}
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
            }}>
              <ArrowLeft size={16} />
              Retour aux grâces
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
                  ✨
                </div>
                <div>
                  <h1 style={{
                    fontSize: '2rem',
                    fontWeight: 'bold',
                    marginBottom: '0.25rem',
                    color: '#78350F'
                  }}>
                    Grâce reçue
                  </h1>
                  <p style={{
                    fontSize: '0.875rem',
                    opacity: 0.8,
                    color: '#92400E'
                  }}>
                    {format(new Date(grace.created_at), 'EEEE d MMMM yyyy', { locale: fr })}
                  </p>
                </div>
              </div>

              <div style={{
                display: 'flex',
                gap: '0.5rem'
              }}>
                <Link
                  href={`/graces/${grace.id}/modifier`}
                  style={{
                    background: 'white',
                    color: '#78350F',
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
            {/* Texte principal */}
            <div style={{
              background: '#FFFEF7',
              border: '2px solid #FEF3C7',
              borderRadius: '0.75rem',
              padding: '1.5rem',
              marginBottom: '2rem'
            }}>
              <p style={{
                fontSize: '1.25rem',
                lineHeight: '1.8',
                color: '#1F2937',
                fontStyle: 'italic'
              }}>
                « {grace.texte} »
              </p>
            </div>

            {/* Métadonnées */}
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
              gap: '1.5rem',
              marginBottom: '2rem'
            }}>
              <div style={{
                background: '#FEF3C7',
                borderRadius: '0.75rem',
                padding: '1rem'
              }}>
                <div style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.5rem',
                  marginBottom: '0.5rem',
                  color: '#92400E'
                }}>
                  <Calendar size={20} />
                  <span style={{ fontWeight: '500' }}>Date</span>
                </div>
                <p style={{ color: '#78350F', fontSize: '1.125rem' }}>
                  {format(new Date(grace.date), 'd MMMM yyyy', { locale: fr })}
                </p>
              </div>

              {grace.lieu && (
                <div style={{
                  background: '#FEF3C7',
                  borderRadius: '0.75rem',
                  padding: '1rem'
                }}>
                  <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.5rem',
                    marginBottom: '0.5rem',
                    color: '#92400E'
                  }}>
                    <MapPin size={20} />
                    <span style={{ fontWeight: '500' }}>Lieu</span>
                  </div>
                  <p style={{ color: '#78350F', fontSize: '1.125rem' }}>
                    {grace.lieu}
                  </p>
                </div>
              )}


            </div>

            {/* Tags */}
            {grace.tags && grace.tags.length > 0 && (
              <div>
                <h3 style={{
                  fontSize: '1.125rem',
                  fontWeight: '600',
                  color: '#78350F',
                  marginBottom: '1rem',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.5rem'
                }}>
                  <Tag size={20} />
                  Tags
                </h3>
                <div style={{
                  display: 'flex',
                  gap: '0.75rem',
                  flexWrap: 'wrap'
                }}>
                  {grace.tags.map(tag => (
                    <span
                      key={tag}
                      style={{
                        background: '#FDE68A',
                        color: '#78350F',
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
                      {tag}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* Actions de partage */}
            <div style={{
              marginTop: '2rem',
              display: 'flex',
              justifyContent: 'center'
            }}>
              <FiorettiButton
                element={grace}
                elementType="grace"
                formattedContent={formattedGraceContent}
              />
            </div>
          </div>
        </div>

        {/* Section Connexions spirituelles */}
        {spiritualLinks.filter(link =>
          link.element_source_id === grace.id ||
          link.element_cible_id === grace.id
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
                  border: '1px solid rgba(245, 158, 11, 0.1)'
                }}>
                  {/* Barre supérieure décorative */}
                  <div style={{
                    height: '4px',
                    background: 'linear-gradient(90deg, #FDE68A 0%, #FCD34D 50%, #FDE68A 100%)'
                  }} />

                  <div style={{
                    padding: '1.5rem',
                    background: '#FFFBEB'
                  }}>
                    <h3 style={{
                      fontSize: '1.2rem',
                      fontWeight: '600',
                      color: '#78350F',
                      marginBottom: '1rem',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '0.5rem'
                    }}>
                      🔗 Connexions spirituelles
                    </h3>

                    <LinksList
                      entryId={grace.id}
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
                      onClick={() => router.push(`/relecture?mode=atelier&source=${grace.id}&sourceType=grace`)}
                      style={{
                        marginTop: '1rem',
                        padding: '0.75rem 1.5rem',
                        background: '#F59E0B',
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
                        e.currentTarget.style.background = '#D97706'
                        e.currentTarget.style.transform = 'translateY(-2px)'
                        e.currentTarget.style.boxShadow = '0 4px 12px rgba(245, 158, 11, 0.3)'
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.background = '#F59E0B'
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
