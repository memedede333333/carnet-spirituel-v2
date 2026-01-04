'use client'

import { useState } from 'react'
import { Search, Loader2, Check, BookOpen, AlertCircle } from 'lucide-react'
import { parseBibleReference, ParseResult, BookSuggestion, validateChapter } from '@/app/lib/bible-parser'

interface BibleVerse {
    ref: string
    text: string
    verseNumber: number
}

interface BibleChapter {
    book: string
    chapter: number
    verses: BibleVerse[]
    sourceUrl: string
}

interface BibleSearchProps {
    onImport: (data: { text: string; reference: string }) => void
    onCancel: () => void
}

export default function BibleSearch({ onImport, onCancel }: BibleSearchProps) {
    const [query, setQuery] = useState('')
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState('')
    const [result, setResult] = useState<BibleChapter | null>(null)
    const [selectedVerses, setSelectedVerses] = useState<number[]>([])

    // Nouveau: état pour les suggestions
    const [suggestions, setSuggestions] = useState<BookSuggestion[]>([])
    const [pendingChapter, setPendingChapter] = useState<number | null>(null)

    // Recherche via le parser intelligent
    const handleSearch = async (e?: React.FormEvent) => {
        e?.preventDefault()
        if (!query.trim()) return

        setError('')
        setSuggestions([])
        setPendingChapter(null)

        // Étape 1: Parser la référence
        const parseResult = parseBibleReference(query)

        if (!parseResult.success) {
            // Si suggestions disponibles
            if (parseResult.suggestions && parseResult.suggestions.length > 0) {
                // Extraire le chapitre de la requête
                const chapterMatch = query.match(/(\d+)\s*$/)
                const chapter = chapterMatch ? parseInt(chapterMatch[1], 10) : null

                setSuggestions(parseResult.suggestions)
                setPendingChapter(chapter)
                setError(parseResult.error || 'Précisez votre recherche')
                return
            }

            // Erreur simple (livre inconnu, chapitre manquant...)
            setError(parseResult.error || 'Référence non reconnue')
            return
        }

        // Recherche réussie, lancer le fetch
        await fetchChapter(parseResult.bookCode!, parseResult.chapter!)
    }

    // Sélection d'une suggestion
    const handleSelectSuggestion = async (suggestion: BookSuggestion) => {
        const chapter = pendingChapter || 1

        // Valider que le chapitre existe
        const validation = validateChapter(suggestion.code, chapter)
        if (!validation.valid) {
            setError(validation.error || 'Chapitre invalide')
            return
        }

        setSuggestions([])
        setPendingChapter(null)

        await fetchChapter(suggestion.code, chapter)
    }

    // Fetch le chapitre depuis l'API
    const fetchChapter = async (bookCode: string, chapter: number) => {
        setLoading(true)
        setError('')
        setResult(null)

        try {
            const response = await fetch(`/api/bible?ref=${bookCode} ${chapter}`)
            const data = await response.json()

            if (!response.ok) {
                throw new Error(data.error || 'Erreur lors de la recherche')
            }

            setResult(data)
            setSelectedVerses([])
        } catch (err: any) {
            setError(err.message)
        } finally {
            setLoading(false)
        }
    }

    const toggleVerse = (verseNumber: number) => {
        setSelectedVerses(prev =>
            prev.includes(verseNumber)
                ? prev.filter(v => v !== verseNumber)
                : [...prev, verseNumber].sort((a, b) => a - b)
        )
    }

    const handleImport = () => {
        if (!result) return

        const selectedText = result.verses
            .filter(v => selectedVerses.includes(v.verseNumber))
            .map(v => v.text)
            .join(' ')

        let refVerse = ''
        if (selectedVerses.length > 0) {
            const min = selectedVerses[0]
            const max = selectedVerses[selectedVerses.length - 1]
            const isContiguous = selectedVerses.length === (max - min + 1)
            refVerse = isContiguous && selectedVerses.length > 1 ? `, ${min}-${max}` : `, ${selectedVerses.join('.')}`
        }

        const reference = `${result.book} ${result.chapter}${refVerse}`

        onImport({
            text: selectedText,
            reference: reference
        })
    }

    return (
        <div style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: 'rgba(0, 0, 0, 0.5)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 50,
            padding: '1rem',
            paddingLeft: 'max(1rem, calc((100vw - 800px) / 2))'
        }}>
            <div style={{
                background: 'white',
                width: '100%',
                maxWidth: '700px',
                maxHeight: '85vh',
                borderRadius: '1rem',
                display: 'flex',
                flexDirection: 'column',
                boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1)',
                overflow: 'hidden',
                marginLeft: 'auto',
                marginRight: 'auto'
            }}>
                {/* Header */}
                <div style={{
                    padding: '1.5rem',
                    borderBottom: '1px solid #E5E7EB',
                    background: 'linear-gradient(135deg, #D1FAE5, #A7F3D0)',
                }}>
                    <h2 style={{
                        fontSize: '1.25rem',
                        fontWeight: '600',
                        color: '#064E3B',
                        marginBottom: '1rem',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '0.5rem'
                    }}>
                        <BookOpen size={24} color="#4F46E5" />
                        Recherche Biblique
                    </h2>

                    <form onSubmit={handleSearch} style={{ display: 'flex', gap: '0.5rem' }}>
                        <input
                            type="text"
                            value={query}
                            onChange={(e) => setQuery(e.target.value)}
                            onKeyDown={(e) => e.key === 'Enter' && handleSearch(e)}
                            placeholder="Ex: Mt 5, Jean 3, 1 timothée 5, ezekiel 2..."
                            style={{
                                flex: 1,
                                padding: '0.75rem',
                                border: '2px solid #D1FAE5',
                                borderRadius: '0.5rem',
                                fontSize: '1rem',
                                outline: 'none',
                                transition: 'border-color 0.2s',
                                backgroundColor: '#F0FDF4'
                            }}
                            onFocus={(e) => e.target.style.borderColor = '#A7F3D0'}
                            onBlur={(e) => e.target.style.borderColor = '#D1FAE5'}
                            autoFocus
                        />
                        <button
                            type="submit"
                            disabled={loading}
                            style={{
                                padding: '0.75rem 1.5rem',
                                background: loading ? '#D1D5DB' : '#6EE7B7',
                                color: loading ? '#9CA3AF' : '#064E3B',
                                border: 'none',
                                borderRadius: '0.5rem',
                                fontWeight: '600',
                                cursor: loading ? 'not-allowed' : 'pointer',
                                transition: 'all 0.2s',
                                boxShadow: '0 2px 4px rgba(0, 0, 0, 0.1)',
                                display: 'flex',
                                alignItems: 'center',
                                gap: '0.5rem'
                            }}
                            onMouseEnter={(e) => {
                                if (!loading) e.currentTarget.style.background = '#34D399'
                            }}
                            onMouseLeave={(e) => {
                                if (!loading) e.currentTarget.style.background = '#6EE7B7'
                            }}
                        >
                            {loading ? <Loader2 size={20} className="animate-spin" /> : <Search size={20} />}
                            {loading ? 'Recherche...' : 'Chercher'}
                        </button>
                    </form>

                    {/* Suggestions quand plusieurs livres correspondent */}
                    {suggestions.length > 0 && (
                        <div style={{
                            marginTop: '0.75rem',
                            padding: '0.75rem',
                            background: '#FEF3C7',
                            border: '1px solid #FCD34D',
                            borderRadius: '0.5rem'
                        }}>
                            <p style={{
                                fontSize: '0.875rem',
                                color: '#92400E',
                                marginBottom: '0.5rem',
                                display: 'flex',
                                alignItems: 'center',
                                gap: '0.5rem'
                            }}>
                                <AlertCircle size={16} />
                                Plusieurs livres correspondent. Lequel cherchez-vous ?
                            </p>
                            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem' }}>
                                {suggestions.map(s => (
                                    <button
                                        key={s.code}
                                        onClick={() => handleSelectSuggestion(s)}
                                        style={{
                                            padding: '0.5rem 1rem',
                                            background: '#FCD34D',
                                            color: '#78350F',
                                            border: '1px solid #F59E0B',
                                            borderRadius: '0.5rem',
                                            cursor: 'pointer',
                                            fontSize: '0.875rem',
                                            fontWeight: '500',
                                            transition: 'all 0.2s'
                                        }}
                                        onMouseEnter={(e) => {
                                            e.currentTarget.style.background = '#FBBF24'
                                            e.currentTarget.style.transform = 'translateY(-1px)'
                                        }}
                                        onMouseLeave={(e) => {
                                            e.currentTarget.style.background = '#FCD34D'
                                            e.currentTarget.style.transform = 'translateY(0)'
                                        }}
                                    >
                                        {s.code} - {s.fullName.length > 40 ? s.fullName.substring(0, 40) + '...' : s.fullName}
                                    </button>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* Message d'erreur (sans suggestions) */}
                    {error && suggestions.length === 0 && (
                        <div style={{
                            marginTop: '0.75rem',
                            padding: '0.75rem',
                            background: '#FEE2E2',
                            border: '1px solid #FCA5A5',
                            borderRadius: '0.5rem',
                            color: '#991B1B',
                            fontSize: '0.875rem'
                        }}>
                            {error}
                        </div>
                    )}
                </div>

                {/* Content */}
                <div style={{
                    flex: 1,
                    overflowY: 'auto',
                    padding: '1.5rem',
                    background: '#FFFFFF'
                }}>
                    {!result && !loading && (
                        <div style={{ textAlign: 'center', color: '#9CA3AF', marginTop: '2rem' }}>
                            <BookOpen size={48} style={{ marginBottom: '1rem', opacity: 0.5, margin: '0 auto' }} />
                            <p style={{ fontWeight: '600', fontSize: '1.1rem', marginBottom: '0.5rem' }}>Recherchez un passage biblique</p>
                            <p style={{ fontSize: '0.875rem', color: '#6B7280' }}>Entrez une référence pour charger le chapitre complet.</p>
                            <p style={{ fontSize: '0.875rem', color: '#6B7280' }}>Vous pourrez ensuite sélectionner les versets précis.</p>
                            <div style={{
                                marginTop: '1.5rem',
                                padding: '1rem',
                                background: '#F0F9FF',
                                borderRadius: '0.5rem',
                                border: '1px solid #BAE6FD'
                            }}>
                                <p style={{ fontSize: '0.875rem', color: '#0369A1', marginBottom: '0.5rem', fontWeight: '600' }}>💡 Formats acceptés :</p>
                                <ul style={{ fontSize: '0.8rem', color: '#075985', textAlign: 'left', maxWidth: '300px', margin: '0 auto', lineHeight: '1.6' }}>
                                    <li>Noms complets : <strong>Matthieu 5</strong>, <strong>Psaume 23</strong></li>
                                    <li>Abréviations : <strong>Mt 5</strong>, <strong>Ps 23</strong>, <strong>Jn 3</strong></li>
                                    <li>Avec/sans accents : <strong>ezekiel 1</strong>, <strong>ézéchiel 1</strong></li>
                                    <li>Livres numérotés : <strong>1 timothée 5</strong>, <strong>2 cor 3</strong></li>
                                </ul>
                            </div>
                        </div>
                    )}

                    {result && (
                        <div>
                            <div style={{
                                marginBottom: '1rem',
                                display: 'flex',
                                justifyContent: 'space-between',
                                alignItems: 'center',
                                padding: '0.75rem',
                                background: '#F0F9FF',
                                borderRadius: '0.5rem'
                            }}>
                                <h3 style={{ fontSize: '1.125rem', fontWeight: 'bold', color: '#1E3A8A' }}>
                                    {result.book} {result.chapter}
                                </h3>
                                <span style={{ fontSize: '0.875rem', color: '#0369A1', fontWeight: '600' }}>
                                    {selectedVerses.length} verset{selectedVerses.length !== 1 ? 's' : ''} sélectionné{selectedVerses.length !== 1 ? 's' : ''}
                                </span>
                            </div>

                            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
                                {result.verses.map((verse) => {
                                    const isSelected = selectedVerses.includes(verse.verseNumber);
                                    return (
                                        <div
                                            key={verse.verseNumber}
                                            onClick={() => toggleVerse(verse.verseNumber)}
                                            style={{
                                                padding: '0.75rem',
                                                cursor: 'pointer',
                                                borderRadius: '0.5rem',
                                                border: '1px solid',
                                                borderColor: isSelected ? '#6EE7B7' : '#E5E7EB',
                                                background: isSelected ? '#D1FAE5' : 'white',
                                                transition: 'all 0.2s',
                                                display: 'flex',
                                                gap: '0.75rem'
                                            }}
                                        >
                                            <span style={{
                                                fontWeight: 'bold',
                                                color: isSelected ? '#065F46' : '#9CA3AF',
                                                minWidth: '1.5rem',
                                                fontSize: '0.75rem',
                                                marginTop: '0.2rem'
                                            }}>
                                                {verse.verseNumber}
                                            </span>
                                            <p style={{
                                                margin: 0,
                                                color: isSelected ? '#064E3B' : '#374151',
                                                lineHeight: '1.6',
                                                fontSize: '0.95rem'
                                            }}>
                                                {verse.text}
                                            </p>
                                        </div>
                                    );
                                })}
                            </div>
                        </div>
                    )}
                </div>

                {/* Footer */}
                <div style={{
                    padding: '1rem 1.5rem',
                    borderTop: '1px solid #E5E7EB',
                    background: '#F9FAFB',
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center'
                }}>
                    <button
                        onClick={onCancel}
                        style={{
                            padding: '0.5rem 1rem',
                            borderRadius: '0.5rem',
                            border: '2px solid #D1D5DB',
                            background: 'white',
                            color: '#374151',
                            fontWeight: '500',
                            cursor: 'pointer'
                        }}
                    >
                        Fermer
                    </button>

                    <button
                        onClick={handleImport}
                        disabled={selectedVerses.length === 0}
                        style={{
                            padding: '0.75rem 1.5rem',
                            background: selectedVerses.length === 0 ? '#D1D5DB' : '#6EE7B7',
                            color: selectedVerses.length === 0 ? '#9CA3AF' : '#064E3B',
                            border: 'none',
                            borderRadius: '0.5rem',
                            fontWeight: '600',
                            cursor: selectedVerses.length === 0 ? 'not-allowed' : 'pointer',
                            transition: 'all 0.2s',
                            boxShadow: '0 2px 4px rgba(0, 0, 0, 0.1)',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '0.5rem'
                        }}
                        onMouseEnter={(e) => {
                            if (selectedVerses.length > 0) e.currentTarget.style.background = '#34D399'
                        }}
                        onMouseLeave={(e) => {
                            if (selectedVerses.length > 0) e.currentTarget.style.background = '#6EE7B7'
                        }}
                    >
                        <Check size={18} />
                        Importer la sélection
                    </button>
                </div>
            </div>
        </div>
    )
}
