-- ================================================
-- Script d'ajout du système d'archivage Fioretti
-- ================================================
-- Ce script ajoute la capacité d'archiver les fioretti
-- pour les garder hors du jardin public tout en conservant l'historique
-- ================================================

-- 1. AJOUTER COLONNE ARCHIVED_AT
-- ================================================

-- Ajouter la colonne pour tracker la date d'archivage
ALTER TABLE fioretti 
ADD COLUMN IF NOT EXISTS archived_at TIMESTAMP WITH TIME ZONE DEFAULT NULL;

-- Commentaire explicatif
COMMENT ON COLUMN fioretti.archived_at IS 'Date d''archivage du fioretto. NULL = actif, NOT NULL = archivé et invisible du jardin public';

-- 2. INDEX POUR PERFORMANCES
-- ================================================

-- Index partiel pour les recherches de fioretti archivés
CREATE INDEX IF NOT EXISTS idx_fioretti_archived 
ON fioretti(archived_at) 
WHERE archived_at IS NOT NULL;

-- Index composite pour le jardin public (approuvés non archivés)
CREATE INDEX IF NOT EXISTS idx_fioretti_public_garden 
ON fioretti(statut, archived_at, created_at DESC)
WHERE statut = 'approuve' AND archived_at IS NULL;

-- 3. MISE À JOUR RLS POLICIES
-- ================================================

-- Supprimer l'ancienne policy de lecture publique
DROP POLICY IF EXISTS "Public can view approved fioretti" ON fioretti;

-- Nouvelle policy : exclure les fioretti archivés du jardin public
CREATE POLICY "Public can view approved and non-archived fioretti"
ON fioretti FOR SELECT
USING (statut = 'approuve' AND archived_at IS NULL);

-- Note: La policy "Moderators can view all fioretti" permet déjà
-- aux modérateurs de voir TOUS les fioretti, y compris archivés

-- 4. VÉRIFICATIONS
-- ================================================

-- Vérifier que la colonne existe
SELECT column_name, data_type, is_nullable 
FROM information_schema.columns 
WHERE table_name = 'fioretti' AND column_name = 'archived_at';

-- Vérifier les index
SELECT indexname, indexdef 
FROM pg_indexes 
WHERE tablename = 'fioretti' 
AND indexname IN ('idx_fioretti_archived', 'idx_fioretti_public_garden');

-- Vérifier les policies
SELECT schemaname, tablename, policyname, cmd
FROM pg_policies 
WHERE tablename = 'fioretti' 
AND policyname = 'Public can view approved and non-archived fioretti';

SELECT 'Archive system created successfully!' as status;
