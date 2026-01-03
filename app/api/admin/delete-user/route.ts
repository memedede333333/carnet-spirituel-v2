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

// Client Supabase normal pour vérifier l'utilisateur connecté
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

export async function POST(request: Request) {
    try {
        const { userIdToDelete, currentUserId } = await request.json()

        if (!userIdToDelete || !currentUserId) {
            return NextResponse.json(
                { error: 'User IDs manquants' },
                { status: 400 }
            )
        }

        // 1. Vérifier que l'utilisateur connecté est superadmin (avec admin client)
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

        // 2. Protection : Impossible de se supprimer soi-même
        if (userIdToDelete === currentUserId) {
            return NextResponse.json(
                { error: 'Vous ne pouvez pas supprimer votre propre compte' },
                { status: 400 }
            )
        }

        // 3. Récupérer les infos de l'utilisateur à supprimer
        const { data: userToDelete } = await supabaseAdmin
            .from('profiles')
            .select('email, prenom, nom, role')
            .eq('id', userIdToDelete)
            .single()

        if (!userToDelete) {
            return NextResponse.json(
                { error: 'Utilisateur non trouvé' },
                { status: 404 }
            )
        }

        // 4. Protection : Vérifier qu'il reste au moins 1 superadmin
        if (userToDelete.role === 'superadmin') {
            const { data: superadmins } = await supabaseAdmin
                .from('profiles')
                .select('id')
                .eq('role', 'superadmin')

            if (superadmins && superadmins.length <= 1) {
                return NextResponse.json(
                    { error: 'Impossible de supprimer le dernier superadmin' },
                    { status: 400 }
                )
            }
        }

        // 5. Logger l'action AVANT la suppression
        const { data: currentUserData } = await supabaseAdmin
            .from('profiles')
            .select('email')
            .eq('id', currentUserId)
            .single()

        await supabaseAdmin.from('security_logs').insert({
            user_id: currentUserId,
            action: 'account_deleted',
            details: {
                deleted_user_id: userIdToDelete,
                deleted_user_email: userToDelete.email,
                deleted_user_name: `${userToDelete.prenom} ${userToDelete.nom || ''}`.trim(),
                deleted_by_admin: currentUserData?.email || 'unknown',
                timestamp: new Date().toISOString()
            }
        })

        // 6. Suppression en CASCADE (avec client admin)
        // Note: Les FK ON DELETE CASCADE doivent être configurées en base
        // Sinon, supprimer manuellement dans l'ordre :

        // Logs de sécurité de l'utilisateur (pas tous, juste ceux où user_id = lui)
        await supabaseAdmin
            .from('security_logs')
            .delete()
            .eq('user_id', userIdToDelete)

        // Fioretti
        await supabaseAdmin
            .from('fioretti')
            .delete()
            .eq('user_id', userIdToDelete)

        // Grâces
        await supabaseAdmin
            .from('graces')
            .delete()
            .eq('user_id', userIdToDelete)

        // Prières
        await supabaseAdmin
            .from('prieres')
            .delete()
            .eq('user_id', userIdToDelete)

        // Écritures
        await supabaseAdmin
            .from('ecritures')
            .delete()
            .eq('user_id', userIdToDelete)

        // Paroles
        await supabaseAdmin
            .from('paroles')
            .delete()
            .eq('user_id', userIdToDelete)

        // Rencontres
        await supabaseAdmin
            .from('rencontres')
            .delete()
            .eq('user_id', userIdToDelete)

        // Profil
        await supabaseAdmin
            .from('profiles')
            .delete()
            .eq('id', userIdToDelete)

        // 7. Supprimer de Supabase Auth (CRITIQUE - nécessite service role)
        const { error: authError } = await supabaseAdmin.auth.admin.deleteUser(
            userIdToDelete
        )

        if (authError) {
            console.error('Erreur suppression Auth:', authError)
            return NextResponse.json(
                { error: 'Erreur lors de la suppression Auth: ' + authError.message },
                { status: 500 }
            )
        }

        // 8. Envoyer email de confirmation à l'utilisateur supprimé
        try {
            const { sendAccountDeletionEmail } = await import('@/app/lib/email')
            await sendAccountDeletionEmail(
                userToDelete.email,
                `${userToDelete.prenom} ${userToDelete.nom || ''}`.trim()
            )
        } catch (emailError) {
            console.error('Erreur envoi email suppression:', emailError)
            // On ne fait pas échouer la suppression si l'email ne part pas
        }

        return NextResponse.json({
            success: true,
            message: `Utilisateur ${userToDelete.email} supprimé avec succès`
        })

    } catch (error: any) {
        console.error('Erreur suppression utilisateur:', error)
        return NextResponse.json(
            { error: error.message || 'Erreur serveur' },
            { status: 500 }
        )
    }
}
