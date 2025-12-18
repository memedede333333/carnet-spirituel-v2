-- 🔍 Script de vérification - Base de données Fioretti
-- Exécuter dans Supabase SQL Editor pour valider l'installation

-- =============================================
-- 1. VÉRIFICATION DES TABLES
-- =============================================

-- Vérifier que les tables existent
SELECT 
  table_name,
  CASE 
    WHEN table_name IN ('fioretti', 'notifications', 'fioretti_interactions') THEN '✅ OK'
    ELSE '❌ Manquant'
  END as status
FROM information_schema.tables 
WHERE table_schema = 'public' 
  AND table_name IN ('fioretti', 'notifications', 'fioretti_interactions');

-- =============================================
-- 2. VÉRIFICATION DES COLONNES FIORETTI
-- =============================================

-- Vérifier les colonnes de la table fioretti
SELECT 
  column_name,
  data_type,
  is_nullable
FROM information_schema.columns 
WHERE table_name = 'fioretti'
ORDER BY ordinal_position;

-- Vérifier spécifiquement les colonnes d'édition (add_moderation_edit_feature.sql)
SELECT 
  column_name,
  CASE 
    WHEN column_name IN ('message_moderateur', 'contenu_original', 'date_moderation') THEN '✅ Colonne édition OK'
    ELSE 'Colonne standard'
  END as type_colonne
FROM information_schema.columns 
WHERE table_name = 'fioretti'
  AND column_name IN ('message_moderateur', 'contenu_original', 'date_moderation');

-- =============================================
-- 3. VÉRIFICATION DES COLONNES NOTIFICATIONS
-- =============================================

SELECT 
  column_name,
  data_type,
  is_nullable
FROM information_schema.columns 
WHERE table_name = 'notifications'
ORDER BY ordinal_position;

-- =============================================
-- 4. VÉRIFICATION DES POLICIES RLS
-- =============================================

-- Vérifier que RLS est activé
SELECT 
  tablename,
  rowsecurity as rls_enabled
FROM pg_tables 
WHERE schemaname = 'public' 
  AND tablename IN ('fioretti', 'notifications', 'fioretti_interactions');

-- Lister toutes les policies
SELECT 
  schemaname,
  tablename,
  policyname,
  permissive,
  cmd,
  qual
FROM pg_policies 
WHERE tablename IN ('fioretti', 'notifications', 'fioretti_interactions')
ORDER BY tablename, policyname;

-- =============================================
-- 5. VÉRIFICATION DES INDEX
-- =============================================

SELECT 
  indexname,
  tablename,
  indexdef
FROM pg_indexes 
WHERE schemaname = 'public' 
  AND tablename IN ('fioretti', 'notifications', 'fioretti_interactions')
ORDER BY tablename, indexname;

-- =============================================
-- 6. VÉRIFICATION DES CONTRAINTES
-- =============================================

-- Contraintes CHECK
SELECT 
  tc.table_name,
  tc.constraint_name,
  cc.check_clause
FROM information_schema.table_constraints tc
JOIN information_schema.check_constraints cc 
  ON tc.constraint_name = cc.constraint_name
WHERE tc.table_schema = 'public' 
  AND tc.table_name IN ('fioretti', 'notifications')
  AND tc.constraint_type = 'CHECK';

-- Contraintes FOREIGN KEY
SELECT 
  tc.table_name,
  kcu.column_name,
  ccu.table_name AS foreign_table_name,
  ccu.column_name AS foreign_column_name
FROM information_schema.table_constraints AS tc 
JOIN information_schema.key_column_usage AS kcu
  ON tc.constraint_name = kcu.constraint_name
  AND tc.table_schema = kcu.table_schema
JOIN information_schema.constraint_column_usage AS ccu
  ON ccu.constraint_name = tc.constraint_name
  AND ccu.table_schema = tc.table_schema
WHERE tc.constraint_type = 'FOREIGN KEY' 
  AND tc.table_name IN ('fioretti', 'notifications', 'fioretti_interactions');

-- =============================================
-- 7. COMPTAGES DONNÉES
-- =============================================

-- Compter les fioretti par statut
SELECT 
  statut,
  COUNT(*) as nombre,
  ROUND(COUNT(*) * 100.0 / SUM(COUNT(*)) OVER (), 1) as pourcentage
FROM fioretti
GROUP BY statut
ORDER BY statut;

-- Compter les notifications par type
SELECT 
  type,
  COUNT(*) as nombre,
  COUNT(*) FILTER (WHERE lu = false) as non_lues
FROM notifications
GROUP BY type
ORDER BY nombre DESC;

-- Compter les interactions par type
SELECT 
  type_interaction,
  COUNT(*) as nombre
FROM fioretti_interactions
GROUP BY type_interaction
ORDER BY nombre DESC;

-- =============================================
-- 8. VÉRIFICATION COLONNES STATUT_PARTAGE
-- =============================================

-- Vérifier que statut_partage existe dans les tables sources
SELECT 
  table_name,
  column_name,
  data_type
FROM information_schema.columns 
WHERE table_schema = 'public' 
  AND column_name = 'statut_partage'
  AND table_name IN ('graces', 'prieres', 'paroles_ecriture', 'paroles_connaissance', 'rencontres_missionnaires');

-- =============================================
-- 9. RÉSUMÉ FINAL
-- =============================================

-- Résumé de la configuration
SELECT 
  '✅ Tables créées' as verification,
  (SELECT COUNT(*) FROM information_schema.tables 
   WHERE table_schema = 'public' 
   AND table_name IN ('fioretti', 'notifications', 'fioretti_interactions')) as resultat,
  '3 attendues' as attendu
UNION ALL
SELECT 
  '✅ Colonnes édition fioretti',
  (SELECT COUNT(*) FROM information_schema.columns 
   WHERE table_name = 'fioretti'
   AND column_name IN ('message_moderateur', 'contenu_original', 'date_moderation')),
  '3 attendues'
UNION ALL
SELECT 
  '✅ Policies RLS notifications',
  (SELECT COUNT(*) FROM pg_policies WHERE tablename = 'notifications'),
  '2+ attendues'
UNION ALL
SELECT 
  '✅ Index notifications',
  (SELECT COUNT(*) FROM pg_indexes 
   WHERE schemaname = 'public' 
   AND tablename = 'notifications'),
  '2+ attendus';

-- =============================================
-- 💡 INTERPRÉTATION DES RÉSULTATS
-- =============================================

/*
ATTENDU :
- 3 tables (fioretti, notifications, fioretti_interactions)
- Colonnes fioretti : id, user_id, element_type, element_id, contenu_affiche, 
  message_ajout, anonyme, pseudo, moderateur_id, date_publication, statut,
  message_moderateur, contenu_original, date_moderation, created_at, updated_at
- Colonnes notifications : id, user_id, type, fioretto_id, message, lu, created_at
- RLS activé sur toutes les tables
- Au moins 2 policies par table
- Au moins 2 index sur notifications

SI MANQUE :
1. Tables manquantes → Exécuter create_fioretti_tables.sql
2. Colonnes édition manquantes → Exécuter add_moderation_edit_feature.sql
3. Policies manquantes → Vérifier RLS dans scripts SQL
*/
