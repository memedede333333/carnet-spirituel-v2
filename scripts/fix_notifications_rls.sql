-- Correction des permissions pour les notifications

-- Permettre aux utilisateurs authentifiés (donc les modérateurs) de créer des notifications
CREATE POLICY "Users can insert notifications" ON notifications 
FOR INSERT 
WITH CHECK (auth.role() = 'authenticated');

-- Vérifier si la policy update existe, sinon la créer
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies 
        WHERE tablename = 'notifications' 
        AND policyname = 'Users mark their notifications as read'
    ) THEN
        CREATE POLICY "Users mark their notifications as read" ON notifications 
        FOR UPDATE 
        USING (auth.uid() = user_id);
    END IF;
END
$$;
