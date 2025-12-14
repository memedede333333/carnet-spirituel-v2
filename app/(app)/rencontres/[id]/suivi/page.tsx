'use client'

import { use, useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { supabase } from '@/app/lib/supabase'
import { Calendar, TrendingUp, MessageSquare, ArrowLeft, Plus, Users } from 'lucide-react'

interface Rencontre {
    id: string
    personne_prenom: string
    personne_nom: string | null
    contexte: string
    description: string
}

const evolutionOptions = [
    { value: 'mes_nouvelles', label: 'J\'ai donné des nouvelles', description: 'Envoi d\'un message, appel, lettre...' },
    { value: 'ses_nouvelles', label: 'J\'ai reçu des nouvelles', description: 'Message reçu, appel, nouvelles indirectes...' },
    { value: 'rencontre', label: 'Nouvelle rencontre', description: 'Nous nous sommes revus' },
    { value: 'invitation', label: 'Invitation', description: 'Invitation à un événement, un repas...' },
    { value: 'perdu_de_vue', label: 'Perdu de vue', description: 'Plus de contact pour le moment' },
    { value: 'prieres', label: 'Prières', description: 'Je prie pour cette personne' },
    { value: 'autre', label: 'Autre', description: 'Autre type d\'évolution' }
]

export default function SuiviRencontrePage({ params }: { params: Promise<{ id: string }> }) {
    const resolvedParams = use(params)
    const router = useRouter()
    const [rencontre, setRencontre] = useState<Rencontre | null>(null)
    const [date, setDate] = useState(new Date().toISOString().split('T')[0])
    const [notes, setNotes] = useState('')
    const [evolution, setEvolution] = useState('')
    const [loading, setLoading] = useState(true)
    const [saving, setSaving] = useState(false)
    const [error, setError] = useState('')

    useEffect(() => {
        fetchRencontre()
    }, [resolvedParams.id])

    const fetchRencontre = async () => {
        try {
            const { data, error } = await supabase
                .from('rencontres_missionnaires')
                .select('*')
                .eq('id', resolvedParams.id)
                .single()

            if (error) throw error
            setRencontre(data)
        } catch (error) {
            console.error('Erreur:', error)
            router.push('/rencontres')
        } finally {
            setLoading(false)
        }
    }

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()

        if (!notes.trim()) {
            setError('Veuillez décrire le suivi')
            return
        }

        setSaving(true)
        setError('')

        try {
            const { data: { user } } = await supabase.auth.getUser()
            if (!user) throw new Error('Non authentifié')

            const { error } = await supabase
                .from('suivis_rencontre')
                .insert({
                    rencontre_id: resolvedParams.id,
                    date,
                    notes: notes.trim(),
                    evolution: evolution || null
                })

            if (error) throw error

            router.push(`/rencontres/${resolvedParams.id}`)
        } catch (error) {
            console.error('Erreur:', error)
            setError('Une erreur est survenue lors de l\'enregistrement')
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
                    <div style={{ fontSize: '2rem', marginBottom: '1rem', textAlign: 'center' }}>🤝</div>
                    <p style={{ color: '#451A03' }}>Chargement...</p>
                </div>
            </div>
        )
    }

    if (!rencontre) return null

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
                    {/* En-tête avec la couleur Rencontres */}
                    <div style={{
                        background: 'linear-gradient(135deg, #FED7AA, #FDBA74)',
                        padding: '2rem'
                    }}>
                        <Link href={`/rencontres/${resolvedParams.id}`} style={{
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: '0.5rem',
                            color: '#451A03',
                            textDecoration: 'none',
                            marginBottom: '1rem',
                            fontSize: '0.875rem',
                            opacity: 0.8,
                            transition: 'opacity 0.2s'
                        }}>
                            <ArrowLeft size={16} />
                            Retour à la rencontre
                        </Link>

                        <div style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: '1rem'
                        }}>
                            <div style={{
                                background: 'white',
                                borderRadius: '50%',
                                padding: '0.75rem',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                width: '48px',
                                height: '48px',
                                boxShadow: '0 2px 4px rgba(198, 93, 0, 0.2)'
                            }}>
                                <Users size={28} style={{ color: '#451A03' }} />
                            </div>
                            <div>
                                <h1 style={{
                                    fontSize: '1.5rem',
                                    fontWeight: 'bold',
                                    color: '#451A03',
                                    marginBottom: '0.25rem'
                                }}>
                                    Ajouter un suivi
                                </h1>
                                <p style={{
                                    color: '#78350F'
                                }}>
                                    {rencontre.personne_prenom} {rencontre.personne_nom || ''}
                                </p>
                            </div>
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

                        {/* Date du suivi */}
                        <div style={{ marginBottom: '1.5rem' }}>
                            <label style={{
                                display: 'flex',
                                alignItems: 'center',
                                gap: '0.5rem',
                                marginBottom: '0.5rem',
                                fontWeight: '500',
                                color: '#92400E'
                            }}>
                                <Calendar size={20} />
                                Date du suivi
                            </label>
                            <input
                                type="date"
                                value={date}
                                onChange={(e) => setDate(e.target.value)}
                                style={{
                                    width: '100%',
                                    padding: '0.75rem',
                                    border: '2px solid #FED7AA',
                                    borderRadius: '0.5rem',
                                    fontSize: '1rem',
                                    outline: 'none',
                                    transition: 'border-color 0.2s',
                                    backgroundColor: '#FFF7ED'
                                }}
                                onFocus={(e) => e.target.style.borderColor = '#FDBA74'}
                                onBlur={(e) => e.target.style.borderColor = '#FED7AA'}
                            />
                        </div>

                        {/* Notes de suivi */}
                        <div style={{ marginBottom: '1.5rem' }}>
                            <label style={{
                                display: 'flex',
                                alignItems: 'center',
                                gap: '0.5rem',
                                marginBottom: '0.5rem',
                                fontWeight: '500',
                                color: '#92400E'
                            }}>
                                <MessageSquare size={20} />
                                Notes de suivi
                            </label>
                            <textarea
                                value={notes}
                                onChange={(e) => setNotes(e.target.value)}
                                placeholder="Nouvelles, discussion, événement..."
                                rows={4}
                                style={{
                                    width: '100%',
                                    padding: '0.75rem',
                                    border: '2px solid #FED7AA',
                                    borderRadius: '0.5rem',
                                    fontSize: '1rem',
                                    resize: 'vertical',
                                    outline: 'none',
                                    transition: 'border-color 0.2s',
                                    backgroundColor: '#FFF7ED'
                                }}
                                onFocus={(e) => e.target.style.borderColor = '#FDBA74'}
                                onBlur={(e) => e.target.style.borderColor = '#FED7AA'}
                            />
                        </div>

                        {/* Évolution */}
                        <div style={{ marginBottom: '1.5rem' }}>
                            <label style={{
                                display: 'flex',
                                alignItems: 'center',
                                gap: '0.5rem',
                                marginBottom: '0.75rem',
                                fontWeight: '500',
                                color: '#92400E'
                            }}>
                                <TrendingUp size={20} />
                                Type de suivi (optionnel)
                            </label>
                            <div style={{
                                display: 'grid',
                                gridTemplateColumns: 'repeat(auto-fill, minmax(250px, 1fr))',
                                gap: '0.75rem'
                            }}>
                                {evolutionOptions.map((option) => (
                                    <label
                                        key={option.value}
                                        style={{
                                            display: 'flex',
                                            flexDirection: 'column',
                                            padding: '1rem',
                                            borderRadius: '0.5rem',
                                            border: `2px solid ${evolution === option.value ? '#FDBA74' : '#E5E7EB'}`,
                                            background: evolution === option.value ? '#FFF7ED' : 'white',
                                            cursor: 'pointer',
                                            transition: 'all 0.2s'
                                        }}
                                    >
                                        <div style={{
                                            display: 'flex',
                                            alignItems: 'center',
                                            gap: '0.5rem'
                                        }}>
                                            <input
                                                type="radio"
                                                name="evolution"
                                                value={option.value}
                                                checked={evolution === option.value}
                                                onChange={(e) => setEvolution(e.target.value)}
                                                style={{ marginRight: '0.25rem' }}
                                            />
                                            <span style={{
                                                fontWeight: '500',
                                                color: evolution === option.value ? '#78350F' : '#1F2937'
                                            }}>
                                                {option.label}
                                            </span>
                                        </div>
                                        <p style={{
                                            fontSize: '0.875rem',
                                            color: '#6B7280',
                                            marginTop: '0.25rem',
                                            marginLeft: '1.5rem'
                                        }}>
                                            {option.description}
                                        </p>
                                    </label>
                                ))}
                            </div>
                        </div>

                        {/* Boutons */}
                        <div style={{
                            display: 'flex',
                            gap: '1rem',
                            justifyContent: 'flex-end',
                            marginTop: '2rem'
                        }}>
                            <Link
                                href={`/rencontres/${resolvedParams.id}`}
                                style={{
                                    padding: '0.75rem 1.5rem',
                                    borderRadius: '0.5rem',
                                    border: '2px solid #FED7AA',
                                    color: '#92400E',
                                    textDecoration: 'none',
                                    fontWeight: '500',
                                    transition: 'all 0.2s',
                                    display: 'inline-block'
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
                                    background: '#F97316',
                                    color: 'white',
                                    border: 'none',
                                    fontWeight: '500',
                                    cursor: saving ? 'not-allowed' : 'pointer',
                                    opacity: saving ? 0.7 : 1,
                                    transition: 'all 0.2s',
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: '0.5rem',
                                    boxShadow: '0 2px 4px rgba(249, 115, 22, 0.2)'
                                }}
                            >
                                <Plus size={20} />
                                {saving ? 'Enregistrement...' : 'Ajouter le suivi'}
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    )
}
