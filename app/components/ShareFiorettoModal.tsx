'use client';

import { useState, useEffect } from 'react';
import { supabase } from '@/app/lib/supabase';
import { X, Loader2, Send } from 'lucide-react';

interface ShareFiorettoModalProps {
    isOpen: boolean;
    onClose: () => void;
    element: any;
    elementType: 'grace' | 'priere' | 'ecriture' | 'parole' | 'rencontre';
    formattedContent?: string;
}

const TYPE_LABELS: Record<string, string> = {
    grace: 'Grâce',
    priere: 'Prière',
    ecriture: 'Écriture',
    parole: 'Parole',
    rencontre: 'Rencontre',
};

const TYPE_ICONS: Record<string, string> = {
    grace: '✨',
    priere: '🙏',
    ecriture: '📖',
    parole: '🕊️',
    rencontre: '🤝',
};

// Fonction pour générer un beau résumé selon le type d'élément
function generateFormattedContent(element: any, elementType: string): string {
    console.log('=== DEBUG generateFormattedContent ===');
    console.log('elementType:', elementType);
    console.log('element:', element);

    switch (elementType) {
        case 'grace':
            return element.texte || '';

        case 'priere':
            const priereLines = [];
            priereLines.push(`🙏 Prière pour ${element.personne_prenom}${element.personne_nom ? ' ' + element.personne_nom : ''}`);
            priereLines.push('');

            // Sujet
            if (element.sujet) priereLines.push(element.sujet);

            // Détails
            if (element.sujet_detail) {
                priereLines.push('');
                priereLines.push(element.sujet_detail);
            }

            // Notes importantes
            if (element.notes) {
                priereLines.push('');
                priereLines.push(`💭 ${element.notes}`);
            }

            return priereLines.join('\n');


        case 'ecriture':
            const ecritureLines = [];
            ecritureLines.push(`📖 ${element.reference}`);
            ecritureLines.push('');
            ecritureLines.push(`« ${element.texte_complet} »`);
            if (element.ce_qui_ma_touche) {
                ecritureLines.push('');
                ecritureLines.push(`💡 ${element.ce_qui_ma_touche}`);
            }
            return ecritureLines.join('\n');

        case 'parole':
            return element.contenu || element.texte || '';

        case 'rencontre':
            const rencontreLines = [];
            rencontreLines.push(`🤝 Rencontre avec ${element.prenom}${element.nom ? ' ' + element.nom : ''}`);
            if (element.description) {
                rencontreLines.push('');
                rencontreLines.push(element.description);
            }
            return rencontreLines.join('\n');

        default:
            return element.texte || element.sujet || element.texte_complet || element.description || '';
    }
}

