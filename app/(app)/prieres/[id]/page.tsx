'use client'

import { use, useState, useEffect } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { supabase } from '@/app/lib/supabase'
import { Calendar, User, Heart, Users, HandHeart, Edit, Trash2, ArrowLeft, Plus, Clock, TrendingUp, CheckCircle, LinkIcon } from 'lucide-react'
import { format } from 'date-fns'
import { fr } from 'date-fns/locale'
import LinksList from '@/app/components/LinksList'
import { loadUserSpiritualLinks } from '@/app/lib/spiritual-links-helpers'
import FiorettiButton from '@/app/components/FiorettiButton'

interface Priere {
  id: string
  type: 'guerison' | 'freres' | 'intercession'
  personne_prenom: string
  personne_nom: string | null
  date: string
  sujet: string
  sujet_detail: string | null
  nombre_fois: number
  notes: string | null
  visibilite: string
  created_at: string
}

interface Suivi {
  id: string
  date: string
  notes: string
  evolution: string | null
  nouvelle_priere: boolean
  created_at: string
}

const typeColors = {
  guerison: {
    bg: '#FEE2E2',
    border: '#FECACA',
    text: '#991B1B',
    light: '#FEF2F2'
  },
  freres: {
    bg: '#E0E7FF',
    border: '#C7D2FE',
    text: '#3730A3',
    light: '#EEF2FF'
  },
  intercession: {
    bg: '#D1FAE5',
    border: '#A7F3D0',
    text: '#064E3B',
    light: '#ECFDF5'
  }
}

const typeLabels = {
  guerison: { label: 'Guérison', icon: Heart },
  freres: { label: 'Prière des frères', icon: Users },
  intercession: { label: 'Intercession', icon: HandHeart }
}

const evolutionLabels: Record<string, { label: string; color: string }> = {
  amelioration: { label: 'Amélioration', color: '#059669' },
  stable: { label: 'Stable', color: '#D97706' },
  aggravation: { label: 'Aggravation', color: '#DC2626' },
  gueri: { label: 'Guéri', color: '#059669' },
  guerison_partielle: { label: 'Guérison partielle', color: '#10B981' },
  paix: { label: 'Paix reçue', color: '#8B5CF6' },
  conversion: { label: 'Conversion', color: '#EC4899' },
  reconciliation: { label: 'Réconciliation', color: '#F59E0B' },
  reponse_claire: { label: 'Réponse claire', color: '#3B82F6' },
  signe_encourageant: { label: 'Signe encourageant', color: '#10B981' },
  dans_mystere: { label: 'Dans le mystère', color: '#6B7280' },
  en_cours: { label: 'En cours', color: '#6366F1' }
}

