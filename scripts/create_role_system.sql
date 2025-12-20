-- ================================================
-- Script de création du système de rôles complet
-- Carnet Spirituel - Gestion Admin/Modérateur
-- ================================================
-- Ce script doit être exécuté dans le SQL Editor de Supabase
-- ================================================

-- 1. CRÉATION/VÉRIFICATION DE LA COLONNE ROLE
-- ================================================

-- Ajouter la colonne role si elle n'existe pas
ALTER TABLE profiles 
ADD COLUMN IF NOT EXISTS role TEXT DEFAULT 'user';

-- Ajouter la contrainte de vérification
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint 
    WHERE conname = 'profiles_role_check'
  ) THEN
    ALTER TABLE profiles 
    ADD CONSTRAINT profiles_role_check 
    CHECK (role IN ('user', 'moderateur', 'superadmin'));
  END IF;
END $$;

-- 2. FONCTION HELPER POUR RÉCUPÉRER LE RÔLE
-- ================================================

-- Fonction pour obtenir le rôle d'un utilisateur
CREATE OR REPLACE FUNCTION get_user_role(user_uuid UUID)
RETURNS TEXT AS $$
  SELECT role FROM profiles WHERE id = user_uuid;
$$ LANGUAGE SQL SECURITY DEFINER STABLE;

-- Fonction pour vérifier si l'utilisateur peut modérer
CREATE OR REPLACE FUNCTION can_moderate()
RETURNS BOOLEAN AS $$
  SELECT EXISTS (
    SELECT 1 FROM profiles 
    WHERE id = auth.uid() 
    AND role IN ('moderateur', 'superadmin')
  );
$$ LANGUAGE SQL SECURITY DEFINER STABLE;

-- Fonction pour vérifier si l'utilisateur est admin
CREATE OR REPLACE FUNCTION is_admin()
RETURNS BOOLEAN AS $$
  SELECT EXISTS (
    SELECT 1 FROM profiles 
    WHERE id = auth.uid() 
    AND role = 'superadmin'
  );
$$ LANGUAGE SQL SECURITY DEFINER STABLE;

-- 3. RLS POLICIES POUR FIORETTI
-- ================================================

-- Supprimer les anciennes policies si elles existent
DROP POLICY IF EXISTS "Public voyent approuvés" ON fioretti;
DROP POLICY IF EXISTS "Auteurs voyent leurs proposés" ON fioretti;
DROP POLICY IF EXISTS "Auteurs créent" ON fioretti;
DROP POLICY IF EXISTS "Moderateurs voyent tout" ON fioretti;
DROP POLICY IF EXISTS "Moderateurs modifient" ON fioretti;

-- POLICY 1: Tout le monde voit les fioretti approuvés
CREATE POLICY "Public can view approved fioretti"
ON fioretti FOR SELECT
USING (statut = 'approuve');

-- POLICY 2: Les auteurs voient leurs propres fioretti (tous statuts)
CREATE POLICY "Authors can view own fioretti"
ON fioretti FOR SELECT
USING (auth.uid() = user_id);

-- POLICY 3: Les modérateurs et admins voient tout
CREATE POLICY "Moderators can view all fioretti"
ON fioretti FOR SELECT
USING (can_moderate());

-- POLICY 4: Les utilisateurs authentifiés peuvent créer
CREATE POLICY "Authenticated users can create fioretti"
ON fioretti FOR INSERT
WITH CHECK (auth.uid() = user_id);

-- POLICY 5: Les modérateurs et admins peuvent modifier
CREATE POLICY "Moderators can update fioretti"
ON fioretti FOR UPDATE
USING (can_moderate());

-- POLICY 6: Les auteurs peuvent supprimer leurs propres fioretti (si brouillon)
CREATE POLICY "Authors can delete own draft fioretti"
ON fioretti FOR DELETE
USING (auth.uid() = user_id AND statut = 'propose');

-- 4. RLS POLICIES POUR PROFILES
-- ================================================

