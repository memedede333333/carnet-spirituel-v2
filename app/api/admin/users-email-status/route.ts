import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

// Client Supabase avec Service Role (admin complet)
const supabaseAdmin = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    {
        auth: {
            autoRefreshToken: false,
            persistSession: false
        }
    }
)

export async function POST(request: Request) {
    try {
        const { currentUserId } = await request.json()

        if (!currentUserId) {
            return NextResponse.json(
                { error: 'User ID manquant' },
                { status: 400 }
            )
        }

        // Vérifier que l'utilisateur connecté est superadmin
        const { data: currentProfile } = await supabaseAdmin
            .from('profiles')
            .select('role')
            .eq('id', currentUserId)
            .single()

        if (currentProfile?.role !== 'superadmin') {
            return NextResponse.json(
                { error: 'Accès refusé - Superadmin requis' },
                { status: 403 }
            )
        }

        // Récupérer tous les utilisateurs avec leur statut de confirmation
        const { data: authUsers, error } = await supabaseAdmin.auth.admin.listUsers()

        if (error) {
            console.error('Erreur récupération users auth:', error)
            return NextResponse.json(
                { error: 'Erreur lors de la récupération des utilisateurs' },
                { status: 500 }
            )
        }

        // Créer un map id -> emailConfirmed
        const emailStatusMap: Record<string, boolean> = {}
        authUsers.users.forEach(user => {
            emailStatusMap[user.id] = !!user.email_confirmed_at
        })

        return NextResponse.json({ emailStatusMap })
    } catch (error: any) {
        console.error('Erreur API users-email-status:', error)
        return NextResponse.json(
            { error: error.message || 'Erreur serveur' },
            { status: 500 }
        )
    }
}
