
'use client'

import { useState } from 'react'
import BibleSearch from '@/app/components/BibleSearch'

export default function TestBiblePage() {
    const [showSearch, setShowSearch] = useState(false)
    const [content, setContent] = useState('')

    return (
        <div style={{ padding: '2rem' }}>
            <h1>Test Intégration Bible AELF</h1>

            <div style={{ margin: '2rem 0' }}>
                <button
                    onClick={() => setShowSearch(true)}
                    style={{
                        padding: '1rem',
                        background: '#4F46E5',
                        color: 'white',
                        border: 'none',
                        borderRadius: '0.5rem',
                        cursor: 'pointer'
                    }}
                >
                    Ouvrir la recherche AELF
                </button>
            </div>

            <textarea
                value={content}
                onChange={(e) => setContent(e.target.value)}
                rows={10}
                style={{
                    width: '100%',
                    padding: '1rem',
                    border: '1px solid #ccc',
                    borderRadius: '0.5rem'
                }}
                placeholder="Le texte importé s'affichera ici..."
            />

            {showSearch && (
                <BibleSearch
                    onImport={(text) => {
                        setContent(prev => prev + (prev ? '\n\n' : '') + text)
                        setShowSearch(false)
                    }}
                    onCancel={() => setShowSearch(false)}
                />
            )}
        </div>
    )
}
