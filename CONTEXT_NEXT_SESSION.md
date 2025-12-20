# Contexte Projet - Carnet Spirituel

## 📖 Vue d'ensemble du projet

**Carnet de Grâces & de Missions** est une application web spirituelle permettant aux utilisateurs de :
- Noter leurs grâces reçues, prières, lectures d'Écriture, paroles de connaissance, et rencontres missionnaires
- Partager ces "fioretti" avec la communauté (jardin communautaire)
- Interagir avec les partages (prier pour, rendre grâce)
- Faire une relecture spirituelle de leur parcours

**Stack technique** :
- Frontend : Next.js 14 (App Router), React, TypeScript
- Backend : Supabase (PostgreSQL + Auth + RLS)
- Déploiement : Vercel
- Design : Vanilla CSS avec animations, couleurs chaleureuses, design méditatif

---

## 🎯 État actuel du projet (Décembre 2025)

### Fonctionnalités opérationnelles

#### Core Features
- ✅ **5 types de contenus** : Grâces, Prières, Écritures, Paroles, Rencontres
- ✅ **Partage communautaire** : Système de fioretti avec validation modération
- ✅ **Interactions** : Boutons "Prier pour" et "Rendre grâce"
- ✅ **Relecture spirituelle** : Vue chronologique et par catégorie
- ✅ **Recherche Bible** : Intégration AELF pour import de versets

#### Administration & Modération
- ✅ **Système de rôles** : `user`, `moderateur`, `superadmin`
- ✅ **Gestion utilisateurs** : Page admin avec recherche, filtres, modification de rôles
- ✅ **Modération fioretti** : 
  - Filtres par statut (En attente/Validés/Refusés)
  - Filtres par type
  - Actions : Valider, Refuser, Éditer, Archiver
  - Composants modulaires (StatusFilter, TypeFilter, FiorettoModerationCard, PreviewModal)
- ✅ **Système d'archivage** :
  - Colonne `archived_at` en base
  - RLS : archivés invisibles au public
  - UI : Toggle, boutons, badge "Archivé"

#### UI/UX
- ✅ **Menu latéral** : Sections organisées (PARTAGE COMMUNAUTÉ, ADMINISTRATION)
- ✅ **Cartes standardisées** : Hauteur fixe, texte tronqué avec `(...)`, design méditatif
- ✅ **Animations** : Float gentle, hover effects, transitions fluides
- ✅ **Responsive** : Mobile-friendly avec menu burger

---

## 🔧 Architecture technique

### Base de données (Supabase)
```
Tables principales :
- profiles (user_id, pseudo, role, anonyme_par_defaut)
- graces, prieres, paroles_ecriture, paroles_connaissance, rencontres_missionnaires
- fioretti (table unifiée pour partages publics, avec archived_at)
- fioretti_interactions (soutien, action_grace)
- notifications (système de badges)
```

### Sécurité (RLS Policies)
- Utilisateurs : CRUD sur leurs propres données
- Modérateurs : Lecture de tous les fioretti, modération
- Superadmins : Gestion utilisateurs + modération
- Protection : Dernier superadmin ne peut être rétrogradé

### Helpers & Utilities
- `app/lib/auth-helpers.ts` : Gestion rôles et permissions
- `app/lib/fioretti-helpers.ts` : Formatage contenu, archivage
- `app/lib/supabase.ts` : Client Supabase

---

## 📝 Travail de la session précédente (19-20 Déc)

### Réalisations majeures

1. **Système d'archivage complet**
   - Migration SQL (`add_archive_system.sql`)
   - Fonctions backend (`archiveFioretto`, `unarchiveFioretto`)
   - Composants UI (`ArchiveManager`, `ArchiveToggle`, `ArchivedBadge`)

2. **Refonte page modération**
   - Découpage en composants modulaires (780 → 310 lignes)
   - Filtres multiples (statut + type)
   - Code maintenable et réutilisable

3. **Améliorations UI**
   - Section "PARTAGE COMMUNAUTÉ" dans menu
   - Cartes fioretti uniformes (~380px)
   - Texte tronqué intelligemment (4 lignes + `(...)`)
   - Espacement méditatif (gap: 2rem, line-height: 1.8)

