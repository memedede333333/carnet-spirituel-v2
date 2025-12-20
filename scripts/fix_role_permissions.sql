-- ================================================
-- Script de correction des permissions
-- ================================================

-- 1. CORRIGER LA CONTRAINTE CHECK SUR LA COLONNE ROLE
-- ================================================

-- Supprimer l'ancienne contrainte
ALTER TABLE profiles DROP CONSTRAINT IF EXISTS profiles_role_check;

-- Recréer la contrainte avec les 3 valeurs
ALTER TABLE profiles 
ADD CONSTRAINT profiles_role_check 
CHECK (role IN ('user', 'moderateur', 'superadmin'));

-- 2. VÉRIFIER LES POLICIES RLS SUR PROFILES
-- ================================================

-- Supprimer toutes les policies existantes
DROP POLICY IF EXISTS "Public can view basic profile info" ON profiles;
DROP POLICY IF EXISTS "Users can update own profile" ON profiles;
DROP POLICY IF EXISTS "Superadmins can update any profile" ON profiles;

-- POLICY 1: Tout le monde peut voir les infos publiques
CREATE POLICY "Public can view basic profile info"
ON profiles FOR SELECT
USING (true);

-- POLICY 2: Les utilisateurs peuvent modifier leur propre profil (SAUF le rôle)
CREATE POLICY "Users can update own profile"
ON profiles FOR UPDATE
USING (auth.uid() = id)
WITH CHECK (
  auth.uid() = id 
  AND role = (SELECT role FROM profiles WHERE id = auth.uid())
);

-- POLICY 3: Les superadmins peuvent tout modifier (y compris les rôles)
CREATE POLICY "Superadmins can update any profile"
ON profiles FOR UPDATE
USING (
  EXISTS (
    SELECT 1 FROM profiles 
    WHERE id = auth.uid() 
    AND role = 'superadmin'
  )
);

-- 3. VÉRIFICATIONS
-- ================================================

-- Vérifier la contrainte
SELECT conname, pg_get_constraintdef(oid) 
FROM pg_constraint 
WHERE conname = 'profiles_role_check';

-- Vérifier les policies
SELECT schemaname, tablename, policyname 
FROM pg_policies 
WHERE tablename = 'profiles';

SELECT 'Corrections appliquées avec succès!' as status;
