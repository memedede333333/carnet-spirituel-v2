import { supabase } from './supabase'

// Fonction pour récupérer l'IP address
async function getClientIP(): Promise<string | null> {
  try {
    // Utiliser une API gratuite pour obtenir l'IP publique
    const response = await fetch('https://api.ipify.org?format=json', {
      method: 'GET',
      cache: 'no-cache'
    })
    const data = await response.json()
    return data.ip || null
  } catch (error) {
    console.error('Erreur récupération IP:', error)
    return null
  }
}

export async function logSecurityAction(
  action: 'login' | 'logout' | 'password_change' | 'email_change' | 'profile_update' | 'failed_login' | 'account_created' | 'account_deleted',
  details?: any,
  explicitUserId?: string
) {
  try {
    let userId = explicitUserId

    // Si pas d'ID explicite, on essaie de récupérer l'utilisateur connecté
    if (!userId) {
      const { data: { user } } = await supabase.auth.getUser()
      userId = user?.id
    }

    // Si toujours pas d'utilisateur et que ce n'est pas un failed_login (qui est anonyme), on annule
    if (!userId && action !== 'failed_login') return

    // Récupérer l'IP et le user agent côté client
    const userAgent = typeof window !== 'undefined' ? window.navigator.userAgent : null
    const ipAddress = await getClientIP()

    const { data, error: insertError } = await supabase
      .from('security_logs')
      .insert({
        user_id: userId || null, // null pour failed_login
        action,
        ip_address: ipAddress,
        user_agent: userAgent,
        details: details || {}
      })

    if (insertError) {
      console.error('❌ ERREUR LOG SÉCURITÉ:', {
        action,
        userId,
        error: insertError,
        message: insertError.message,
        code: insertError.code
      })
    } else {
      console.log('✅ Log sécurité enregistré:', action, userId)
    }
  } catch (error) {
    console.error('❌ EXCEPTION log de sécurité:', error)
  }
}
