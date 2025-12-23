'use client'

import { useState } from 'react'
import { supabase } from '@/app/lib/supabase'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import Image from 'next/image'
import { logSecurityAction } from '@/app/lib/security-logger'

type AuthMode = 'login' | 'register'

interface AuthFormProps {
  mode: AuthMode
  showResetLink?: boolean
}

export default function AuthForm({ mode, showResetLink = false }: AuthFormProps) {
  const router = useRouter()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [passwordConfirm, setPasswordConfirm] = useState('')
  const [prenom, setPrenom] = useState('')
  const [nom, setNom] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [message, setMessage] = useState<string | null>(null)

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
      if (mode === 'register') {
        if (!prenom.trim()) {
          throw new Error('Le prénom est obligatoire')
        }

        if (password !== passwordConfirm) {
          throw new Error('Les mots de passe ne correspondent pas')
        }

        const passwordError = validatePassword(password)
        if (passwordError) {
          throw new Error(passwordError)
        }

        const { data: authData, error: authError } = await supabase.auth.signUp({
          email,
          password,
          options: {
            data: {
              prenom,
              nom,
            },
          },
        })

        if (authError) throw authError

        if (authData.user) {
          const { error: profileError } = await supabase
            .from('profiles')
            .insert({
              id: authData.user.id,
              email: email,
              prenom: prenom,
              nom: nom || null,
              role: 'user'
            })

          if (profileError) {
            console.error('Erreur création profil:', profileError)
          }
        }

        setMessage('Inscription réussie ! Vérifiez votre email pour confirmer votre compte.')
      } else {
        const { data, error: authError } = await supabase.auth.signInWithPassword({
          email,
          password,
        })

        if (authError) {
          if (authError.message.includes('Invalid login credentials')) {
            throw new Error('Email ou mot de passe incorrect')
          } else if (authError.message.includes('Email not confirmed')) {
            throw new Error('Veuillez confirmer votre email avant de vous connecter')
          } else {
            throw authError
          }
        }

        if (data.user) {
          const { data: profile, error: profileError } = await supabase
            .from('profiles')
            .select('*')
            .eq('id', data.user.id)
            .single()

          if (profileError && profileError.code === 'PGRST116') {
            const { error: insertError } = await supabase
              .from('profiles')
              .insert({
                id: data.user.id,
                email: data.user.email,
                prenom: data.user.user_metadata?.prenom || 'Utilisateur',
                nom: data.user.user_metadata?.nom || null,
                role: 'user'
              })

            if (insertError) {
              console.error('Erreur création profil:', insertError)
            } else {
              // Envoyer l'email de bienvenue (première connexion)
              try {
                await fetch('/api/send-welcome-email', {
                  method: 'POST',
                  headers: { 'Content-Type': 'application/json' },
                  body: JSON.stringify({
                    userEmail: data.user.email,
                    userName: data.user.user_metadata?.prenom || 'Utilisateur'
                  })
                })
              } catch (emailError) {
                console.error('Erreur envoi email bienvenue:', emailError)
                // Ne pas bloquer la connexion si l'email échoue
              }
            }
          }

          await logSecurityAction('login')
          router.push('/dashboard')
        }
      }
    } catch (error: any) {
      setError(error.message || 'Une erreur est survenue')
    } finally {
      setLoading(false)
    }
  }

  return (
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
        {/* Version mobile */}
        <div className="header-mobile" style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: '1rem'
        }}>
          <Link
            href="/"
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
                alt="Logo Esprit Saint - Retour à l'accueil"
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

        {/* Version desktop */}
        <div className="header-desktop" style={{
          display: 'none'
        }}>
          <div style={{
            display: 'grid',
            gridTemplateColumns: '1fr 2fr 1fr',
            alignItems: 'center',
            width: '100%'
          }}>
            <div style={{
              display: 'flex',
              justifyContent: 'center'
            }}>
              <Link
                href="/"
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
                    alt="Logo Esprit Saint - Retour à l'accueil"
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
            </div>
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
            <div>{/* Colonne vide pour l'équilibre */}</div>
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
            {mode === 'login' ? 'Connexion' : 'Créer un compte'}
          </h2>
          <p style={{ fontSize: '0.875rem', opacity: 0.9 }}>
            {mode === 'login' ? 'Bienvenue dans votre carnet spirituel' : 'Rejoignez la communauté spirituelle'}
          </p>
        </div>

        <div style={{ padding: '2rem' }}>
          {mode === 'register' && (
            <div style={{
              background: 'linear-gradient(135deg, #E0F2FE, #F0F9FF)',
              borderRadius: '0.5rem',
              padding: '1rem',
              marginBottom: '1.5rem',
              fontSize: '0.875rem',
              color: '#075985',
              display: 'flex',
              alignItems: 'flex-start',
              gap: '0.75rem'
            }}>
              <span style={{ fontSize: '1.25rem', flexShrink: 0 }}>💫</span>
              <div>
                <strong>Bienvenue !</strong><br />
                Votre carnet spirituel vous permettra de noter et relire l'action de Dieu dans votre vie.
              </div>
            </div>
          )}

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
            {mode === 'register' && (
              <>
                <div style={{
                  display: 'grid',
                  gridTemplateColumns: '1fr 1fr',
                  gap: '1rem',
                  marginBottom: '1.5rem'
                }}>
                  <div>
                    <label htmlFor="prenom" style={{
                      display: 'block',
                      fontSize: '0.875rem',
                      fontWeight: 500,
                      color: '#4b5563',
                      marginBottom: '0.5rem'
                    }}>
                      Prénom *
                    </label>
                    <input
                      type="text"
                      id="prenom"
                      value={prenom}
                      onChange={(e) => setPrenom(e.target.value)}
                      required
                      placeholder="Marie"
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

                  <div>
                    <label htmlFor="nom" style={{
                      display: 'block',
                      fontSize: '0.875rem',
                      fontWeight: 500,
                      color: '#4b5563',
                      marginBottom: '0.5rem'
                    }}>
                      Nom
                    </label>
                    <input
                      type="text"
                      id="nom"
                      value={nom}
                      onChange={(e) => setNom(e.target.value)}
                      placeholder="Dupont"
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
                </div>
              </>
            )}

            <div style={{ marginBottom: '1.5rem' }}>
              <label htmlFor="email" style={{
                display: 'block',
                fontSize: '0.875rem',
                fontWeight: 500,
                color: '#4b5563',
                marginBottom: '0.5rem'
              }}>
                Email {mode === 'register' && '*'}
              </label>
              <input
                type="email"
                id="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                placeholder={mode === 'register' ? 'marie.dupont@email.com' : 'votre@email.com'}
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

            <div style={{ marginBottom: mode === 'register' ? '1.5rem' : '1.5rem' }}>
              <label htmlFor="password" style={{
                display: 'block',
                fontSize: '0.875rem',
                fontWeight: 500,
                color: '#4b5563',
                marginBottom: '0.5rem'
              }}>
                Mot de passe {mode === 'register' && '*'}
              </label>
              <input
                type="password"
                id="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                placeholder="••••••••"
                autoComplete={mode === 'login' ? 'current-password' : 'new-password'}
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
              {mode === 'register' && (
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
              )}
              {mode === 'login' && showResetLink && (
                <div style={{ textAlign: 'right', marginTop: '0.5rem' }}>
                  <Link
                    href="/reset-password"
                    style={{
                      fontSize: '0.875rem',
                      color: '#0ea5e9',
                      textDecoration: 'none',
                      transition: 'color 0.2s'
                    }}
                  >
                    Mot de passe oublié ?
                  </Link>
                </div>
              )}
            </div>

            {mode === 'register' && (
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
            )}

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
              {loading ? (mode === 'login' ? 'Connexion...' : 'Création en cours...') : (mode === 'login' ? 'Se connecter' : 'Créer mon compte')}
            </button>
          </form>


          <div style={{
            display: 'flex',
            alignItems: 'center',
            margin: '1.5rem 0',
            color: '#9ca3af',
            fontSize: '0.875rem'
          }}>
            <div style={{ flex: 1, height: '1px', background: '#e5e7eb' }} />
            <span style={{ padding: '0 1rem' }}>ou continuez avec</span>
            <div style={{ flex: 1, height: '1px', background: '#e5e7eb' }} />
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', marginBottom: '1.5rem' }}>
            <button
              type="button"
              onClick={() => {
                supabase.auth.signInWithOAuth({
                  provider: 'google',
                  options: {
                    redirectTo: `${window.location.origin}/auth/callback`,
                    queryParams: {
                      access_type: 'offline',
                      prompt: 'consent',
                    },
                  },
                })
              }}
              disabled={loading}
              style={{
                width: '100%',
                padding: '0.75rem',
                background: 'white',
                color: '#374151',
                border: '1px solid #e5e7eb',
                borderRadius: '0.5rem',
                fontSize: '0.95rem',
                fontWeight: 500,
                cursor: loading ? 'not-allowed' : 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '0.75rem',
                transition: 'all 0.2s'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.background = '#f9fafb'
                e.currentTarget.style.borderColor = '#d1d5db'
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = 'white'
                e.currentTarget.style.borderColor = '#e5e7eb'
              }}
            >
              <svg width="20" height="20" viewBox="0 0 24 24">
                <path
                  d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                  fill="#4285F4"
                />
                <path
                  d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                  fill="#34A853"
                />
                <path
                  d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.84z"
                  fill="#FBBC05"
                />
                <path
                  d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                  fill="#EA4335"
                />
              </svg>
              Google
            </button>

            <button
              type="button"
              onClick={() => {
                supabase.auth.signInWithOAuth({
                  provider: 'azure',
                  options: {
                    redirectTo: `${window.location.origin}/auth/callback`,
                    scopes: 'email',
                  },
                })
              }}
              disabled={loading}
              style={{
                width: '100%',
                padding: '0.75rem',
                background: 'white',
                color: '#374151',
                border: '1px solid #e5e7eb',
                borderRadius: '0.5rem',
                fontSize: '0.95rem',
                fontWeight: 500,
                cursor: loading ? 'not-allowed' : 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '0.75rem',
                transition: 'all 0.2s'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.background = '#f9fafb'
                e.currentTarget.style.borderColor = '#d1d5db'
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = 'white'
                e.currentTarget.style.borderColor = '#e5e7eb'
              }}
            >
              <svg width="20" height="20" viewBox="0 0 21 21">
                <path fill="#f25022" d="M1 1h9v9H1z" />
                <path fill="#00a4ef" d="M1 11h9v9H1z" />
                <path fill="#7fba00" d="M11 1h9v9H11z" />
                <path fill="#ffb900" d="M11 11h9v9H11z" />
              </svg>
              Microsoft
            </button>
          </div>

          <Link
            href={mode === 'login' ? '/register' : '/login'}
            style={{
              display: 'block',
              width: '100%',
              padding: '0.75rem',
              background: 'transparent',
              color: '#6b7280',
              border: '1px dashed #d1d5db',
              borderRadius: '0.5rem',
              fontSize: '0.875rem',
              textAlign: 'center',
              textDecoration: 'none',
              transition: 'all 0.2s'
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.borderColor = '#0ea5e9'
              e.currentTarget.style.color = '#0ea5e9'
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.borderColor = '#d1d5db'
              e.currentTarget.style.color = '#6b7280'
            }}
          >
            {mode === 'login' ? 'Pas encore de compte ? Créer un compte' : 'Déjà un compte ? Se connecter'}
          </Link>

          {mode === 'login' && (
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
              « Là où deux ou trois sont assemblés en mon nom, je suis au milieu d'eux. »
              <span style={{
                display: 'block',
                marginTop: '0.5rem',
                fontWeight: 500,
                color: '#0ea5e9',
                fontStyle: 'normal'
              }}>
                Matthieu 18, 20
              </span>
            </div>
          )}
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

        @media (max-width: 768px) {
          .header-desktop {
            display: none !important;
          }
          .header-mobile {
            display: flex !important;
          }
        }

        @media (min-width: 769px) {
          .header-mobile {
            display: none !important;
          }
          .header-desktop {
            display: block !important;
          }
        }

        @media (max-width: 480px) {
          form > div:first-child {
            grid-template-columns: 1fr !important;
          }
        }
      `}</style>
    </div>
  )
}