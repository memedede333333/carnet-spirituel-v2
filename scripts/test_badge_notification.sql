-- Insérer des fioretti de test pour vérifier le badge
-- Ces fioretti seront datés de "maintenant" pour apparaître comme nouveaux

INSERT INTO fioretti (
    user_id,
    element_type,
    element_id,
    contenu_affiche,
    statut,
    date_publication,
    created_at,
    anonyme
) VALUES 
-- 1. Une nouvelle grâce
(
    '3bed61a5-d11b-40e2-b2d0-45b48bfd1187', -- Votre ID utilisateur (pour test)
    'grace',
    'test-badge-1',
    '{"texte": "Test Badge: Une grâce toute fraîche pour tester la notification !"}',
    'approuve',
    NOW(),
    NOW(),
    false
),
-- 2. Une nouvelle prière
(
    '3bed61a5-d11b-40e2-b2d0-45b48bfd1187',
    'priere',
    'test-badge-2',
    '{"sujet": "Prière pour le test du badge", "texte": "Seigneur, fais que ce badge s''affiche correctement."}',
    'approuve',
    NOW(),
    NOW(),
    true
);