### Fichiers clés modifiés
- `app/(app)/layout.tsx` - Menu organisé
- `app/(app)/fioretti/page.tsx` - Cartes standardisées
- `app/(app)/admin/moderation/page.tsx` - Refonte complète
- `app/components/FiorettoCard.tsx` - Hauteur fixe + troncature
- `app/components/moderation/*` - 4 nouveaux composants
- `scripts/add_archive_system.sql` - Migration archivage

---

## 🚀 Prochaine session : Amélioration Authentification

### Objectifs

#### 1. Page de connexion améliorée
- [ ] Design moderne et accueillant
- [ ] Formulaire email/password optimisé
- [ ] Messages d'erreur clairs
- [ ] Loading states

#### 2. Récupération de mot de passe
- [ ] Page "Mot de passe oublié"
- [ ] Envoi email de réinitialisation
- [ ] Page de réinitialisation sécurisée
- [ ] Feedback utilisateur (succès/erreur)

#### 3. Inscription améliorée
- [ ] Validation en temps réel
- [ ] Confirmation email
- [ ] Choix pseudo lors de l'inscription
- [ ] Onboarding optionnel

#### 4. OAuth / Social Login (optionnel)
- [ ] **Google Authentication**
- [ ] Apple Sign-In (si souhaité)
- [ ] Configuration Supabase OAuth
- [ ] Gestion des profils OAuth
- [ ] Fallback si OAuth échoue

### Considérations techniques

#### Supabase Auth
- Utilise déjà `supabase.auth.signInWithPassword()`
- Supporte nativement OAuth (Google, Apple, etc.)
- Gestion des sessions automatique
- Email templates personnalisables

#### Points d'attention
- **Sécurité** : HTTPS obligatoire pour OAuth
- **UX** : Choix clair entre email et social login
- **Données** : Mapper profil OAuth → table `profiles`
- **Fallback** : Que faire si Google Auth échoue ?
- **Design** : Cohérence avec l'esthétique actuelle (tons chauds, méditatif)

---

## 📋 Backlog général (Priorités futures)

### Court terme
- [ ] Tests système d'archivage en production
- [ ] Corriger bug TypeScript moderation/page.tsx (ligne 273)
- [ ] Pagination fioretti communauté (si >50)
- [ ] Statistiques modération (badge nombre en attente)

### Moyen terme
- [ ] Notifications push pour modérateurs
- [ ] Historique archivage (qui/quand)
- [ ] Recherche/filtres avancés fioretti
- [ ] Export PDF relecture spirituelle
- [ ] Mode sombre (optionnel)

### Long terme
- [ ] Application mobile (React Native ?)
- [ ] Groupes de prière / communautés
- [ ] Calendrier liturgique intégré
- [ ] Partage direct sur réseaux sociaux

---

## 🎨 Principes de design à respecter

1. **Couleurs chaleureuses** : Tons dorés (#F59E0B, #78350F), pastels
2. **Typographie** : Crimson Text pour titres, lisibilité optimale
3. **Animations subtiles** : Float gentle, hover effects doux
4. **Espacement généreux** : Design aéré, propice à la méditation
5. **Accessibilité** : Contraste suffisant, tailles de police confortables
6. **Cohérence** : Réutiliser composants existants, respecter la charte

---

## 📚 Documentation utile

### Fichiers de référence
- `SESSION_RECAP.md` - Récap session précédente
- `TODO_NEXT_SESSION.md` - Liste des tâches
- `scripts/` - Migrations SQL documentées
- `.gemini/antigravity/brain/*/` - Plans et walkthroughs

### Commandes utiles
```bash
# Dev local
npm run dev

# Build production
npm run build

# Supabase (si CLI installée)
supabase db push
supabase db reset
```

---

## 🔑 Points clés pour démarrer la prochaine session

1. **Contexte** : Projet spirituel, design méditatif, communauté bienveillante
2. **Stack** : Next.js + Supabase, déjà configuré
3. **Auth actuelle** : Email/password basique via Supabase Auth
4. **Objectif** : Améliorer UX connexion + ajouter récupération MP + OAuth Google
5. **Contraintes** : Respecter design existant, sécurité maximale, UX fluide

**Prêt à améliorer l'authentification ! 🔐✨**
