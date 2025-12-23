-- ================================================
-- TRIGGER INTELLIGENT POUR CRÉATION DE PROFIL (V2)
-- ================================================
-- Gère l'inscription par Email (prenom/nom explicites)
-- ET l'inscription par OAuth Google (full_name à découper)

CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER SET search_path = public
AS $$
DECLARE
  v_prenom text;
  v_nom text;
  v_full_name text;
BEGIN
  -- 1. Essayer de récupérer prenom/nom (Inscription Formulaire)
  v_prenom := NEW.raw_user_meta_data->>'prenom';
  v_nom := NEW.raw_user_meta_data->>'nom';

  -- 2. Si pas de prénom, c'est probablement un OAuth (Google, etc.)
  IF v_prenom IS NULL OR v_prenom = '' THEN
     -- Google envoie souvent 'full_name' ou 'name'
     v_full_name := NEW.raw_user_meta_data->>'full_name';
     
     IF v_full_name IS NULL THEN
        v_full_name := NEW.raw_user_meta_data->>'name';
     END IF;

     -- Si on a un nom complet, on essaie de le couper
     IF v_full_name IS NOT NULL THEN
       IF position(' ' in v_full_name) > 0 THEN
         -- Tout ce qui est avant le premier espace = Prénom
         v_prenom := split_part(v_full_name, ' ', 1);
         -- Tout le reste = Nom
         v_nom := substring(v_full_name from position(' ' in v_full_name) + 1);
       ELSE
         -- Pas d'espace, on met tout dans le prénom
         v_prenom := v_full_name;
         v_nom := '';
       END IF;
     END IF;
  END IF;

  -- 3. Filet de sécurité : si vraiment rien, on prend le début de l'email
  IF v_prenom IS NULL OR v_prenom = '' THEN
    v_prenom := split_part(NEW.email, '@', 1);
  END IF;

  -- Insertion finale
  INSERT INTO public.profiles (id, email, prenom, nom, role)
  VALUES (
    NEW.id,
    NEW.email,
    v_prenom,
    v_nom,
    'user'
  );
  RETURN NEW;
END;
$$;

-- Le trigger reste le même, on a juste mis à jour la fonction
