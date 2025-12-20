'use client';

import { useState } from 'react';
import { Archive, ArchiveRestore } from 'lucide-react';
import { archiveFioretto, unarchiveFioretto } from '@/app/lib/fioretti-helpers';
import { Fioretto } from '@/app/types';

interface ArchiveManagerProps {
    fioretto: Fioretto;
    onArchiveChange: () => void;
}

export default function ArchiveManager({ fioretto, onArchiveChange }: ArchiveManagerProps) {
    const [isProcessing, setIsProcessing] = useState(false);

    const handleArchive = async () => {
        if (!confirm('Archiver ce fioretto ? Il ne sera plus visible dans le jardin public.')) {
            return;
        }

        setIsProcessing(true);
        try {
            const success = await archiveFioretto(fioretto.id);
            if (success) {
                onArchiveChange();
            } else {
                alert('Erreur lors de l\'archivage');
            }
        } catch (error) {
            console.error('Archive error:', error);
            alert('Erreur lors de l\'archivage');
        } finally {
            setIsProcessing(false);
        }
    };

    const handleUnarchive = async () => {
        setIsProcessing(true);
        try {
            const success = await unarchiveFioretto(fioretto.id);
            if (success) {
                onArchiveChange();
            } else {
                alert('Erreur lors du désarchivage');
            }
        } catch (error) {
            console.error('Unarchive error:', error);
            alert('Erreur lors du désarchivage');
        } finally {
            setIsProcessing(false);
        }
    };

    // Fioretto archivé : bouton désarchiver
    if (fioretto.archived_at) {
        return (
            <button
                onClick={handleUnarchive}
                disabled={isProcessing}
                style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.5rem',
                    padding: '0.5rem 1rem',
                    background: isProcessing ? '#94A3B8' : '#10B981',
                    color: 'white',
                    border: 'none',
                    borderRadius: '0.5rem',
                    cursor: isProcessing ? 'not-allowed' : 'pointer',
                    fontSize: '0.875rem',
                    fontWeight: '500',
                    transition: 'all 0.2s',
                    opacity: isProcessing ? 0.6 : 1
                }}
                onMouseEnter={(e) => {
                    if (!isProcessing) e.currentTarget.style.transform = 'scale(1.05)';
                }}
                onMouseLeave={(e) => {
                    e.currentTarget.style.transform = 'scale(1)';
                }}
            >
                <ArchiveRestore size={16} />
                {isProcessing ? 'Traitement...' : 'Désarchiver'}
            </button>
        );
    }

    // Fioretto approuvé non archivé : bouton archiver
    if (fioretto.statut === 'approuve') {
        return (
            <button
                onClick={handleArchive}
                disabled={isProcessing}
                style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.5rem',
                    padding: '0.5rem 1rem',
                    background: isProcessing ? '#94A3B8' : '#64748B',
                    color: 'white',
                    border: 'none',
                    borderRadius: '0.5rem',
                    cursor: isProcessing ? 'not-allowed' : 'pointer',
                    fontSize: '0.875rem',
                    fontWeight: '500',
                    transition: 'all 0.2s',
                    opacity: isProcessing ? 0.6 : 1
                }}
                onMouseEnter={(e) => {
                    if (!isProcessing) e.currentTarget.style.transform = 'scale(1.05)';
                }}
                onMouseLeave={(e) => {
                    e.currentTarget.style.transform = 'scale(1)';
                }}
            >
                <Archive size={16} />
                {isProcessing ? 'Traitement...' : 'Archiver'}
            </button>
        );
    }

    // Ni archivable ni archivé
    return null;
}

/**
 * Badge visuel pour indiquer qu'un fioretto est archivé
 */
export function ArchivedBadge() {
    return (
        <span style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '0.375rem',
            padding: '0.375rem 0.75rem',
            background: '#E2E8F0',
            color: '#475569',
            borderRadius: '9999px',
            fontSize: '0.75rem',
            fontWeight: '600',
            border: '2px solid #CBD5E1'
        }}>
            <Archive size={14} />
            Archivé
        </span>
    );
}
