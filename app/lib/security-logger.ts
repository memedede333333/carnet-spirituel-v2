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
  action: 'login' | 'logout' | 'password_change' | 'email_change' | 'profile_update' | 'failed_login' | 'account_created',
  details?: any
) {
  try {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return

    // Récupérer l'IP et le user agent côté client
    const userAgent = typeof window !== 'undefined' ? window.navigator.userAgent : null
    const ipAddress = await getClientIP()

    await supabase
      .from('security_logs')
      .insert({
        user_id: user.id,
        action,
        ip_address: ipAddress,
        user_agent: userAgent,
        details: details || {}
      })
  } catch (error) {
    console.error('Erreur lors du log de sécurité:', error)
  }
}
