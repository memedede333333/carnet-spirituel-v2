# Résolution du problème "Aucun log affiché"

## Problème identifié

Les pages de logs de sécurité (utilisateur et admin) affichent "0 activité" alors que des données existent dans la table.

**Cause probable** : Politiques RLS (Row Level Security) trop restrictives ou mal configurées.

## Solution

### Étape 1 : Exécuter le script SQL de correction

1. Ouvrir Supabase Dashboard
2. Aller dans **SQL Editor**
3. Ouvrir le fichier `/scripts/fix_security_logs_rls.sql`
4. Exécuter le script complet

Ce script va :
- Supprimer les anciennes politiques RLS
- Créer de nouvelles politiques plus permissives :
  - `users_view_own_logs` : Les users voient leurs propres logs
  - `superadmins_view_all_logs` : Les admins voient TOUS les logs
  - `anyone_can_insert_logs` : Tout le monde peut insérer (pour le système)

### Étape 2 : Vérifier les logs dans la console

Après avoir exécuté le script SQL, rafraîchissez les pages :

**Page utilisateur** (`/profile/security`) :
- Ouvrir la console développeur (F12)
- Vérifier les logs : `Loading security logs for user: [ID]`
- Vérifier : `Security logs loaded: [nombre]`

**Page admin** (`/admin/security`) :
- Ouvrir la console développeur (F12)
- Vérifier les logs : `Loading all security logs for admin...`
- Vérifier : `Admin security logs loaded: [nombre]`

### Étape 3 : Tester si les données apparaissent

Si après l'exécution du script les logs n'apparaissent toujours pas, vérifiez :

**A. Les user_id correspondent-ils ?**

Dans Supabase SQL Editor :
```sql
-- Lister vos users
SELECT id, email FROM auth.users LIMIT 10;

-- Lister les logs
SELECT user_id, action, created_at FROM security_logs LIMIT 10;

-- Vérifier si un user_id dans security_logs existe dans auth.users
SELECT sl.*, au.email 
FROM security_logs sl
LEFT JOIN auth.users au ON au.id = sl.user_id
LIMIT 10;
```

Si les `user_id` ne correspondent pas, c'est que les logs ont été créés avec des IDs qui n'existent plus.

**B. Solution temporaire : Créer de nouveaux logs**

Si les anciennes données sont orphelines, reconnectez-vous pour générer un nouveau log :
1. Se déconnecter
2. Se reconnecter
3. Aller sur `/profile/security`

Cela devrait créer un nouveau log de connexion qui s'affichera.

## Erreur "Invalid Refresh Token"

Cette erreur est gérée maintenant dans le code. Si elle apparaît :
1. Vous serez automatiquement redirigé vers `/login`
2. Reconnectez-vous normalement

## Changements effectués dans le code

### Menu (layout.tsx)
✅ "Logs de Sécurité" déplacé en dernier dans ADMINISTRATION

### Logs côté utilisateur (profile/security/page.tsx)
✅ Ajout de logs console pour debugging
✅ Gestion de l'erreur "Refresh Token"

### Logs côté admin (admin/security/page.tsx)
✅ Ajout de logs console pour debugging

## Ordre de test

1. **Exécuter le script SQL** `fix_security_logs_rls.sql`
2. **Rafraîchir la page** (CTRL+F5 ou CMD+SHIFT+R)
3. **Ouvrir la console** (F12)
4. **Vérifier les logs** dans la console
5. **Vérifier l'affichage** des logs de sécurité

Si ça ne fonctionne toujours pas, envoyez-moi :
- Les logs de la console
- Le résultat du script SQL (section 2 et 7 surtout)