export default function ShareFiorettoModal({ isOpen, onClose, element, elementType, formattedContent }: ShareFiorettoModalProps) {
    const [contenuEditable, setContenuEditable] = useState('');
    const [message, setMessage] = useState('');
    const [anonyme, setAnonyme] = useState(true);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    // Mettre à jour le contenu quand l'élément ou la modale change
    useEffect(() => {
        if (isOpen) {
            if (formattedContent) {
                setContenuEditable(formattedContent);
            } else if (element) {
                setContenuEditable(generateFormattedContent(element, elementType));
            }

            setMessage('');
            setError(null);
        }
    }, [isOpen, formattedContent, element, elementType]);

    // Bloquer le scroll du body quand la modale est ouverte
    useEffect(() => {
        if (isOpen) {
            document.body.style.overflow = 'hidden';
        } else {
            document.body.style.overflow = 'unset';
        }

        return () => {
            document.body.style.overflow = 'unset';
        };
    }, [isOpen]);



    if (!isOpen) return null;

    // Couleurs par type d'élément
    const themeColors = {
        grace: { bg: '#FFFBEB', border: '#FEF3C7', text: '#78350F', button: '#FCD34D', buttonHover: '#FBBF24' },
        priere: { bg: '#EFF6FF', border: '#DBEAFE', text: '#1E3A8A', button: '#93C5FD', buttonHover: '#60A5FA' },
        ecriture: { bg: '#ECFDF5', border: '#D1FAE5', text: '#065F46', button: '#6EE7B7', buttonHover: '#34D399' },
        parole: { bg: '#F0F9FF', border: '#E0F2FE', text: '#075985', button: '#7DD3FC', buttonHover: '#0EA5E9' },
        rencontre: { bg: '#FFF7ED', border: '#FED7AA', text: '#92400E', button: '#FDBA74', buttonHover: '#F97316' }
    }[elementType];

    const handleSubmit = async () => {
        setLoading(true);
        setError(null);

        try {
            const { data: { user } } = await supabase.auth.getUser();
            if (!user) throw new Error("Non authentifié");

            const contenuSnapshot = {
                texte: contenuEditable,
                detail: element.lieu || element.reference || element.contexte,
                original_id: element.id
            };

            const { error: insertError } = await supabase
                .from('fioretti')
                .insert({
                    user_id: user.id,
                    element_type: elementType,
                    element_id: element.id,
                    contenu_affiche: contenuSnapshot,
                    message_ajout: message || null,
                    anonyme,
                    statut: 'propose'
                });

            if (insertError) throw insertError;

            let tableName = '';
            if (elementType === 'grace') tableName = 'graces';
            else if (elementType === 'priere') tableName = 'prieres';
            else if (elementType === 'ecriture') tableName = 'paroles_ecriture';
            else if (elementType === 'parole') tableName = 'paroles_connaissance';
            else if (elementType === 'rencontre') tableName = 'rencontres_missionnaires';

            if (tableName) {
                await supabase
                    .from(tableName)
                    .update({ statut_partage: 'propose' })
                    .eq('id', element.id);
            }

            alert("Votre fioretti a été envoyé en modération 🌸");
            onClose();
            window.location.reload();

        } catch (err: any) {
            console.error('Erreur:', err);
            setError(err.message || "Une erreur est survenue");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div
            style={{
                position: 'fixed',
                top: 0,
                left: 0,
                right: 0,
                bottom: 0,
                backgroundColor: 'rgba(0, 0, 0, 0.3)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                zIndex: 50,
                padding: '1rem',
                paddingLeft: 'max(1rem, calc((100vw - 800px) / 2))',
                overflowY: 'auto'
            }}
            onClick={onClose}
        >
            <div
                style={{
                    background: 'white',
                    borderRadius: '1rem',
                    maxWidth: '600px',
                    width: '100%',
                    overflow: 'hidden',
                    boxShadow: '0 10px 25px rgba(0, 0, 0, 0.15)',
                    display: 'flex',
                    flexDirection: 'column'
                }}
                onClick={(e) => e.stopPropagation()}
            >
                {/* En-tête */}
                <div style={{
                    padding: '1.5rem 2rem',
                    borderBottom: `3px solid ${themeColors.border}`,
                    background: themeColors.bg,
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center'
                }}>
                    <div>
                        <h2 style={{
                            fontSize: '1.5rem',
                            fontWeight: 'bold',
                            color: themeColors.text,
                            marginBottom: '0.25rem'
                        }}>
                            🌸 Partager ce fioretti
                        </h2>
                        <p style={{
                            fontSize: '0.875rem',
                            color: themeColors.text,
                            opacity: 0.8
                        }}>
                            {TYPE_ICONS[elementType]} {TYPE_LABELS[elementType]}
                        </p>
                    </div>
                    <button
                        onClick={onClose}
                        style={{
                            background: 'white',
                            border: 'none',
                            borderRadius: '0.5rem',
                            padding: '0.5rem',
                            cursor: 'pointer',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            boxShadow: '0 2px 4px rgba(0, 0, 0, 0.1)'
                        }}
                    >
                        <X size={20} color={themeColors.text} />
                    </button>
                </div>

                {/* Corps */}
                <div style={{
                    padding: '1.5rem 2rem',
                    flex: 1
                }}>
                    {/* Zone de texte éditable */}
                    <div style={{ marginBottom: '1.5rem' }}>
                        <label style={{
                            fontSize: '1rem',
                            fontWeight: '500',
                            color: themeColors.text,
                            marginBottom: '0.5rem',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '0.5rem'
                        }}>
                            🙏 Contenu à partager
                        </label>
                        <div style={{ position: 'relative' }}>
                            <textarea
                                value={contenuEditable}
                                onChange={(e) => setContenuEditable(e.target.value)}
                                style={{
                                    width: '100%',
                                    height: '250px',
                                    padding: '1rem',
                                    background: themeColors.bg,
                                    border: `2px solid ${themeColors.border}`,
                                    borderRadius: '0.75rem',
                                    fontSize: '1.125rem',
                                    lineHeight: '1.6',
                                    color: '#1F2937',
                                    fontStyle: 'italic',
                                    resize: 'none',
                                    fontFamily: 'inherit',
                                    overflowY: 'auto'
                                }}
                            />
                            {/* Gradient fade pour indiquer qu'il y a plus de contenu */}
                            <div style={{
                                position: 'absolute',
                                bottom: '2px',
                                left: '2px',
                                right: '2px',
                                height: '40px',
                                background: `linear-gradient(to bottom, transparent, ${themeColors.border}99)`,
                                borderRadius: '0 0 0.75rem 0.75rem',
                                pointerEvents: 'none'
                            }} />
                        </div>
                        <p style={{
                            marginTop: '0.5rem',
                            fontSize: '0.75rem',
                            color: themeColors.text,
                            opacity: 0.7,
                            fontStyle: 'italic'
                        }}>
                            💡 Vous pouvez modifier le texte pour l'adapter au partage public
                        </p>
                    </div>

                    {/* Message optionnel */}
                    <div style={{ marginBottom: '1.5rem' }}>
                        <label style={{
                            display: 'block',
                            marginBottom: '0.5rem',
                            fontWeight: '500',
                            color: themeColors.text,
                            fontSize: '0.9rem'
                        }}>
                            💬 Message pour la communauté <span style={{ fontWeight: 'normal', opacity: 0.7 }}>(optionnel)</span>
                        </label>
                        <textarea
                            value={message}
                            onChange={(e) => setMessage(e.target.value)}
                            rows={3}
                            style={{
                                width: '100%',
                                height: '100px',
                                padding: '1rem',
                                background: 'white',
                                border: `2px solid ${themeColors.border}`,
                                borderRadius: '0.75rem',
                                fontSize: '1rem',
                                lineHeight: '1.5',
                                color: '#1F2937',
                                resize: 'none',
                                fontFamily: 'inherit',
                                overflow: 'hidden'
                            }}
                            placeholder="Ex: Priez pour mon intention..."
                        />
                    </div>

                    {/* Toggle anonymat */}
                    <div style={{
                        background: themeColors.bg,
                        border: `2px solid ${themeColors.border}`,
                        borderRadius: '0.75rem',
                        padding: '1rem',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '1rem'
                    }}>
                        <button
                            onClick={() => setAnonyme(!anonyme)}
                            style={{
                                position: 'relative',
                                width: '3rem',
                                height: '1.75rem',
                                borderRadius: '9999px',
                                border: 'none',
                                cursor: 'pointer',
                                background: anonyme ? themeColors.button : '#D1D5DB',
                                transition: 'all 0.2s'
                            }}
                        >
                            <div style={{
                                position: 'absolute',
                                top: '0.25rem',
                                left: anonyme ? '1.5rem' : '0.25rem',
                                width: '1.25rem',
                                height: '1.25rem',
                                borderRadius: '50%',
                                background: 'white',
                                boxShadow: '0 2px 4px rgba(0, 0, 0, 0.2)',
                                transition: 'all 0.2s'
                            }} />
                        </button>
                        <div style={{ flex: 1 }}>
                            <p style={{
                                fontWeight: '500',
                                color: themeColors.text,
                                marginBottom: '0.25rem'
                            }}>
                                Rester anonyme
                            </p>
                            <p style={{
                                fontSize: '0.875rem',
                                color: themeColors.text,
                                opacity: 0.8
                            }}>
                                {anonyme
                                    ? "Signature : Anonyme"
                                    : "Votre prénom sera visible"}
                            </p>
                        </div>
                    </div>

                    {error && (
                        <div style={{
                            marginTop: '1rem',
                            background: '#FEE2E2',
                            border: '2px solid #FECACA',
                            borderRadius: '0.75rem',
                            padding: '1rem',
                            color: '#991B1B',
                            fontSize: '0.875rem'
                        }}>
                            ⚠️ {error}
                        </div>
                    )}
                </div>

                {/* Footer */}
                <div style={{
                    padding: '1rem 2rem',
                    borderTop: `1px solid ${themeColors.border}`,
                    display: 'flex',
                    gap: '1rem'
                }}>
                    <button
                        onClick={onClose}
                        style={{
                            flex: 1,
                            padding: '0.75rem',
                            background: 'white',
                            color: themeColors.text,
                            border: `2px solid ${themeColors.border}`,
                            borderRadius: '0.5rem',
                            fontWeight: '500',
                            cursor: 'pointer',
                            fontSize: '1rem'
                        }}
                    >
                        Annuler
                    </button>
                    <button
                        onClick={handleSubmit}
                        disabled={loading || !contenuEditable.trim()}
                        style={{
                            flex: 2,
                            padding: '0.75rem',
                            background: loading ? '#D1D5DB' : themeColors.button,
                            color: themeColors.text,
                            border: 'none',
                            borderRadius: '0.5rem',
                            fontWeight: '500',
                            cursor: loading ? 'not-allowed' : 'pointer',
                            fontSize: '1rem',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            gap: '0.5rem',
                            opacity: !contenuEditable.trim() ? 0.5 : 1
                        }}
                    >
                        {loading ? (
                            <>
                                <Loader2 size={20} style={{ animation: 'spin 1s linear infinite' }} />
                                Envoi...
                            </>
                        ) : (
                            <>
                                <Send size={18} />
                                Partager à la communauté
                            </>
                        )}
                    </button>
                </div>
            </div>
        </div>
    );
}
