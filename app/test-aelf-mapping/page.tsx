'use client'

import { useState } from 'react'
import { AELF_BOOKS_LIST, BOOK_MAPPING } from '@/app/lib/aelf-mapping-table'
import { parseBibleReference, validateChapter, ParseResult, BookSuggestion } from '@/app/lib/bible-parser'

interface TestResult {
    code: string
    fullName: string
    chapter: number
    status: 'pending' | 'testing' | 'success' | 'error'
    error?: string
    responseTime?: number
}

export default function TestAelfMappingPage() {
    const [results, setResults] = useState<TestResult[]>([])
    const [searchQuery, setSearchQuery] = useState('')
    const [parseResult, setParseResult] = useState<ParseResult | null>(null)
    const [fetchResult, setFetchResult] = useState<{
        success: boolean
        data?: any
        error?: string
        loading: boolean
    }>({ success: false, loading: false })
    const [isTesting, setIsTesting] = useState(false)
    const [filter, setFilter] = useState<'all' | 'success' | 'error' | 'pending'>('all')

    // Initialiser les résultats avec tous les livres
    const initializeResults = () => {
        const initial: TestResult[] = AELF_BOOKS_LIST.map(book => ({
            code: book.code,
            fullName: book.fullName,
            chapter: book.startsAt !== undefined ? book.startsAt : 1,
            status: 'pending'
        }))
        setResults(initial)
    }

    // Tester un seul livre
    const testBook = async (book: typeof AELF_BOOKS_LIST[0]): Promise<TestResult> => {
        const chapter = book.startsAt !== undefined ? book.startsAt : 1
        const startTime = Date.now()

        try {
            const response = await fetch(`/api/bible?ref=${book.code} ${chapter}`)
            const data = await response.json()
            const responseTime = Date.now() - startTime

            if (!response.ok) {
                return {
                    code: book.code,
                    fullName: book.fullName,
                    chapter,
                    status: 'error',
                    error: data.error || `HTTP ${response.status}`,
                    responseTime
                }
            }

            return {
                code: book.code,
                fullName: book.fullName,
                chapter,
                status: 'success',
                responseTime
            }
        } catch (err: any) {
            return {
                code: book.code,
                fullName: book.fullName,
                chapter,
                status: 'error',
                error: err.message
            }
        }
    }

    // Tester tous les livres
    const testAllBooks = async () => {
        setIsTesting(true)
        initializeResults()

        for (const book of AELF_BOOKS_LIST) {
            setResults(prev => prev.map(r =>
                r.code === book.code ? { ...r, status: 'testing' as const } : r
            ))

            const result = await testBook(book)

            setResults(prev => prev.map(r =>
                r.code === book.code ? result : r
            ))

            await new Promise(resolve => setTimeout(resolve, 200))
        }

        setIsTesting(false)
    }

    // Parser intelligent
    const handleSmartSearch = () => {
        const result = parseBibleReference(searchQuery)
        setParseResult(result)
        setFetchResult({ success: false, loading: false })
    }

    // Tester la requête AELF
    const handleTestFetch = async (code?: string, chapter?: number) => {
        const bookCode = code || parseResult?.bookCode
        const chapterNum = chapter || parseResult?.chapter

        if (!bookCode || !chapterNum) return

        setFetchResult({ success: false, loading: true })

        try {
            const response = await fetch(`/api/bible?ref=${bookCode} ${chapterNum}`)
            const data = await response.json()

            if (!response.ok) {
                setFetchResult({ success: false, error: data.error, loading: false })
            } else {
                setFetchResult({ success: true, data, loading: false })
            }
        } catch (err: any) {
            setFetchResult({ success: false, error: err.message, loading: false })
        }
    }

    // Sélectionner une suggestion
    const handleSelectSuggestion = (suggestion: BookSuggestion) => {
        // Extraire le numéro de chapitre de la recherche originale
        const chapterMatch = searchQuery.match(/(\d+)\s*$/)
        const chapter = chapterMatch ? parseInt(chapterMatch[1], 10) : 1

        setParseResult({
            success: true,
            bookCode: suggestion.code,
            bookName: suggestion.fullName,
            chapter
        })
    }

    // Stats
    const stats = {
        total: results.length,
        success: results.filter(r => r.status === 'success').length,
        error: results.filter(r => r.status === 'error').length,
        pending: results.filter(r => r.status === 'pending' || r.status === 'testing').length
    }

    const filteredResults = results.filter(r => {
        if (filter === 'all') return true
        if (filter === 'pending') return r.status === 'pending' || r.status === 'testing'
        return r.status === filter
    })

    return (
        <div style={{ padding: '2rem', maxWidth: '1200px', margin: '0 auto' }}>
            <h1 style={{ marginBottom: '0.5rem', color: '#1E3A8A' }}>
                🔍 Test de la Table de Mapping AELF
            </h1>
            <p style={{ color: '#6B7280', marginBottom: '2rem' }}>
                Cette page permet de tester le parser intelligent et chaque livre de la Bible sur AELF.
            </p>

            {/* Section Parser Intelligent */}
            <div style={{
                padding: '1.5rem',
                background: 'linear-gradient(135deg, #EDE9FE, #DDD6FE)',
                borderRadius: '0.75rem',
                marginBottom: '2rem',
                border: '1px solid #C4B5FD'
            }}>
                <h2 style={{ marginBottom: '1rem', color: '#5B21B6' }}>🧠 Test du Parser Intelligent</h2>
                <p style={{ fontSize: '0.875rem', color: '#7C3AED', marginBottom: '1rem' }}>
                    Testez différents formats : "ezekiel 1", "1 timothée 5", "timothée 1 ch 5", "jean 3"...
                </p>
                <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '1rem' }}>
                    <input
                        type="text"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        onKeyDown={(e) => e.key === 'Enter' && handleSmartSearch()}
                        placeholder="Entrez une référence biblique..."
                        style={{
                            flex: 1,
                            padding: '0.75rem',
                            border: '2px solid #C4B5FD',
                            borderRadius: '0.5rem',
                            fontSize: '1rem',
                            background: 'white'
                        }}
                    />
                    <button
                        onClick={handleSmartSearch}
                        style={{
                            padding: '0.75rem 1.5rem',
                            background: '#7C3AED',
                            color: 'white',
                            border: 'none',
                            borderRadius: '0.5rem',
                            cursor: 'pointer',
                            fontWeight: '600'
                        }}
                    >
                        Parser
                    </button>
                </div>

                {/* Résultat du parsing */}
                {parseResult && (
                    <div style={{
                        padding: '1rem',
                        background: parseResult.success ? '#D1FAE5' : parseResult.suggestions ? '#FEF3C7' : '#FEE2E2',
                        borderRadius: '0.5rem',
                        marginBottom: '1rem'
                    }}>
                        {parseResult.success ? (
                            <div>
                                <div style={{ color: '#065F46', marginBottom: '0.5rem' }}>
                                    ✅ <strong>Parsé avec succès !</strong>
                                </div>
                                <div style={{ fontSize: '0.9rem', color: '#064E3B' }}>
                                    <strong>Livre :</strong> {parseResult.bookName} ({parseResult.bookCode})<br />
                                    <strong>Chapitre :</strong> {parseResult.chapter}
                                </div>
                                <button
                                    onClick={() => handleTestFetch()}
                                    disabled={fetchResult.loading}
                                    style={{
                                        marginTop: '0.75rem',
                                        padding: '0.5rem 1rem',
                                        background: fetchResult.loading ? '#D1D5DB' : '#10B981',
                                        color: 'white',
                                        border: 'none',
                                        borderRadius: '0.25rem',
                                        cursor: fetchResult.loading ? 'not-allowed' : 'pointer'
                                    }}
                                >
                                    {fetchResult.loading ? '⏳ Chargement...' : '🌐 Tester sur AELF'}
                                </button>
                            </div>
                        ) : parseResult.suggestions && parseResult.suggestions.length > 0 ? (
                            <div>
                                <div style={{ color: '#92400E', marginBottom: '0.75rem' }}>
                                    ⚠️ <strong>{parseResult.error}</strong>
                                </div>
                                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem' }}>
                                    {parseResult.suggestions.map(s => (
                                        <button
                                            key={s.code}
                                            onClick={() => handleSelectSuggestion(s)}
                                            style={{
                                                padding: '0.5rem 1rem',
                                                background: '#FCD34D',
                                                color: '#78350F',
                                                border: '1px solid #F59E0B',
                                                borderRadius: '0.25rem',
                                                cursor: 'pointer',
                                                fontSize: '0.875rem'
                                            }}
                                        >
                                            {s.code} - {s.fullName}
                                        </button>
                                    ))}
                                </div>
                            </div>
                        ) : (
                            <div style={{ color: '#991B1B' }}>
                                ❌ <strong>{parseResult.error}</strong>
                            </div>
                        )}
                    </div>
                )}

                {/* Résultat du fetch AELF */}
                {fetchResult.success && fetchResult.data && (
                    <div style={{
                        padding: '1rem',
                        background: '#ECFDF5',
                        borderRadius: '0.5rem',
                        border: '1px solid #6EE7B7'
                    }}>
                        <div style={{ color: '#065F46', marginBottom: '0.5rem' }}>
                            ✅ <strong>Récupéré depuis AELF !</strong>
                        </div>
                        <div style={{ fontSize: '0.875rem', color: '#064E3B' }}>
                            <strong>{fetchResult.data.book} {fetchResult.data.chapter}</strong> - {fetchResult.data.verses?.length || 0} versets
                        </div>
                        <div style={{
                            marginTop: '0.75rem',
                            padding: '0.75rem',
                            background: 'white',
                            borderRadius: '0.25rem',
                            maxHeight: '150px',
                            overflow: 'auto',
                            fontSize: '0.875rem',
                            lineHeight: '1.6'
                        }}>
                            {fetchResult.data.verses?.slice(0, 3).map((v: any) => (
                                <p key={v.verseNumber} style={{ marginBottom: '0.5rem' }}>
                                    <strong>{v.verseNumber}</strong> {v.text}
                                </p>
                            ))}
                            {fetchResult.data.verses?.length > 3 && (
                                <p style={{ color: '#6B7280', fontStyle: 'italic' }}>
                                    ... et {fetchResult.data.verses.length - 3} versets de plus
                                </p>
                            )}
                        </div>
                    </div>
                )}

                {fetchResult.error && (
                    <div style={{
                        padding: '1rem',
                        background: '#FEE2E2',
                        borderRadius: '0.5rem',
                        color: '#991B1B'
                    }}>
                        ❌ <strong>Erreur AELF :</strong> {fetchResult.error}
                    </div>
                )}
            </div>

            {/* Section Stats */}
            <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(4, 1fr)',
                gap: '1rem',
                marginBottom: '2rem'
            }}>
                <div style={{ padding: '1rem', background: '#F3F4F6', borderRadius: '0.5rem', textAlign: 'center' }}>
                    <div style={{ fontSize: '2rem', fontWeight: 'bold' }}>{stats.total}</div>
                    <div style={{ color: '#6B7280' }}>Total</div>
                </div>
                <div style={{ padding: '1rem', background: '#D1FAE5', borderRadius: '0.5rem', textAlign: 'center' }}>
                    <div style={{ fontSize: '2rem', fontWeight: 'bold', color: '#065F46' }}>{stats.success}</div>
                    <div style={{ color: '#065F46' }}>Succès</div>
                </div>
                <div style={{ padding: '1rem', background: '#FEE2E2', borderRadius: '0.5rem', textAlign: 'center' }}>
                    <div style={{ fontSize: '2rem', fontWeight: 'bold', color: '#991B1B' }}>{stats.error}</div>
                    <div style={{ color: '#991B1B' }}>Erreurs</div>
                </div>
                <div style={{ padding: '1rem', background: '#FEF3C7', borderRadius: '0.5rem', textAlign: 'center' }}>
                    <div style={{ fontSize: '2rem', fontWeight: 'bold', color: '#92400E' }}>{stats.pending}</div>
                    <div style={{ color: '#92400E' }}>En attente</div>
                </div>
            </div>

            {/* Bouton de test et filtres */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                <button
                    onClick={testAllBooks}
                    disabled={isTesting}
                    style={{
                        padding: '1rem 2rem',
                        background: isTesting ? '#D1D5DB' : '#6EE7B7',
                        color: isTesting ? '#9CA3AF' : '#064E3B',
                        border: 'none',
                        borderRadius: '0.5rem',
                        cursor: isTesting ? 'not-allowed' : 'pointer',
                        fontWeight: '600',
                        fontSize: '1rem'
                    }}
                >
                    {isTesting ? '⏳ Test en cours...' : '🚀 Tester tous les livres'}
                </button>

                <div style={{ display: 'flex', gap: '0.5rem' }}>
                    {(['all', 'success', 'error', 'pending'] as const).map((f) => (
                        <button
                            key={f}
                            onClick={() => setFilter(f)}
                            style={{
                                padding: '0.5rem 1rem',
                                background: filter === f ? '#4F46E5' : '#E5E7EB',
                                color: filter === f ? 'white' : '#374151',
                                border: 'none',
                                borderRadius: '0.5rem',
                                cursor: 'pointer'
                            }}
                        >
                            {f === 'all' ? 'Tous' : f === 'success' ? '✅' : f === 'error' ? '❌' : '⏳'}
                        </button>
                    ))}
                </div>
            </div>

            {/* Liste des livres */}
            <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))',
                gap: '0.75rem'
            }}>
                {filteredResults.map((result) => (
                    <div
                        key={result.code}
                        style={{
                            padding: '1rem',
                            borderRadius: '0.5rem',
                            border: '1px solid',
                            borderColor: result.status === 'success' ? '#6EE7B7' :
                                result.status === 'error' ? '#FCA5A5' :
                                    result.status === 'testing' ? '#FCD34D' : '#E5E7EB',
                            background: result.status === 'success' ? '#F0FDF4' :
                                result.status === 'error' ? '#FEF2F2' :
                                    result.status === 'testing' ? '#FFFBEB' : 'white'
                        }}
                    >
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                            <div>
                                <span style={{ fontWeight: 'bold', marginRight: '0.5rem' }}>{result.code}</span>
                                <span style={{ color: '#6B7280', fontSize: '0.875rem' }}>ch. {result.chapter}</span>
                            </div>
                            <span>
                                {result.status === 'success' && '✅'}
                                {result.status === 'error' && '❌'}
                                {result.status === 'testing' && '⏳'}
                                {result.status === 'pending' && '⬜'}
                            </span>
                        </div>
                        <div style={{ fontSize: '0.875rem', color: '#374151', marginTop: '0.25rem' }}>
                            {result.fullName}
                        </div>
                        {result.error && (
                            <div style={{ fontSize: '0.75rem', color: '#991B1B', marginTop: '0.5rem' }}>
                                {result.error}
                            </div>
                        )}
                        {result.responseTime && (
                            <div style={{ fontSize: '0.75rem', color: '#6B7280', marginTop: '0.25rem' }}>
                                {result.responseTime}ms
                            </div>
                        )}
                    </div>
                ))}
            </div>

            {/* Info sur le mapping */}
            <div style={{
                marginTop: '2rem',
                padding: '1rem',
                background: '#F3F4F6',
                borderRadius: '0.5rem',
                fontSize: '0.875rem',
                color: '#6B7280'
            }}>
                <strong>Statistiques du mapping :</strong><br />
                • {AELF_BOOKS_LIST.length} livres dans AELF_BOOKS_LIST<br />
                • {Object.keys(BOOK_MAPPING).length} alias dans BOOK_MAPPING
            </div>
        </div>
    )
}
