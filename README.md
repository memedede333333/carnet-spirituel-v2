# Carnet Spirituel

Application web Next.js pour tenir un journal spirituel numérique.

## 📚 Documentation

**👉 [DOCUMENTATION COMPLÈTE](./DOCUMENTATION-COMPLETE.md)** - Documentation exhaustive du projet (1010 lignes)

La documentation complète contient :
- Vue d'ensemble et architecture
- Structure du projet
- Modules et fonctionnalités
- Configuration et installation
- Base de données Supabase
- Système de liens spirituels
- Guide de développement
- Déploiement et dépannage

## 🚀 Démarrage rapide

### Prérequis

- Node.js 18+
- Compte Supabase configuré

### Installation

```bash
# Installer les dépendances
npm install

# Configurer les variables d'environnement
# Créer .env.local avec :
# NEXT_PUBLIC_SUPABASE_URL=votre_url
# NEXT_PUBLIC_SUPABASE_ANON_KEY=votre_cle

# Lancer le serveur de développement
npm run dev
```

Ouvrir [http://localhost:3000](http://localhost:3000) dans le navigateur.

## 📖 Documentation supplémentaire

- [Documentation des liens spirituels](./DOCUMENTATION_LIENS_SPIRITUELS.md) - Système de connexions entre éléments
- [Documentation complète](./DOCUMENTATION-COMPLETE.md) - Guide exhaustif du projet

## 🛠️ Scripts disponibles

- `npm run dev` - Serveur de développement
- `npm run build` - Build de production
- `npm run start` - Serveur de production
- `npm run lint` - Linter ESLint

## ⚠️ Important - Configuration GitHub

**Avant de commencer à travailler, lisez la section "Configuration GitHub" dans la [documentation complète](./DOCUMENTATION-COMPLETE.md)**.

Les deux projets (travail et sauvegarde) pointent actuellement vers le même dépôt GitHub. Il est **fortement recommandé** de :
1. Créer un nouveau dépôt GitHub pour le projet de travail
2. OU travailler sur une branche séparée

Voir la documentation complète pour les détails.

## 🎯 Projet de travail

**Chemin :** `/Users/aymeri/projets/carnet-spirituel`

C'est sur ce projet que vous devez travailler dans votre IDE.

## 📝 Stack technique

- **Framework** : Next.js 15.3.2 (App Router)
- **Langage** : TypeScript 5
- **UI** : React 19.0.0
- **Styling** : CSS pur + Tailwind CSS 4.1.7
- **Base de données** : Supabase (PostgreSQL)
- **Authentification** : Supabase Auth
- **Icônes** : Lucide React
- **Dates** : date-fns avec locale française
- **Visualisation** : D3.js pour la vue constellation

## 🔗 Liens utiles

- [Next.js Documentation](https://nextjs.org/docs)
- [Supabase Documentation](https://supabase.com/docs)
- [React Documentation](https://react.dev)

---

**Version :** 0.1.0  
**Dernière mise à jour :** 14 décembre 2025
