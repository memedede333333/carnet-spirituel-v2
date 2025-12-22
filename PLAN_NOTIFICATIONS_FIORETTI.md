# Plan d'implémentation - Système de notifications Fioretti

## ✅ État actuel (ce qui fonctionne)
- ✅ Édition et approbation des fioretti par les modérateurs
- ✅ Création de notifications dans la table `notifications`
- ✅ Backup du contenu original
- ✅ Messages privés modérateur → auteur

---

## 🎯 Améliorations demandées

### 1. NOTIFICATIONS UTILISATEURS (auteurs de fioretti)

#### A. Badge de notification dans le menu
**Fonctionnalité :**
- Afficher un badge avec le nombre de notifications non lues dans le menu de gauche
- Ex: "Mes Fioretti (2)" avec pastille rouge

**Implémentation :**
```typescript
// 1. Composant NotificationBadge
// Fichier : /app/components/NotificationBadge.tsx
// - useEffect pour fetch count des notifications non lues
// - SELECT COUNT(*) FROM notifications WHERE user_id = auth.uid() AND lu = false

// 2. Intégrer dans le menu de gauche
// Fichier : Layout ou Sidebar component
// - Ajouter <NotificationBadge /> à côté de "Mes Fioretti"
```

**SQL nécessaire :**
```sql
-- Query pour compter notifications non lues
SELECT COUNT(*) 
FROM notifications 
WHERE user_id = auth.uid() 
  AND lu = false;
```

#### B. Page "Mes Notifications"
**Fonctionnalité :**
- Nouvelle page `/mes-fioretti` ou `/notifications`
- Liste des notifications avec :
  - Date
  - Type (approuvé / refusé / modifié)
  - Message du modérateur
  - Lien vers le fioretto
- Bouton "Tout marquer comme lu"

**Fichier à créer :**
`/app/(app)/mes-fioretti/page.tsx`

#### C. Email de notification
**Service requis :** Resend (ou alternative)

**Configuration :**
1. Créer compte Resend (gratuit : 100 emails/jour)
2. Ajouter clé API dans `.env.local` : `RESEND_API_KEY=`
3. Configurer domaine d'envoi (ex: noreply@carnet-spirituel.fr)

**Template email :**
```html
Bonjour [Prénom],

Votre fioretto a été [approuvé/refusé/modifié] par notre équipe de modération.

[Si modifié:]
Message du modérateur : [message]

[Si refusé:]
Nous vous invitons à revoir le contenu ou nous contacter si vous avez des questions.

---
Carnet Spirituel
[Lien vers la charte]
```

**Implémentation :**
```typescript
// Fichier : /app/lib/email.ts
import { Resend } from 'resend';
const resend = new Resend(process.env.RESEND_API_KEY);

export async function sendFiorettoNotification(
  userEmail: string, 
  userName: string, 
  status: 'approuve' | 'refuse' | 'modifie',
  moderatorMessage?: string
) {
  // Template selon status
  // resend.emails.send(...)
}
```

**Appeler dans `handleEdit`, `handleModeration` :**
```typescript
// Après création de la notification DB
await sendFiorettoNotification(
  authorEmail,
  authorName,
  'approuve',
  moderatorMessage
);
```

---

### 2. NOTIFICATIONS MODÉRATEURS

#### A. Badge dans le menu admin
**Fonctionnalité :**
- Badge sur "Modération" avec nombre de fioretti en attente
- Ex: "Modération (5)"

**Query SQL :**
```sql
SELECT COUNT(*) 
FROM fioretti 
WHERE statut = 'propose';
```

**Implémentation :** Même principe que pour les utilisateurs, mais compte les fioretti proposés.

#### B. Email aux modérateurs lors de nouvelle soumission
**Déclencheur :** Quand un utilisateur clique "Partager" dans `ShareFiorettoModal`

**Fonctionnalité :**
- Récupérer tous les emails des modérateurs (role = 'superadmin' ou 'moderateur')
- Envoyer email groupé

**SQL pour récupérer modérateurs :**
```sql
SELECT email, prenom, nom 
FROM profiles 
WHERE role IN ('superadmin', 'moderateur');
```

**Template email modérateur :**
```html
Bonjour [Modérateur],

Un nouveau fioretto attend votre validation :

📝 Type : [Grâce/Prière/...]
👤 Auteur : [Prénom NOM] ([email])
📅 Soumis le : [Date]

Aperçu :
« [Texte tronqué...] »

[Anonymat demandé : Oui/Non]

👉 Accéder à la modération : [Lien]

---
Carnet Spirituel - Modération
```

**Implémentation :**
```typescript
// Dans ShareFiorettoModal, après l'insert fioretti :
const { data: moderators } = await supabase
  .from('profiles')
  .select('email, prenom, nom')
  .in('role', ['superadmin', 'moderateur']);

for (const mod of moderators || []) {
  await sendModeratorNotification(
    mod.email,
    mod.prenom,
    {
      fiorettoType: elementType,
      authorName: `${author.prenom} ${author.nom}`,
      authorEmail: author.email,
      content: formattedContent.substring(0, 200),
      isAnonymous: anonyme,
      submittedAt: new Date()
    }
  );
}
```

