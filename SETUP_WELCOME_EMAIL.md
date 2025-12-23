# 📧 Configuration Email de Bienvenue - Webhook Supabase

## ✅ Ce qui est fait

1. ✅ **Fonction d'email créée** : `sendWelcomeEmail()` dans `/app/lib/email.ts`
2. ✅ **API route créée** : `/app/api/send-welcome-email/route.ts`
3. ✅ **Template HTML** : Email avec charte graphique complète du site
4. ✅ **Contenu** : 5 modules + Relecture + Fioretti + CTA

---

## 🔧 Configuration à faire dans Supabase

### Étape 1 : Créer un webhook

1. **Aller dans Supabase Dashboard**
   - Projet : Carnet Spirituel
   - Menu : **Database** → **Webhooks**

2. **Créer un nouveau webhook**
   - **Name** : `send-welcome-email`
   - **Table** : `auth.users`
   - **Events** : Cocher uniquement `UPDATE`
   - **Type** : `HTTP Request`
   - **Method** : `POST`
   - **URL** : `https://votre-domaine.vercel.app/api/send-welcome-email`
     - ⚠️ En dev local : `http://localhost:3000/api/send-welcome-email` (ne fonctionnera pas, il faut ngrok)
     - ✅ En production : `https://carnet-spirituel.vercel.app/api/send-welcome-email`

3. **Condition SQL** (pour ne déclencher que si email confirmé) :
   ```sql
   NEW.email_confirmed_at IS NOT NULL 
   AND OLD.email_confirmed_at IS NULL
   ```

4. **HTTP Headers** :
   ```json
   {
     "Content-Type": "application/json"
   }
   ```

5. **Payload** (Body du webhook) :
   ```json
   {
     "userEmail": "{{ record.email }}",
     "userName": "{{ record.raw_user_meta_data.prenom }}"
   }
   ```

---

## 🧪 Test du webhook

### Option 1 : Créer un nouveau compte
1. S'inscrire avec un nouvel email
2. Confirmer l'email via le lien Supabase
3. Vérifier la réception de l'email de bienvenue

### Option 2 : Tester manuellement l'API
```bash
curl -X POST http://localhost:3000/api/send-welcome-email \
  -H "Content-Type: application/json" \
  -d '{
    "userEmail": "votre-email@example.com",
    "userName": "Prénom"
  }'
```

---

## 🚀 Déploiement

### 1. Variables d'environnement Vercel
Vérifier que ces variables sont bien configurées :
- `GMAIL_USER` : `carnet.spirituel33@gmail.com`
- `GMAIL_APP_PASSWORD` : Mot de passe d'application Gmail
- `NEXT_PUBLIC_APP_URL` : `https://carnet-spirituel.vercel.app`

### 2. Déployer sur Vercel
```bash
git add .
git commit -m "feat: add welcome email with onboarding content"
git push
```

### 3. Configurer le webhook avec l'URL de production
Une fois déployé, retourner dans Supabase et mettre à jour l'URL du webhook avec l'URL Vercel.

---

## 📝 Notes importantes

### Pourquoi `raw_user_meta_data.prenom` ?
Supabase stocke les données du formulaire d'inscription dans `raw_user_meta_data`. Si vous avez un champ `prenom` dans votre formulaire d'inscription, il sera accessible via cette clé.

### Si le prénom n'est pas disponible
Modifier le payload du webhook :
```json
{
  "userEmail": "{{ record.email }}",
  "userName": "{{ record.email }}"
}
```
L'email sera utilisé comme nom par défaut.

### Alternative : Utiliser la table `profiles`
Si vous avez une table `profiles` avec le prénom :
1. Créer le webhook sur la table `profiles` au lieu de `auth.users`
2. Event : `INSERT` (quand un profil est créé)
3. Payload :
   ```json
   {
     "userEmail": "{{ record.email }}",
     "userName": "{{ record.prenom }}"
   }
   ```

---

## 🐛 Debugging

### Le webhook ne se déclenche pas
1. Vérifier les logs Supabase : **Database** → **Webhooks** → Cliquer sur le webhook → **Logs**
2. Vérifier que la condition SQL est correcte
3. Tester l'API manuellement avec curl

### L'email n'arrive pas
1. Vérifier les logs du serveur : `npm run dev` (en local) ou Vercel logs (en prod)
2. Vérifier que les variables d'environnement sont bien configurées
3. Vérifier les spams Gmail

### Erreur 500 de l'API
1. Vérifier que `GMAIL_USER` et `GMAIL_APP_PASSWORD` sont corrects
2. Vérifier que le mot de passe d'application Gmail n'a pas été révoqué
3. Regarder les logs d'erreur dans la console

---

## 🎯 Prochaines étapes (optionnel)

1. **Modal d'onboarding** sur le dashboard (première connexion)
2. **Page `/guide`** avec tutoriel interactif
3. **Tooltips** sur les boutons pour guider l'utilisateur

---

**Créé le** : 23 décembre 2024
**Status** : ✅ Code prêt, webhook à configurer
