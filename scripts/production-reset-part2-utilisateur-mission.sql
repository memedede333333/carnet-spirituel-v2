-- =====================================================================
-- PARTIE 2/3 : DONNÉES UTILISATEUR@MISSION.FR
-- Date : 2025-12-24
-- ⚠️ EXÉCUTER APRÈS LA PARTIE 1
-- =====================================================================

DO $$
BEGIN
  RAISE NOTICE '📝 CRÉATION DES DONNÉES POUR utilisateur@mission.fr...';
END $$;

-- GRÂCES (7 entrées)
INSERT INTO graces (id, user_id, texte, date, lieu, tags, visibilite, statut_partage) VALUES
('b17b729d-a6e2-48f9-b118-b8b88f887446', 'a3aaf7c1-48dd-4d0a-b1dc-70c04def672b', 
 'Pendant l''adoration, j''ai ressenti une paix profonde et la certitude que Dieu veille sur mon fils malgré ses difficultés actuelles.', 
 CURRENT_DATE - INTERVAL '5 days', 'Chapelle Saint-Joseph', ARRAY['adoration', 'paix', 'famille'], 'prive', 'brouillon'),

('bcc8f6e0-6877-4d5e-a88d-c5e36f07b7f5', 'a3aaf7c1-48dd-4d0a-b1dc-70c04def672b', 
 'Moment de grâce inattendu en visitant une amie malade : c''est elle qui m''a consolée et redonné espoir. La joie sur son visage malgré la souffrance.', 
 CURRENT_DATE - INTERVAL '12 days', 'Hôpital Saint-Louis', ARRAY['visite', 'consolation', 'témoignage'], 'prive', 'brouillon'),

('74ca9a50-e759-4804-9c01-4de3aceabff5', 'a3aaf7c1-48dd-4d0a-b1dc-70c04def672b', 
 'Ma fille adolescente difficile est venue me parler spontanément de ses problèmes. Moment de vraie connexion après des mois de silence.', 
 CURRENT_DATE - INTERVAL '21 days', 'Maison', ARRAY['famille', 'réconciliation', 'écoute'], 'prive', 'brouillon'),

('8f075729-657d-4a86-9e19-6a87bd55c0d0', 'a3aaf7c1-48dd-4d0a-b1dc-70c04def672b', 
 'Solution providentielle pour notre problème financier : mon mari a reçu une prime inattendue exactement du montant dont nous avions besoin.', 
 CURRENT_DATE - INTERVAL '35 days', 'Maison', ARRAY['providence', 'argent', 'couple'], 'prive', 'brouillon'),

('b97d37b4-5dc2-4369-9f1f-15b52764ae34', 'a3aaf7c1-48dd-4d0a-b1dc-70c04def672b', 
 'Confession libératrice après des années. Le prêtre m''a dit exactement ce que j''avais besoin d''entendre. Je me sens légère comme jamais.', 
 CURRENT_DATE - INTERVAL '52 days', 'Église Notre-Dame', ARRAY['confession', 'pardon', 'libération'], 'prive', 'brouillon'),

('875b896b-0aa5-44d4-aa84-4a60e49826c2', 'a3aaf7c1-48dd-4d0a-b1dc-70c04def672b', 
 'Retrouvailles inespérées avec une amie perdue de vue depuis 10 ans, juste au moment où j''avais besoin d''un conseil qu''elle seule pouvait me donner.', 
 CURRENT_DATE - INTERVAL '75 days', 'Centre commercial', ARRAY['amitié', 'providence', 'conseil'], 'prive', 'brouillon'),

('a1b2c3d4-e5f6-7890-abcd-ef1234567890', 'a3aaf7c1-48dd-4d0a-b1dc-70c04def672b', 
 'Sophie m''a envoyé une photo de son premier jour de travail, rayonnante. Sa foi a été fortifiée par cette épreuve.', 
 CURRENT_DATE - INTERVAL '40 days', 'Message WhatsApp', ARRAY['gratitude', 'témoignage', 'providence'], 'prive', 'brouillon');

-- PRIÈRES (5 entrées)
INSERT INTO prieres (id, user_id, type, personne_prenom, personne_nom, date, sujet, sujet_detail, nombre_fois, notes, visibilite) VALUES
('ff01d34c-9dbc-4849-b3ff-3c81caa82fef', 'a3aaf7c1-48dd-4d0a-b1dc-70c04def672b', 
 'guerison', 'Paul', 'Martin', CURRENT_DATE - INTERVAL '20 days', 
 'Cancer', 'Cancer du poumon diagnostiqué en avril. Chimiothérapie en cours.', 25, 
 'Je prie chaque jour le chapelet pour lui.', 'prive'),

