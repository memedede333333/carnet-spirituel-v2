-- ================================================
-- Attribution du rôle Superadmin
-- Carnet Spirituel
-- ================================================

-- 1. CRÉER LE PREMIER SUPERADMIN
-- ================================================

UPDATE profiles 
SET role = 'superadmin' 
WHERE id IN (
  SELECT id FROM auth.users WHERE email = 'aymeri.catho@gmail.com'
);

-- Vérification
SELECT 
  p.id, 
  p.prenom, 
  p.nom, 
  p.email, 
  p.role 
FROM profiles p
WHERE p.email = 'aymeri.catho@gmail.com';

-- 2. EXEMPLES - CRÉER UN MODÉRATEUR
-- ================================================
-- Décommenter et remplacer l'email pour créer un modérateur

-- UPDATE profiles 
-- SET role = 'moderateur' 
-- WHERE id IN (
--   SELECT id FROM auth.users WHERE email = 'moderateur@exemple.com'
-- );

-- 3. RÉTROGRADER UN UTILISATEUR EN USER
-- ================================================
-- Décommenter et remplacer l'email pour rétrograder

-- UPDATE profiles 
-- SET role = 'user' 
-- WHERE id IN (
--   SELECT id FROM auth.users WHERE email = 'utilisateur@exemple.com'
-- );

-- 4. REQUÊTES UTILES DE VÉRIFICATION
-- ================================================

-- Voir tous les rôles assignés
SELECT 
  p.email, 
  p.prenom, 
  p.nom, 
  p.role,
  p.created_at
FROM profiles p
WHERE p.role != 'user'
ORDER BY p.role, p.email;

-- Compter les utilisateurs par rôle
SELECT 
  role, 
  COUNT(*) as nombre
FROM profiles
GROUP BY role
ORDER BY role;
