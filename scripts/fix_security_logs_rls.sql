-- Script de diagnostic et correction des politiques RLS pour security_logs
-- À exécuter dans Supabase SQL Editor

-- 1. Vérifier si RLS est activé
SELECT tablename, rowsecurity 
FROM pg_tables 
WHERE tablename = 'security_logs';

-- 2. Lister toutes les politiques actuelles
SELECT schemaname, tablename, policyname, permissive, roles, cmd, qual
FROM pg_policies
WHERE tablename = 'security_logs';

-- 3. Compter les logs existants (bypass RLS avec SECURITY DEFINER)
SELECT COUNT(*) as total_logs FROM security_logs;

-- 4. Voir les 5 derniers logs (bypass RLS)
SELECT id, user_id, action, created_at 
FROM security_logs 
ORDER BY created_at DESC 
LIMIT 5;

-- 5. Supprimer TOUTES les anciennes politiques (pour repartir proprement)
DROP POLICY IF EXISTS "Users can view their own security logs" ON security_logs;
DROP POLICY IF EXISTS "Admins can view all security logs" ON security_logs;
DROP POLICY IF EXISTS "System can insert security logs" ON security_logs;
DROP POLICY IF EXISTS "Enable read access for users based on user_id" ON security_logs;
DROP POLICY IF EXISTS "Enable insert for authenticated users only" ON security_logs;

-- 6. Créer les NOUVELLES politiques (plus permissives)

-- Politique 1 : Les utilisateurs peuvent voir leurs PROPRES logs
CREATE POLICY "users_view_own_logs"
ON security_logs
FOR SELECT
TO authenticated
USING (auth.uid() = user_id);

-- Politique 2 : Les superadmins peuvent voir TOUS les logs
CREATE POLICY "superadmins_view_all_logs"
ON security_logs
FOR SELECT
TO authenticated
USING (
  EXISTS (
    SELECT 1 
    FROM profiles
    WHERE profiles.id = auth.uid()
    AND profiles.role = 'superadmin'
  )
);

-- Politique 3 : Tout le monde peut INSÉRER des logs (pour le système)
CREATE POLICY "anyone_can_insert_logs"
ON security_logs
FOR INSERT
TO authenticated, anon
WITH CHECK (true);

-- 7. Vérifier que les nouvelles politiques sont bien créées
SELECT policyname, cmd, qual
FROM pg_policies
WHERE tablename = 'security_logs';

-- 8. Test : Sélectionner avec votre user_id
-- REMPLACER 'VOTRE_USER_ID' par votre vrai user_id
-- Exemple : SELECT * FROM security_logs WHERE user_id = 'a3aaf7c1-48dd-4d0a-b1dc-70c04def672b' LIMIT 10;