('b6453be8-243c-4a93-bfc0-f14839166b2f', 'a3aaf7c1-48dd-4d0a-b1dc-70c04def672b', 
 'intercession', 'Sophie', NULL, CURRENT_DATE - INTERVAL '42 days', 
 'Recherche d''emploi', 'Au chômage depuis 6 mois', 12, 
 'Neuvaine à Saint Joseph travailleur', 'prive'),

('fb31a026-96cc-4ee9-bd9e-f55135f37bea', 'a3aaf7c1-48dd-4d0a-b1dc-70c04def672b', 
 'freres', 'Communauté', 'Taizé', CURRENT_DATE - INTERVAL '48 days', 
 'Guidance pour ma mission', 'Discernement sur mon engagement', 7, 
 'Prière quotidienne', 'prive'),

('8853eeb8-12a6-426d-8474-4125bc595dd4', 'a3aaf7c1-48dd-4d0a-b1dc-70c04def672b', 
 'intercession', 'Lucas', 'Durand', CURRENT_DATE - INTERVAL '67 days', 
 'Retour à la foi', 'Mon neveu éloigné de l''Église', 30, 
 'Un Je vous salue Marie chaque soir', 'prive'),

('ce77d1dc-e0f7-4b64-bf8f-4ce99df892f5', 'a3aaf7c1-48dd-4d0a-b1dc-70c04def672b', 
 'guerison', 'Marie', 'Leblanc', CURRENT_DATE - INTERVAL '80 days', 
 'Dépression', 'Dépression suite à un deuil', 15, 
 'Chapelet de la miséricorde', 'prive');

-- SUIVIS DE PRIÈRE (4 entrées)
INSERT INTO suivis_priere (id, priere_id, date, notes, evolution, nouvelle_priere) VALUES
('1c112017-cce4-4063-887f-b0daa2f10604', 'ff01d34c-9dbc-4849-b3ff-3c81caa82fef', 
 CURRENT_DATE - INTERVAL '10 days', 
 'La tumeur a diminué de 30%. Paul témoigne de sa foi à l''hôpital.', 
 'guerison_partielle', true),

('25e6d08b-5ee0-47c4-b157-887aa0a117e2', 'ff01d34c-9dbc-4849-b3ff-3c81caa82fef', 
 CURRENT_DATE - INTERVAL '14 days', 
 'Paul continue sa chimio avec courage.', 
 'stable', false),

('ff504a35-2a35-4047-837d-31bc0a714813', 'b6453be8-243c-4a93-bfc0-f14839166b2f', 
 CURRENT_DATE - INTERVAL '38 days', 
 'Sophie a été retenue ! Elle commence lundi.', 
 'reponse_claire', false),

('1cbef961-fb0f-49fe-9a37-730f021e9693', 'b6453be8-243c-4a93-bfc0-f14839166b2f', 
 CURRENT_DATE - INTERVAL '41 days', 
 'Entretien prometteur chez une startup chrétienne !', 
 'amelioration', false);

-- ÉCRITURES (3 entrées)
INSERT INTO paroles_ecriture (id, user_id, reference, texte_complet, traduction, contexte, date_reception, ce_qui_ma_touche, pour_qui, fruits) VALUES
('2e186aa1-3303-477e-9ef5-0d62f82950f1', 'a3aaf7c1-48dd-4d0a-b1dc-70c04def672b', 
 'Mt 11,28-30', 'Venez à moi, vous tous qui êtes fatigués et chargés, et je vous donnerai du repos.', 
 'AELF', 'messe', CURRENT_DATE - INTERVAL '15 days', 
 'Le repos en Dieu, pas dans mes efforts.', 
 'Paul qui lutte contre la maladie', ARRAY['paix', 'abandon', 'confiance']),

('5fd7235d-f6a1-4391-8853-d1f40b5a7987', 'a3aaf7c1-48dd-4d0a-b1dc-70c04def672b', 
 'Is 43,1', 'Ne crains pas, car je t''ai racheté, je t''ai appelé par ton nom : tu es à moi !', 
 'AELF', 'lectio', CURRENT_DATE - INTERVAL '25 days', 
 'Dieu connaît mon nom, celui de mes enfants.', 
 'Mes enfants en difficulté', ARRAY['confiance', 'appartenance']),

('b6827528-4121-480f-a05e-c028a93a2556', 'a3aaf7c1-48dd-4d0a-b1dc-70c04def672b', 
 'Ph 4,13', 'Je puis tout en celui qui me fortifie.', 
 'AELF', 'personnel', CURRENT_DATE - INTERVAL '45 days', 
 'Ce n''est pas ma force mais la Sienne.', 
 'Moi-même face aux défis', ARRAY['force', 'courage']);

