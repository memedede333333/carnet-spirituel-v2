# 🚀 Procédure de déploiement dans Google Antigravity

## 📋 Prérequis

### Système d'exploitation
- **macOS** : Monterey 12 ou version ultérieure (vous êtes sur macOS 22.6.0 ✅)
- **Windows** : Windows 10 (64 bits) ou version ultérieure
- **Linux** : glibc 2.28+ et glibcxx 3.4.25+

### Ressources système
- **RAM** : 16 Go minimum (32 Go recommandés)
- **Connexion réseau** : Haut débit requis pour le streaming de Gemini 3

### Prérequis du projet
- Node.js 18+ installé
- Git configuré
- Compte Supabase avec projet configuré

---

## 📥 Installation de Google Antigravity

1. **Télécharger Antigravity**
   - Accédez à : [https://antigravity.google/](https://antigravity.google/)
   - Téléchargez la version macOS
   - Suivez les instructions d'installation

2. **Mise à jour WSL2 (Windows uniquement)**
   ```powershell
   wsl --update
   ```
   *(Non nécessaire sur macOS)*

---

## 🔧 Configuration du projet pour Antigravity

### 1. Vérifier la structure du projet

Assurez-vous que le projet est dans le bon répertoire :
```bash
cd /Users/aymeri/projets/carnet-spirituel
pwd
# Doit afficher : /Users/aymeri/projets/carnet-spirituel
```

### 2. Vérifier les fichiers essentiels

```bash
# Vérifier que ces fichiers existent
ls -la package.json
ls -la .env.local
ls -la next.config.js
ls -la tsconfig.json
```

### 3. Installer les dépendances (si pas déjà fait)

```bash
cd /Users/aymeri/projets/carnet-spirituel
npm install
```

### 4. Vérifier les variables d'environnement

Le fichier `.env.local` doit contenir :
```env
NEXT_PUBLIC_SUPABASE_URL=https://votre-projet.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=votre_cle_anon
```

⚠️ **Important** : Ne pas commiter `.env.local` dans Git (déjà dans `.gitignore`)

---

## 📂 Importation dans Google Antigravity

### Étape 1 : Ouvrir Antigravity

1. Lancez l'application Google Antigravity
2. Attendez le chargement complet de l'interface

### Étape 2 : Ouvrir le projet existant

1. Dans le menu principal d'Antigravity :
   - Cliquez sur **"File"** → **"Open Folder"** (ou équivalent)
   - OU utilisez le raccourci : `Cmd+O` (macOS) ou `Ctrl+O` (Windows/Linux)

2. Naviguez vers le répertoire du projet :
   ```
   /Users/aymeri/projets/carnet-spirituel
   ```

3. Sélectionnez le dossier `carnet-spirituel` et cliquez sur **"Open"**

### Étape 3 : Vérification de l'import

Antigravity devrait :
- Détecter automatiquement que c'est un projet Next.js
- Charger la structure des fichiers
- Afficher l'arborescence dans l'explorateur de fichiers

---

## ⚙️ Configuration des agents AI dans Antigravity

### Configuration recommandée

1. **Accès aux fichiers**
   - Autoriser les agents à lire les fichiers du projet
   - Autoriser l'accès au terminal intégré

2. **Permissions de commandes**
   - ⚠️ **IMPORTANT** : Ne pas activer le "Turbo mode" qui permet l'exécution sans confirmation
   - Toujours demander confirmation avant d'exécuter des commandes
   - Vérifier les commandes avant validation

3. **Contexte du projet**
   - Informer les agents que c'est un projet Next.js 15.3.2
   - Mentionner l'utilisation de Supabase
   - Pointer vers `DOCUMENTATION-COMPLETE.md` pour le contexte

### Instructions pour les agents

Vous pouvez donner ces instructions aux agents AI d'Antigravity :

```
Ce projet est un Carnet Spirituel développé avec Next.js 15.3.2.
- Framework : Next.js App Router avec TypeScript
- Base de données : Supabase (PostgreSQL)
- Styling : CSS pur + Tailwind CSS
- Documentation complète : DOCUMENTATION-COMPLETE.md
- Structure : app/(app)/ pour les routes protégées
- Variables d'environnement : .env.local (non commité)
```

---

## 🔒 Sécurité et bonnes pratiques

### ⚠️ Problèmes de sécurité connus

Antigravity a eu des problèmes de sécurité signalés. Pour éviter les risques :

1. **Ne pas utiliser le Turbo mode**
   - Désactiver l'exécution automatique de commandes
   - Toujours demander confirmation avant d'exécuter

2. **Vérifier les commandes**
   - Examiner chaque commande avant validation
   - Ne pas autoriser de commandes suspectes

3. **Protection des secrets**
   - Ne jamais partager `.env.local` avec les agents
   - Vérifier que `.env.local` est dans `.gitignore`
   - Ne pas autoriser les agents à modifier les variables d'environnement

4. **Mises à jour**
   - Garder Antigravity à jour avec les dernières versions
   - Consulter les correctifs de sécurité

---

## 🧪 Test du projet dans Antigravity

### 1. Vérifier que le projet est bien chargé

Dans Antigravity, vérifiez :
- ✅ L'arborescence des fichiers est visible
- ✅ `package.json` est détecté
- ✅ Les fichiers TypeScript sont reconnus

### 2. Installer les dépendances (si nécessaire)

Dans le terminal intégré d'Antigravity :
```bash
npm install
```

### 3. Lancer le serveur de développement

```bash
npm run dev
```

### 4. Vérifier l'accès

- Ouvrir `http://localhost:3000` dans le navigateur
- L'application devrait se charger

---

## 📝 Configuration spécifique pour Antigravity

### Fichiers à vérifier dans Antigravity

1. **`.gitignore`**
   - Vérifier que `.env.local` est bien ignoré
   - Vérifier que `node_modules/` est ignoré
   - Vérifier que `.next/` est ignoré

2. **`package.json`**
   - Vérifier que tous les scripts sont présents
   - Vérifier les versions des dépendances

3. **`tsconfig.json`**
   - Vérifier les paths alias (`@/*`)
   - Vérifier la configuration TypeScript

### Configuration du terminal

Dans Antigravity, le terminal devrait :
- Utiliser bash (macOS/Linux) ou PowerShell (Windows)
- Avoir accès à Node.js et npm
- Avoir accès à Git

Vérifier avec :
```bash
node --version
npm --version
git --version
```

---

## 🚨 Dépannage dans Antigravity

### Problème : Le projet ne se charge pas

**Solution :**
1. Fermer et rouvrir Antigravity
2. Vérifier que le chemin est correct : `/Users/aymeri/projets/carnet-spirituel`
3. Vérifier les permissions du dossier

### Problème : Les dépendances ne s'installent pas

**Solution :**
1. Vérifier la connexion internet
2. Vérifier que Node.js est installé : `node --version`
3. Nettoyer et réinstaller :
   ```bash
   rm -rf node_modules package-lock.json
   npm install
   ```

### Problème : Erreurs TypeScript

**Solution :**
1. Vérifier que TypeScript est installé : `npm list typescript`
2. Redémarrer le serveur TypeScript dans Antigravity
3. Vérifier `tsconfig.json`

### Problème : Variables d'environnement non trouvées

**Solution :**
1. Vérifier que `.env.local` existe
2. Vérifier le contenu du fichier
3. Redémarrer le serveur de développement

---

## 📚 Ressources pour Antigravity

- **Site officiel** : [https://antigravity.google/](https://antigravity.google/)
- **Documentation** : Consulter la documentation officielle d'Antigravity
- **Sécurité** : Vérifier les mises à jour de sécurité régulièrement

---

## ✅ Checklist de déploiement dans Antigravity

Avant de commencer à travailler :

- [ ] Antigravity installé et à jour
- [ ] Projet ouvert dans Antigravity : `/Users/aymeri/projets/carnet-spirituel`
- [ ] Structure des fichiers visible dans l'explorateur
- [ ] Dépendances installées (`npm install`)
- [ ] Variables d'environnement configurées (`.env.local`)
- [ ] Serveur de développement testé (`npm run dev`)
- [ ] Application accessible sur `http://localhost:3000`
- [ ] Agents AI configurés avec les bonnes permissions
- [ ] Turbo mode désactivé (sécurité)
- [ ] Documentation lue (`DOCUMENTATION-COMPLETE.md`)
- [ ] Git configuré et remote vérifié

---

## 🎯 Prochaines étapes après importation

1. **Lire la documentation complète**
   - Ouvrir `DOCUMENTATION-COMPLETE.md` dans Antigravity
   - Lire la section "Configuration GitHub" pour éviter les conflits

2. **Configurer Git (si nécessaire)**
   - Vérifier le remote : `git remote -v`
   - Créer un nouveau dépôt GitHub pour le travail (recommandé)

3. **Tester l'application**
   - Lancer `npm run dev`
   - Tester la connexion Supabase
   - Tester l'authentification

4. **Configurer les agents AI**
   - Donner le contexte du projet aux agents
   - Pointer vers la documentation

---

**Date de création :** 14 décembre 2025  
**Dernière mise à jour :** 14 décembre 2025

---

*Cette procédure est spécifique au projet Carnet Spirituel. Pour des informations générales sur Antigravity, consultez la documentation officielle.*

