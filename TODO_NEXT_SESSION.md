# Tâches pour la prochaine session - Modération & Profils

## 🎯 Objectif Principal : Configuration Modération
Mettre en place les profils **Admin** et **Modérateur** avec leurs permissions respectives.

---

## 🔐 Configuration des Rôles

### 1. Schéma Base de Données
- [ ] Vérifier colonne `role` dans table `profiles`
- [ ] Créer types/énumérations si nécessaire (`superadmin`, `moderateur`, `user`)
- [ ] Script SQL pour attribuer les rôles

### 2. Permissions & RLS
- [ ] Politique RLS pour `/admin/moderation` (accessible aux `superadmin` et `moderateur`)
- [ ] Vérification des permissions sur table `fioretti`
- [ ] Permissions sur table `notifications`

### 3. Interface Admin
- [ ] Page de gestion des utilisateurs (liste, attribution rôles)
- [ ] Vérification accès `/admin/moderation` selon profil
- [ ] Tests workflow modération complet

---

## ✅ Déjà Accompli (Session Précédente)

- [x] **Menu latéral** : Bug de disparition corrigé
- [x] **Badge Nouveaux Fioretti** : Fonctionnel et testé
- [x] **Interactions Fioretti** : Toggle Prier/Grâce fonctionnel
- [x] **Harmonisation** : Tous modules utilisent `FiorettiButton`
- [x] **Effet de survol** : Bordure colorée sans "Lire plus"

---

## 🚧 En Suspens (Reporter)

### UX / UI
- [ ] Indicateur visuel pour inciter au clic sur cartes (icône 👁️, animation)
- [ ] Structure Menu : Regrouper "Fioretti Communauté" et "Mes Fioretti" ?

### Pages Manquantes
- [ ] **Page "Mes Fioretti"** : Vue utilisateur de ses soumissions + statuts + messages modérateur
- [ ] **Refonte Jardin** : Modal détail "waouh" selon cahier des charges
- [ ] **Centre Notifications** : Badge + liste des notifications

---

*Mis à jour le : 20 Décembre 2024*
