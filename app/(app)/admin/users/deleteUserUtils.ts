import { supabase } from '@/app/lib/supabase';

export function generateConfirmationCode(): string {
    const words = [
        'ALPHA', 'BRAVO', 'CHARLIE', 'DELTA', 'ECHO',
        'FOXTROT', 'GOLF', 'HOTEL', 'INDIA', 'JULIET'
    ];
    const word = words[Math.floor(Math.random() * words.length)];
    const number = Math.floor(Math.random() * 9000) + 1000;
    return `${word}-${number}`;
}

export async function deleteUser(userId: string): Promise<{ success: boolean; message: string }> {
    try {
        // Récupérer l'utilisateur connecté
        const { data: { user: currentUser } } = await supabase.auth.getUser();

        if (!currentUser) {
            throw new Error('Vous devez être connecté');
        }

        const response = await fetch('/api/admin/delete-user', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                userIdToDelete: userId,
                currentUserId: currentUser.id
            })
        });

        const data = await response.json();

        if (!response.ok) {
            throw new Error(data.error || 'Erreur lors de la suppression');
        }

        return { success: true, message: data.message };
    } catch (error: any) {
        return { success: false, message: error.message };
    }
}
