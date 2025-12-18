'use client';

import { useState } from 'react';
import { Clock, CheckCircle2, AlertCircle } from 'lucide-react';
import ShareFiorettoModal from './ShareFiorettoModal';

interface FiorettiButtonProps {
    element: any;
    elementType: 'grace' | 'priere' | 'ecriture' | 'parole' | 'rencontre';
    formattedContent?: string;
}

export default function FiorettiButton({ element, elementType, formattedContent }: FiorettiButtonProps) {
    const [isModalOpen, setIsModalOpen] = useState(false);
    const statut = element.statutPartage || element.statut_partage || 'brouillon';

    // Couleurs par type d'élément
    const colors = {
        grace: { bg: '#FCD34D', hover: '#FBBF24', text: '#78350F' },
        priere: { bg: '#93C5FD', hover: '#60A5FA', text: '#1E3A8A' },
        ecriture: { bg: '#6EE7B7', hover: '#34D399', text: '#065F46' },
        parole: { bg: '#7DD3FC', hover: '#0EA5E9', text: '#075985' },
        rencontre: { bg: '#FDBA74', hover: '#F97316', text: '#92400E' }
    }[elementType];

    // États possibles : brouillon, propose, approuve, refuse
    // État: En attente de validation
    if (statut === 'propose') {
        return (
            <div style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '0.5rem',
                padding: '0.75rem 1.25rem',
                borderRadius: '2rem',
                background: '#FEF3C7',
                color: '#92400E',
                fontSize: '0.875rem',
                fontWeight: '500',
                border: '2px solid #FDE68A'
            }}>
                <Clock size={16} />
                En attente de validation
            </div>
        );
    }

    // État: Publié dans la communauté
    if (statut === 'approuve') {
        return (
            <div style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '0.5rem',
                padding: '0.75rem 1.25rem',
                borderRadius: '2rem',
                background: '#D1FAE5',
                color: '#065F46',
                fontSize: '0.875rem',
                fontWeight: '500',
                border: '2px solid #6EE7B7'
            }}>
                <CheckCircle2 size={16} />
                Publié dans la communauté
            </div>
        );
    }

    // État: Non retenu
    if (statut === 'refuse') {
        return (
            <div style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '0.5rem',
                padding: '0.75rem 1.25rem',
                borderRadius: '2rem',
                background: '#FEE2E2',
                color: '#991B1B',
                fontSize: '0.875rem',
                fontWeight: '500',
                border: '2px solid #FECACA'
            }}>
                <AlertCircle size={16} />
                Non retenu
            </div>
        );
    }

    // État normal: Bouton de partage
    return (
        <>
            <button
                onClick={() => setIsModalOpen(true)}
                style={{
                    background: colors.bg,
                    color: colors.text,
                    padding: '0.75rem 1.5rem',
                    borderRadius: '0.5rem',
                    border: 'none',
                    fontWeight: '500',
                    cursor: 'pointer',
                    boxShadow: '0 2px 4px rgba(0, 0, 0, 0.1)',
                    transition: 'all 0.2s',
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '0.5rem',
                    fontSize: '1rem'
                }}
                onMouseEnter={(e) => {
                    e.currentTarget.style.background = colors.hover;
                    e.currentTarget.style.transform = 'translateY(-2px)';
                    e.currentTarget.style.boxShadow = '0 4px 8px rgba(0, 0, 0, 0.15)';
                }}
                onMouseLeave={(e) => {
                    e.currentTarget.style.background = colors.bg;
                    e.currentTarget.style.transform = 'translateY(0)';
                    e.currentTarget.style.boxShadow = '0 2px 4px rgba(0, 0, 0, 0.1)';
                }}
            >
                🌸 Partager ce fioretti
            </button>

            <ShareFiorettoModal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                element={element}
                elementType={elementType}
                formattedContent={formattedContent}
            />
        </>
    );
}
