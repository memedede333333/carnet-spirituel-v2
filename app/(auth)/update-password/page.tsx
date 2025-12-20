'use client'

import { useState, useEffect } from 'react'
import { supabase } from '@/app/lib/supabase'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import Image from 'next/image'

export default function UpdatePasswordPage() {
    const router = useRouter()
    const [password, setPassword] = useState('')
    const [passwordConfirm, setPasswordConfirm] = useState('')
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState<string | null>(null)
    const [message, setMessage] = useState<string | null>(null)
    const [isValidSession, setIsValidSession] = useState(false)

    useEffect(() => {
        // Vérifier qu'on a bien une session de récupération
        const checkSession = async () => {
            const { data: { session } } = await supabase.auth.getSession()
            if (session) {
                setIsValidSession(true)
            } else {
                setError('Lien de réinitialisation invalide ou expiré.')
            }
        }
        checkSession()
    }, [])

    const validatePassword = (password: string) => {
        if (password.length < 8) {
            return 'Le mot de passe doit contenir au moins 8 caractères'
        }
        if (!/[A-Z]/.test(password) || !/[a-z]/.test(password)) {
            return 'Le mot de passe doit contenir des majuscules et minuscules'
        }
        if (!/[0-9]/.test(password)) {
            return 'Le mot de passe doit contenir au moins un chiffre'
        }
        return null
    }

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setLoading(true)
        setError(null)
        setMessage(null)

        try {
            if (password !== passwordConfirm) {
                throw new Error('Les mots de passe ne correspondent pas')
            }

            const passwordError = validatePassword(password)
            if (passwordError) {
                throw new Error(passwordError)
            }

            const { error: updateError } = await supabase.auth.updateUser({
                password: password
            })

            if (updateError) throw updateError

            setMessage('Mot de passe modifié avec succès ! Redirection...')

            setTimeout(() => {
                router.push('/login')
            }, 2000)

        } catch (error: any) {
            setError(error.message || 'Une erreur est survenue')
        } finally {
            setLoading(false)
        }
    }

    if (!isValidSession && !error) {
        return (
            <div style={{
                minHeight: '100vh',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
            }}>
                <div style={{ textAlign: 'center' }}>
                    <div className="spinner" style={{
                        width: '40px',
                        height: '40px',
                        border: '4px solid #e5e7eb',
                        borderTop: '4px solid #0ea5e9',
                        borderRadius: '50%',
                        animation: 'spin 1s linear infinite',
                        margin: '0 auto'
                    }} />
                    <p style={{ marginTop: '1rem', color: '#6b7280' }}>Vérification...</p>
                </div>
            </div>
        )
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
                                    alt="Logo Esprit Saint"
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
                            Nouveau mot de passe
                        </h2>
                        <p style={{ fontSize: '0.875rem', opacity: 0.9 }}>
                            Choisissez un mot de passe sécurisé
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
                                <label htmlFor="password" style={{
                                    display: 'block',
                                    fontSize: '0.875rem',
                                    fontWeight: 500,
                                    color: '#4b5563',
                                    marginBottom: '0.5rem'
                                }}>
                                    Nouveau mot de passe *
                                </label>
                                <input
                                    type="password"
                                    id="password"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    required
                                    placeholder="••••••••"
                                    autoComplete="new-password"
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
                                <ul style={{
                                    fontSize: '0.75rem',
                                    color: '#6b7280',
                                    marginTop: '0.5rem',
                                    paddingLeft: '1rem',
                                    listStyle: 'disc'
                                }}>
                                    <li>Au moins 8 caractères</li>
                                    <li>Une majuscule et une minuscule</li>
                                    <li>Un chiffre</li>
                                </ul>
                            </div>

                            <div style={{ marginBottom: '1.5rem' }}>
                                <label htmlFor="passwordConfirm" style={{
                                    display: 'block',
                                    fontSize: '0.875rem',
                                    fontWeight: 500,
                                    color: '#4b5563',
                                    marginBottom: '0.5rem'
                                }}>
                                    Confirmer le mot de passe *
                                </label>
                                <input
                                    type="password"
                                    id="passwordConfirm"
                                    value={passwordConfirm}
                                    onChange={(e) => setPasswordConfirm(e.target.value)}
                                    required
                                    placeholder="••••••••"
                                    autoComplete="new-password"
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
                                disabled={loading || !isValidSession}
                                style={{
                                    width: '100%',
                                    padding: '0.875rem',
                                    background: (loading || !isValidSession) ? '#9ca3af' : 'linear-gradient(135deg, #0ea5e9, #0284c7)',
                                    color: 'white',
                                    border: 'none',
                                    borderRadius: '0.5rem',
                                    fontSize: '1rem',
                                    fontWeight: 600,
                                    cursor: (loading || !isValidSession) ? 'not-allowed' : 'pointer',
                                    transition: 'all 0.2s',
                                    marginTop: '0.5rem'
                                }}
                            >
                                {loading ? 'Modification en cours...' : 'Modifier mon mot de passe'}
                            </button>
                        </form>

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
                            « Venez à moi, vous tous qui peinez et ployez sous le fardeau. »
                            <span style={{
                                display: 'block',
                                marginTop: '0.5rem',
                                fontWeight: 500,
                                color: '#0ea5e9',
                                fontStyle: 'normal'
                            }}>
                                Matthieu 11, 28
                            </span>
                        </div>
                    </div>
                </div>

                <style jsx>{`
          @keyframes shimmer {
            0%, 100% { transform: translate(0, 0); }
            50% { transform: translate(10%, 10%); }
          }

          @keyframes spin {
            to { transform: rotate(360deg); }
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
        `}</style>
            </div>
        </div>
    )
}
