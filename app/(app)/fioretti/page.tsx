'use client';

import { useState, useEffect } from 'react';
import { supabase } from '@/app/lib/supabase';
import { Fioretto } from '@/app/types';
import FiorettoCard from '@/app/components/FiorettoCard';
import { Loader2 } from 'lucide-react';

export default function FiorettiPage() {
    const [fioretti, setFioretti] = useState<Fioretto[]>([]);
    const [loading, setLoading] = useState(true);
    const [filter, setFilter] = useState<'all' | 'grace' | 'priere' | 'ecriture' | 'parole' | 'rencontre'>('all');

    useEffect(() => {
        fetchFioretti();
    }, []);

    const fetchFioretti = async () => {
        try {
            const { data, error } = await supabase
                .from('fioretti')
                .select(`
          *,
          interactions:fioretti_interactions(type_interaction)
        `)
                .eq('statut', 'approuve')
                .order('date_publication', { ascending: false })
                .limit(50);

            if (error) throw error;

            const formattedData = (data || []).map((item: any) => ({
                ...item,
                _count: {
                    soutien: item.interactions.filter((i: any) => i.type_interaction === 'soutien').length,
                    action_grace: item.interactions.filter((i: any) => i.type_interaction === 'action_grace').length
                }
            }));

            setFioretti(formattedData);
        } catch (err) {
            console.error('Erreur chargement jardin:', err);
        } finally {
            setLoading(false);
        }
    };

    const filteredFioretti = filter === 'all'
        ? fioretti
        : fioretti.filter(f => f.element_type === filter);

    return (
        <div style={{
            minHeight: '100vh',
            backgroundColor: '#FFFBEB',
            padding: '2rem 1rem'
        }}>
            <div style={{ maxWidth: '1200px', margin: '0 auto' }}>

                {/* En-tête */}
                <div style={{ textAlign: 'center', marginBottom: '3rem' }}>
                    <div style={{
                        display: 'inline-flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        marginBottom: '1.5rem'
                    }}>
                        <div style={{
                            fontSize: '3rem',
                            background: 'linear-gradient(135deg, #FEF3C7, #FDE68A)',
                            borderRadius: '50%',
                            width: '100px',
                            height: '100px',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            boxShadow: '0 4px 10px rgba(0, 0, 0, 0.1)'
                        }}>
                            🌸
                        </div>
                    </div>

                    <h1 style={{
                        fontSize: '2.5rem',
                        fontWeight: 'bold',
                        color: '#78350F',
                        marginBottom: '0.75rem'
                    }}>
                        Le Jardin des Fioretti
                    </h1>

                    <p style={{
                        fontSize: '1.125rem',
                        color: '#92400E',
                        fontStyle: 'italic',
                        maxWidth: '600px',
                        margin: '0 auto',
                        opacity: 0.8
                    }}>
                        « Partageons ensemble les grâces reçues, cultivons la joie de croire »
                    </p>
                </div>

                {/* Filtres */}
                <div style={{
                    display: 'flex',
                    flexWrap: 'wrap',
                    justifyContent: 'center',
                    gap: '0.75rem',
                    marginBottom: '2.5rem'
                }}>
                    <FilterButton active={filter === 'all'} onClick={() => setFilter('all')} label="Tout le jardin" emoji="🌸" />
                    <FilterButton active={filter === 'grace'} onClick={() => setFilter('grace')} label="Grâces" emoji="✨" />
                    <FilterButton active={filter === 'priere'} onClick={() => setFilter('priere')} label="Prières" emoji="🙏" />
                    <FilterButton active={filter === 'ecriture'} onClick={() => setFilter('ecriture')} label="Écritures" emoji="📖" />
                    <FilterButton active={filter === 'parole'} onClick={() => setFilter('parole')} label="Paroles" emoji="🕊️" />
                    <FilterButton active={filter === 'rencontre'} onClick={() => setFilter('rencontre')} label="Rencontres" emoji="🤝" />
                </div>

                {/* Grille de cartes */}
                {loading ? (
                    <div style={{
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'center',
                        justifyContent: 'center',
                        padding: '4rem 0'
                    }}>
                        <Loader2 size={48} color="#D97706" style={{ marginBottom: '1rem' }} />
                        <p style={{ color: '#92400E', fontStyle: 'italic' }}>Le jardin s'éveille...</p>
                    </div>
                ) : filteredFioretti.length === 0 ? (
                    <div style={{
                        textAlign: 'center',
                        padding: '4rem 2rem',
                        background: 'white',
                        borderRadius: '1rem',
                        boxShadow: '0 4px 6px rgba(0, 0, 0, 0.05)',
                        border: '2px solid #FEF3C7'
                    }}>
                        <div style={{ fontSize: '4rem', marginBottom: '1rem' }}>🌱</div>
                        <h3 style={{
                            fontSize: '1.5rem',
                            fontWeight: '600',
                            color: '#78350F',
                            marginBottom: '0.5rem'
                        }}>
                            Le jardin attend ses premières fleurs
                        </h3>
                        <p style={{ color: '#92400E', fontStyle: 'italic' }}>
                            Soyez le premier à partager une grâce !
                        </p>
                    </div>
                ) : (
                    <div style={{
                        display: 'grid',
                        gridTemplateColumns: 'repeat(auto-fill, minmax(350px, 1fr))',
                        gap: '1.5rem',
                        marginBottom: '2rem'
                    }}>
                        {filteredFioretti.map((fioretto) => (
                            <FiorettoCard key={fioretto.id} fioretto={fioretto} />
                        ))}
                    </div>
                )}

                {/* Citation */}
                {!loading && filteredFioretti.length > 0 && (
                    <div style={{
                        marginTop: '3rem',
                        textAlign: 'center',
                        paddingTop: '2rem',
                        borderTop: '1px solid #FEF3C7'
                    }}>
                        <p style={{
                            fontSize: '1rem',
                            color: '#92400E',
                            fontStyle: 'italic',
                            maxWidth: '600px',
                            margin: '0 auto',
                            opacity: 0.7
                        }}>
                            « Que toute la vie devienne louange et que chaque instant soit une petite fleur offerte au Seigneur »
                        </p>
                    </div>
                )}
            </div>
        </div>
    );
}

function FilterButton({ active, onClick, label, emoji }: any) {
    return (
        <button
            onClick={onClick}
            style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '0.5rem',
                padding: '0.625rem 1.25rem',
                borderRadius: '9999px',
                border: active ? 'none' : '2px solid #FEF3C7',
                background: active ? '#FCD34D' : 'white',
                color: active ? '#78350F' : '#92400E',
                fontWeight: active ? '600' : '500',
                cursor: 'pointer',
                fontSize: '0.9rem',
                boxShadow: active ? '0 2px 4px rgba(0, 0, 0, 0.1)' : 'none',
                transition: 'all 0.2s'
            }}
            onMouseEnter={(e) => {
                if (!active) {
                    e.currentTarget.style.background = '#FFFBEB';
                    e.currentTarget.style.borderColor = '#FDE68A';
                }
            }}
            onMouseLeave={(e) => {
                if (!active) {
                    e.currentTarget.style.background = 'white';
                    e.currentTarget.style.borderColor = '#FEF3C7';
                }
            }}
        >
            <span style={{ fontSize: '1.1rem' }}>{emoji}</span>
            <span>{label}</span>
        </button>
    );
}
