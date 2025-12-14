# Sauvegarde du Carnet Spirituel - 14 décembre 2025

## 📦 Contenu

Cette sauvegarde contient un snapshot complet du projet **Carnet Spirituel** au **14 décembre 2025**.

## 🎯 Objectif

Cette sauvegarde sert de :
- **Point de restauration** en cas de problème
- **Référence stable** pour comparer les évolutions
- **Archive** de l'état du projet à cette date

## ⚙️ Configuration Git

Cette sauvegarde n'a **pas de remote `origin`** pour éviter les push accidentels vers le dépôt principal.

Pour ajouter un remote de sauvegarde GitHub (optionnel) :

```bash
git remote add backup https://github.com/votre-user/carnet-spirituel-backup.git
```

## 📝 Notes

- Cette sauvegarde inclut tous les fichiers, y compris ceux non suivis par Git
- L'historique Git complet est préservé
- Ne pas modifier cette sauvegarde directement - utiliser le projet principal

## 🔄 Utilisation

Pour restaurer à partir de cette sauvegarde :

```bash
cd /Users/aymeri/projets
cp -R carnet-spirituel-backup-20251214 carnet-spirituel-restore
cd carnet-spirituel-restore
npm install
```