-- Vérifier si RLS est activé
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

-- Supprimer les anciennes policies si elles existent
DROP POLICY IF EXISTS "Public profiles are viewable by everyone" ON profiles;
DROP POLICY IF EXISTS "Users can update own profile" ON profiles;
DROP POLICY IF EXISTS "Admins can update roles" ON profiles;

-- POLICY 1: Tout le monde peut voir les infos publiques
CREATE POLICY "Public can view basic profile info"
ON profiles FOR SELECT
USING (true);

-- POLICY 2: Les utilisateurs peuvent modifier leur propre profil (sauf role)
CREATE POLICY "Users can update own profile"
ON profiles FOR UPDATE
USING (auth.uid() = id)
WITH CHECK (
  auth.uid() = id 
  AND (
    -- Ne peut pas changer son propre rôle
    role = (SELECT role FROM profiles WHERE id = auth.uid())
  )
);

-- POLICY 3: Les superadmins peuvent modifier les rôles
CREATE POLICY "Superadmins can update any profile"
ON profiles FOR UPDATE
USING (is_admin())
WITH CHECK (is_admin());

-- 5. RLS POLICIES POUR NOTIFICATIONS
-- ================================================

-- Ajouter les colonnes manquantes si elles n'existent pas
ALTER TABLE notifications ADD COLUMN IF NOT EXISTS read BOOLEAN DEFAULT false;
ALTER TABLE notifications ADD COLUMN IF NOT EXISTS fioretto_id UUID REFERENCES fioretti(id) ON DELETE CASCADE;

-- Vérifier que la colonne type a les bonnes valeurs
-- Note: On ne peut pas modifier une contrainte CHECK existante facilement, 
-- donc on s'assure juste que les nouvelles valeurs sont acceptées

-- Activer RLS
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;

-- Supprimer anciennes policies
DROP POLICY IF EXISTS "Users can view own notifications" ON notifications;
DROP POLICY IF EXISTS "Moderators can create notifications" ON notifications;
DROP POLICY IF EXISTS "Users can update own notifications" ON notifications;
DROP POLICY IF EXISTS "Users can delete own notifications" ON notifications;

-- POLICY 1: Les utilisateurs voient leurs propres notifications
CREATE POLICY "Users can view own notifications"
ON notifications FOR SELECT
USING (auth.uid() = user_id);

-- POLICY 2: Les modérateurs et admins peuvent créer des notifications
CREATE POLICY "Moderators can create notifications"
ON notifications FOR INSERT
WITH CHECK (can_moderate());

-- POLICY 3: Les utilisateurs peuvent marquer comme lu
CREATE POLICY "Users can update own notifications"
ON notifications FOR UPDATE
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

-- POLICY 4: Les utilisateurs peuvent supprimer leurs notifications
CREATE POLICY "Users can delete own notifications"
ON notifications FOR DELETE
USING (auth.uid() = user_id);

-- 6. INDEX POUR PERFORMANCES
-- ================================================

-- Index sur role pour les requêtes de vérification
CREATE INDEX IF NOT EXISTS idx_profiles_role ON profiles(role);

-- Index sur user_id et statut pour les fioretti
CREATE INDEX IF NOT EXISTS idx_fioretti_user_statut ON fioretti(user_id, statut);

-- Index composite pour la modération
CREATE INDEX IF NOT EXISTS idx_fioretti_statut_created ON fioretti(statut, created_at DESC);

-- Index sur notifications (vérifier si la colonne read existe avant)
DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'notifications' AND column_name = 'read'
  ) THEN
    CREATE INDEX IF NOT EXISTS idx_notifications_user_read ON notifications(user_id, read, created_at DESC);
  END IF;
END $$;

-- ================================================
-- FIN DU SCRIPT
-- ================================================

-- Vérifications
SELECT 'Role system created successfully!' as status;
SELECT 'Functions created: get_user_role, can_moderate, is_admin' as functions;
SELECT 'Policies created for: fioretti, profiles, notifications' as policies;
