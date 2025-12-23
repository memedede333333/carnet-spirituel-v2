# 📋 TODO - Système de Notifications & Modération

## 🔴 PRIORITÉ 1 : Email aux Modérateurs (Terminé ✅)

**Problème actuel :** Quand un utilisateur soumet un fioretto, aucun email n'est envoyé aux modérateurs.

**À faire :**
1. Modifier `ShareFiorettoModal.tsx` (fonction `handleSubmit`)
2. Après l'insertion du fioretto en base, récupérer la liste des modérateurs :
   ```sql
   SELECT email, prenom FROM profiles WHERE role IN ('superadmin', 'moderateur')
   ```
3. Appeler l'API `/api/send-moderator-email` (à créer) pour chaque modérateur
4. Utiliser la fonction `sendModeratorNotification` déjà présente dans `email.ts`

**Fichiers à modifier :**
- `/app/components/ShareFiorettoModal.tsx`
- `/app/api/send-moderator-email/route.ts` (à créer)

---

## 🟠 PRIORITÉ 2 : Affichage Info Auteur en Modération (Terminé ✅)

**Problème actuel :** Les modérateurs ne voient pas le nom/email de l'auteur, juste "Anonyme" ou le pseudo.

**À faire :**
1. Modifier le fetch dans `/app/(app)/admin/moderation/page.tsx` :
   ```typescript
   .select(`
     *,
     author:profiles!user_id(id, prenom, nom, email)
   `)
   ```
2. Modifier `FiorettoModerationCard.tsx` pour afficher en bas de carte :
   ```
   ┌─────────────────────────────────────┐
   │ 📝 Contenu du fioretto...           │
   │                                     │
   ├─────────────────────────────────────┤
   │ 👤 Auteur : Jean Dupont             │
   │ 📧 Email : jean@example.com         │
   │ 🎭 Anonymat public : Oui            │
   └─────────────────────────────────────┘
   ```

**Fichiers à modifier :**
- `/app/(app)/admin/moderation/page.tsx` (ligne ~40-60, fonction `checkPermissionsAndFetch`)
- `/app/components/moderation/FiorettoModerationCard.tsx` (ajouter section en bas)

---

## 🟡 PRIORITÉ 3 : Badges de Notification Utilisateurs (2h)

**Problème actuel :** Les utilisateurs ne savent pas qu'ils ont des notifications (fioretto approuvé/refusé).

### 3.1 Badge "Mes Fioretti" (Terminé ✅)

**À faire :**
1. Créer `/app/components/UserNotificationBadge.tsx`
   - Compte les notifications non lues : `SELECT COUNT(*) FROM notifications WHERE user_id = auth.uid() AND lu = false`
   - Affiche un badge rouge avec le nombre
2. Modifier `/app/(app)/layout.tsx` ligne 91 :
   ```typescript
   { href: '/mes-fioretti', label: 'Mes Fioretti', emoji: '📝', color: '#D97706', hasUserBadge: true },
   ```
3. Ajouter la logique d'affichage du badge ligne ~410

**Fichiers à créer/modifier :**
- `/app/components/UserNotificationBadge.tsx` (nouveau)
- `/app/(app)/layout.tsx`

### 3.2 Badge "Modération" (Terminé ✅)

**Problème actuel :** Le composant `FiorettiMenuBadge` compte les nouveaux fioretti publics, pas les fioretti en attente de modération.

**À faire :**
1. Créer `/app/components/ModerationBadge.tsx`
   - Compte les fioretti en attente : `SELECT COUNT(*) FROM fioretti WHERE statut = 'propose'`
   - Affiche un badge orange avec le nombre
2. Le badge est déjà configuré dans `layout.tsx` ligne 96 et 101 (`hasBadge: true`)
3. Remplacer `FiorettiMenuBadge` par `ModerationBadge` pour ces items

**Fichiers à créer/modifier :**
- `/app/components/ModerationBadge.tsx` (nouveau)
- `/app/(app)/layout.tsx` (ligne 410, condition pour afficher le bon badge)

### 3.3 Page "Mes Notifications" (30 min)

**À faire :**
1. Créer `/app/(app)/mes-notifications/page.tsx`
2. Afficher la liste des notifications de l'utilisateur :
   ```sql
   SELECT * FROM notifications 
   WHERE user_id = auth.uid() 
   ORDER BY created_at DESC
   ```
