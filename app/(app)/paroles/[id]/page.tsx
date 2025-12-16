'use client'

import { use, useState, useEffect } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { supabase } from '@/app/lib/supabase'
import { Calendar, MessageSquare, Users, MapPin, CheckCircle, Edit, Trash2, ArrowLeft, Sparkles, LinkIcon } from 'lucide-react'
import { format } from 'date-fns'
import { fr } from 'date-fns/locale'
import LinksList from '@/app/components/LinksList'
import { loadUserSpiritualLinks } from '@/app/lib/spiritual-links-helpers'
import FiorettiButton from '@/app/components/FiorettiButton'


interface Parole {
  id: string
  texte: string
  date: string
  contexte: string
  contexte_detail: string | null
  destinataire: string
  personne_destinataire: string | null
  fruit_constate: string | null
  date_accomplissement: string | null
  created_at: string
}

const contexteLabels: Record<string, string> = {
  personnelle: 'Personnelle',
  veillee: 'Veillée',
  mission: 'Mission',
  priere: 'Prière',
  autre: 'Autre'
}

export default function ParoleDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = use(params)
  const router = useRouter()
  const [parole, setParole] = useState<Parole | null>(null)
  const [loading, setLoading] = useState(true)
  const [deleting, setDeleting] = useState(false)
  const [spiritualLinks, setSpiritualLinks] = useState<any[]>([])
  const [allEntries, setAllEntries] = useState<any[]>([])

  useEffect(() => {
    fetchParole()
  }, [resolvedParams.id])

  const fetchParole = async () => {
    try {
      const { data, error } = await supabase
        .from('paroles_connaissance')
        .select('*')
        .eq('id', resolvedParams.id)
        .single()

      if (error) throw error
      setParole(data)

      // Charger les liens spirituels
      const { data: { user } } = await supabase.auth.getUser()
      if (user?.id) {
        loadUserSpiritualLinks(user.id).then(setSpiritualLinks)
        loadAllEntries(user.id).then(setAllEntries)
      }
    } catch (error) {
      console.error('Erreur:', error)
      router.push('/paroles')
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
    if (!confirm('Êtes-vous sûr de vouloir supprimer cette parole ?')) return

    setDeleting(true)
    try {
      const { error } = await supabase
        .from('paroles_connaissance')
        .delete()
        .eq('id', resolvedParams.id)

      if (error) throw error
      router.push('/paroles')
    } catch (error) {
      console.error('Erreur:', error)
      alert('Erreur lors de la suppression')
    } finally {
      setDeleting(false)
    }
  }

  const getDestinataire = () => {
    if (!parole) return ''
    if (parole.destinataire === 'moi') return 'Pour moi'
    if (parole.destinataire === 'inconnu') return 'Destinataire inconnu'
    return parole.personne_destinataire || 'Pour quelqu\'un'
  }

  // Hooks doivent être appelés avant tout return conditionnel
  const [formattedParoleContent, setFormattedParoleContent] = useState('');

  useEffect(() => {
    if (!parole || loading) return;

    const lines = [];

    // Titre
    lines.push(`🕊️ Parole de connaissance`);
    lines.push('');

    // Texte principal
    lines.push(`« ${parole.texte} »`);
    lines.push('');

    // Date et contexte
    lines.push(`📅 ${format(new Date(parole.date), 'd MMMM yyyy', { locale: fr })}`);
    lines.push(`📍 Contexte : ${contexteLabels[parole.contexte] || parole.contexte}`);
    if (parole.contexte_detail) {
      lines.push(parole.contexte_detail);
    }
    lines.push('');

    // Destinataire
    let dest = 'Pour quelqu\'un';
    if (parole.destinataire === 'moi') dest = 'Pour moi';
    else if (parole.destinataire === 'inconnu') dest = 'Destinataire inconnu';
    else if (parole.personne_destinataire) dest = `Pour ${parole.personne_destinataire}`;
    lines.push(`👤 ${dest}`);

    // Fruit constaté
    if (parole.fruit_constate) {
      lines.push('');
      lines.push(`✨ Fruit constaté`);
      lines.push(parole.fruit_constate);
    }

    // Date d'accomplissement
    if (parole.date_accomplissement) {
      lines.push('');
      lines.push(`✅ Accomplie le ${format(new Date(parole.date_accomplissement), 'd MMMM yyyy', { locale: fr })}`);
    }

    setFormattedParoleContent(lines.join('\n'));
  }, [parole, loading]);

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
          <div style={{ fontSize: '2rem', marginBottom: '1rem', textAlign: 'center' }}>🕊️</div>
          <p style={{ color: '#075985' }}>Chargement...</p>
        </div>
      </div>
    )
  }

  if (!parole) return null

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
          {/* En-tête bleu ciel pastel */}
          <div style={{
            background: 'linear-gradient(135deg, #E0F2FE, #BAE6FD)',
            padding: '2rem',
            color: '#075985'
          }}>
            {/* Bouton retour vers le module */}
            <Link href="/paroles" style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '0.5rem',
              color: '#075985',
              textDecoration: 'none',
              marginBottom: '1rem',
              fontSize: '0.875rem',
              opacity: 0.8,
              transition: 'opacity 0.2s'
            }}>
              <ArrowLeft size={16} />
              Retour aux paroles
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
                  🕊️
                </div>
                <div>
                  <h1 style={{
                    fontSize: '1.75rem',
                    fontWeight: 'bold',
                    marginBottom: '0.25rem'
                  }}>
                    Parole de connaissance
                  </h1>
                  <p style={{
                    fontSize: '0.875rem',
                    opacity: 0.8
                  }}>
                    {format(new Date(parole.date), 'd MMMM yyyy', { locale: fr })}
                  </p>
                </div>
              </div>

              <div style={{
                display: 'flex',
                gap: '0.5rem'
              }}>
                <Link
                  href={`/paroles/${parole.id}/modifier`}
                  style={{
                    background: 'white',
                    color: '#075985',
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

            {parole.date_accomplissement && (
              <div style={{
                marginTop: '1rem',
                background: '#10B981',
                color: 'white',
                padding: '0.5rem 1rem',
                borderRadius: '2rem',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '0.5rem',
                fontSize: '0.875rem'
              }}>
                <CheckCircle size={16} />
                Accomplie le {format(new Date(parole.date_accomplissement), 'd MMMM yyyy', { locale: fr })}
              </div>
            )}
          </div>

          {/* Contenu */}
          <div style={{ padding: '2rem' }}>
            {/* Texte de la parole */}
            <div style={{
              background: '#F0F9FF',
              border: '2px solid #E0F2FE',
              borderRadius: '0.75rem',
              padding: '1.5rem',
              marginBottom: '2rem',
              textAlign: 'center'
            }}>
              <p style={{
                fontSize: '1.5rem',
                lineHeight: '1.8',
                color: '#075985',
                fontStyle: 'italic',
                fontWeight: '500'
              }}>
                « {parole.texte} »
              </p>
            </div>

            {/* Informations */}
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
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
                  color: '#0C4A6E'
                }}>
                  <MapPin size={20} />
                  <span style={{ fontWeight: '500' }}>Contexte</span>
                </div>
                <p style={{ color: '#075985', fontSize: '1.125rem' }}>
                  {contexteLabels[parole.contexte] || parole.contexte}
                </p>
                {parole.contexte_detail && (
                  <p style={{
                    fontSize: '0.875rem',
                    color: '#0C4A6E',
                    marginTop: '0.5rem',
                    fontStyle: 'italic'
                  }}>
                    {parole.contexte_detail}
                  </p>
                )}
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
                  color: '#0C4A6E'
                }}>
                  <Users size={20} />
                  <span style={{ fontWeight: '500' }}>Destinataire</span>
                </div>
                <p style={{ color: '#075985', fontSize: '1.125rem' }}>
                  {getDestinataire()}
                </p>
              </div>
            </div>

            {/* Fruit constaté */}
            {parole.fruit_constate && (
              <div style={{
                background: '#D1FAE5',
                borderRadius: '0.75rem',
                padding: '1.5rem',
                marginBottom: '2rem'
              }}>
                <div style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.5rem',
                  marginBottom: '0.75rem',
                  color: '#064E3B'
                }}>
                  <Sparkles size={20} />
                  <h3 style={{
                    fontSize: '1.125rem',
                    fontWeight: '600',
                    margin: 0
                  }}>
                    Fruit constaté
                  </h3>
                </div>
                <p style={{
                  color: '#047857',
                  lineHeight: '1.6'
                }}>
                  {parole.fruit_constate}
                </p>
              </div>
            )}

            {/* Si pas encore accomplie, possibilité d'ajouter le fruit */}
            {!parole.date_accomplissement && (
              <div style={{
                textAlign: 'center',
                padding: '2rem',
                background: '#F0F9FF',
                borderRadius: '0.75rem',
                border: '2px dashed #BAE6FD'
              }}>
                <p style={{
                  color: '#0C4A6E',
                  marginBottom: '1rem'
                }}>
                  Cette parole n'est pas encore marquée comme accomplie.
                </p>
                <Link
                  href={`/paroles/${parole.id}/modifier`}
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '0.5rem',
                    background: '#7DD3FC',
                    color: '#075985',
                    padding: '0.75rem 1.5rem',
                    borderRadius: '0.5rem',
                    textDecoration: 'none',
                    fontWeight: '500',
                    transition: 'all 0.2s',
                    boxShadow: '0 2px 4px rgba(0, 0, 0, 0.1)'
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.background = '#38BDF8'
                    e.currentTarget.style.transform = 'translateY(-1px)'
                    e.currentTarget.style.boxShadow = '0 4px 8px rgba(0, 0, 0, 0.15)'
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.background = '#7DD3FC'
                    e.currentTarget.style.transform = 'translateY(0)'
                    e.currentTarget.style.boxShadow = '0 2px 4px rgba(0, 0, 0, 0.1)'
                  }}
                >
                  <CheckCircle size={20} />
                  Noter l'accomplissement
                </Link>
              </div>
            )}

            {/* Citation en bas */}
            <div style={{
              marginTop: '3rem',
              padding: '1.5rem',
              background: '#F0F9FF',
              borderRadius: '0.75rem',
              textAlign: 'center',
              borderLeft: '4px solid #7DD3FC'
            }}>
              <p style={{
                fontSize: '1rem',
                color: '#075985',
                fontStyle: 'italic',
                marginBottom: '0.5rem'
              }}>
                « L'Esprit Saint vous enseignera à l'heure même ce qu'il faudra dire. »
              </p>
              <p style={{
                fontSize: '0.875rem',
                color: '#0C4A6E'
              }}>
                Luc 12, 12
              </p>
            </div>

            {/* Actions de partage */}
            <div style={{
              marginTop: '2rem',
              display: 'flex',
              justifyContent: 'center'
            }}>
              <FiorettiButton
                element={parole}
                elementType="parole"
                formattedContent={formattedParoleContent}
              />
            </div>
          </div>
        </div>

        {/* Section Connexions spirituelles */}
        {spiritualLinks.filter(link =>
          link.element_source_id === parole.id ||
          link.element_cible_id === parole.id
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
                  border: '1px solid rgba(14, 165, 233, 0.1)'
                }}>
                  {/* Barre supérieure décorative */}
                  <div style={{
                    height: '4px',
                    background: 'linear-gradient(90deg, #BAE6FD 0%, #7DD3FC 50%, #BAE6FD 100%)'
                  }} />

                  <div style={{
                    padding: '1.5rem',
                    background: '#F0F9FF'
                  }}>
                    <h3 style={{
                      fontSize: '1.2rem',
                      fontWeight: '600',
                      color: '#075985',
                      marginBottom: '1rem',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '0.5rem'
                    }}>
                      🔗 Connexions spirituelles
                    </h3>

                    <LinksList
                      entryId={parole.id}
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
                      onClick={() => router.push(`/relecture?mode=atelier&source=${parole.id}&sourceType=parole`)}
                      style={{
                        marginTop: '1rem',
                        padding: '0.75rem 1.5rem',
                        background: '#0EA5E9',
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
                        e.currentTarget.style.background = '#0284C7'
                        e.currentTarget.style.transform = 'translateY(-2px)'
                        e.currentTarget.style.boxShadow = '0 4px 12px rgba(14, 165, 233, 0.3)'
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.background = '#0EA5E9'
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