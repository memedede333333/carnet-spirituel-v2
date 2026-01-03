/**
 * Authentication and Authorization Helpers
 * Carnet Spirituel - Role-based access control
 */

import { supabase } from './supabase';

/**
 * Type pour les rôles utilisateur
 */
export type UserRole = 'user' | 'moderateur' | 'superadmin';

/**
 * Interface pour le profil utilisateur avec rôle
 */
export interface UserProfile {
    id: string;
    email: string;
    prenom: string;
    nom?: string;
    role: UserRole;
    emailConfirmed?: boolean;
}

/**
 * Récupère le rôle de l'utilisateur actuellement connecté
 * @returns Le rôle de l'utilisateur ou null si non connecté
 */
export async function getCurrentUserRole(): Promise<UserRole | null> {
    try {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) return null;

        const { data, error } = await supabase
            .from('profiles')
            .select('role')
            .eq('id', user.id)
            .single();

        if (error || !data) return null;
        return data.role as UserRole;
    } catch (error) {
        console.error('Error fetching user role:', error);
        return null;
    }
}

/**
 * Récupère le profil complet de l'utilisateur actuellement connecté
 * @returns Le profil utilisateur ou null si non connecté
 */
export async function getCurrentUserProfile(): Promise<UserProfile | null> {
    try {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) return null;

        const { data, error } = await supabase
            .from('profiles')
            .select('id, email, prenom, nom, role')
            .eq('id', user.id)
            .single();

        if (error || !data) return null;
        return data as UserProfile;
    } catch (error) {
        console.error('Error fetching user profile:', error);
        return null;
    }
}

/**
 * Vérifie si l'utilisateur a un rôle spécifique
 * @param requiredRole Le rôle requis ('moderateur' ou 'superadmin')
 * @returns true si l'utilisateur a ce rôle, false sinon
 */
export async function hasRole(requiredRole: 'moderateur' | 'superadmin'): Promise<boolean> {
    const role = await getCurrentUserRole();
    if (!role) return false;

    if (requiredRole === 'moderateur') {
        // Les superadmins ont aussi les droits de modérateur
        return role === 'moderateur' || role === 'superadmin';
    }

    return role === requiredRole;
}

/**
 * Vérifie si l'utilisateur peut modérer
 * @returns true si l'utilisateur est modérateur ou superadmin
 */
export async function canModerate(): Promise<boolean> {
    return hasRole('moderateur');
}

/**
 * Vérifie si l'utilisateur est administrateur
 * @returns true si l'utilisateur est superadmin
 */
export async function isAdmin(): Promise<boolean> {
    const role = await getCurrentUserRole();
    return role === 'superadmin';
}

/**
 * Vérifie si l'utilisateur peut accéder à la gestion des utilisateurs
 * @returns true si l'utilisateur est superadmin
 */
export async function canManageUsers(): Promise<boolean> {
    return isAdmin();
}

/**
 * Récupère tous les utilisateurs (admin seulement)
 * @returns Liste des profils utilisateurs ou null si non autorisé
 */
export async function getAllUsers(): Promise<UserProfile[] | null> {
    try {
        const isAdminUser = await isAdmin();
        if (!isAdminUser) {
            console.error('Unauthorized: Admin access required');
            return null;
        }

        const { data, error } = await supabase
            .from('profiles')
            .select('id, email, prenom, nom, role')
            .order('created_at', { ascending: false });

        if (error) {
            console.error('Error fetching users:', error);
            return null;
        }

        // Enrichir avec les données auth (statut confirmation email)
        // On récupère tous les utilisateurs auth pour comparer
        const { data: { user: currentUser } } = await supabase.auth.getUser();

        // Pour récupérer le statut de confirmation, on doit utiliser l'admin API
        // Mais comme on est côté client, on va faire une approximation :
        // Si l'utilisateur peut se connecter, son email est confirmé
        // On va plutôt enrichir ça dans la page admin via une API route

        return data.map(profile => ({
            ...profile,
            emailConfirmed: undefined // Sera enrichi côté serveur
        })) as UserProfile[];
    } catch (error) {
        console.error('Error in getAllUsers:', error);
        return null;
    }
}

/**
 * Met à jour le rôle d'un utilisateur (admin seulement)
 * @param userId ID de l'utilisateur
 * @param newRole Nouveau rôle à assigner
 * @returns true si succès, false sinon
 */
export async function updateUserRole(userId: string, newRole: UserRole): Promise<boolean> {
    try {
        const isAdminUser = await isAdmin();
        if (!isAdminUser) {
            console.error('Unauthorized: Admin access required');
            return false;
        }

        // Vérifier qu'on ne rétrograde pas le dernier superadmin
        if (newRole !== 'superadmin') {
            const { data: admins } = await supabase
                .from('profiles')
                .select('id')
                .eq('role', 'superadmin');

            if (admins && admins.length === 1) {
                // Vérifier si c'est le dernier admin qu'on essaie de modifier
                const { data: targetUser } = await supabase
                    .from('profiles')
                    .select('role')
                    .eq('id', userId)
                    .single();

                if (targetUser?.role === 'superadmin') {
                    console.error('Cannot demote last superadmin');
                    return false;
                }
            }
        }

        const { error } = await supabase
            .from('profiles')
            .update({ role: newRole })
            .eq('id', userId);

        if (error) {
            console.error('Error updating user role:', error);
            return false;
        }

        // Créer une notification pour l'utilisateur
        await supabase.from('notifications').insert({
            user_id: userId,
            type: 'role_changed',
            message: `Votre rôle a été modifié en: ${newRole === 'superadmin' ? 'Administrateur' : newRole === 'moderateur' ? 'Modérateur' : 'Utilisateur'}`,
        });

        return true;
    } catch (error) {
        console.error('Error in updateUserRole:', error);
        return false;
    }
}
