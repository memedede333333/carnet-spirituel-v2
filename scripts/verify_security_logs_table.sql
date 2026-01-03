-- Script de vérification et création de la table security_logs
-- À exécuter dans Supabase SQL Editor

-- 1. Vérifier si la table existe
SELECT EXISTS (
   SELECT FROM information_schema.tables 
   WHERE table_schema = 'public'
   AND table_name = 'security_logs'
);

-- 2. Si la table existe, voir sa structure
SELECT column_name, data_type, is_nullable
FROM information_schema.columns
WHERE table_name = 'security_logs'
ORDER BY ordinal_position;

-- 3. Compter les enregistrements
SELECT COUNT(*) as total_logs FROM security_logs;

-- 4. Voir les derniers logs
SELECT * FROM security_logs 
ORDER BY created_at DESC 
LIMIT 10;
