# Règles de Sauvegarde Multi-Dépôts

Cette règle s'active lorsque l'utilisateur demande de "sauvegarder", "commit", "push" ou "enregistrer".

## Actions à effectuer automatiquement

Il faut **TOUJOURS** exécuter ces 3 étapes dans l'ordre :

### 1. Sauvegarde Locale
Créer une archive locale simple (si demandé explicitement) ou s'assurer que les fichiers sont bien enregistrés.

### 2. Dépôt Principal (Code)
Exécuter les commandes suivantes dans `/Users/aymeri/projets/carnet-spirituel` :
```bash
git add -A
git commit -m "update: [décrire les changements]"
git push origin main
```

### 3. Dépôt Documentation (Docs privées)
Vérifier si des fichiers ont changé dans `_private_docs/`.
Si oui, exécuter les commandes suivantes dans `/Users/aymeri/projets/carnet-spirituel/_private_docs` :
```bash
git add -A
git commit -m "docs: mise à jour documentation"
git push origin main
```

## Rappel Important
Ne JAMAIS oublier le deuxième dépôt (`_private_docs`). C'est critique pour garder la documentation synchronisée.