---

### 3. AFFICHAGE INFORMATIONS AUTEUR (Modération)

#### A. Dans la plateforme de modération
**Objectif :** Afficher nom/prénom/email même si anonymat demandé (pour contact en cas de refus)

**Modification du fetch :**
```typescript
// Dans /app/(app)/admin/moderation/page.tsx
const { data, error } = await supabase
  .from('fioretti')
  .select(`
    *,
    author:profiles!user_id(
      id,
      prenom,
      nom,
      email
    )
  `)
  .eq('statut', 'propose')
  .order('created_at', { ascending: true });
```

**Affichage dans FiorettoModerationCard :**
```tsx
{/* Info auteur (toujours visible pour modérateurs) */}
<div style={{
  padding: '0.75rem',
  background: '#F8FAFC',
  borderTop: '1px solid #E2E8F0',
  fontSize: '0.75rem',
  color: '#64748B'
}}>
  <div><strong>Auteur :</strong> {fioretto.author.prenom} {fioretto.author.nom}</div>
  <div><strong>Email :</strong> {fioretto.author.email}</div>
  <div><strong>Anonymat public :</strong> {fioretto.anonyme ? '✅ Oui' : '❌ Non'}</div>
</div>
```

**Design :** Boîte grise discrète en bas de chaque carte, séparée visuellement du contenu public.

#### B. Dans l'email modérateur
**Déjà prévu dans le template ci-dessus :**
```
👤 Auteur : [Prénom NOM] ([email])
[Anonymat demandé : Oui/Non]
```

---

## 📋 CHECKLIST D'IMPLÉMENTATION

### Phase 1 : Notifications en base (sans email)
- [ ] Composant `NotificationBadge` pour utilisateurs
- [ ] Page `/mes-fioretti` avec liste notifications
- [ ] Composant `ModerationBadge` pour admins
- [ ] Marquer notifications comme lues
- [ ] Join `profiles` dans fetch modération pour récupérer info auteur
- [ ] Afficher info auteur dans `FiorettoModerationCard`

### Phase 2 : Emails (nécessite Resend)
- [ ] Configurer compte Resend
- [ ] Ajouter `RESEND_API_KEY` à `.env.local`
- [ ] Créer `/app/lib/email.ts` avec fonctions d'envoi
- [ ] Template email utilisateur (approuvé/refusé/modifié)
- [ ] Template email modérateur (nouvelle soumission)
- [ ] Intégrer envoi dans `handleEdit`, `handleModeration`
- [ ] Intégrer envoi dans `ShareFiorettoModal`

### Phase 3 : Charte & mentions légales
- [ ] Créer page `/charte`
- [ ] Lien dans footer
- [ ] Lien dans emails

---

## 🛠️ OUTILS & SERVICES NÉCESSAIRES

### Resend (Emails)
- **Site :** https://resend.com
- **Prix :** Gratuit jusqu'à 100 emails/jour, puis $20/mois pour 50k emails
- **Alternative :** SendGrid, Mailgun, ou Supabase Edge Functions + SMTP

### Installation Resend :
```bash
npm install resend
```

### Variables d'environnement :
```env
# .env.local
RESEND_API_KEY=re_xxxxx
RESEND_FROM_EMAIL=noreply@carnet-spirituel.fr
```

---

## 📊 SCHÉMA DB - Modifications nécessaires

### Ajout colonne `author` virtuelle (via JOIN)
Pas de modification DB nécessaire, juste améliorer les queries fetch.

### Index pour performance notifications
```sql
-- Déjà créés dans fix_notifications_rls.sql
CREATE INDEX IF NOT EXISTS idx_notifications_user_read 
ON notifications(user_id, lu, created_at DESC);
```

---

## 🎨 DESIGN DES NOTIFICATIONS

### Badge notification (menu)
```css
.notification-badge {
  background: #EF4444;
  color: white;
  border-radius: 9999px;
  padding: 0.125rem 0.5rem;
  font-size: 0.75rem;
  font-weight: 600;
  margin-left: 0.5rem;
}
```

### Info auteur (modération)
- Fond gris clair (#F8FAFC)
- Bordure subtile en haut (#E2E8F0)
- Texte petit (0.75rem)
- Clairement séparé du contenu public

---

## ⏱️ ESTIMATION TEMPS

- **Phase 1 (Notifications base)** : 3-4h
- **Phase 2 (Emails)** : 2-3h
- **Phase 3 (Charte)** : 1h
- **Total :** 6-8h de développement

---

## 🚀 PROCHAINES ÉTAPES

1. **Décider** : Voulez-vous implémenter tout d'un coup ou par phase ?
2. **Resend** : Créer un compte et obtenir la clé API
3. **Domaine** : Quel domaine/email pour l'envoi ? (ex: noreply@carnet-spirituel.fr)
4. **Commencer Phase 1** : Notifications visuelles sans emails d'abord

---

**Prêt à démarrer ?** 🎯
