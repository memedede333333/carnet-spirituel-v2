'use client';

import { useState, useEffect } from 'react';
import { supabase } from '@/app/lib/supabase';
import { Fioretto } from '@/app/types';
import { ShieldAlert, Loader2, Check } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { canModerate } from '@/app/lib/auth-helpers';

// Composants
import StatusFilter from '@/app/components/moderation/StatusFilter';
import TypeFilter from '@/app/components/moderation/TypeFilter';
import FiorettoModerationCard from '@/app/components/moderation/FiorettoModerationCard';
import PreviewModal from '@/app/components/moderation/PreviewModal';
import EditFiorettoModal from '@/app/components/EditFiorettoModal';
import ArchiveToggle from '@/app/components/ArchiveToggle';

export default function ModerationPage() {
    const [fioretti, setFioretti] = useState<Fioretto[]>([]);
    const [loading, setLoading] = useState(true);
    const [statutFilter, setStatutFilter] = useState<'propose' | 'approuve' | 'refuse'>('propose');
    const [typeFilter, setTypeFilter] = useState<'all' | 'grace' | 'priere' | 'ecriture' | 'parole' | 'rencontre'>('all');
    const [showArchived, setShowArchived] = useState(false);
    const [previewFioretto, setPreviewFioretto] = useState<Fioretto | null>(null);
    const [editingFioretto, setEditingFioretto] = useState<Fioretto | null>(null);
    const router = useRouter();

    useEffect(() => {
        checkPermissionsAndFetch();
    }, [statutFilter, showArchived]);

    const checkPermissionsAndFetch = async () => {
        try {
            const { data: { user } } = await supabase.auth.getUser();
            if (!user) {
                router.push('/login');
                return;
            }

            const hasPermission = await canModerate();
            if (!hasPermission) {
                router.push('/dashboard');
                return;
            }

            // Construire la query avec les infos auteur
            let query = supabase
                .from('fioretti')
                .select(`
                    *,
                    author:profiles!user_id(id, prenom, nom, email)
                `)
                .eq('statut', statutFilter);

            // Filtrer archivés pour les validés
            if (statutFilter === 'approuve' && !showArchived) {
                query = query.is('archived_at', null);
            }

            const { data, error } = await query.order('created_at', { ascending: false });

            if (error) throw error;
            setFioretti(data as Fioretto[]);

        } catch (err) {
            console.error('Error:', err);
        } finally {
            setLoading(false);
        }
    };

    // Helper pour envoyer un email via l'API
    const sendEmailNotification = async (
        userEmail: string,
        userName: string,
        status: 'approuve' | 'refuse' | 'modifie',
        moderatorMessage?: string,
        fiorettoContent?: { type: string; text: string }
    ) => {
        try {
            await fetch('/api/send-email', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ userEmail, userName, status, moderatorMessage, fiorettoContent })
            });
        } catch (error) {
            console.error('Erreur envoi email:', error);
        }
    };


    const handleModeration = async (id: string, decision: 'approuve' | 'refuse') => {
        const action = decision === 'approuve' ? 'approuver' : 'refuser';
        if (!confirm(`Êtes-vous sûr de vouloir ${action} ce fioretto ?`)) return;

        try {
            const fioretto = fioretti.find(f => f.id === id);
            setFioretti(prev => prev.filter(f => f.id !== id));

            const { data: { user } } = await supabase.auth.getUser();

            // Mettre à jour le fioretto
            await supabase
                .from('fioretti')
                .update({
                    statut: decision,
                    moderateur_id: user?.id,
                    date_publication: decision === 'approuve' ? new Date().toISOString() : null
                })
                .eq('id', id);

            // Mettre à jour l'élément source
            if (fioretto) {
                const tableMap: Record<string, string> = {
                    grace: 'graces',
                    priere: 'prieres',
                    ecriture: 'paroles_ecriture',
                    parole: 'paroles_connaissance',
                    rencontre: 'rencontres_missionnaires'
                };

                const tableName = tableMap[fioretto.element_type];
                if (tableName) {
                    await supabase
                        .from(tableName)
                        .update({ statut_partage: decision })
                        .eq('id', fioretto.element_id);
                }

                // Créer notification pour l'auteur
                const notifMessage = decision === 'approuve'
                    ? 'Votre fioretto a été approuvé et est maintenant visible dans le Jardin des Fioretti.'
                    : 'Votre fioretto n\'a pas été approuvé pour publication.';

                await supabase
                    .from('notifications')
                    .insert({
                        user_id: fioretto.user_id,
                        type: decision === 'approuve' ? 'fioretto_approuve' : 'fioretto_refuse',
                        fioretto_id: id,
                        message: notifMessage
                    });

                // Envoyer email à l'auteur
                const { data: author } = await supabase
                    .from('profiles')
                    .select('email, prenom')
                    .eq('id', fioretto.user_id)
                    .single();

                if (author?.email) {
                    // Extraire le texte du fioretto
                    const content = typeof fioretto.contenu_affiche === 'string'
                        ? JSON.parse(fioretto.contenu_affiche)
                        : fioretto.contenu_affiche;
                    const fiorettoText = content?.texte || '';

                    await sendEmailNotification(
                        author.email,
                        author.prenom || 'Cher contributeur',
                        decision,
                        undefined,
                        { type: fioretto.element_type, text: fiorettoText }
                    );
                }
            }

        } catch (err) {
            console.error('Moderation error:', err);
            alert("Erreur lors de la modération");
            checkPermissionsAndFetch();
        }
    };

    const handleEdit = async (id: string, editedText: string, moderatorMessage?: string) => {
        try {
            const { data: { user } } = await supabase.auth.getUser();
            if (!user) return;

            const fioretto = fioretti.find(f => f.id === id);
            if (!fioretto) return;

            const content = typeof fioretto.contenu_affiche === 'string'
                ? JSON.parse(fioretto.contenu_affiche)
                : fioretto.contenu_affiche;

            const updatedContent = {
                ...content,
                texte: editedText
            };

            // 1. Update fioretto with new content, backup original, and approve
            const { error: fiorettoError } = await supabase
                .from('fioretti')
                .update({
                    contenu_original: fioretto.contenu_affiche, // Backup original
                    contenu_affiche: updatedContent,
                    message_moderateur: moderatorMessage || null,
                    statut: 'approuve',
                    moderateur_id: user.id,
                    date_publication: new Date().toISOString(),
                    date_moderation: new Date().toISOString()
                })
                .eq('id', id);

            if (fiorettoError) throw fiorettoError;

            // 2. Update source table status
            const tableMap: Record<string, string> = {
                grace: 'graces',
                priere: 'prieres',
                ecriture: 'paroles_ecriture',
                parole: 'paroles_connaissance',
                rencontre: 'rencontres_missionnaires'
            };

            const tableName = tableMap[fioretto.element_type];
            if (tableName) {
                await supabase
                    .from(tableName)
                    .update({ statut_partage: 'approuve' })
                    .eq('id', fioretto.element_id);
            }

            // 3. Create notification for author
            const notifMessage = moderatorMessage
                ? `Votre fioretto a été modifié et approuvé. Message du modérateur : ${moderatorMessage}`
                : 'Votre fioretto a été modifié et approuvé pour publication dans le jardin.';

            await supabase
                .from('notifications')
                .insert({
                    user_id: fioretto.user_id,
                    type: moderatorMessage ? 'message_moderateur' : 'fioretto_modifie',
                    fioretto_id: id,
                    message: notifMessage
                });

            // 4. Envoyer email à l'auteur
            const { data: author } = await supabase
                .from('profiles')
                .select('email, prenom')
                .eq('id', fioretto.user_id)
                .single();

            if (author?.email) {
                // Extraire le texte du fioretto
                const content = typeof fioretto.contenu_affiche === 'string'
                    ? JSON.parse(fioretto.contenu_affiche)
                    : fioretto.contenu_affiche;
                const fiorettoText = editedText; // Utiliser le texte édité

                await sendEmailNotification(
                    author.email,
                    author.prenom || 'Cher contributeur',
                    'modifie',
                    moderatorMessage,
                    { type: fioretto.element_type, text: fiorettoText }
                );
            }

            setEditingFioretto(null);
            checkPermissionsAndFetch();

        } catch (err) {
            console.error('Edit error:', err);
            alert("Erreur lors de la modification");
        }
    };

    // Filtrer par type
    const filteredByType = typeFilter === 'all'
        ? fioretti
        : fioretti.filter(f => f.element_type === typeFilter);

    // Compter par type
    const counts: Record<string, number> = {
        all: fioretti.length,
        grace: fioretti.filter(f => f.element_type === 'grace').length,
        priere: fioretti.filter(f => f.element_type === 'priere').length,
        ecriture: fioretti.filter(f => f.element_type === 'ecriture').length,
        parole: fioretti.filter(f => f.element_type === 'parole').length,
        rencontre: fioretti.filter(f => f.element_type === 'rencontre').length,
    };

    if (loading) {
        return (
            <div style={{
                minHeight: '100vh',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
            }}>
                <Loader2 size={48} style={{ animation: 'spin 1s linear infinite' }} />
            </div>
        );
    }

    return (
        <div style={{
            minHeight: '100vh',
            backgroundColor: '#F8FAFC',
            padding: '2rem 1rem'
        }}>
            <div style={{ maxWidth: '1400px', margin: '0 auto' }}>

                {/* Header */}
                <header style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '1rem',
                    marginBottom: '2rem'
                }}>
                    <ShieldAlert size={32} color="#475569" />
                    <div>
                        <h1 style={{
                            fontSize: '1.875rem',
                            fontWeight: 'bold',
                            color: '#1E293B',
                            marginBottom: '0.25rem'
                        }}>
                            Modération Fioretti
                        </h1>
                        <p style={{ color: '#64748B', fontSize: '0.875rem' }}>
                            Cultivez le jardin : gardez-le beau et saint
                        </p>
                    </div>
                </header>

                {/* Filtres */}
                <div style={{ marginBottom: '2rem' }}>
                    <StatusFilter selected={statutFilter} onSelect={setStatutFilter} />
                    <TypeFilter selected={typeFilter} onSelect={setTypeFilter} counts={counts} />
                </div>

                {/* Toggle archivés (seulement pour validés) */}
                {statutFilter === 'approuve' && (
                    <div style={{ marginBottom: '2rem' }}>
                        <ArchiveToggle showArchived={showArchived} onToggle={setShowArchived} />
                    </div>
                )}

                {/* Liste des fioretti */}
                {filteredByType.length === 0 ? (
                    <div style={{
                        background: 'white',
                        padding: '3rem',
                        borderRadius: '1rem',
                        boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)',
                        textAlign: 'center',
                        border: '1px solid #E2E8F0'
                    }}>
                        <Check size={48} color="#10B981" style={{ margin: '0 auto 1rem' }} />
                        <h3 style={{
                            fontSize: '1.25rem',
                            fontWeight: '600',
                            color: '#475569',
                            marginBottom: '0.5rem'
                        }}>
                            Tout est propre !
                        </h3>
                        <p style={{ color: '#94A3B8' }}>
                            Aucun fioretto dans cette catégorie.
                        </p>
                    </div>
                ) : (
                    <div style={{
                        display: 'grid',
                        gridTemplateColumns: 'repeat(auto-fill, minmax(380px, 1fr))',
                        gap: '1.5rem'
                    }}>
                        {filteredByType.map((fioretto) => (
                            <FiorettoModerationCard
                                key={fioretto.id}
                                fioretto={fioretto}
                                onApprove={() => handleModeration(fioretto.id, 'approuve')}
                                onReject={() => handleModeration(fioretto.id, 'refuse')}
                                onPreview={() => setPreviewFioretto(fioretto)}
                                onEdit={() => setEditingFioretto(fioretto)}
                                onArchiveChange={checkPermissionsAndFetch}
                            />
                        ))}
                    </div>
                )}

                {/* Modales */}
                {previewFioretto && (
                    <PreviewModal
                        fioretto={previewFioretto}
                        onClose={() => setPreviewFioretto(null)}
                    />
                )}

                {editingFioretto && (
                    <EditFiorettoModal
                        fioretto={editingFioretto}
                        onClose={() => setEditingFioretto(null)}
                        onSave={(editedText, moderatorMessage) => handleEdit(editingFioretto.id, editedText, moderatorMessage)}
                    />
                )}
            </div>
        </div>
    );
}