-- PAROLES DE CONNAISSANCE (4 entrées)
INSERT INTO paroles_connaissance (id, user_id, texte, date, contexte, contexte_detail, destinataire, personne_destinataire, fruit_constate, date_accomplissement) VALUES
('d6da43f2-9cfe-487b-bc42-e37c214f67f8', 'a3aaf7c1-48dd-4d0a-b1dc-70c04def672b', 
 'Une femme en bleu pleure. Elle attend un enfant mais se sent seule.', 
 CURRENT_DATE - INTERVAL '70 days', 'veillee', 'Veillée de prière', 
 'inconnu', NULL, 'Rencontré Clara deux semaines après', CURRENT_DATE - INTERVAL '56 days'),

('2cd64392-eba3-4883-bf45-e2ee613a7cb4', 'a3aaf7c1-48dd-4d0a-b1dc-70c04def672b', 
 'Le Seigneur te demande de servir là où tu es, mais différemment.', 
 CURRENT_DATE - INTERVAL '55 days', 'personnelle', 'Oraison matinale', 
 'moi', NULL, 'Clarté sur ma mission', NULL),

('ef0f6d8e-2431-4a6b-87f2-3c8d5e7a9b2c', 'a3aaf7c1-48dd-4d0a-b1dc-70c04def672b', 
 'Le Seigneur guérit mais d''abord Il sanctifie.', 
 CURRENT_DATE - INTERVAL '18 days', 'priere', 'Chapelet pour Paul', 
 'personne', 'Paul Martin', NULL, NULL),

('9a8b7c6d-5e4f-3a2b-1c0d-9e8f7a6b5c4d', 'a3aaf7c1-48dd-4d0a-b1dc-70c04def672b', 
 'Ton fils traverse une nuit obscure mais l''aube vient.', 
 CURRENT_DATE - INTERVAL '8 days', 'priere', 'Adoration eucharistique', 
 'moi', NULL, NULL, NULL);

-- RENCONTRES (4 entrées)
INSERT INTO rencontres_missionnaires (id, user_id, personne_prenom, personne_nom, lieu, date, contexte, description, fruit_immediat, fruit_espere, visibilite) VALUES
('e2c5a9e5-6f83-4712-aa45-d5d7f9399372', 'a3aaf7c1-48dd-4d0a-b1dc-70c04def672b', 
 'Clara', NULL, 'Sortie de la messe', CURRENT_DATE - INTERVAL '58 days', 
 'spontanee', 'Jeune femme enceinte en pleurs. Nous avons prié ensemble.', 
 'Elle a retrouvé le sourire', 'L''accompagner', 'prive'),

('2efa844c-756b-4adf-bb2e-f57521db0b28', 'a3aaf7c1-48dd-4d0a-b1dc-70c04def672b', 
 'Ahmed', 'Benzema', 'Parc municipal', CURRENT_DATE - INTERVAL '30 days', 
 'rencontre_fortuite', 'Musulman pratiquant, belle discussion sur la prière.', 
 'Amitié naissante', 'Dialogue interreligieux', 'prive'),

('4552dadb-9f86-4948-b52d-4f03bfa5120c', 'a3aaf7c1-48dd-4d0a-b1dc-70c04def672b', 
 'Marc', 'Petit', 'Café du centre', CURRENT_DATE - INTERVAL '65 days', 
 'evangelisation', 'Ancien catholique blessé. J''ai surtout écouté.', 
 'Il accepte de revoir un prêtre', 'Réconciliation', 'prive'),

('a2b3c4d5-e6f7-8901-bcde-f23456789012', 'a3aaf7c1-48dd-4d0a-b1dc-70c04def672b', 
 'Marie-Claire', NULL, 'Lourdes', CURRENT_DATE - INTERVAL '8 days', 
 'pelerinage', 'Cancéreuse en rémission, témoignage bouleversant.', 
 'Espérance renouvelée', 'Contact avec Paul', 'prive');

