#!/bin/bash
# Script pour appliquer les modifications d'archivage à la page de modération

FILE="/Users/aymeri/projets/carnet-spirituel/app/(app)/admin/moderation/page.tsx"

echo "Application des modifications d'archivage..."

# 1. Ajouter le toggle après les filtres (ligne ~272)
# Chercher la ligne avec les filtres et ajouter le toggle après

# 2. Ajouter onArchiveChange au props de FiorettoModerationCard (ligne ~310)
sed -i.bak '310 a\
                                onArchiveChange={checkAdminAndFetch}' "$FILE"

# 3. Modifier la signature de FiorettoModerationCard (ligne ~363)
sed -i.bak '374 a\
    onArchiveChange: () => void;' "$FILE"

sed -i.bak '368 a\
    onArchiveChange' "$FILE"

echo "Modifications appliquées ! Vérifiez le fichier."
echo "Un backup a été créé : ${FILE}.bak"
