-- Insérer des fioretti de test pour l'utilisateur 3bed61a5-d11b-40e2-b2d0-45b48bfd1187

-- 1. Fioretto APPROUVÉ (pour tester l'alerte dashboard et le jardin)
INSERT INTO fioretti (
    user_id,
    element_type,
    element_id,
    contenu_affiche,
    message_ajout,
    anonyme,
    pseudo,
    statut,
    date_publication,
    created_at
) VALUES (
    '3bed61a5-d11b-40e2-b2d0-45b48bfd1187',
    'grace',
    '00000000-0000-0000-0000-000000000001',
    '{"texte": "J''ai ressenti une paix profonde lors de ma prière ce matin. Le Seigneur m''a montré combien Il est présent dans les petites choses du quotidien."}',
    'Ce moment de grâce m''a vraiment touché.',
    false,
    'Marie',
    'approuve',
    NOW() - INTERVAL '2 hours',
    NOW() - INTERVAL '1 day'
);

-- 2. Fioretto EN ATTENTE (pour tester la page "Mes Fioretti")
INSERT INTO fioretti (
    user_id,
    element_type,
    element_id,
    contenu_affiche,
    message_ajout,
    anonyme,
    statut,
    created_at
) VALUES (
    '3bed61a5-d11b-40e2-b2d0-45b48bfd1187',
    'priere',
    '00000000-0000-0000-0000-000000000002',
    '{"texte": "Seigneur, je te confie cette situation difficile au travail. Donne-moi la patience et la charité."}',
    'Merci de prier pour moi.',
    true,
    'propose',
    NOW() - INTERVAL '3 hours'
);

-- 3. Fioretto AVEC MESSAGE MODÉRATEUR (pour tester le badge statut)
INSERT INTO fioretti (
    user_id,
    element_type,
    element_id,
    contenu_affiche,
    message_ajout,
    anonyme,
    pseudo,
    statut,
    date_publication,
    message_moderateur,
    created_at
) VALUES (
    '3bed61a5-d11b-40e2-b2d0-45b48bfd1187',
    'ecriture',
    '00000000-0000-0000-0000-000000000003',
    '{"texte": "Car Dieu a tant aimé le monde qu''il a donné son Fils unique."}',
    'Ma parole préférée.',
    false,
    'Pierre',
    'approuve',
    NOW() - INTERVAL '5 hours',
    'Merci pour ce beau partage ! J''ai validé votre fioretto.',
    NOW() - INTERVAL '1 day'
);
