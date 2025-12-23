'use client';

import { useState, useEffect } from 'react';
import { supabase } from '@/app/lib/supabase';

export default function ModerationBadge() {
    const [count, setCount] = useState(0);

    useEffect(() => {
        checkPendingFioretti();

        // Rafraîchir toutes les 30 secondes
        const interval = setInterval(checkPendingFioretti, 30000);
        return () => clearInterval(interval);
    }, []);

    const checkPendingFioretti = async () => {
        try {
            // Compter les fioretti en attente de modération
            const { count: pendingCount, error } = await supabase
                .from('fioretti')
                .select('*', { count: 'exact', head: true })
                .eq('statut', 'propose');

            if (error) throw error;

            setCount(pendingCount || 0);
        } catch (err) {
            console.error('Erreur vérification fioretti en attente:', err);
        }
    };

    // Écouter l'événement de clic sur le menu pour rafraîchir
    useEffect(() => {
        const handleMenuClick = () => {
            checkPendingFioretti();
        };

        window.addEventListener('moderation-menu-clicked', handleMenuClick);
        return () => window.removeEventListener('moderation-menu-clicked', handleMenuClick);
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
                background: '#F59E0B',
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