export default function PriereDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = use(params)
  const router = useRouter()
  const [priere, setPriere] = useState<Priere | null>(null)
  const [suivis, setSuivis] = useState<Suivi[]>([])
  const [loading, setLoading] = useState(true)
  const [deleting, setDeleting] = useState(false)
  const [spiritualLinks, setSpiritualLinks] = useState<any[]>([])
  const [allEntries, setAllEntries] = useState<any[]>([])

  useEffect(() => {
    fetchPriere()
  }, [resolvedParams.id])

  const fetchPriere = async () => {
    try {
      const { data: priereData, error: priereError } = await supabase
        .from('prieres')
        .select('*')
        .eq('id', resolvedParams.id)
        .single()

      if (priereError) throw priereError
      setPriere(priereData)

      const { data: suivisData, error: suivisError } = await supabase
        .from('suivis_priere')
        .select('*')
        .eq('priere_id', resolvedParams.id)
        .order('date', { ascending: false })

      if (suivisError) throw suivisError
      setSuivis(suivisData || [])

      // Charger les liens spirituels
      const { data: { user } } = await supabase.auth.getUser()
      if (user?.id) {
        loadUserSpiritualLinks(user.id).then(setSpiritualLinks)
        loadAllEntries(user.id).then(setAllEntries)
      }
    } catch (error) {
      console.error('Erreur:', error)
      router.push('/prieres')
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
    if (!confirm('Êtes-vous sûr de vouloir supprimer cette prière et tous ses suivis ?')) return

    setDeleting(true)
    try {
      const { error } = await supabase
        .from('prieres')
        .delete()
        .eq('id', resolvedParams.id)

      if (error) throw error
      router.push('/prieres')
    } catch (error) {
      console.error('Erreur:', error)
      alert('Erreur lors de la suppression')
    } finally {
      setDeleting(false)
    }
  }

  // Hooks doivent être appelés avant tout return conditionnel
  const [formattedContentForModal, setFormattedContentForModal] = useState('');
  const latestSuivi = suivis[0];

  useEffect(() => {
    if (!priere || loading) return;

    const lines = [];

    // En-tête
    lines.push(`🙏 Prière pour ${priere.personne_prenom}${priere.personne_nom ? ' ' + priere.personne_nom : ''}`);
    if (priere.sujet) lines.push(priere.sujet);
    lines.push('');

    // Date et fréquence
    lines.push(`📅 Nous prions depuis le ${format(new Date(priere.date), 'd MMMM yyyy', { locale: fr })} (${priere.nombre_fois} fois)`);
    lines.push('');

    // Contexte/Détails
    if (priere.sujet_detail) {
      lines.push('🔍 Contexte');
      lines.push(priere.sujet_detail);
      lines.push('');
    }

    // Notes personnelles
    if (priere.notes) {
      lines.push('💭 Note personnelle');
      lines.push(priere.notes);
      lines.push('');
    }

    // Tous les suivis (du plus récent au plus ancien)
    if (suivis && suivis.length > 0) {
      lines.push('📰 Évolution de la prière');
      lines.push('');

      suivis.forEach((suivi, index) => {
        const suiviDate = format(new Date(suivi.date), 'd MMMM yyyy', { locale: fr });
        lines.push(`📅 ${suiviDate}`);

        if (suivi.evolution) {
          const evoLabel = evolutionLabels[suivi.evolution]?.label;
          if (evoLabel) {
            lines.push(`✨ ${evoLabel}`);
          }
        }

        if (suivi.notes) {
          lines.push(suivi.notes);
        }

        // Séparateur entre suivis (sauf pour le dernier)
        if (index < suivis.length - 1) {
          lines.push('');
        }
      });
    }

    setFormattedContentForModal(lines.join('\n'));
  }, [priere, suivis, loading]);


  if (loading) {
    return (
      <div style={{
        minHeight: '100vh', display: 'flex',
        alignItems: 'center',
        justifyContent: 'center'
      }}>
        <div style={{
          background: 'white',
          borderRadius: '1rem',
          padding: '2rem',
          boxShadow: '0 4px 6px rgba(0, 0, 0, 0.05)'
        }}>
          <div style={{ fontSize: '2rem', marginBottom: '1rem', textAlign: 'center' }}>🙏</div>
          <p style={{ color: '#1E3A8A' }}>Chargement...</p>
        </div>
      </div>
    )
  }

  if (!priere) return null

  const TypeIcon = typeLabels[priere.type].icon
  const colors = typeColors[priere.type]


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
          {/* En-tête coloré selon le type */}
          <div style={{
            background: colors.bg,
            borderBottom: `3px solid ${colors.border}`,
            padding: '2rem'
          }}>
            {/* Bouton retour vers le module */}
            <Link href="/prieres" style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '0.5rem',
              color: colors.text,
              textDecoration: 'none',
              marginBottom: '1rem',
              fontSize: '0.875rem',
              opacity: 0.8,
              transition: 'opacity 0.2s'
            }}>
              <ArrowLeft size={16} />
              Retour aux prières
            </Link>

            <div style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'flex-start',
              gap: '1rem'
            }}>
              <div style={{
                display: 'flex',
                alignItems: 'flex-start',
                gap: '1rem'
              }}>
                <div style={{
                  background: colors.light,
                  borderRadius: '0.75rem',
                  padding: '0.75rem',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}>
                  <TypeIcon size={28} style={{ color: colors.text }} />
                </div>
                <div>
                  <p style={{
                    fontSize: '0.875rem',
                    color: colors.text,
                    opacity: 0.8,
                    marginBottom: '0.25rem'
                  }}>
                    {typeLabels[priere.type].label}
                  </p>
                  <h1 style={{
                    fontSize: '1.75rem',
                    fontWeight: 'bold',
                    color: '#1F2937',
                    marginBottom: '0.5rem'
                  }}>
                    {priere.personne_prenom} {priere.personne_nom || ''}
                  </h1>
                  <p style={{
                    fontSize: '1.125rem',
                    color: '#4B5563'
                  }}>
                    {priere.sujet}
                  </p>
                </div>
              </div>

              <div style={{
                display: 'flex',
                gap: '0.5rem'
              }}>
                <Link
                  href={`/prieres/${priere.id}/modifier`}
                  style={{
                    background: 'white',
                    color: colors.text,
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
            {/* Détails de la prière */}
            {priere.sujet_detail && (
              <div style={{
                background: '#F9FAFB',
                borderRadius: '0.75rem',
                padding: '1.5rem',
                marginBottom: '2rem'
              }}>
                <h3 style={{
                  fontSize: '1rem',
                  fontWeight: '600',
                  color: '#6B7280',
                  marginBottom: '0.5rem'
                }}>
                  Détails
                </h3>
                <p style={{
                  color: '#1F2937',
                  lineHeight: '1.6'
                }}>
                  {priere.sujet_detail}
                </p>
              </div>
            )}

            {/* Informations */}
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
              gap: '1rem',
              marginBottom: '2rem'
            }}>
              <div style={{
                background: '#F0F9FF',
                borderRadius: '0.75rem',
                padding: '1rem'
              }}>
                <div style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.5rem',
                  marginBottom: '0.5rem',
                  color: '#0369A1'
                }}>
                  <Calendar size={20} />
                  <span style={{ fontWeight: '500' }}>Début de la prière</span>
                </div>
                <p style={{ color: '#1E40AF', fontSize: '1.125rem' }}>
                  {format(new Date(priere.date), 'd MMMM yyyy', { locale: fr })}
                </p>
              </div>

              <div style={{
                background: '#F0F9FF',
                borderRadius: '0.75rem',
                padding: '1rem'
              }}>
                <div style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.5rem',
                  marginBottom: '0.5rem',
                  color: '#0369A1'
                }}>
                  <Clock size={20} />
                  <span style={{ fontWeight: '500' }}>Nombre de fois</span>
                </div>
                <p style={{ color: '#1E40AF', fontSize: '1.125rem' }}>
                  {priere.nombre_fois} fois priées
                </p>
              </div>

              {latestSuivi && latestSuivi.evolution && (
                <div style={{
                  background: evolutionLabels[latestSuivi.evolution].color + '20',
                  borderRadius: '0.75rem',
                  padding: '1rem'
                }}>
                  <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.5rem',
                    marginBottom: '0.5rem',
                    color: evolutionLabels[latestSuivi.evolution].color
                  }}>
                    <TrendingUp size={20} />
                    <span style={{ fontWeight: '500' }}>Dernière évolution</span>
                  </div>
                  <p style={{
                    color: evolutionLabels[latestSuivi.evolution].color,
                    fontSize: '1.125rem',
                    fontWeight: '600'
                  }}>
                    {evolutionLabels[latestSuivi.evolution].label}
                  </p>
                </div>
              )}
            </div>

            {/* Notes */}
            {priere.notes && (
              <div style={{
                background: '#FEF3C7',
                borderRadius: '0.75rem',
                padding: '1.5rem',
                marginBottom: '2rem'
              }}>
                <h3 style={{
                  fontSize: '1rem',
                  fontWeight: '600',
                  color: '#92400E',
                  marginBottom: '0.5rem'
                }}>
                  Notes
                </h3>
                <p style={{
                  color: '#78350F',
                  lineHeight: '1.6'
                }}>
                  {priere.notes}
                </p>
              </div>
            )}

            {/* Section des suivis */}
            <div>
              <div style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                marginBottom: '1.5rem'
              }}>
                <h2 style={{
                  fontSize: '1.5rem',
                  fontWeight: '600',
                  color: '#1F2937'
                }}>
                  Suivis de prière ({suivis.length})
                </h2>
                <Link
                  href={`/prieres/${priere.id}/suivi`}
                  style={{
                    background: '#93C5FD',
                    color: '#1E3A8A',
                    padding: '0.75rem 1.5rem',
                    borderRadius: '0.5rem',
                    textDecoration: 'none',
                    fontWeight: '500',
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '0.5rem',
                    boxShadow: '0 2px 4px rgba(0, 0, 0, 0.1)',
                    transition: 'all 0.2s'
                  }}
                >
                  <Plus size={20} />
                  Ajouter un suivi
                </Link>
              </div>

              {suivis.length === 0 ? (
                <div style={{
                  background: '#F9FAFB',
                  borderRadius: '0.75rem',
                  padding: '2rem',
                  textAlign: 'center'
                }}>
                  <p style={{ color: '#6B7280' }}>
                    Aucun suivi enregistré pour cette prière
                  </p>
                </div>
              ) : (
                <div style={{
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '1rem'
                }}>
                  {suivis.map((suivi, index) => (
                    <div
                      key={suivi.id}
                      style={{
                        background: 'white',
                        border: '2px solid #E5E7EB',
                        borderRadius: '0.75rem',
                        padding: '1.5rem',
                        animation: `fadeIn 0.6s ease-out ${index * 0.1}s both`
                      }}
                    >
                      <div style={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'flex-start',
                        marginBottom: '1rem'
                      }}>
                        <div>
                          <p style={{
                            fontSize: '0.875rem',
                            color: '#6B7280',
                            marginBottom: '0.25rem'
                          }}>
                            {format(new Date(suivi.date), 'EEEE d MMMM yyyy', { locale: fr })}
                          </p>
                          {suivi.evolution && (
                            <span style={{
                              display: 'inline-flex',
                              alignItems: 'center',
                              gap: '0.25rem',
                              background: evolutionLabels[suivi.evolution].color + '20',
                              color: evolutionLabels[suivi.evolution].color,
                              padding: '0.25rem 0.75rem',
                              borderRadius: '1rem',
                              fontSize: '0.875rem',
                              fontWeight: '500'
                            }}>
                              {(suivi.evolution === 'gueri' || suivi.evolution === 'guerison_partielle') &&
                                <CheckCircle size={14} />
                              }
                              {evolutionLabels[suivi.evolution].label}
                            </span>
                          )}
                        </div>
                        {suivi.nouvelle_priere && (
                          <span style={{
                            background: '#E0E7FF',
                            color: '#3730A3',
                            padding: '0.25rem 0.75rem',
                            borderRadius: '1rem',
                            fontSize: '0.75rem',
                            fontWeight: '500'
                          }}>
                            Nouvelle prière
                          </span>
                        )}
                      </div>
                      <p style={{
                        color: '#374151',
                        lineHeight: '1.6'
                      }}>
                        {suivi.notes}
                      </p>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Actions de partage */}
            <div style={{
              marginTop: '2rem',
              display: 'flex',
              justifyContent: 'center'
            }}>
              <FiorettiButton
                element={priere}
                elementType="priere"
                formattedContent={formattedContentForModal}
              />
            </div>
          </div>
        </div>

        {/* Section Connexions spirituelles */}
        {spiritualLinks.filter(link =>
          link.element_source_id === priere.id ||
          link.element_cible_id === priere.id
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
                  border: '1px solid rgba(99, 102, 241, 0.1)'
                }}>
                  {/* Barre supérieure décorative */}
                  <div style={{
                    height: '4px',
                    background: 'linear-gradient(90deg, #C7D2FE 0%, #A5B4FC 50%, #C7D2FE 100%)'
                  }} />

                  <div style={{
                    padding: '1.5rem',
                    background: '#F8F9FF'
                  }}>
                    <h3 style={{
                      fontSize: '1.2rem',
                      fontWeight: '600',
                      color: '#312E81',
                      marginBottom: '1rem',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '0.5rem'
                    }}>
                      🔗 Connexions spirituelles
                    </h3>

                    <LinksList
                      entryId={priere.id}
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
                      onClick={() => router.push(`/relecture?mode=atelier&source=${priere.id}&sourceType=priere`)}
                      style={{
                        marginTop: '1rem',
                        padding: '0.75rem 1.5rem',
                        background: '#6366F1',
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
                        e.currentTarget.style.background = '#4F46E5'
                        e.currentTarget.style.transform = 'translateY(-2px)'
                        e.currentTarget.style.boxShadow = '0 4px 12px rgba(99, 102, 241, 0.3)'
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.background = '#6366F1'
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