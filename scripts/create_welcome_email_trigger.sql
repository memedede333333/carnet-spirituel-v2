-- ================================================
-- TRIGGER ROBUSTE POUR EMAIL DE BIENVENUE
-- ================================================
-- Ce version inclut une gestion d'erreur pour NE PAS BLOQUER
-- l'inscription si l'envoi de l'email échoue.

-- S'assurer que l'extension est active
CREATE EXTENSION IF NOT EXISTS http WITH SCHEMA extensions;

CREATE OR REPLACE FUNCTION send_welcome_email_trigger()
RETURNS TRIGGER AS $$
BEGIN
  -- Vérifier que l'email vient d'être confirmé
  IF NEW.email_confirmed_at IS NOT NULL 
     AND OLD.email_confirmed_at IS NULL THEN
    
    -- Bloc de sécurité : si l'envoi échoue, on continue quand même
    BEGIN
      PERFORM extensions.http_post(
        url := 'https://carnet-spirituel-v2.vercel.app/api/send-welcome-email',
        headers := '{"Content-Type": "application/json"}'::jsonb,
        body := json_build_object(
          'userEmail', NEW.email,
          'userName', COALESCE(NEW.raw_user_meta_data->>'prenom', NEW.email)
        )::text,
        timeout_milliseconds := 2000 -- Timeout court (2s) pour ne pas faire attendre l'user
      );
    EXCEPTION WHEN OTHERS THEN
      -- On log l'erreur mais ON NE BLOQUE PAS la transaction
      RAISE WARNING 'Erreur non-bloquante envoi email bienvenue: %', SQLERRM;
    END;
    
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Recréer le trigger pour être sûr
DROP TRIGGER IF EXISTS on_user_email_confirmed ON auth.users;
CREATE TRIGGER on_user_email_confirmed
  AFTER UPDATE ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION send_welcome_email_trigger();
