-- Création de la table de suivi des rencontres
CREATE TABLE suivis_rencontre (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  rencontre_id UUID REFERENCES rencontres_missionnaires(id) ON DELETE CASCADE,
  date DATE NOT NULL,
  notes TEXT,
  evolution TEXT, -- 'mes_nouvelles', 'ses_nouvelles', 'rencontre', 'invitation', 'perdu_de_vue', 'autre'
  created_at TIMESTAMP DEFAULT NOW()
);

-- Activation de la Row Level Security (RLS)
ALTER TABLE suivis_rencontre ENABLE ROW LEVEL SECURITY;

-- Politique de lecture : Un utilisateur voit les suivis des rencontres qui lui appartiennent
CREATE POLICY "Users can view own suivis_rencontre" 
ON suivis_rencontre 
FOR SELECT 
USING (
  auth.uid() IN (
    SELECT user_id 
    FROM rencontres_missionnaires 
    WHERE id = suivis_rencontre.rencontre_id
  )
);

-- Politique d'insertion : Un utilisateur peut ajouter un suivi à ses propres rencontres
CREATE POLICY "Users can insert own suivis_rencontre" 
ON suivis_rencontre 
FOR INSERT 
WITH CHECK (
  auth.uid() IN (
    SELECT user_id 
    FROM rencontres_missionnaires 
    WHERE id = rencontre_id
  )
);

-- Politique de modification
CREATE POLICY "Users can update own suivis_rencontre" 
ON suivis_rencontre 
FOR UPDATE 
USING (
  auth.uid() IN (
    SELECT user_id 
    FROM rencontres_missionnaires 
    WHERE id = suivis_rencontre.rencontre_id
  )
);

-- Politique de suppression
CREATE POLICY "Users can delete own suivis_rencontre" 
ON suivis_rencontre 
FOR DELETE 
USING (
  auth.uid() IN (
    SELECT user_id 
    FROM rencontres_missionnaires 
    WHERE id = suivis_rencontre.rencontre_id
  )
);
