# Tâches pour la prochaine session

## 🎯 Priorité Actuelle : Modération & Finalisation Auth
L'audit et l'implémentation de l'authentification sont terminés (sauf config Microsoft). Le prochain gros chantier est la finalisation de l'interface d'administration/modération et la gestion des rôles.

---

## 🔐 Authentification (Terminé ✅)
- [x] **Récupération de mot de passe** :
    - Pages `/reset-password` et `/update-password` créées.
    - Lien "Mot de passe oublié ?" ajouté au login.
    - Emails configurés avec templates "Spirituels".
- [x] **OAuth (Google)** :
    - Bouton intégré et fonctionnel.
    - Page de callback `/auth/callback` gérant la création de profil.
- [x] **OAuth (Microsoft)** :
    - Code intégré (bouton + logique).
    - Guide de configuration créé : `CHECKLIST_OAUTH_CONFIG.md`.
    - *Reste à faire : Configurer Azure Portal quand souhaité.*

---

## 🛡️ Modération & Rôles (En cours 🚧)

### 1. Gestion des Utilisateurs
- [ ] Page d'administration des utilisateurs (liste, recherche).
- [ ] Interface d'attribution des rôles (`superadmin`, `moderateur`, `user`).
- [ ] Vérification des permissions RLS pour l'accès admin.

### 2. Interface de Modération (`/admin/moderation`)
- [ ] Finaliser l'interface de validation des fiorretti.
- [ ] Tester le workflow complet : Soumission -> Notification -> Validation/Refus -> Publication.

---

## 🎨 UI / UX (À venir)
- [ ] **Page "Mes Fioretti"** : Vue utilisateur de ses soumissions + statuts.
- [ ] **Refonte Jardin** : Modal détail "waouh" selon cahier des charges.
- [ ] **Centre Notifications** : Badge + liste des notifications.

---

*Mis à jour le : 20 Décembre 2024 - Session "Authentification & Audit"*
