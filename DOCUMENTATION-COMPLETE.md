# 📚 Documentation Complète - Carnet Spirituel

**Date de création :** 14 décembre 2025  
**Version du projet :** 0.1.0  
**Dernière mise à jour :** 14 décembre 2025

---

## ⚠️ IMPORTANT - AVANT DE COMMENCER

### 🎯 Sur quel projet travailler ?

**PROJET DE TRAVAIL (à utiliser dans votre IDE) :**
```
/Users/aymeri/projets/carnet-spirituel
```

**SAUVEGARDE (ne pas modifier) :**
```
/Users/aymeri/projets/carnet-spirituel-original-20251214
```

### ✅ Vérification de l'opérationnalité

Le projet de travail a été vérifié et est **opérationnel** :
- ✅ Structure complète du projet
- ✅ Fichiers de configuration présents (`package.json`, `next.config.js`, `tsconfig.json`)
- ✅ Dossier `app/` avec tous les modules
- ✅ Dossier `.git/` avec historique complet
- ✅ Fichier `.env.local` présent (variables d'environnement)
- ✅ Remote GitHub configuré : `origin` → `https://github.com/memedede333333/carnet-spirituel-catholique.git`

### 🔗 Configuration GitHub - RECOMMANDATIONS CRITIQUES

**⚠️ ATTENTION : Les deux projets pointent vers le même dépôt GitHub !**

**État actuel :**
- **Projet de travail** (`carnet-spirituel`) : Remote `origin` → `https://github.com/memedede333333/carnet-spirituel-catholique.git`
- **Sauvegarde** (`carnet-spirituel-original-20251214`) : Remote `origin` → `https://github.com/memedede333333/carnet-spirituel-catholique.git`

**Recommandations FORTES :**

1. **Créer un nouveau dépôt GitHub pour le projet de travail** (recommandé)
   ```bash
   # Créer un nouveau dépôt sur GitHub (ex: carnet-spirituel-work)
   # Puis dans le projet de travail :
   cd /Users/aymeri/projets/carnet-spirituel
   git remote set-url origin https://github.com/votre-user/carnet-spirituel-work.git
   ```

2. **OU travailler sur une branche séparée** (alternative)
   ```bash
   cd /Users/aymeri/projets/carnet-spirituel
   git checkout -b travail-ide-nouveau
   # Travailler sur cette branche, puis push vers origin
   ```

3. **NE JAMAIS push directement sur main depuis les deux projets simultanément** - risque de conflits et perte de données

---

## 📋 Table des matières

1. [Vue d'ensemble du projet](#vue-densemble)
2. [Architecture technique](#architecture-technique)
3. [Structure du projet](#structure-du-projet)
4. [Modules et fonctionnalités](#modules-et-fonctionnalités)
5. [Configuration et installation](#configuration-et-installation)
6. [Base de données Supabase](#base-de-données-supabase)
7. [Système de liens spirituels](#système-de-liens-spirituels)
8. [Guide de développement](#guide-de-développement)
9. [Déploiement](#déploiement)
10. [Dépannage](#dépannage)

---

## 🎯 Vue d'ensemble

### Description

**Carnet Spirituel** est une application web Next.js permettant aux utilisateurs de tenir un journal spirituel numérique. L'application permet de noter, organiser et relire les grâces reçues, les prières, les écritures, les paroles de connaissance et les rencontres missionnaires.

### Fonctionnalités principales

- ✨ **Module Grâces** : Noter les grâces reçues avec tags et contexte
- 🙏 **Module Prières** : Suivre les prières (guérison, frères, intercession) avec suivi d'évolution
- 📖 **Module Écritures** : Enregistrer les passages bibliques qui ont touché
- 🕊️ **Module Paroles** : Noter les paroles de connaissance reçues avec accomplissement
- 🤝 **Module Rencontres** : Documenter les rencontres missionnaires avec suivi
- 🔄 **Module Relecture** : Visualisation chronologique et en constellation des éléments spirituels
- 🔗 **Liens spirituels** : Créer des connexions entre les différents éléments
- 👤 **Profil utilisateur** : Gestion du compte, sécurité, email

### Stack technique

- **Framework** : Next.js 15.3.2 (App Router)
- **Langage** : TypeScript 5
- **UI** : React 19.0.0
- **Styling** : CSS pur + Tailwind CSS 4.1.7
- **Base de données** : Supabase (PostgreSQL)
- **Authentification** : Supabase Auth
- **Icônes** : Lucide React
- **Dates** : date-fns avec locale française
- **Visualisation** : D3.js pour la vue constellation
- **UI Components** : Radix UI (Dialog, Dropdown Menu)

---

## 🏗️ Architecture technique

### Structure Next.js App Router

Le projet utilise le **App Router** de Next.js avec une structure de routes basée sur les dossiers :

```
app/
├── (app)/          # Routes protégées (nécessitent authentification)
│   ├── layout.tsx  # Layout principal avec menu latéral
│   ├── dashboard/  # Tableau de bord
│   ├── graces/     # Module grâces
│   ├── prieres/    # Module prières
│   ├── ecritures/  # Module écritures
│   ├── paroles/    # Module paroles
│   ├── rencontres/ # Module rencontres
│   ├── relecture/  # Module relecture
│   └── profile/    # Gestion du profil
├── (auth)/         # Routes d'authentification
│   ├── login/      # Connexion
│   └── register/   # Inscription
├── components/     # Composants réutilisables
├── lib/            # Utilitaires et helpers
├── types/          # Types TypeScript
└── layout.tsx      # Layout racine
```

### Pattern de routage

Chaque module suit le même pattern :
```
module/
├── page.tsx              # Liste des éléments
├── nouvelle/page.tsx     # Création d'un nouvel élément
├── [id]/page.tsx         # Détail d'un élément
└── [id]/modifier/page.tsx # Modification d'un élément
```

### Authentification

- Utilisation de **Supabase Auth** pour l'authentification
- Protection des routes via le layout `(app)/layout.tsx`
- Vérification de l'utilisateur sur chaque page protégée
- Redirection automatique vers `/login` si non authentifié

### Gestion d'état

- **État local React** : `useState`, `useEffect` pour la gestion d'état locale
- **Supabase Realtime** : Pas utilisé actuellement, mais possible pour les mises à jour en temps réel
- **Pas de state management global** : Chaque page gère son propre état

---

## 📁 Structure du projet

### Arborescence complète

```
carnet-spirituel/
├── app/                          # Application Next.js
│   ├── (app)/                    # Routes protégées
│   │   ├── dashboard/            # Tableau de bord
│   │   ├── graces/               # Module grâces
│   │   │   ├── page.tsx          # Liste
│   │   │   ├── nouvelle/         # Création
│   │   │   └── [id]/             # Détail et modification
│   │   ├── prieres/              # Module prières
│   │   │   ├── page.tsx
│   │   │   ├── nouvelle/
│   │   │   └── [id]/
│   │   │       └── suivi/        # Suivi des prières
│   │   ├── ecritures/            # Module écritures
│   │   ├── paroles/              # Module paroles
│   │   ├── rencontres/           # Module rencontres
│   │   ├── relecture/            # Module relecture
│   │   │   ├── page.tsx          # Page principale (très complexe)
│   │   │   └── components/       # Composants spécifiques
│   │   │       ├── links/        # Gestion des liens
│   │   │       ├── navigation/   # Navigation
│   │   │       └── shared/       # Composants partagés
│   │   ├── profile/              # Gestion du profil
│   │   │   ├── page.tsx          # Profil
│   │   │   ├── edit/             # Édition
│   │   │   ├── email/            # Changement email
│   │   │   ├── password/         # Changement mot de passe
│   │   │   └── security/         # Sécurité
│   │   ├── layout.tsx            # Layout avec menu
│   │   └── page.tsx              # Page d'accueil (landing)
│   ├── (auth)/                   # Routes publiques
│   │   ├── login/
│   │   └── register/
│   ├── components/                # Composants réutilisables
│   │   ├── AuthForm.tsx
│   │   ├── ConstellationView.tsx # Vue constellation
│   │   ├── LinkBadge.tsx         # Badge de liens
│   │   ├── LinksList.tsx         # Liste de liens
│   │   ├── LinksManager.tsx      # Gestionnaire de liens
│   │   └── SpiritualLinksSection.tsx
│   ├── lib/                      # Utilitaires
│   │   ├── supabase.ts           # Client Supabase
│   │   ├── aelf.ts               # API AELF (lectures du jour)
│   │   ├── email-alerts.ts       # Alertes email
│   │   ├── security-logger.ts    # Logs de sécurité
│   │   └── spiritual-links-helpers.ts # Helpers liens spirituels
│   ├── types/                    # Types TypeScript
│   │   └── index.ts
│   ├── globals.css               # Styles globaux
│   └── layout.tsx                # Layout racine
├── public/                        # Fichiers statiques
│   ├── logo-sacre-coeur-final.svg
│   └── ...
├── supabase/                     # Configuration Supabase
│   └── functions/                # Edge Functions
│       └── send-email-alert/
├── scripts/                      # Scripts utilitaires
│   └── reset-test-account.sql
├── .env.local                    # Variables d'environnement (NE PAS COMMITER)
├── .gitignore
├── next.config.js                # Configuration Next.js
├── package.json                  # Dépendances
├── postbuild.js                  # Script post-build
├── tailwind.config.ts            # Configuration Tailwind
├── tsconfig.json                 # Configuration TypeScript
└── README.md
```

### Fichiers de configuration importants

#### `package.json`
- Dépendances principales : Next.js 15.3.2, React 19, Supabase, Tailwind CSS
- Scripts : `dev`, `build`, `start`, `lint`
- Build personnalisé : `build && node postbuild.js`

#### `next.config.js`
- ESLint et TypeScript ignorés pendant le build (à corriger en production)
- Configuration minimale

#### `tsconfig.json`
- Path alias : `@/*` → `./*`
- Target : ES2017
- Module resolution : bundler

#### `.env.local` (à créer si absent)
```env
NEXT_PUBLIC_SUPABASE_URL=votre_url_supabase
NEXT_PUBLIC_SUPABASE_ANON_KEY=votre_cle_anon
```

---

## 🎨 Modules et fonctionnalités

### 1. Module Grâces (`app/(app)/graces/`)

**Fonctionnalités :**
- Liste des grâces avec filtres par date et tags
- Création d'une grâce avec texte, date, lieu, personnes présentes, fruits
- Modification et suppression
- Système de tags
- Liens spirituels avec autres éléments

**Structure de données :**
```typescript
interface Grace {
  id: string
  user_id: string
  texte: string
  date: string
  lieu?: string
  personnes_presentes?: string[]
  fruits?: string
  tags?: string[]
  visibilite: 'prive' | 'anonyme' | 'public'
  created_at: string
  updated_at: string
}
```

**Table Supabase :** `graces`

### 2. Module Prières (`app/(app)/prieres/`)

**Fonctionnalités :**
- Liste des prières avec filtres
- Création avec type (guérison, frères, intercession)
- Suivi d'évolution avec historique
- Compteur de nombre de fois prié
- Liens spirituels

**Structure de données :**
```typescript
interface Priere {
  id: string
  user_id: string
  type: 'guerison' | 'freres' | 'intercession'
  personne_prenom: string
  personne_nom?: string
  date: string
  sujet: string
  sujet_detail?: string
  nombre_fois: number
  notes?: string
  visibilite: 'prive' | 'anonyme' | 'public'
  created_at: string
  updated_at: string
}

interface SuiviPriere {
  id: string
  priere_id: string
  date: string
  notes: string
  evolution?: 'amelioration' | 'stable' | 'aggravation' | 'gueri'
  nouvelle_priere?: boolean
}
```

**Tables Supabase :** `prieres`, `suivis_priere`

### 3. Module Écritures (`app/(app)/ecritures/`)

**Fonctionnalités :**
- Liste des passages bibliques
- Création avec référence, texte complet, traduction
- Contexte (messe, lectio, retraite, groupe, personnel)
- Notes personnelles ("Ce qui m'a touché")
- Fruits constatés

**Structure de données :**
```typescript
interface ParoleEcriture {
  id: string
  user_id: string
  reference: string
  texte_complet: string
  traduction: string
  contexte: 'messe' | 'lectio' | 'retraite' | 'groupe' | 'personnel'
  date_reception: string
  ce_qui_ma_touche: string
  pour: string
  fruits?: string[]
  visibilite: 'prive' | 'anonyme' | 'public'
  created_at: string
  updated_at: string
}
```

**Table Supabase :** `paroles_ecriture`

### 4. Module Paroles (`app/(app)/paroles/`)

**Fonctionnalités :**
- Liste des paroles de connaissance
- Création avec contexte (personnelle, veillée, mission, prière, autre)
- Destinataire (moi, inconnu, personne spécifique)
- Suivi d'accomplissement avec date
- Fruits constatés

**Structure de données :**
```typescript
interface ParoleConnaissance {
  id: string
  user_id: string
  texte: string
  date: string
  contexte: 'personnelle' | 'veillee' | 'mission' | 'priere' | 'autre'
  contexte_detail?: string
  destinataire: 'moi' | 'inconnu' | 'personne'
  personne_destinataire?: string
  fruit_constate?: string
  date_accomplissement?: string
  visibilite: 'prive' | 'anonyme' | 'public'
  created_at: string
  updated_at: string
}
```

**Table Supabase :** `paroles_connaissance`

### 5. Module Rencontres (`app/(app)/rencontres/`)

**Fonctionnalités :**
- Liste des rencontres missionnaires
- Création avec personne, date, lieu, contexte
- Description détaillée
- Fruits immédiats et espérés
- Suivi avec historique

**Structure de données :**
```typescript
interface RencontreMissionnaire {
  id: string
  user_id: string
  personne_prenom: string
  personne_nom?: string
  date: string
  lieu: string
  contexte: string
  description: string
  fruit_immediat?: string
  fruit_espere?: string
  visibilite: 'prive' | 'anonyme' | 'public'
  created_at: string
  updated_at: string
}
```

**Table Supabase :** `rencontres_missionnaires`

### 6. Module Relecture (`app/(app)/relecture/`)

**Fonctionnalités principales :**
- **Vue chronologique** : Timeline de tous les éléments spirituels
- **Vue constellation** : Visualisation graphique des connexions
- **Filtres avancés** : Par type, date, tags
- **Recherche** : Recherche textuelle dans tous les éléments
- **Création de liens** : Interface pour créer des liens spirituels
- **Suggestions** : Suggestions automatiques de liens possibles

**Composants spécifiques :**
- `ConstellationView` : Visualisation D3.js des connexions
- `PanneauLateralLiens` : Panneau de création de liens
- `RappelsDoux` : Widget de rappels

**Fichier principal :** `app/(app)/relecture/page.tsx` (très volumineux, ~3500 lignes)

### 7. Module Profil (`app/(app)/profile/`)

**Fonctionnalités :**
- Affichage du profil utilisateur
- Édition des informations (prénom, nom)
- Changement d'email
- Changement de mot de passe
- Gestion de la sécurité (logs de connexion)

**Table Supabase :** `profiles`

---

## 🔧 Configuration et installation

### Prérequis

- **Node.js** : Version 18+ (recommandé : 20+)
- **npm** ou **yarn** ou **pnpm**
- **Compte Supabase** avec projet configuré
- **Git** pour le versioning

### Installation

1. **Cloner ou ouvrir le projet**
   ```bash
   cd /Users/aymeri/projets/carnet-spirituel
   ```

2. **Installer les dépendances**
   ```bash
   npm install
   # ou
   yarn install
   # ou
   pnpm install
   ```

3. **Configurer les variables d'environnement**
   
   Créer ou vérifier le fichier `.env.local` :
   ```env
   NEXT_PUBLIC_SUPABASE_URL=https://votre-projet.supabase.co
   NEXT_PUBLIC_SUPABASE_ANON_KEY=votre_cle_anon
   ```
   
   Ces valeurs se trouvent dans votre projet Supabase :
   - Dashboard Supabase → Settings → API

4. **Lancer le serveur de développement**
   ```bash
   npm run dev
   # ou
   yarn dev
   # ou
   pnpm dev
   ```

5. **Ouvrir dans le navigateur**
   ```
   http://localhost:3000
   ```

### Scripts disponibles

- `npm run dev` : Serveur de développement (port 3000)
- `npm run build` : Build de production + postbuild
- `npm run start` : Serveur de production
- `npm run lint` : Linter ESLint

### Build de production

```bash
npm run build
npm run start
```

Le script `postbuild.js` s'exécute automatiquement après le build.

---

## 🗄️ Base de données Supabase

### Tables principales

#### 1. `profiles`
Profil utilisateur étendu (après authentification Supabase Auth)

```sql
CREATE TABLE profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id),
  prenom TEXT NOT NULL,
  nom TEXT,
  email TEXT,
  role TEXT DEFAULT 'user',
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);
```

#### 2. `graces`
Grâces reçues

```sql
CREATE TABLE graces (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) NOT NULL,
  texte TEXT NOT NULL,
  date DATE NOT NULL,
  lieu TEXT,
  personnes_presentes TEXT[],
  fruits TEXT,
  tags TEXT[],
  visibilite TEXT DEFAULT 'prive',
  statut_partage TEXT DEFAULT 'brouillon',
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);
```

#### 3. `prieres`
Prières (guérison, frères, intercession)

```sql
CREATE TABLE prieres (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) NOT NULL,
  type TEXT NOT NULL, -- 'guerison' | 'freres' | 'intercession'
  personne_prenom TEXT NOT NULL,
  personne_nom TEXT,
  date DATE NOT NULL,
  sujet TEXT NOT NULL,
  sujet_detail TEXT,
  nombre_fois INTEGER DEFAULT 1,
  notes TEXT,
  visibilite TEXT DEFAULT 'prive',
  statut_partage TEXT DEFAULT 'brouillon',
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);
```

#### 4. `suivis_priere`
Suivi d'évolution des prières

```sql
CREATE TABLE suivis_priere (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  priere_id UUID REFERENCES prieres(id) ON DELETE CASCADE,
  date DATE NOT NULL,
  notes TEXT,
  evolution TEXT, -- 'amelioration' | 'stable' | 'aggravation' | 'gueri'
  nouvelle_priere BOOLEAN DEFAULT false,
  created_at TIMESTAMP DEFAULT NOW()
);
```

#### 5. `paroles_ecriture`
Passages bibliques

```sql
CREATE TABLE paroles_ecriture (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) NOT NULL,
  reference TEXT NOT NULL,
  texte_complet TEXT NOT NULL,
  traduction TEXT,
  contexte TEXT NOT NULL, -- 'messe' | 'lectio' | 'retraite' | 'groupe' | 'personnel'
  date_reception DATE NOT NULL,
  ce_qui_ma_touche TEXT NOT NULL,
  pour TEXT,
  fruits TEXT[],
  visibilite TEXT DEFAULT 'prive',
  statut_partage TEXT DEFAULT 'brouillon',
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);
```

#### 6. `paroles_connaissance`
Paroles de connaissance

```sql
CREATE TABLE paroles_connaissance (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) NOT NULL,
  texte TEXT NOT NULL,
  date DATE NOT NULL,
  contexte TEXT NOT NULL, -- 'personnelle' | 'veillee' | 'mission' | 'priere' | 'autre'
  contexte_detail TEXT,
  destinataire TEXT NOT NULL, -- 'moi' | 'inconnu' | 'personne'
  personne_destinataire TEXT,
  fruit_constate TEXT,
  date_accomplissement DATE,
  visibilite TEXT DEFAULT 'prive',
  statut_partage TEXT DEFAULT 'brouillon',
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);
```

#### 7. `rencontres_missionnaires`
Rencontres missionnaires

```sql
CREATE TABLE rencontres_missionnaires (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) NOT NULL,
  personne_prenom TEXT NOT NULL,
  personne_nom TEXT,
  date DATE NOT NULL,
  lieu TEXT NOT NULL,
  contexte TEXT NOT NULL,
  description TEXT NOT NULL,
  fruit_immediat TEXT,
  fruit_espere TEXT,
  visibilite TEXT DEFAULT 'prive',
  statut_partage TEXT DEFAULT 'brouillon',
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);
```

#### 8. `liens_spirituels`
Connexions entre éléments spirituels

```sql
CREATE TABLE liens_spirituels (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) NOT NULL,
  element_source_type TEXT NOT NULL, -- 'grace' | 'priere' | 'ecriture' | 'parole' | 'rencontre'
  element_source_id UUID NOT NULL,
  element_cible_type TEXT NOT NULL,
  element_cible_id UUID NOT NULL,
  type_lien TEXT NOT NULL, -- 'decoule' | 'accomplit' | 'exauce' | 'echo' | 'eclaire'
  description TEXT,
  created_at TIMESTAMP DEFAULT NOW()
);
```

### Row Level Security (RLS)

Toutes les tables doivent avoir RLS activé avec des politiques permettant :
- **SELECT** : Utilisateurs peuvent voir uniquement leurs propres données
- **INSERT** : Utilisateurs peuvent créer uniquement leurs propres données
- **UPDATE** : Utilisateurs peuvent modifier uniquement leurs propres données
- **DELETE** : Utilisateurs peuvent supprimer uniquement leurs propres données

Exemple de politique :
```sql
-- Politique de lecture
CREATE POLICY "Utilisateurs peuvent voir leurs données" ON graces
  FOR SELECT USING (auth.uid() = user_id);

-- Politique de création
CREATE POLICY "Utilisateurs peuvent créer leurs données" ON graces
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Politique de modification
CREATE POLICY "Utilisateurs peuvent modifier leurs données" ON graces
  FOR UPDATE USING (auth.uid() = user_id);

-- Politique de suppression
CREATE POLICY "Utilisateurs peuvent supprimer leurs données" ON graces
  FOR DELETE USING (auth.uid() = user_id);
```

### Index recommandés

```sql
-- Index pour améliorer les performances
CREATE INDEX idx_graces_user_date ON graces(user_id, date DESC);
CREATE INDEX idx_prieres_user_date ON prieres(user_id, date DESC);
CREATE INDEX idx_liens_user ON liens_spirituels(user_id);
CREATE INDEX idx_liens_source ON liens_spirituels(element_source_id, element_source_type);
CREATE INDEX idx_liens_cible ON liens_spirituels(element_cible_id, element_cible_type);
```

---

## 🔗 Système de liens spirituels

Voir la documentation complète dans : `DOCUMENTATION_LIENS_SPIRITUELS.md`

### Vue d'ensemble

Le système de liens spirituels permet de créer des connexions entre les différents éléments spirituels pour visualiser les relations et comprendre l'action de Dieu dans la vie de l'utilisateur.

### Types de liens

1. **`exauce`** 🙏 : Une prière exaucée par une grâce
2. **`accomplit`** ✓ : Une parole accomplie par un événement
3. **`decoule`** → : Un élément découle d'un autre
4. **`eclaire`** 💡 : Un élément éclaire un autre
5. **`echo`** 🔄 : Deux éléments font écho l'un à l'autre

### Composants principaux

- `SpiritualLinksSection` : Affichage des liens sur une page d'élément
- `LinksManager` : Modal de gestion des liens
- `LinkBadge` : Badge indiquant le nombre de liens
- `LinksList` : Liste des liens avec actions
- `ConstellationView` : Visualisation graphique D3.js
- `PanneauLateralLiens` : Panneau de création de liens

### Helpers

Fichier : `app/lib/spiritual-links-helpers.ts`

Fonctions principales :
- `getLinksCountForEntry()` : Nombre de liens pour une entrée
- `getLinksForEntry()` : Tous les liens d'une entrée
- `areEntriesLinked()` : Vérifier si deux entrées sont liées
- `getLinkTypeBetween()` : Type de lien entre deux entrées
- `getEntryShortText()` : Texte court pour une entrée
- `getTypeConfig()` : Configuration visuelle d'un type

---

## 💻 Guide de développement

### Conventions de code

#### TypeScript
- Utiliser TypeScript strict
- Définir les types dans `app/types/index.ts`
- Utiliser les interfaces plutôt que les types pour les objets

#### Composants React
- Utiliser des composants fonctionnels avec hooks
- Préférer `'use client'` pour les composants interactifs
- Utiliser les Server Components quand possible

#### Styling
- CSS pur dans `globals.css` avec variables CSS
- Tailwind CSS pour les utilitaires
- Classes réutilisables définies dans `globals.css`

#### Noms de fichiers
- Composants : PascalCase (`LinkBadge.tsx`)
- Pages : `page.tsx` (convention Next.js)
- Utilitaires : kebab-case (`spiritual-links-helpers.ts`)

### Ajout d'un nouveau module

1. **Créer la structure de dossiers**
   ```
   app/(app)/nouveau-module/
   ├── page.tsx
   ├── nouvelle/page.tsx
   └── [id]/
       ├── page.tsx
       └── modifier/page.tsx
   ```

2. **Créer la table Supabase**
   - Définir le schéma SQL
   - Activer RLS
   - Créer les politiques

3. **Définir les types TypeScript**
   - Ajouter dans `app/types/index.ts`

4. **Créer les pages**
   - Liste, création, détail, modification
   - Suivre le pattern des modules existants

5. **Ajouter au menu**
   - Modifier `app/(app)/layout.tsx`
   - Ajouter l'item de menu

6. **Intégrer les liens spirituels**
   - Utiliser `SpiritualLinksSection`
   - Charger les liens dans la page

### Débogage

#### Erreurs courantes

1. **Erreur Supabase "relation does not exist"**
   - Vérifier que la table existe dans Supabase
   - Vérifier le nom exact de la table (case-sensitive)

2. **Erreur d'authentification**
   - Vérifier `.env.local`
   - Vérifier que l'utilisateur est connecté
   - Vérifier les politiques RLS

3. **Erreur de build TypeScript**
   - Vérifier les types dans `app/types/index.ts`
   - Vérifier les imports

4. **Styles non appliqués**
   - Vérifier l'import de `globals.css` dans `layout.tsx`
   - Vérifier les classes Tailwind dans `tailwind.config.ts`

#### Outils de débogage

- **Console navigateur** : `console.log()`, `console.error()`
- **React DevTools** : Inspection des composants
- **Supabase Dashboard** : Logs et données
- **Network tab** : Requêtes API

### Tests

Actuellement, **aucun test automatisé** n'est configuré. Recommandations :
- Ajouter Jest + React Testing Library
- Tests unitaires pour les helpers
- Tests d'intégration pour les pages principales

---

## 🚀 Déploiement

### Vercel (recommandé)

1. **Connecter le dépôt GitHub**
   - Aller sur [vercel.com](https://vercel.com)
   - Importer le projet depuis GitHub

2. **Configurer les variables d'environnement**
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`

3. **Déployer**
   - Vercel détecte automatiquement Next.js
   - Build automatique à chaque push

### Autres plateformes

- **Netlify** : Similaire à Vercel
- **Railway** : Configuration manuelle
- **Docker** : Créer un Dockerfile

### Variables d'environnement de production

⚠️ **Ne jamais commiter `.env.local`** dans Git !

Variables nécessaires :
- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`

---

## 🔧 Dépannage

### Problèmes courants

#### 1. Le projet ne démarre pas

```bash
# Vérifier Node.js
node --version  # Doit être 18+

# Réinstaller les dépendances
rm -rf node_modules package-lock.json
npm install

# Vérifier les variables d'environnement
cat .env.local
```

#### 2. Erreurs Supabase

- Vérifier les variables d'environnement
- Vérifier que les tables existent
- Vérifier les politiques RLS
- Vérifier les logs dans Supabase Dashboard

#### 3. Erreurs de build

```bash
# Nettoyer le cache Next.js
rm -rf .next

# Rebuild
npm run build
```

#### 4. Styles cassés

- Vérifier l'import de `globals.css`
- Vérifier `tailwind.config.ts`
- Vérifier les classes CSS

### Logs utiles

- **Supabase Dashboard** → Logs
- **Vercel Dashboard** → Logs de déploiement
- **Console navigateur** → Erreurs JavaScript

---

## 📝 Notes importantes

### Points d'attention

1. **Next.js 15** : Utiliser `use()` pour les params asynchrones
   ```typescript
   const params = await use(params)
   ```

2. **Supabase** : Toujours vérifier l'authentification avant les requêtes
   ```typescript
   const { data: { user } } = await supabase.auth.getUser()
   if (!user) return
   ```

3. **Types** : Vérifier les noms de colonnes dans Supabase (snake_case)
   - `user_id` (pas `userId`)
   - `created_at` (pas `createdAt`)

4. **CSS** : Le projet utilise principalement CSS pur, Tailwind pour les utilitaires

5. **Icônes** : Utiliser Lucide React, pas d'autres bibliothèques

### Fichiers à ne pas modifier

- `node_modules/` : Généré automatiquement
- `.next/` : Cache Next.js
- `.env.local` : Ne pas commiter

### Fichiers de sauvegarde

Le projet contient de nombreux fichiers `.backup` et `.old`. Ils peuvent être supprimés en production mais sont conservés pour référence.

---

## 📚 Ressources

### Documentation officielle

- [Next.js Documentation](https://nextjs.org/docs)
- [Supabase Documentation](https://supabase.com/docs)
- [React Documentation](https://react.dev)
- [TypeScript Documentation](https://www.typescriptlang.org/docs)
- [Tailwind CSS Documentation](https://tailwindcss.com/docs)

### Documentation du projet

- `DOCUMENTATION_LIENS_SPIRITUELS.md` : Documentation complète du système de liens
- `DEPLOIEMENT-ANTIGRAVITY.md` : Procédure complète pour déployer dans Google Antigravity IDE
- `README.md` : README de base
- `README-STRUCTURE.md` : Structure des dossiers (si présent)

### Support

- Issues GitHub : [https://github.com/memedede333333/carnet-spirituel-catholique](https://github.com/memedede333333/carnet-spirituel-catholique)
- Supabase Support : [https://supabase.com/support](https://supabase.com/support)

---

## ✅ Checklist de démarrage

Avant de commencer à travailler :

- [ ] Projet cloné/ouvert dans l'IDE
- [ ] Dépendances installées (`npm install`)
- [ ] Variables d'environnement configurées (`.env.local`)
- [ ] Serveur de développement lancé (`npm run dev`)
- [ ] Application accessible sur `http://localhost:3000`
- [ ] Compte Supabase configuré et accessible
- [ ] Tables Supabase créées avec RLS
- [ ] Compte utilisateur de test créé
- [ ] Remote GitHub vérifié et configuré correctement
- [ ] Documentation lue et comprise

---

**Documentation créée le :** 14 décembre 2025  
**Dernière mise à jour :** 14 décembre 2025  
**Version du projet :** 0.1.0

---

*Cette documentation est exhaustive et couvre tous les aspects du projet. En cas de question, référez-vous d'abord à cette documentation avant de chercher ailleurs.*

