-- Assigner le rôle superadmin à l'utilisateur spécifié
UPDATE profiles 
SET role = 'superadmin' 
WHERE id IN (
  SELECT id FROM auth.users WHERE email = 'utilisateur@mission.fr'
);
