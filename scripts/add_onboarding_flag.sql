-- Ajouter la colonne has_seen_onboarding à la table profiles
ALTER TABLE public.profiles
ADD COLUMN IF NOT EXISTS has_seen_onboarding BOOLEAN DEFAULT FALSE;

-- Par défaut, les utilisateurs existants ont déjà "vu" l'onboarding (pour ne pas les embêter)
UPDATE public.profiles
SET has_seen_onboarding = TRUE
WHERE created_at < NOW();