-- LIENS SPIRITUELS (13 entrées)
INSERT INTO liens_spirituels (id, user_id, element_source_type, element_source_id, element_cible_type, element_cible_id, type_lien, description) VALUES
('aaf4a040-6890-433b-86ae-f86d3ec5c2ee', 'a3aaf7c1-48dd-4d0a-b1dc-70c04def672b', 'grace', 'b17b729d-a6e2-48f9-b118-b8b88f887446', 'ecriture', '2e186aa1-3303-477e-9ef5-0d62f82950f1', 'exauce', 'La paix ressentie répond à l''invitation du Christ'),
('f0c3c7c0-e0a0-42d0-badf-9a5b9e4f87a1', 'a3aaf7c1-48dd-4d0a-b1dc-70c04def672b', 'ecriture', '2e186aa1-3303-477e-9ef5-0d62f82950f1', 'parole', '2cd64392-eba3-4883-bf45-e2ee613a7cb4', 'accomplit', 'L''Écriture s''accomplit'),
('0c616d97-e37e-4b86-86f5-f82e4dc48de8', 'a3aaf7c1-48dd-4d0a-b1dc-70c04def672b', 'parole', 'd6da43f2-9cfe-487b-bc42-e37c214f67f8', 'rencontre', 'e2c5a9e5-6f83-4712-aa45-d5d7f9399372', 'accomplit', 'Parole accomplie avec Clara'),
('68faabc9-e8d1-4cf5-b456-3c14b6063b16', 'a3aaf7c1-48dd-4d0a-b1dc-70c04def672b', 'ecriture', '5fd7235d-f6a1-4391-8853-d1f40b5a7987', 'rencontre', '2efa844c-756b-4adf-bb2e-f57521db0b28', 'decoule', 'Préparé à accueillir Ahmed'),
('ad4cc5ba-0f89-4285-80cf-9e6f0da1f8f0', 'a3aaf7c1-48dd-4d0a-b1dc-70c04def672b', 'priere', 'fb31a026-96cc-4ee9-bd9e-f55135f37bea', 'grace', '8f075729-657d-4a86-9e19-6a87bd55c0d0', 'decoule', 'Providence découle de la prière'),
('b1c2d3e4-f5a6-7890-bcde-f12345678901', 'a3aaf7c1-48dd-4d0a-b1dc-70c04def672b', 'ecriture', '2e186aa1-3303-477e-9ef5-0d62f82950f1', 'priere', 'ff01d34c-9dbc-4849-b3ff-3c81caa82fef', 'eclaire', 'Parole console Paul'),
('c2d3e4f5-a6b7-8901-cdef-f23456789012', 'a3aaf7c1-48dd-4d0a-b1dc-70c04def672b', 'grace', '74ca9a50-e759-4804-9c01-4de3aceabff5', 'grace', 'b17b729d-a6e2-48f9-b118-b8b88f887446', 'echo', 'Double grâce familiale'),
('d3e4f5a6-b7c8-9012-defa-f34567890123', 'a3aaf7c1-48dd-4d0a-b1dc-70c04def672b', 'ecriture', '5fd7235d-f6a1-4391-8853-d1f40b5a7987', 'grace', 'b17b729d-a6e2-48f9-b118-b8b88f887446', 'eclaire', 'Dieu veille sur mon fils'),
('e4f5a6b7-c8d9-0123-efab-f45678901234', 'a3aaf7c1-48dd-4d0a-b1dc-70c04def672b', 'priere', 'fb31a026-96cc-4ee9-bd9e-f55135f37bea', 'parole', '2cd64392-eba3-4883-bf45-e2ee613a7cb4', 'exauce', 'Prière exaucée'),
('f5a6b7c8-d9e0-1234-fabc-f56789012345', 'a3aaf7c1-48dd-4d0a-b1dc-70c04def672b', 'ecriture', 'b6827528-4121-480f-a05e-c028a93a2556', 'grace', '8f075729-657d-4a86-9e19-6a87bd55c0d0', 'accomplit', 'Force accomplie'),
('a6b7c8d9-e0f1-2345-abcd-f67890123456', 'a3aaf7c1-48dd-4d0a-b1dc-70c04def672b', 'grace', '875b896b-0aa5-44d4-aa84-4a60e49826c2', 'rencontre', '2efa844c-756b-4adf-bb2e-f57521db0b28', 'decoule', 'Préparé à consoler'),
('b7c8d9e0-f1a2-3456-bcde-f78901234567', 'a3aaf7c1-48dd-4d0a-b1dc-70c04def672b', 'priere', '8853eeb8-12a6-426d-8474-4125bc595dd4', 'rencontre', '4552dadb-9f86-4948-b52d-4f03bfa5120c', 'echo', 'Comprendre les blessés'),
('c8d9e0f1-a2b3-4567-cdef-f89012345678', 'a3aaf7c1-48dd-4d0a-b1dc-70c04def672b', 'grace', 'b97d37b4-5dc2-4369-9f1f-15b52764ae34', 'rencontre', 'e2c5a9e5-6f83-4712-aa45-d5d7f9399372', 'decoule', 'Miséricorde transmise');

DO $$
BEGIN
  RAISE NOTICE '✅ DONNÉES utilisateur@mission.fr CRÉÉES';
END $$;

SELECT '✅ PARTIE 2/3 TERMINÉE' as message;
