-- ================================================
-- SCRIPT DE TEST : Reset ou Suppression utilisateur
-- ================================================
-- Ce script vous permet de tester à nouveau l'onboarding
-- avec un compte existant (aymeri.achat@gmail.com)

-- ================================================
-- OPTION 1 : RESET ONBOARDING UNIQUEMENT (Recommandé)
-- ================================================
-- Réinitialise juste le flag pour revoir le modal d'onboarding
-- Le compte reste intact avec toutes ses données

UPDATE public.profiles
SET has_seen_onboarding = FALSE
WHERE email = 'aymeri.achat@gmail.com';

-- Vérification
SELECT id, email, prenom, has_seen_onboarding 
FROM public.profiles 
WHERE email = 'aymeri.achat@gmail.com';


-- ================================================
-- OPTION 2 : SUPPRESSION COMPLÈTE DU COMPTE (Destructif)
-- ================================================
-- ⚠️ ATTENTION : Cela supprime TOUTES les données du compte !
-- Utilisez cette option uniquement si vous voulez vraiment tout supprimer.

-- Étape 1 : Supprimer d'abord toutes les données liées dans les tables
-- (Supabase supprimera automatiquement grâce aux CASCADE si configuré,
--  sinon il faut les supprimer manuellement)

-- Grâces
DELETE FROM public.graces WHERE user_id = (
  SELECT id FROM auth.users WHERE email = 'aymeri.achat@gmail.com'
);

-- Prières
DELETE FROM public.prieres WHERE user_id = (
  SELECT id FROM auth.users WHERE email = 'aymeri.achat@gmail.com'
);

-- Écritures
DELETE FROM public.ecritures WHERE user_id = (
  SELECT id FROM auth.users WHERE email = 'aymeri.achat@gmail.com'
);

-- Paroles
DELETE FROM public.paroles WHERE user_id = (
  SELECT id FROM auth.users WHERE email = 'aymeri.achat@gmail.com'
);

-- Rencontres
DELETE FROM public.rencontres WHERE user_id = (
  SELECT id FROM auth.users WHERE email = 'aymeri.achat@gmail.com'
);

-- Fioretti
DELETE FROM public.fioretti WHERE user_id = (
  SELECT id FROM auth.users WHERE email = 'aymeri.achat@gmail.com'
);

-- Liens de relecture
DELETE FROM public.liens WHERE user_id = (
  SELECT id FROM auth.users WHERE email = 'aymeri.achat@gmail.com'
);

-- Étape 2 : Supprimer le profil
DELETE FROM public.profiles 
WHERE email = 'aymeri.achat@gmail.com';

-- Étape 3 : Supprimer l'utilisateur de auth.users
-- ⚠️ Cette commande nécessite des droits admin sur auth.users
DELETE FROM auth.users 
WHERE email = 'aymeri.achat@gmail.com';

-- Vérification finale
SELECT COUNT(*) as remaining_user 
FROM auth.users 
WHERE email = 'aymeri.achat@gmail.com';
-- Devrait retourner 0
