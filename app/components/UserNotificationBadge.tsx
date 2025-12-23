'use client';

import { useState, useEffect } from 'react';
import { supabase } from '@/app/lib/supabase';

export default function UserNotificationBadge() {
    const [count, setCount] = useState(0);

    useEffect(() => {
        checkUnreadNotifications();

        // Rafraîchir toutes les 30 secondes
        const interval = setInterval(checkUnreadNotifications, 30000);
        return () => clearInterval(interval);
    }, []);

    const checkUnreadNotifications = async () => {
        try {
            const { data: { user } } = await supabase.auth.getUser();
            if (!user) return;

            // Compter les notifications non lues de l'utilisateur
            const { count: unreadCount, error } = await supabase
                .from('notifications')
                .select('*', { count: 'exact', head: true })
                .eq('user_id', user.id)
                .eq('lu', false);

            if (error) throw error;

            setCount(unreadCount || 0);
        } catch (err) {
            console.error('Erreur vérification notifications:', err);
        }
    };

    // Écouter l'événement de clic sur le menu pour rafraîchir
    useEffect(() => {
        const handleMenuClick = () => {
            checkUnreadNotifications();
        };

        window.addEventListener('mes-fioretti-menu-clicked', handleMenuClick);
        return () => window.removeEventListener('mes-fioretti-menu-clicked', handleMenuClick);
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
                background: '#DC2626',
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
