# Configuration Gmail pour l'envoi d'emails

## ✅ Étapes à suivre

### 1. Activer la validation en 2 étapes
1. Allez sur https://myaccount.google.com/security
2. Connectez-vous avec `carnet.spirituel33@gmail.com`
3. Cherchez "Validation en deux étapes"
4. Cliquez sur "Activer"
5. Suivez les instructions (SMS ou application Google Authenticator)

### 2. Créer un mot de passe d'application
1. Une fois la 2FA activée, retournez sur https://myaccount.google.com/security
2. Cherchez "Mots de passe d'application" (apparaît seulement après activation 2FA)
3. Sélectionnez "Mail" ou "Autre (personnalisé)"
4. Nommez-le "Carnet Spirituel"
5. **Copiez le code à 16 caractères** (format: `abcd efgh ijkl mnop`)

### 3. Ajouter les variables d'environnement
Ajoutez ces lignes dans votre fichier `.env.local` :

```env
# Configuration Gmail
GMAIL_USER=carnet.spirituel33@gmail.com
GMAIL_APP_PASSWORD=abcdefghijklmnop  # Remplacez par le mot de passe d'application (sans espaces)

# URL de l'application (pour les liens dans les emails)
NEXT_PUBLIC_APP_URL=http://localhost:3000  # En dev
# NEXT_PUBLIC_APP_URL=https://carnet-spirituel.vercel.app  # En production
```

### 4. Redémarrer le serveur de développement
```bash
# Arrêtez le serveur (Ctrl+C) puis relancez
npm run dev
```

### 5. Tester l'envoi d'email
Une fois configuré, vous pouvez tester en approuvant/refusant un fioretto dans la page de modération.

---

## 🔒 Sécurité

- ✅ Le mot de passe d'application est **différent** de votre mot de passe Gmail
- ✅ Il ne donne accès qu'à l'envoi d'emails, pas à votre compte complet
- ✅ Vous pouvez le révoquer à tout moment depuis les paramètres Google
- ⚠️ **Ne commitez JAMAIS** le fichier `.env.local` sur Git (déjà dans `.gitignore`)

---

## 📧 Emails configurés

### Pour les utilisateurs (auteurs de fioretti)
- ✅ Fioretto approuvé
- ✅ Fioretto refusé
- ✅ Fioretto modifié (avec message du modérateur)

### Pour les modérateurs
- ✅ Nouvelle soumission de fioretto (avec infos auteur)

---

## 🚨 Limites Gmail

Google impose des limites d'envoi :
- **500 emails/jour** pour un compte Gmail gratuit
- **2000 emails/jour** pour Google Workspace

Pour le Carnet Spirituel, 500/jour devrait largement suffire au début.

Si vous dépassez ces limites, vous devrez passer à un service professionnel (Resend, SendGrid, etc.).

---

## 🧪 Test rapide

Pour tester que tout fonctionne, vous pouvez créer un petit script de test :

```typescript
// test-email.ts
import { sendEmail } from './app/lib/email';

sendEmail({
  to: 'votre-email-perso@example.com',
  subject: 'Test Carnet Spirituel',
  html: '<h1>Ça marche ! 🎉</h1><p>L\'envoi d\'emails est configuré.</p>'
}).then(result => {
  console.log('Résultat:', result);
});
```

Puis exécutez :
```bash
npx tsx test-email.ts
```
