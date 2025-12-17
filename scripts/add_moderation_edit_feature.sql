-- Mise à jour du schéma pour la fonctionnalité d'édition en modération

-- 1. Ajouter colonnes à la table fioretti
ALTER TABLE fioretti ADD COLUMN IF NOT EXISTS message_moderateur TEXT;
ALTER TABLE fioretti ADD COLUMN IF NOT EXISTS contenu_original JSONB;
ALTER TABLE fioretti ADD COLUMN IF NOT EXISTS date_moderation TIMESTAMP WITH TIME ZONE;

-- 2. Créer table de notifications
CREATE TABLE IF NOT EXISTS notifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  type TEXT NOT NULL CHECK (type IN ('fioretto_approuve', 'fioretto_refuse', 'fioretto_modifie', 'message_moderateur')),
  fioretto_id UUID REFERENCES fioretti(id) ON DELETE CASCADE,
  message TEXT,
  lu BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 3. RLS pour notifications
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users see their own notifications" ON notifications 
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users mark their notifications as read" ON notifications 
  FOR UPDATE USING (auth.uid() = user_id);

-- 4. Index pour performance
CREATE INDEX IF NOT EXISTS idx_notifications_user_id ON notifications(user_id);
CREATE INDEX IF NOT EXISTS idx_notifications_lu ON notifications(lu) WHERE lu = false;
