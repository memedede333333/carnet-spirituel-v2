'use client';

import { useState, useEffect } from 'react';
import { supabase } from '@/app/lib/supabase';

export default function FiorettiMenuBadge() {
    const [count, setCount] = useState(0);

    useEffect(() => {
        checkNewFioretti();
    }, []);

    const checkNewFioretti = async () => {
        try {
            // Récupérer le timestamp du dernier clic sur le menu
            const lastClick = localStorage.getItem('fioretti_menu_last_click');

            // Si jamais cliqué, ne rien afficher (pas de spam initial)
            if (!lastClick) {
                // On initialise avec la date actuelle pour éviter le spam lors de la première visite
                localStorage.setItem('fioretti_menu_last_click', new Date().toISOString());
                return;
            }

            // Compter les fioretti approuvés depuis le dernier clic
            const { count: newCount, error } = await supabase
                .from('fioretti')
                .select('*', { count: 'exact', head: true })
                .eq('statut', 'approuve')
                .gte('date_publication', lastClick);

            if (error) throw error;

            setCount(newCount || 0);
        } catch (err) {
            console.error('Erreur vérification nouveaux fioretti:', err);
        }
    };

    // Fonction appelée depuis le layout quand on clique sur le lien
    useEffect(() => {
        // Écouter l'événement personnalisé de clic sur le menu
        const handleMenuClick = () => {
            setCount(0);
            localStorage.setItem('fioretti_menu_last_click', new Date().toISOString());
        };

        window.addEventListener('fioretti-menu-clicked', handleMenuClick);
        return () => window.removeEventListener('fioretti-menu-clicked', handleMenuClick);
    }, []);

    if (count === 0) return null;

    return (
        <div
            style={{
                position: 'absolute',
                top: '0',
                right: '0',
                width: '18px',
                height: '18px',
                borderRadius: '50%',
                background: '#EF4444',
                color: 'white',
                fontSize: '11px',
                fontWeight: 'bold',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                border: '2px solid white',
                boxShadow: '0 2px 4px rgba(0, 0, 0, 0.2)',
                zIndex: 10,
                animation: 'pulse-badge 2s ease-in-out infinite'
            }}
        >
            {count > 9 ? '9+' : count}

            <style jsx>{`
                @keyframes pulse-badge {
                    0%, 100% {
                        transform: scale(1);
                        opacity: 1;
                    }
                    50% {
                        transform: scale(1.1);
                        opacity: 0.9;
                    }
                }
            `}</style>
        </div>
    );
}
