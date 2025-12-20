# 🔐 Guide de Configuration OAuth (Google & Microsoft)

Ce guide vous accompagne pas à pas pour activer la connexion avec Google et Microsoft sur votre Carnet Spirituel.

---

## 🌍 Pré-requis : Votre URL de Callback Supabase

Avant de commencer, récupérez votre URL de callback dans Supabase :
1. Allez sur votre [Supabase Dashboard](https://supabase.com/dashboard).
2. Sélectionnez votre projet.
3. Allez dans **Authentication** -> **URL Configuration**.
4. Copiez l'URL sous **Site URL** (ex: `https://votre-projet.supabase.co`).
5. Gardez cette URL précieusement, nous l'appellerons `[SUPABASE_URL]` dans ce guide.
   - L'URL de callback complète est : `[SUPABASE_URL]/auth/v1/callback`

---

## 🔵 Partie 1 : Google OAuth (Gmail)

### 1. Créer le projet Google
1. Allez sur la [Google Cloud Console](https://console.cloud.google.com/).
2. En haut à gauche, cliquez sur le sélecteur de projet et faites **"New Project"**.
3. Nommez-le "Carnet Spirituel" et validez.

### 2. Configurer l'écran de consentement
1. Dans le menu de gauche, allez dans **APIs & Services** -> **OAuth consent screen**.
2. Choisissez **External** et cliquez sur **Create**.
3. Remplissez les infos de base :
   - **App name** : Carnet Spirituel
   - **User support email** : Votre email
   - **Developer contact information** : Votre email
4. Cliquez sur **Save and Continue** pour les étapes suivantes (pas besoin de changer les "Scopes" pour l'instant).

### 3. Créer les identifiants (Credentials)
1. Allez dans **Credentials** (menu gauche) -> **Create Credentials** -> **OAuth client ID**.
2. **Application type** : Sélectionnez **Web application**.
3. **Name** : "Supabase Login".
4. **Authorized Redirect URIs** :
   - Cliquez sur **Add URI**.
   - Collez votre URL de callback Supabase : `[SUPABASE_URL]/auth/v1/callback`
   - *Exemple : `https://xyz.supabase.co/auth/v1/callback`*
5. Cliquez sur **Create**.

### 4. Activer dans Supabase
1. Une fenêtre apparaît avec **Your Client ID** et **Your Client Secret**.
2. Ouvrez un nouvel onglet vers [Supabase Dashboard](https://supabase.com/dashboard).
3. Allez dans **Authentication** -> **Providers** -> **Google**.
4. Activez le switch **Enable Google**.
5. Collez le **Client ID** et le **Client Secret**.
6. Cliquez sur **Save**.

👉 **Test** : Essayez de vous connecter avec Google sur votre site local (`http://localhost:3000/login`).

---

## 🟦 Partie 2 : Microsoft OAuth (Outlook, Hotmail)

### 1. Créer l'application Azure
1. Allez sur le [Azure Portal](https://portal.azure.com/).
2. Cherchez et sélectionnez **Microsoft Entra ID** (anciennement Azure Active Directory).
3. Dans le menu gauche, cliquez sur **App registrations** -> **New registration**.
4. Remplissez :
   - **Name** : Carnet Spirituel
   - **Supported account types** : Sélectionnez le 3ème choix : *"Accounts in any organizational directory (Any Microsoft Entra ID tenant - Multitenant) and personal Microsoft accounts (e.g. Skype, Xbox)"*. C'est **CRUCIAL** pour que les emails personnels (@hotmail, @outlook) fonctionnent.
   - **Redirect URI** : Sélectionnez **Web** et collez : `[SUPABASE_URL]/auth/v1/callback`
5. Cliquez sur **Register**.

### 2. Récupérer les ID
Sur la page d'aperçu (Overview) de votre nouvelle app, copiez :
1. **Application (client) ID** (Ce sera votre Client ID pour Supabase).

### 3. Créer le Secret
1. Dans le menu gauche de l'app, cliquez sur **Certificates & secrets**.
2. Onglet **Client secrets** -> **New client secret**.
3. **Description** : "Supabase Login".
4. **Expires** : Choisissez la durée max (ex: 24 mois).
5. Cliquez sur **Add**.
6. ⚠️ **IMPORTANT** : Copiez IMMÉDIATEMENT la **Value** du secret (pas le Secret ID). Elle ne sera plus visible après.

### 4. Activer dans Supabase
1. Retournez sur [Supabase Dashboard](https://supabase.com/dashboard).
2. Allez dans **Authentication** -> **Providers** -> **Azure (Microsoft)**.
3. Activez le switch **Enable Azure**.
4. Remplissez :
   - **Application (client) ID** : Collez l'ID copié à l'étape 2.
   - **Directory (tenant) ID** : *Laisser vide ou mettre "common" si demandé*.
   - **Client Secret** : Collez la **Value** copiée à l'étape 3.
5. Cliquez sur **Save**.

---

## ✅ Vérification Finale

Une fois configuré :

1. Lancez votre projet localement (`npm run dev`).
2. Allez sur `http://localhost:3000/login`.
3. Cliquez sur "Google" : Vous devriez voir la fenêtre de connexion Google.
4. Cliquez sur "Microsoft" : Vous devriez voir la fenêtre de connexion Microsoft.

### 🚨 En cas d'erreur "redirect_uri_mismatch"
Cela signifie que l'URL que vous avez mise dans Google/Azure ne correspond pas EXACTEMENT à celle de Supabase.
- Vérifiez s'il manque un `/` à la fin ou s'il y en a un de trop.
- Vérifiez `http` vs `https`.

Bonne configuration ! 🕊️
