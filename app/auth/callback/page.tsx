'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '@/app/lib/supabase'

export default function AuthCallbackPage() {
    const router = useRouter()

    useEffect(() => {
        const handleAuthCallback = async () => {
            const { data: { session }, error } = await supabase.auth.getSession()

            if (error) {
                console.error('Erreur callback auth:', error)
                router.push('/login?error=auth_callback_error')
                return
            }

            if (session?.user) {
                // Vérifier si le profil existe
                const { data: profile } = await supabase
                    .from('profiles')
                    .select('id')
                    .eq('id', session.user.id)
                    .single()

                // S'il n'existe pas, le créer (pour OAuth)
                if (!profile) {
                    /* eslint-disable @typescript-eslint/no-explicit-any */
                    const metadata = session.user.user_metadata as any
                    /* eslint-enable @typescript-eslint/no-explicit-any */

                    let prenom = 'Utilisateur'
                    let nom = ''

                    // Essayer de deviner prénom/nom depuis les métadonnées OAuth
                    if (metadata.full_name) {
                        const parts = metadata.full_name.split(' ')
                        prenom = parts[0]
                        nom = parts.slice(1).join(' ')
                    } else if (metadata.name) {
                        const parts = metadata.name.split(' ')
                        prenom = parts[0]
                        nom = parts.slice(1).join(' ')
                    } else if (metadata.given_name) {
                        prenom = metadata.given_name
                        nom = metadata.family_name || ''
                    }

                    await supabase.from('profiles').insert({
                        id: session.user.id,
                        email: session.user.email,
                        prenom: prenom,
                        nom: nom,
                        role: 'user'
                    })
                }

                router.push('/dashboard')
            } else {
                router.push('/login')
            }
        }

        handleAuthCallback()
    }, [router])

    return (
        <div style={{
            minHeight: '100vh',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            background: '#f0f9ff'
        }}>
            <div style={{ textAlign: 'center' }}>
                <div className="spinner" style={{
                    width: '50px',
                    height: '50px',
                    border: '4px solid #e0f2fe',
                    borderTop: '4px solid #0ea5e9',
                    borderRadius: '50%',
                    animation: 'spin 1s linear infinite',
                    margin: '0 auto 1.5rem auto'
                }} />
                <h2 style={{ color: '#0ea5e9', fontSize: '1.25rem', fontWeight: 600 }}>
                    Connexion en cours...
                </h2>
                <style jsx>{`
          @keyframes spin {
            to { transform: rotate(360deg); }
          }
        `}</style>
            </div>
        </div>
    )
}
