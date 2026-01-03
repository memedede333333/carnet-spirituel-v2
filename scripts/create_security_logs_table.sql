-- Création de la table security_logs si elle n'existe pas
-- Pour tracker les événements de sécurité (connexions, modifications de compte)

CREATE TABLE IF NOT EXISTS security_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  action TEXT NOT NULL, -- 'login', 'logout', 'password_change', 'email_change', 'profile_update', 'failed_login', 'account_created'
  ip_address TEXT,
  user_agent TEXT,
  details JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Index pour améliorer les performances
CREATE INDEX IF NOT EXISTS idx_security_logs_user_id ON security_logs(user_id);
CREATE INDEX IF NOT EXISTS idx_security_logs_created_at ON security_logs(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_security_logs_action ON security_logs(action);

-- Row Level Security (RLS)
ALTER TABLE security_logs ENABLE ROW LEVEL SECURITY;

-- Politique : Les utilisateurs peuvent voir leurs propres logs
CREATE POLICY "Users can view their own security logs"
  ON security_logs
  FOR SELECT
  USING (auth.uid() = user_id);

-- Politique : Les admins peuvent voir tous les logs
CREATE POLICY "Admins can view all security logs"
  ON security_logs
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role = 'superadmin'
    )
  );

-- Politique : Le système peut insérer des logs
CREATE POLICY "System can insert security logs"
  ON security_logs
  FOR INSERT
  WITH CHECK (true);

-- Commentaires
COMMENT ON TABLE security_logs IS 'Logs de sécurité pour tracker les connexions et modifications de compte';
COMMENT ON COLUMN security_logs.action IS 'Type d''action: login, logout, password_change, email_change, profile_update, failed_login, account_created';
COMMENT ON COLUMN security_logs.details IS 'Informations supplémentaires en JSON (ex: old_email, new_email, etc.)';
