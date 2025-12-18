'use client';

import { useState, useEffect } from 'react';
import { supabase } from '@/app/lib/supabase';
import Link from 'next/link';
import { X } from 'lucide-react';

export default function NewFiorettiAlert() {
    const [count, setCount] = useState(0);
    const [dismissed, setDismissed] = useState(true);
    const [lastCheck, setLastCheck] = useState<string | null>(null);

    useEffect(() => {
        checkNewFioretti();
    }, []);

    const checkNewFioretti = async () => {
        try {
            // Récupérer la dernière consultation depuis localStorage
            const lastCheckStored = localStorage.getItem('fioretti_last_check');
            setLastCheck(lastCheckStored);

            // Si jamais consulté, ne pas afficher (évite spam au premier chargement)
            if (!lastCheckStored) {
                localStorage.setItem('fioretti_last_check', new Date().toISOString());
                return;
            }

            // Compter les fioretti approuvés depuis la dernière consultation
            const { count: newCount, error } = await supabase
                .from('fioretti')
                .select('*', { count: 'exact', head: true })
                .eq('statut', 'approuve')
                .gte('date_publication', lastCheckStored);

            if (error) throw error;

            if (newCount && newCount > 0) {
                setCount(newCount);
                setDismissed(false);
            }
        } catch (err) {
            console.error('Erreur vérification nouveaux fioretti:', err);
        }
    };

    const handleDismiss = () => {
        setDismissed(true);
        localStorage.setItem('fioretti_last_check', new Date().toISOString());
    };

    if (dismissed || count === 0) return null;

    return (
        <div
            className="fade-in"
            style={{
                background: 'white',
                border: '2px solid #FEF3C7',
                borderRadius: '1rem',
                padding: '1rem 1.5rem',
                marginBottom: '2rem',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                gap: '1rem',
                boxShadow: '0 2px 8px rgba(251, 191, 36, 0.1)',
                flexWrap: 'wrap'
            }}
        >
            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', flex: 1 }}>
                <span style={{ fontSize: '1.5rem' }}>✨</span>
                <div>
                    <p style={{
                        fontSize: '0.95rem',
                        color: '#78350F',
                        fontWeight: '500',
                        marginBottom: '0.25rem'
                    }}>
                        {count === 1
                            ? 'Un nouveau témoignage partagé'
                            : `${count} nouveaux témoignages partagés`
                        }
                    </p>
                    <p style={{
                        fontSize: '0.75rem',
                        color: '#92400E',
                        fontStyle: 'italic',
                        opacity: 0.8
                    }}>
                        Découvrez les grâces de la communauté
                    </p>
                </div>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                <Link
                    href="/fioretti"
                    onClick={handleDismiss}
                    style={{
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '0.5rem',
                        padding: '0.625rem 1.25rem',
                        background: '#F59E0B',
                        color: 'white',
                        borderRadius: '0.75rem',
                        textDecoration: 'none',
                        fontSize: '0.875rem',
                        fontWeight: '500',
                        transition: 'all 0.2s',
                        whiteSpace: 'nowrap'
                    }}
                    onMouseEnter={(e) => {
                        e.currentTarget.style.background = '#D97706';
                        e.currentTarget.style.transform = 'translateY(-2px)';
                    }}
                    onMouseLeave={(e) => {
                        e.currentTarget.style.background = '#F59E0B';
                        e.currentTarget.style.transform = 'translateY(0)';
                    }}
                >
                    Découvrir
                </Link>

                <button
                    onClick={handleDismiss}
                    style={{
                        width: '2rem',
                        height: '2rem',
                        borderRadius: '50%',
                        border: '2px solid #FEF3C7',
                        background: 'white',
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        color: '#92400E',
                        transition: 'all 0.2s',
                        flexShrink: 0
                    }}
                    onMouseEnter={(e) => {
                        e.currentTarget.style.background = '#FFFBEB';
                        e.currentTarget.style.borderColor = '#F59E0B';
                    }}
                    onMouseLeave={(e) => {
                        e.currentTarget.style.background = 'white';
                        e.currentTarget.style.borderColor = '#FEF3C7';
                    }}
                >
                    <X size={14} />
                </button>
            </div>
        </div>
    );
}