3. Bouton "Marquer tout comme lu" :
   ```sql
   UPDATE notifications SET lu = true WHERE user_id = auth.uid()
   ```
4. Ajouter un lien dans le menu (optionnel, ou accessible depuis "Mes Fioretti")

**Fichiers à créer :**
- `/app/(app)/mes-notifications/page.tsx` (nouveau)

---

## 🟢 PRIORITÉ 4 : Page Charte du Site (1h)

**Problème actuel :** Les emails contiennent un lien vers `/charte` qui n'existe pas (404).

**À faire :**
1. Créer `/app/(app)/charte/page.tsx`
2. Contenu à définir :
   - Règles de modération (pas de politique, respect de la foi, bienveillance)
   - Politique de confidentialité (données personnelles, emails)
   - Anonymat (comment ça fonctionne)
   - Contact modération
3. Design sobre et lisible
4. Ajouter lien dans le footer du site (pas seulement dans les emails)

**Fichiers à créer :**
- `/app/(app)/charte/page.tsx` (nouveau)
- Modifier le footer (si existant) pour ajouter le lien

---

## 📊 Récapitulatif des Estimations

| Priorité | Tâche | Temps estimé | Difficulté |
|----------|-------|--------------|------------|
| 🔴 P1 | Email aux modérateurs | 30 min | Facile |
| 🟠 P2 | Info auteur en modération | 30 min | Facile |
| 🟡 P3.1 | Badge "Mes Fioretti" | 1h | Moyen |
| 🟡 P3.2 | Badge "Modération" | 30 min | Facile |
| 🟡 P3.3 | Page "Mes Notifications" | 30 min | Facile |
| 🟢 P4 | Page Charte | 1h | Facile |
| **TOTAL** | | **4h** | |

---

## 🎯 Ordre recommandé d'implémentation

1. **Email aux modérateurs** (P1) - Critique pour le fonctionnement
2. **Info auteur en modération** (P2) - Très utile au quotidien
3. **Badge Modération** (P3.2) - Complète P1
4. **Badge Mes Fioretti** (P3.1) - UX utilisateur
5. **Page Notifications** (P3.3) - Complète P3.1
6. **Charte** (P4) - Juridique/Éthique

---

## 📝 Notes techniques

### Variables d'environnement
Toutes les variables nécessaires sont déjà configurées dans `.env.local` :
- ✅ `GMAIL_USER`
- ✅ `GMAIL_APP_PASSWORD`
- ✅ `NEXT_PUBLIC_SUPABASE_URL`
- ✅ `NEXT_PUBLIC_SUPABASE_ANON_KEY`

### Base de données
Toutes les tables et colonnes nécessaires existent déjà :
- ✅ Table `notifications` (avec RLS configuré)
- ✅ Table `fioretti` (avec colonnes modération)
- ✅ Table `profiles` (avec colonne `role`)

### Fonctions email
Toutes les fonctions d'envoi d'email sont déjà créées dans `/app/lib/email.ts` :
- ✅ `sendEmail()` - Fonction de base
- ✅ `sendFiorettoNotification()` - Pour les auteurs
- ✅ `sendModeratorNotification()` - Pour les modérateurs (pas encore utilisée)

---

## ⚠️ Points d'attention

1. **Performance** : Les badges font des requêtes SQL. Penser à mettre en cache si nécessaire.
2. **Temps réel** : Les badges ne se mettent pas à jour automatiquement. Il faut rafraîchir la page.
3. **Emails** : Limite Gmail de 500 emails/jour. Surveiller si beaucoup de soumissions.
4. **Sécurité** : Les infos auteur en modération sont sensibles. Bien vérifier les permissions RLS.

---

## 🚀 Après ces tâches

Une fois tout cela fait, le système sera **complet et opérationnel** pour :
- ✅ Soumettre des fioretti
- ✅ Notifier les modérateurs
- ✅ Modérer (approuver/refuser/modifier)
- ✅ Notifier les auteurs
- ✅ Afficher les notifications visuellement
- ✅ Respecter les règles (charte)

**Prochaines évolutions possibles (hors scope actuel) :**
- Notifications en temps réel (WebSocket/Supabase Realtime)
- Système de commentaires sur les fioretti
- Statistiques de modération
- Export des fioretti en PDF
