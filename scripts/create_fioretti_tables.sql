-- 1. Schema Updates (Run in Supabase SQL Editor)

-- A. Add 'statut_partage' to existing tables
ALTER TABLE graces ADD COLUMN IF NOT EXISTS statut_partage TEXT DEFAULT 'brouillon' CHECK (statut_partage IN ('brouillon', 'propose', 'approuve', 'refuse'));
ALTER TABLE prieres ADD COLUMN IF NOT EXISTS statut_partage TEXT DEFAULT 'brouillon' CHECK (statut_partage IN ('brouillon', 'propose', 'approuve', 'refuse'));
ALTER TABLE paroles_ecriture ADD COLUMN IF NOT EXISTS statut_partage TEXT DEFAULT 'brouillon' CHECK (statut_partage IN ('brouillon', 'propose', 'approuve', 'refuse'));
ALTER TABLE paroles_connaissance ADD COLUMN IF NOT EXISTS statut_partage TEXT DEFAULT 'brouillon' CHECK (statut_partage IN ('brouillon', 'propose', 'approuve', 'refuse'));
ALTER TABLE rencontres_missionnaires ADD COLUMN IF NOT EXISTS statut_partage TEXT DEFAULT 'brouillon' CHECK (statut_partage IN ('brouillon', 'propose', 'approuve', 'refuse'));

-- B. Create 'fioretti' table
CREATE TABLE IF NOT EXISTS fioretti (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  element_type TEXT NOT NULL CHECK (element_type IN ('grace', 'priere', 'ecriture', 'parole', 'rencontre')),
  element_id UUID NOT NULL,
  contenu_affiche JSONB NOT NULL, -- Snapshot of content
  message_ajout TEXT,
  anonyme BOOLEAN DEFAULT true,
  pseudo TEXT,
  moderateur_id UUID REFERENCES profiles(id),
  date_publication TIMESTAMP WITH TIME ZONE,
  statut TEXT DEFAULT 'propose' CHECK (statut IN ('propose', 'approuve', 'refuse')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- C. Create 'fioretti_interactions' table
CREATE TABLE IF NOT EXISTS fioretti_interactions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  fioretto_id UUID NOT NULL REFERENCES fioretti(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  type_interaction TEXT NOT NULL CHECK (type_interaction IN ('soutien', 'action_grace')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(fioretto_id, user_id, type_interaction) -- One type of interaction per user per fioretto
);

-- D. RLS Policies
ALTER TABLE fioretti ENABLE ROW LEVEL SECURITY;
ALTER TABLE fioretti_interactions ENABLE ROW LEVEL SECURITY;

-- Fioretti Policies
CREATE POLICY "Public voyent approuvés" ON fioretti FOR SELECT USING (statut = 'approuve');
CREATE POLICY "Auteurs voyent leurs proposés" ON fioretti FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Auteurs créent" ON fioretti FOR INSERT WITH CHECK (auth.uid() = user_id);
-- Note: Moderation policies require checking role, complex to hardcode without role function working perfectly, defaulting to 'public read approved' for now.

-- Interaction Policies
CREATE POLICY "Public voit tout interaction" ON fioretti_interactions FOR SELECT USING (true);
CREATE POLICY "Auth users interact" ON fioretti_interactions FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Auth users delete own" ON fioretti_interactions FOR DELETE USING (auth.uid() = user_id);
