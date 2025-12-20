'use client'

import { useState } from 'react'
import { supabase } from '@/app/lib/supabase'
import Link from 'next/link'
import Image from 'next/image'

export default function ResetPasswordPage() {
    const [email, setEmail] = useState('')
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState<string | null>(null)
    const [message, setMessage] = useState<string | null>(null)

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setLoading(true)
        setError(null)
        setMessage(null)

        try {
            const { error } = await supabase.auth.resetPasswordForEmail(email, {
                redirectTo: `${window.location.origin}/update-password`,
            })

            if (error) throw error

            setMessage('Un email de réinitialisation a été envoyé. Vérifiez votre boîte de réception.')
            setEmail('')
        } catch (error: any) {
            // Pour la sécurité, on ne révèle pas si l'email existe ou non
            setMessage('Si cet email existe dans notre base, vous recevrez un lien de réinitialisation.')
        } finally {
            setLoading(false)
        }
    }

    return (
        <div style={{
            minHeight: '100vh',
            background: 'transparent',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '1rem'
        }}>
            <div style={{
                width: '100%',
                maxWidth: '450px',
                margin: '0 auto',
                padding: '0 1rem'
            }}>
                {/* Header responsive */}
                <div style={{
                    marginBottom: '2rem',
                    width: '100%'
                }}>
                    {/* Version mobile/desktop unifiée */}
                    <div style={{
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'center',
                        gap: '1rem'
                    }}>
                        <Link
                            href="/login"
                            style={{
                                textDecoration: 'none',
                                cursor: 'pointer'
                            }}
                        >
                            <div style={{
                                width: '80px',
                                height: '80px',
                                borderRadius: '50%',
                                overflow: 'hidden',
                                background: 'white',
                                boxShadow: '0 6px 20px rgba(14, 165, 233, 0.15)',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                position: 'relative',
                                transition: 'transform 0.2s ease'
                            }}
                                onMouseEnter={(e) => {
                                    e.currentTarget.style.transform = 'scale(1.05)'
                                }}
                                onMouseLeave={(e) => {
                                    e.currentTarget.style.transform = 'scale(1)'
                                }}>
                                <div style={{
                                    position: 'absolute',
                                    inset: 0,
                                    background: 'linear-gradient(135deg, rgba(224, 242, 254, 0.3), rgba(186, 230, 253, 0.3))',
                                    animation: 'shimmer 3s ease-in-out infinite'
                                }} />
                                <Image
                                    src="/logo-esprit-saint-web.png"
                                    alt="Logo Esprit Saint - Retour à la connexion"
                                    width={80}
                                    height={80}
                                    style={{
                                        objectFit: 'contain',
                                        zIndex: 1
                                    }}
                                    priority
                                />
                            </div>
                        </Link>
                        <div style={{ textAlign: 'center' }}>
                            <h1 style={{
                                fontSize: '1.75rem',
                                color: '#1f2345',
                                fontWeight: 700,
                                margin: 0,
                                lineHeight: 1.2
                            }}>
                                Carnet Spirituel
                            </h1>
                            <p style={{
                                color: '#6b7280',
                                fontSize: '0.95rem',
                                margin: 0,
                                marginTop: '0.25rem'
                            }}>
                                Grâces & Missions
                            </p>
                        </div>
                    </div>
                </div>

                <div style={{
                    background: 'white',
                    borderRadius: '1rem',
                    boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)',
                    overflow: 'hidden'
                }}>
                    <div style={{
                        background: 'linear-gradient(135deg, #0ea5e9, #0284c7)',
                        padding: '1.5rem 2rem',
                        color: 'white',
                        textAlign: 'center'
                    }}>
                        <h2 style={{
                            fontSize: '1.25rem',
                            fontWeight: 600,
                            marginBottom: '0.25rem'
                        }}>
                            Mot de passe oublié ?
                        </h2>
                        <p style={{ fontSize: '0.875rem', opacity: 0.9 }}>
                            Nous allons vous envoyer un lien de réinitialisation
                        </p>
                    </div>

                    <div style={{ padding: '2rem' }}>
                        {error && (
                            <div style={{
                                background: '#fee2e2',
                                color: '#dc2626',
                                padding: '0.75rem',
                                borderRadius: '0.5rem',
                                fontSize: '0.875rem',
                                marginBottom: '1rem',
                                display: 'flex',
                                alignItems: 'center',
                                gap: '0.5rem'
                            }}>
                                <span>⚠️</span>
                                <span>{error}</span>
                            </div>
                        )}

                        {message && (
                            <div style={{
                                background: '#d1fae5',
                                color: '#047857',
                                padding: '0.75rem',
                                borderRadius: '0.5rem',
                                fontSize: '0.875rem',
                                marginBottom: '1rem',
                                display: 'flex',
                                alignItems: 'center',
                                gap: '0.5rem'
                            }}>
                                <span>✅</span>
                                <span>{message}</span>
                            </div>
                        )}

                        <form onSubmit={handleSubmit}>
                            <div style={{ marginBottom: '1.5rem' }}>
                                <label htmlFor="email" style={{
                                    display: 'block',
                                    fontSize: '0.875rem',
                                    fontWeight: 500,
                                    color: '#4b5563',
                                    marginBottom: '0.5rem'
                                }}>
                                    Adresse email
                                </label>
                                <input
                                    type="email"
                                    id="email"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    required
                                    placeholder="votre@email.com"
                                    autoComplete="email"
                                    style={{
                                        width: '100%',
                                        padding: '0.75rem 1rem',
                                        border: '1px solid #e5e7eb',
                                        borderRadius: '0.5rem',
                                        fontSize: '1rem',
                                        background: '#f9fafb',
                                        transition: 'all 0.2s'
                                    }}
                                />
                            </div>

                            <button
                                type="submit"
                                disabled={loading}
                                style={{
                                    width: '100%',
                                    padding: '0.875rem',
                                    background: loading ? '#9ca3af' : 'linear-gradient(135deg, #0ea5e9, #0284c7)',
                                    color: 'white',
                                    border: 'none',
                                    borderRadius: '0.5rem',
                                    fontSize: '1rem',
                                    fontWeight: 600,
                                    cursor: loading ? 'not-allowed' : 'pointer',
                                    transition: 'all 0.2s',
                                    marginTop: '0.5rem'
                                }}
                            >
                                {loading ? 'Envoi en cours...' : 'Envoyer le lien'}
                            </button>
                        </form>

                        <div style={{
                            display: 'flex',
                            alignItems: 'center',
                            margin: '2rem 0',
                            color: '#9ca3af',
                            fontSize: '0.875rem'
                        }}>
                            <div style={{ flex: 1, height: '1px', background: '#e5e7eb' }} />
                            <span style={{ padding: '0 1rem' }}>ou</span>
                            <div style={{ flex: 1, height: '1px', background: '#e5e7eb' }} />
                        </div>

                        <Link
                            href="/login"
                            style={{
                                display: 'block',
                                width: '100%',
                                padding: '0.75rem',
                                background: 'white',
                                color: '#4b5563',
                                border: '1px solid #e5e7eb',
                                borderRadius: '0.5rem',
                                fontSize: '0.875rem',
                                textAlign: 'center',
                                textDecoration: 'none',
                                transition: 'all 0.2s'
                            }}
                        >
                            Retour à la connexion
                        </Link>

                        <div style={{
                            marginTop: '2rem',
                            padding: '1.5rem',
                            background: 'linear-gradient(135deg, #E0F2FE, #F0F9FF)',
                            borderRadius: '0.75rem',
                            textAlign: 'center',
                            fontStyle: 'italic',
                            color: '#075985',
                            fontSize: '0.875rem',
                            lineHeight: 1.6
                        }}>
                            « Le Seigneur est proche de ceux qui ont le cœur brisé. »
                            <span style={{
                                display: 'block',
                                marginTop: '0.5rem',
                                fontWeight: 500,
                                color: '#0ea5e9',
                                fontStyle: 'normal'
                            }}>
                                Psaume 34, 19
                            </span>
                        </div>
                    </div>
                </div>

                <style jsx>{`
          @keyframes shimmer {
            0%, 100% { transform: translate(0, 0); }
            50% { transform: translate(10%, 10%); }
          }

          input:focus {
            outline: none !important;
            border-color: #0ea5e9 !important;
            background: white !important;
            box-shadow: 0 0 0 3px rgba(14, 165, 233, 0.1) !important;
          }

          button:hover:not(:disabled) {
            transform: translateY(-1px);
            box-shadow: 0 4px 12px rgba(14, 165, 233, 0.3);
          }

          button:active:not(:disabled) {
            transform: translateY(0);
          }

          a:hover {
            background: #f9fafb !important;
            border-color: #d1d5db !important;
          }
        `}</style>
            </div>
        </div>
    )
}
