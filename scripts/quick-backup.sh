#!/bin/bash

# Configuration
PROJECT_DIR="/Users/aymeri/projets/carnet-spirituel"
BACKUP_ROOT="${PROJECT_DIR}/backups"
DATE=$(date +%Y%m%d_%H%M%S)
BACKUP_NAME="carnet-spirituel-backup-${DATE}"
BACKUP_PATH="${BACKUP_ROOT}/${BACKUP_NAME}"

echo "🔄 Début de la sauvegarde..."
mkdir -p "$BACKUP_PATH"

# Copie des fichiers importants
cp "${PROJECT_DIR}/package.json" "$BACKUP_PATH/" 2>/dev/null
cp "${PROJECT_DIR}/package-lock.json" "$BACKUP_PATH/" 2>/dev/null
cp "${PROJECT_DIR}/next.config.js" "$BACKUP_PATH/" 2>/dev/null
cp "${PROJECT_DIR}/tsconfig.json" "$BACKUP_PATH/" 2>/dev/null
cp "${PROJECT_DIR}/tailwind.config.ts" "$BACKUP_PATH/" 2>/dev/null
cp "${PROJECT_DIR}/.env.local" "$BACKUP_PATH/" 2>/dev/null

# Copie des dossiers
echo "📂 Copie du dossier app..."
mkdir -p "$BACKUP_PATH/app"
cp -R "${PROJECT_DIR}/app/"* "$BACKUP_PATH/app/"

echo "📂 Copie du dossier public..."
mkdir -p "$BACKUP_PATH/public"
cp -R "${PROJECT_DIR}/public/"* "$BACKUP_PATH/public/"

echo "📂 Copie du dossier scripts..."
mkdir -p "$BACKUP_PATH/scripts"
cp -R "${PROJECT_DIR}/scripts/"* "$BACKUP_PATH/scripts/"

echo "📂 Copie de la documentation..."
cp "${PROJECT_DIR}/"*.md "$BACKUP_PATH/" 2>/dev/null

# Compression
echo "🗜️ Compression..."
cd "$BACKUP_ROOT"
tar -czf "${BACKUP_NAME}.tar.gz" "$BACKUP_NAME"

# Nettoyage dossier temporaire
rm -rf "$BACKUP_PATH"

echo "✅ Sauvegarde terminée : ${BACKUP_ROOT}/${BACKUP_NAME}.tar.gz"
ls -lh "${BACKUP_ROOT}/${BACKUP_NAME}.tar.gz"
