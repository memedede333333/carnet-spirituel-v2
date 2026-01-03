-- =====================================================================
-- SCRIPT DE MISE EN PRODUCTION - BASE DE DONNÉES PROPRE
-- Date de création : 2025-12-24
-- 
-- 📋 CE SCRIPT FAIT :
-- 1. Met à jour les profils utilisateurs avec des noms réalistes
-- 2. Nettoie et réinitialise le compte utilisateur@mission.fr
-- 3. Crée des Fioretti communautaires variés (anonymes et non-anonymes)
--
-- ⚠️ UTILISATION :
-- 1. Copier tout ce script
-- 2. Aller dans Supabase > SQL Editor
-- 3. Coller et exécuter UNE SEULE FOIS
-- 4. La base de données sera prête pour la production
--
-- =====================================================================

-- =====================================================================
-- PARTIE 1 : MISE À JOUR DES PROFILS UTILISATEURS
-- =====================================================================

DO $$
BEGIN
  RAISE NOTICE '🔄 Mise à jour des profils utilisateurs...';
END $$;

-- Mise à jour des profils sans nom avec des identités chrétiennes françaises
UPDATE profiles SET prenom = 'Pierre', nom = 'Dubois' 
WHERE email = 'aymeri.appli@gmail.com';

UPDATE profiles SET prenom = 'Marie', nom = 'Lefèvre' 
WHERE email = 'aymeri.catho@gmail.com';

UPDATE profiles SET prenom = 'Thérèse', nom = 'Martin' 
WHERE email = 'aymeri.info2@gmail.com';

UPDATE profiles SET prenom = 'Jean', nom = 'Rousseau' 
WHERE email = 'aymeri.video@gmail.com';

UPDATE profiles SET prenom = 'François', nom = 'Bernard' 
WHERE email = 'ofthegardenmeme@gmail.com';

-- Vérifier que Claude et Elisabeth ont déjà leurs noms
UPDATE profiles SET prenom = 'Claude', nom = 'Fontaine' 
WHERE email = 'claude@saintho.fr' AND (prenom IS NULL OR prenom = 'Claude AI');

UPDATE profiles SET prenom = 'Élisabeth', nom = 'Dupont' 
WHERE email = 'memeofthegarden@gmail.com' AND (prenom IS NULL OR prenom = 'MEME Ofthegarden');

DO $$
BEGIN
  RAISE NOTICE '✅ Profils mis à jour';
END $$;

-- =====================================================================
-- PARTIE 2 : NETTOYAGE DU COMPTE utilisateur@mission.fr
-- =====================================================================

DO $$
DECLARE
  test_user_id UUID := 'a3aaf7c1-48dd-4d0a-b1dc-70c04def672b';
BEGIN
  RAISE NOTICE '🧹 Nettoyage du compte utilisateur@mission.fr...';
  
  -- Supprimer dans l'ordre (respect des contraintes)
  DELETE FROM liens_spirituels WHERE user_id = test_user_id;
  DELETE FROM suivis_priere WHERE priere_id IN (SELECT id FROM prieres WHERE user_id = test_user_id);
  DELETE FROM graces WHERE user_id = test_user_id;
  DELETE FROM prieres WHERE user_id = test_user_id;
  DELETE FROM paroles_ecriture WHERE user_id = test_user_id;
  DELETE FROM paroles_connaissance WHERE user_id = test_user_id;
  DELETE FROM rencontres_missionnaires WHERE user_id = test_user_id;
  DELETE FROM fioretti WHERE user_id = test_user_id;
  
  RAISE NOTICE '✅ Données existantes supprimées';
END $$;

-- =====================================================================
-- PARTIE 3 : DONNÉES POUR utilisateur@mission.fr (DATES DYNAMIQUES)
-- =====================================================================

DO $$
BEGIN
  RAISE NOTICE '📝 Création des données pour utilisateur@mission.fr...';
END $$;

-- GRÂCES (7 entrées réparties sur 3 mois)
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
 'Sophie m''a envoyé une photo de son premier jour de travail, rayonnante. Sa foi a été fortifiée par cette épreuve. Elle témoigne auprès de ses nouveaux collègues.', 
 CURRENT_DATE - INTERVAL '40 days', 'Message WhatsApp', ARRAY['gratitude', 'témoignage', 'providence'], 'prive', 'brouillon');

-- PRIÈRES (5 entrées)
INSERT INTO prieres (id, user_id, type, personne_prenom, personne_nom, date, sujet, sujet_detail, nombre_fois, notes, visibilite) VALUES
('ff01d34c-9dbc-4849-b3ff-3c81caa82fef', 'a3aaf7c1-48dd-4d0a-b1dc-70c04def672b', 
 'guerison', 'Paul', 'Martin', CURRENT_DATE - INTERVAL '20 days', 
 'Cancer', 'Cancer du poumon diagnostiqué en avril. Chimiothérapie en cours.', 25, 
 'Je prie chaque jour le chapelet pour lui. Sa femme me tient au courant.', 'prive'),

('b6453be8-243c-4a93-bfc0-f14839166b2f', 'a3aaf7c1-48dd-4d0a-b1dc-70c04def672b', 
 'intercession', 'Sophie', NULL, CURRENT_DATE - INTERVAL '42 days', 
 'Recherche d''emploi', 'Au chômage depuis 6 mois, elle désespère', 12, 
 'Neuvaine à Saint Joseph travailleur', 'prive'),

('fb31a026-96cc-4ee9-bd9e-f55135f37bea', 'a3aaf7c1-48dd-4d0a-b1dc-70c04def672b', 
 'freres', 'Communauté', 'Taizé', CURRENT_DATE - INTERVAL '48 days', 
 'Guidance pour ma mission', 'Discernement sur mon engagement dans l''évangélisation', 7, 
 'Prière quotidienne avec les frères', 'prive'),

('8853eeb8-12a6-426d-8474-4125bc595dd4', 'a3aaf7c1-48dd-4d0a-b1dc-70c04def672b', 
 'intercession', 'Lucas', 'Durand', CURRENT_DATE - INTERVAL '67 days', 
 'Retour à la foi', 'Mon neveu qui s''est éloigné de l''Église', 30, 
 'Un Je vous salue Marie chaque soir', 'prive'),

('ce77d1dc-e0f7-4b64-bf8f-4ce99df892f5', 'a3aaf7c1-48dd-4d0a-b1dc-70c04def672b', 
 'guerison', 'Marie', 'Leblanc', CURRENT_DATE - INTERVAL '80 days', 
 'Dépression', 'Dépression suite à un deuil', 15, 
 'Chapelet de la miséricorde divine', 'prive');

-- ÉCRITURES (3 entrées)
INSERT INTO paroles_ecriture (id, user_id, reference, texte_complet, traduction, contexte, date_reception, ce_qui_ma_touche, pour_qui, fruits) VALUES
('2e186aa1-3303-477e-9ef5-0d62f82950f1', 'a3aaf7c1-48dd-4d0a-b1dc-70c04def672b', 
 'Mt 11,28-30', 'Venez à moi, vous tous qui êtes fatigués et chargés, et je vous donnerai du repos. Prenez mon joug sur vous et recevez mes instructions, car je suis doux et humble de cœur, et vous trouverez du repos pour vos âmes. Car mon joug est aisé, et mon fardeau léger.', 
 'AELF', 'messe', CURRENT_DATE - INTERVAL '15 days', 
 'Le repos en Dieu, pas dans mes efforts. La douceur du Christ face à mes inquiétudes.', 
 'Paul qui lutte contre la maladie', ARRAY['paix', 'abandon', 'confiance']),

('5fd7235d-f6a1-4391-8853-d1f40b5a7987', 'a3aaf7c1-48dd-4d0a-b1dc-70c04def672b', 
 'Is 43,1', 'Ne crains pas, car je t''ai racheté, je t''ai appelé par ton nom : tu es à moi !', 
 'AELF', 'lectio', CURRENT_DATE - INTERVAL '25 days', 
 'Dieu connaît mon nom, celui de mes enfants. Nous lui appartenons. Cette certitude chasse la peur.', 
 'Mes enfants en difficulté', ARRAY['confiance', 'appartenance', 'protection']),

('b6827528-4121-480f-a05e-c028a93a2556', 'a3aaf7c1-48dd-4d0a-b1dc-70c04def672b', 
 'Ph 4,13', 'Je puis tout en celui qui me fortifie.', 
 'AELF', 'personnel', CURRENT_DATE - INTERVAL '45 days', 
 'Ce n''est pas ma force mais la Sienne. Tout devient possible avec Lui.', 
 'Moi-même face aux défis', ARRAY['force', 'courage', 'espérance']);

-- PAROLES DE CONNAISSANCE (4 entrées)
INSERT INTO paroles_connaissance (id, user_id, texte, date, contexte, contexte_detail, destinataire, personne_destinataire, fruit_constate, date_accomplissement) VALUES
('d6da43f2-9cfe-487b-bc42-e37c214f67f8', 'a3aaf7c1-48dd-4d0a-b1dc-70c04def672b', 
 'Une femme en bleu pleure. Elle attend un enfant mais se sent seule. Je dois lui dire que Dieu la voit.', 
 CURRENT_DATE - INTERVAL '70 days', 'veillee', 'Veillée de prière paroissiale', 
 'inconnu', NULL, 'Rencontré Clara enceinte deux semaines après', CURRENT_DATE - INTERVAL '56 days'),

('2cd64392-eba3-4883-bf45-e2ee613a7cb4', 'a3aaf7c1-48dd-4d0a-b1dc-70c04def672b', 
 'Tu hésites sur ton chemin professionnel. Le Seigneur te demande de servir là où tu es, mais différemment.', 
 CURRENT_DATE - INTERVAL '55 days', 'personnelle', 'Durant mon oraison matinale', 
 'moi', NULL, 'Clarté sur ma mission d''évangélisation au travail', NULL),

('ef0f6d8e-2431-4a6b-87f2-3c8d5e7a9b2c', 'a3aaf7c1-48dd-4d0a-b1dc-70c04def672b', 
 'Le Seigneur guérit mais d''abord Il sanctifie. Cette maladie est un chemin de sainteté.', 
 CURRENT_DATE - INTERVAL '18 days', 'priere', 'Durant mon chapelet pour Paul', 
 'personne', 'Paul Martin', NULL, NULL),

('9a8b7c6d-5e4f-3a2b-1c0d-9e8f7a6b5c4d', 'a3aaf7c1-48dd-4d0a-b1dc-70c04def672b', 
 'Ton fils traverse une nuit obscure mais l''aube vient. Continue de prier, tes prières sont comme de l''encens devant Dieu.', 
 CURRENT_DATE - INTERVAL '8 days', 'adoration', 'Adoration eucharistique', 
 'moi', NULL, NULL, NULL);

-- RENCONTRES MISSIONNAIRES (4 entrées)
INSERT INTO rencontres_missionnaires (id, user_id, personne_prenom, personne_nom, lieu, date, contexte, description, fruit_immediat, fruit_espere, visibilite) VALUES
('e2c5a9e5-6f83-4712-aa45-d5d7f9399372', 'a3aaf7c1-48dd-4d0a-b1dc-70c04def672b', 
 'Clara', NULL, 'Sortie de la messe', CURRENT_DATE - INTERVAL '58 days', 
 'spontanee', 'Jeune femme enceinte en pleurs sur le parvis. Je l''ai abordée doucement. Elle vit une grossesse difficile, abandonnée par le père. Nous avons prié ensemble.', 
 'Elle a retrouvé le sourire et pris mon numéro', 'L''accompagner durant sa grossesse', 'prive'),

('2efa844c-756b-4adf-bb2e-f57521db0b28', 'a3aaf7c1-48dd-4d0a-b1dc-70c04def672b', 
 'Ahmed', 'Benzema', 'Parc municipal', CURRENT_DATE - INTERVAL '30 days', 
 'rencontre_fortuite', 'Musulman pratiquant, nous avons parlé de nos fois respectives pendant que nos enfants jouaient. Belle ouverture sur l''importance de la prière dans nos vies.', 
 'Respect mutuel et amitié naissante', 'Dialogue interreligieux dans le quartier', 'prive'),

('4552dadb-9f86-4948-b52d-4f03bfa5120c', 'a3aaf7c1-48dd-4d0a-b1dc-70c04def672b', 
 'Marc', 'Petit', 'Café du centre', CURRENT_DATE - INTERVAL '65 days', 
 'evangelisation', 'Ancien catholique blessé par l''Église. Longue discussion sur ses blessures. J''ai surtout écouté sans juger.', 
 'Il a accepté de revoir un prêtre ami', 'Réconciliation avec l''Église', 'prive'),

('a2b3c4d5-e6f7-8901-bcde-f23456789012', 'a3aaf7c1-48dd-4d0a-b1dc-70c04def672b', 
 'Marie-Claire', NULL, 'Pèlerinage à Lourdes', CURRENT_DATE - INTERVAL '8 days', 
 'pelerinage', 'Rencontrée dans le train. Cancéreuse en rémission depuis 2 ans. Son témoignage de foi dans l''épreuve m''a bouleversée. Elle m''a dit : "La maladie m''a rapprochée de Dieu comme jamais".', 
 'Espérance renouvelée pour Paul', 'Mettre en contact avec Paul', 'prive');

-- SUIVIS DE PRIÈRE (4 entrées)
INSERT INTO suivis_priere (id, priere_id, date, notes, evolution, nouvelle_priere) VALUES
('1c112017-cce4-4063-887f-b0daa2f10604', 'ff01d34c-9dbc-4849-b3ff-3c81caa82fef', 
 CURRENT_DATE - INTERVAL '10 days', 
 'Les médecins sont étonnés, la tumeur a diminué de 30%. Paul garde le moral et témoigne de sa foi à l''hôpital.', 
 'guerison_partielle', true),

('25e6d08b-5ee0-47c4-b157-887aa0a117e2', 'ff01d34c-9dbc-4849-b3ff-3c81caa82fef', 
 CURRENT_DATE - INTERVAL '14 days', 
 'Paul continue sa chimio avec courage. Il prie le chapelet avec d''autres malades. Les infirmières sont touchées.', 
 'stable', false),

('ff504a35-2a35-4047-837d-31bc0a714813', 'b6453be8-243c-4a93-bfc0-f14839166b2f', 
 CURRENT_DATE - INTERVAL '38 days', 
 'Sophie a été retenue ! Elle commence lundi. Deo Gratias ! Elle veut organiser une messe d''action de grâce.', 
 'reponse_claire', false),

('1cbef961-fb0f-49fe-9a37-730f021e9693', 'b6453be8-243c-4a93-bfc0-f14839166b2f', 
 CURRENT_DATE - INTERVAL '41 days', 
 'Sophie m''a appelée toute joyeuse : elle a eu un entretien prometteur chez une startup chrétienne !', 
 'amelioration', false);

-- LIENS SPIRITUELS (13 entrées cohérentes)
INSERT INTO liens_spirituels (id, user_id, element_source_type, element_source_id, element_cible_type, element_cible_id, type_lien, description) VALUES
('aaf4a040-6890-433b-86ae-f86d3ec5c2ee', 'a3aaf7c1-48dd-4d0a-b1dc-70c04def672b', 'grace', 'b17b729d-a6e2-48f9-b118-b8b88f887446', 'ecriture', '2e186aa1-3303-477e-9ef5-0d62f82950f1', 'exauce', 'La paix ressentie pour mon fils répond à l''invitation du Christ'),
('f0c3c7c0-e0a0-42d0-badf-9a5b9e4f87a1', 'a3aaf7c1-48dd-4d0a-b1dc-70c04def672b', 'ecriture', '2e186aa1-3303-477e-9ef5-0d62f82950f1', 'parole', '2cd64392-eba3-4883-bf45-e2ee613a7cb4', 'accomplit', 'L''Écriture s''accomplit dans cette parole personnelle'),
('0c616d97-e37e-4b86-86f5-f82e4dc48de8', 'a3aaf7c1-48dd-4d0a-b1dc-70c04def672b', 'parole', 'd6da43f2-9cfe-487b-bc42-e37c214f67f8', 'rencontre', 'e2c5a9e5-6f83-4712-aa45-d5d7f9399372', 'accomplit', 'La parole prophétique s''est accomplie dans cette rencontre avec Clara'),
('68faabc9-e8d1-4cf5-b456-3c14b6063b16', 'a3aaf7c1-48dd-4d0a-b1dc-70c04def672b', 'ecriture', '5fd7235d-f6a1-4391-8853-d1f40b5a7987', 'rencontre', '2efa844c-756b-4adf-bb2e-f57521db0b28', 'decoule', 'Cette Parole m''a préparée à accueillir Ahmed avec bienveillance'),
('ad4cc5ba-0f89-4285-80cf-9e6f0da1f8f0', 'a3aaf7c1-48dd-4d0a-b1dc-70c04def672b', 'priere', 'fb31a026-96cc-4ee9-bd9e-f55135f37bea', 'grace', '8f075729-657d-4a86-9e19-6a87bd55c0d0', 'decoule', 'La providence découle de cette prière de discernement'),
('b1c2d3e4-f5a6-7890-bcde-f12345678901', 'a3aaf7c1-48dd-4d0a-b1dc-70c04def672b', 'ecriture', '2e186aa1-3303-477e-9ef5-0d62f82950f1', 'priere', 'ff01d34c-9dbc-4849-b3ff-3c81caa82fef', 'eclaire', 'Cette parole éclaire et console Paul dans son épreuve du cancer'),
('c2d3e4f5-a6b7-8901-cdef-f23456789012', 'a3aaf7c1-48dd-4d0a-b1dc-70c04def672b', 'grace', '74ca9a50-e759-4804-9c01-4de3aceabff5', 'grace', 'b17b729d-a6e2-48f9-b118-b8b88f887446', 'echo', 'Double grâce familiale : Dieu console à travers moi et me console pour mes enfants'),
('d3e4f5a6-b7c8-9012-defa-f34567890123', 'a3aaf7c1-48dd-4d0a-b1dc-70c04def672b', 'ecriture', '5fd7235d-f6a1-4391-8853-d1f40b5a7987', 'grace', 'b17b729d-a6e2-48f9-b118-b8b88f887446', 'eclaire', 'Cette parole confirme que Dieu connaît et veille sur mon fils'),
('e4f5a6b7-c8d9-0123-efab-f45678901234', 'a3aaf7c1-48dd-4d0a-b1dc-70c04def672b', 'priere', 'fb31a026-96cc-4ee9-bd9e-f55135f37bea', 'parole', '2cd64392-eba3-4883-bf45-e2ee613a7cb4', 'exauce', 'La prière de discernement est exaucée par cette parole sur mon orientation'),
('f5a6b7c8-d9e0-1234-fabc-f56789012345', 'a3aaf7c1-48dd-4d0a-b1dc-70c04def672b', 'ecriture', 'b6827528-4121-480f-a05e-c028a93a2556', 'grace', '8f075729-657d-4a86-9e19-6a87bd55c0d0', 'accomplit', 'La force promise s''accomplit dans cette solution inattendue'),
('a6b7c8d9-e0f1-2345-abcd-f67890123456', 'a3aaf7c1-48dd-4d0a-b1dc-70c04def672b', 'grace', '875b896b-0aa5-44d4-aa84-4a60e49826c2', 'rencontre', '2efa844c-756b-4adf-bb2e-f57521db0b28', 'decoule', 'L''expérience d''être un ange pour mon ami m''a préparée à consoler Ahmed'),
('b7c8d9e0-f1a2-3456-bcde-f78901234567', 'a3aaf7c1-48dd-4d0a-b1dc-70c04def672b', 'priere', '8853eeb8-12a6-426d-8474-4125bc595dd4', 'rencontre', '4552dadb-9f86-4948-b52d-4f03bfa5120c', 'echo', 'Cette rencontre fait écho à ma prière : comprendre ceux qui s''éloignent de la foi'),
('c8d9e0f1-a2b3-4567-cdef-f89012345678', 'a3aaf7c1-48dd-4d0a-b1dc-70c04def672b', 'grace', 'b97d37b4-5dc2-4369-9f1f-15b52764ae34', 'rencontre', 'e2c5a9e5-6f83-4712-aa45-d5d7f9399372', 'decoule', 'Ayant reçu la miséricorde, j''ai pu la transmettre à Clara dans sa détresse');

DO $$
BEGIN
  RAISE NOTICE '✅ Données utilisateur@mission.fr créées';
END $$;

-- =====================================================================
-- PARTIE 4 : CRÉATION DES FIORETTI COMMUNAUTAIRES
-- =====================================================================

DO $$
BEGIN
  RAISE NOTICE '🌸 Création des Fioretti communautaires...';
END $$;

-- Récupération des user_id pour les Fioretti
DO $$
DECLARE
  user_pierre UUID;
  user_marie UUID;
  user_therese UUID;
  user_jean UUID;
  user_claude UUID;
  user_elisabeth UUID;
  user_francois UUID;
BEGIN
  -- Récupérer les IDs
  SELECT id INTO user_pierre FROM profiles WHERE email = 'aymeri.appli@gmail.com';
  SELECT id INTO user_marie FROM profiles WHERE email = 'aymeri.catho@gmail.com';
  SELECT id INTO user_therese FROM profiles WHERE email = 'aymeri.info2@gmail.com';
  SELECT id INTO user_jean FROM profiles WHERE email = 'aymeri.video@gmail.com';
  SELECT id INTO user_claude FROM profiles WHERE email = 'claude@saintho.fr';
  SELECT id INTO user_elisabeth FROM profiles WHERE email = 'memeofthegarden@gmail.com';
  SELECT id INTO user_francois FROM profiles WHERE email = 'ofthegardenmeme@gmail.com';

  -- Fioretti de Pierre (NON ANONYME)
  INSERT INTO fioretti (user_id, grace_id, texte, est_anonyme, statut_moderation, date_partage, created_at)
  VALUES (
    user_pierre,
    NULL,
    'Ce matin, en me rendant au travail, j''ai croisé un sans-abri devant la gare. Au lieu de passer mon chemin comme d''habitude, j''ai senti un appel intérieur à m''arrêter. Nous avons parlé 20 minutes. Il s''appelle Michel et était ingénieur avant de tout perdre. Je lui ai offert un café et mon numéro. En repartant, il m''a dit : "Vous êtes le premier à me regarder comme un homme depuis des mois." Cette rencontre a bouleversé ma journée.',
    false,
    'approved',
    CURRENT_DATE - INTERVAL '3 days',
    CURRENT_DATE - INTERVAL '3 days'
  );

  -- Fioretti de Marie (ANONYME)
  INSERT INTO fioretti (user_id, grace_id, texte, est_anonyme, statut_moderation, date_partage, created_at)
  VALUES (
    user_marie,
    NULL,
    'Ma voisine âgée était hospitalisée. Personne ne lui rendait visite. J''ai décidé d''y aller chaque jour pendant deux semaines. Au début, elle était méfiante, puis elle s''est ouverte. Elle m''a confié qu''elle avait perdu la foi après la mort de son mari. Nous avons prié ensemble pour la première fois hier. Elle pleurait de joie. Elle m''a dit : "Je pensais que Dieu m''avait oubliée."',
    true,
    'approved',
    CURRENT_DATE - INTERVAL '8 days',
    CURRENT_DATE - INTERVAL '8 days'
  );

  -- Fioretti de Thérèse (NON ANONYME)
  INSERT INTO fioretti (user_id, grace_id, texte, est_anonyme, statut_moderation, date_partage, created_at)
  VALUES (
    user_therese,
    NULL,
    'Durant l''adoration, j''ai ressenti l''appel à prier pour une personne précise sans savoir qui. Le lendemain, ma petite-fille m''a appelée en larmes : elle venait d''apprendre qu''elle était enceinte et avait peur. Je lui ai dit que je priais pour elle depuis la veille sans le savoir. Elle a fondu en larmes et m''a dit : "Mamie, c''est un signe de Dieu." Aujourd''hui, elle garde son bébé avec joie.',
    false,
    'approved',
    CURRENT_DATE - INTERVAL '15 days',
    CURRENT_DATE - INTERVAL '15 days'
  );

  -- Fioretti de Jean (ANONYME)
  INSERT INTO fioretti (user_id, grace_id, texte, est_anonyme, statut_moderation, date_partage, created_at)
  VALUES (
    user_jean,
    NULL,
    'À la fac, un camarade athée se moquait toujours de ma foi. Un jour, il a appris que son père avait un cancer. Il est venu me voir, effondré, et m''a demandé : "Tu crois vraiment que prier peut changer quelque chose ?" On a prié ensemble. Trois mois plus tard, son père est en rémission. Il ne s''est pas converti, mais il m''a dit : "Je ne me moquerai plus jamais de ta foi."',
    true,
    'approved',
    CURRENT_DATE - INTERVAL '22 days',
    CURRENT_DATE - INTERVAL '22 days'
  );

  -- Fioretti de Claude (NON ANONYME)
  INSERT INTO fioretti (user_id, grace_id, texte, est_anonyme, statut_moderation, date_partage, created_at)
  VALUES (
    user_claude,
    NULL,
    'Un jeune homme est venu me voir au confessionnal après 15 ans d''absence. Il portait un fardeau terrible : il avait causé un accident mortel en conduisant ivre. Il n''arrivait pas à se pardonner. Après la confession, je l''ai accompagné devant le Saint-Sacrement. Il a pleuré pendant une heure. En repartant, il m''a dit : "Pour la première fois depuis 15 ans, je peux respirer." La miséricorde de Dieu est infinie.',
    false,
    'approved',
    CURRENT_DATE - INTERVAL '28 days',
    CURRENT_DATE - INTERVAL '28 days'
  );

  -- Fioretti d'Élisabeth (ANONYME)
  INSERT INTO fioretti (user_id, grace_id, texte, est_anonyme, statut_moderation, date_partage, created_at)
  VALUES (
    user_elisabeth,
    NULL,
    'Dans notre communauté, nous prions pour les âmes du purgatoire. Une nuit, j''ai rêvé d''une femme qui me suppliait de prier pour elle. Le lendemain, en rangeant la sacristie, j''ai trouvé une vieille photo tombée d''un missel : c''était elle. Au dos, un nom et une date de décès : 1987. J''ai fait célébrer une messe pour elle. Depuis, une paix inexplicable m''habite. La communion des saints est réelle.',
    true,
    'approved',
    CURRENT_DATE - INTERVAL '35 days',
    CURRENT_DATE - INTERVAL '35 days'
  );

  -- Fioretti de François (NON ANONYME)
  INSERT INTO fioretti (user_id, grace_id, texte, est_anonyme, statut_moderation, date_partage, created_at)
  VALUES (
    user_francois,
    NULL,
    'Chaque semaine, je visite les détenus de la prison locale. Un homme condamné à perpétuité m''a dit qu''il ne croyait pas au pardon. Pendant 6 mois, je suis venu sans rien attendre. Un jour, il m''a demandé une Bible. Aujourd''hui, il anime un groupe de prière en prison et a écrit à sa victime pour demander pardon. Il m''a dit : "Vous m''avez montré que l''amour est plus fort que la haine."',
    false,
    'approved',
    CURRENT_DATE - INTERVAL '42 days',
    CURRENT_DATE - INTERVAL '42 days'
  );

  -- Fioretti de Pierre (ANONYME)
  INSERT INTO fioretti (user_id, grace_id, texte, est_anonyme, statut_moderation, date_partage, created_at)
  VALUES (
    user_pierre,
    NULL,
    'Mon collègue musulman jeûnait pour le Ramadan. Par solidarité, j''ai décidé de jeûner aussi et de lui expliquer le Carême chrétien. Nous avons partagé nos fois respectives pendant des semaines. Un jour, il m''a invité à l''Iftar chez lui. Sa famille m''a accueilli comme un frère. En repartant, il m''a dit : "Tu m''as montré que nos fois nous rapprochent au lieu de nous diviser." Le dialogue interreligieux commence par l''amitié.',
    true,
    'approved',
    CURRENT_DATE - INTERVAL '48 days',
    CURRENT_DATE - INTERVAL '48 days'
  );

  -- Fioretti de Marie (NON ANONYME)
  INSERT INTO fioretti (user_id, grace_id, texte, est_anonyme, statut_moderation, date_partage, created_at)
  VALUES (
    user_marie,
    NULL,
    'Ma fille adolescente traversait une crise de foi terrible. Elle voulait tout abandonner. Au lieu de la forcer, j''ai simplement prié et continué à vivre ma foi avec joie. Un soir, elle est entrée dans ma chambre pendant que je priais le chapelet. Elle s''est assise à côté de moi sans rien dire. Aujourd''hui, elle prie avec moi chaque soir. Elle m''a dit : "C''est ta paix qui m''a donné envie de revenir."',
    false,
    'approved',
    CURRENT_DATE - INTERVAL '12 days',
    CURRENT_DATE - INTERVAL '12 days'
  );

  -- Fioretti de Jean (NON ANONYME)
  INSERT INTO fioretti (user_id, grace_id, texte, est_anonyme, statut_moderation, date_partage, created_at)
  VALUES (
    user_jean,
    NULL,
    'Lors d''une soirée étudiante, un ami complètement ivre allait repartir en voiture. J''ai insisté pour le ramener. Il était furieux. En chemin, il s''est effondré et m''a confié qu''il voulait en finir. Nous avons parlé toute la nuit. Je l''ai accompagné voir un psychologue le lendemain. Six mois plus tard, il va mieux. Il m''a dit : "Tu m''as sauvé la vie cette nuit-là." Parfois, être chrétien, c''est juste être présent.',
    false,
    'approved',
    CURRENT_DATE - INTERVAL '18 days',
    CURRENT_DATE - INTERVAL '18 days'
  );

  -- Fioretti de Thérèse (ANONYME)
  INSERT INTO fioretti (user_id, grace_id, texte, est_anonyme, statut_moderation, date_partage, created_at)
  VALUES (
    user_therese,
    NULL,
    'J''ai perdu mon mari il y a 5 ans. La solitude était insupportable. Un jour, j''ai décidé d''offrir ma souffrance pour les couples en difficulté. Quelques semaines plus tard, ma nièce au bord du divorce m''a appelée. Nous avons prié ensemble. Aujourd''hui, son couple est restauré. Elle m''a dit : "Tante, tes prières ont tout changé." Ma solitude a porté du fruit. Rien n''est perdu avec Dieu.',
    true,
    'approved',
    CURRENT_DATE - INTERVAL '25 days',
    CURRENT_DATE - INTERVAL '25 days'
  );

  -- Fioretti d'Élisabeth (NON ANONYME)
  INSERT INTO fioretti (user_id, grace_id, texte, est_anonyme, statut_moderation, date_partage, created_at)
  VALUES (
    user_elisabeth,
    NULL,
    'Une jeune femme est venue frapper à la porte du monastère à 3h du matin, en pleurs. Elle voulait se suicider. Nous l''avons accueillie, écoutée, priée avec elle toute la nuit. Elle est restée une semaine avec nous. Aujourd''hui, elle a retrouvé goût à la vie et vient nous voir régulièrement. Elle m''a dit : "Vous m''avez montré que l''Église est une mère." La vie consacrée, c''est être disponible pour Dieu et pour les autres.',
    false,
    'approved',
    CURRENT_DATE - INTERVAL '5 days',
    CURRENT_DATE - INTERVAL '5 days'
  );

  RAISE NOTICE '✅ 12 Fioretti communautaires créés';
END $$;

-- =====================================================================
-- PARTIE 5 : RÉSUMÉ ET VÉRIFICATIONS
-- =====================================================================

DO $$
BEGIN
  RAISE NOTICE '📊 Génération du résumé...';
END $$;

-- Afficher le résumé
SELECT 
  '✅ SCRIPT TERMINÉ !' as message,
  CURRENT_DATE as date_execution;

-- Compter les profils mis à jour
SELECT 
  '👥 PROFILS MIS À JOUR' as type,
  COUNT(*) as nombre
FROM profiles
WHERE prenom IS NOT NULL AND nom IS NOT NULL;

-- Compter les données de utilisateur@mission.fr
SELECT 
  '📝 DONNÉES utilisateur@mission.fr' as section,
  type,
  nombre
FROM (
  SELECT 'Grâces' as type, COUNT(*) as nombre
  FROM graces WHERE user_id = 'a3aaf7c1-48dd-4d0a-b1dc-70c04def672b'
  UNION ALL
  SELECT 'Prières', COUNT(*)
  FROM prieres WHERE user_id = 'a3aaf7c1-48dd-4d0a-b1dc-70c04def672b'
  UNION ALL
  SELECT 'Écritures', COUNT(*)
  FROM paroles_ecriture WHERE user_id = 'a3aaf7c1-48dd-4d0a-b1dc-70c04def672b'
  UNION ALL
  SELECT 'Paroles connaissance', COUNT(*)
  FROM paroles_connaissance WHERE user_id = 'a3aaf7c1-48dd-4d0a-b1dc-70c04def672b'
  UNION ALL
  SELECT 'Rencontres', COUNT(*)
  FROM rencontres_missionnaires WHERE user_id = 'a3aaf7c1-48dd-4d0a-b1dc-70c04def672b'
  UNION ALL
  SELECT 'Liens spirituels', COUNT(*)
  FROM liens_spirituels WHERE user_id = 'a3aaf7c1-48dd-4d0a-b1dc-70c04def672b'
  UNION ALL
  SELECT 'Suivis prière', COUNT(*)
  FROM suivis_priere WHERE priere_id IN (
    SELECT id FROM prieres WHERE user_id = 'a3aaf7c1-48dd-4d0a-b1dc-70c04def672b'
  )
) as stats
ORDER BY type;

-- Compter les Fioretti communautaires
SELECT 
  '🌸 FIORETTI COMMUNAUTAIRES' as section,
  COUNT(*) as total,
  SUM(CASE WHEN est_anonyme = true THEN 1 ELSE 0 END) as anonymes,
  SUM(CASE WHEN est_anonyme = false THEN 1 ELSE 0 END) as non_anonymes
FROM fioretti
WHERE statut_moderation = 'approved';

-- Vérifier la plage de dates
SELECT 
  '📅 PLAGE DE DATES' as section,
  MIN(date_min) as date_la_plus_ancienne,
  MAX(date_max) as date_la_plus_recente,
  (MAX(date_max) - MIN(date_min)) as nombre_de_jours
FROM (
  SELECT MIN(date) as date_min, MAX(date) as date_max 
  FROM graces WHERE user_id = 'a3aaf7c1-48dd-4d0a-b1dc-70c04def672b'
  UNION ALL
  SELECT MIN(date), MAX(date) 
  FROM prieres WHERE user_id = 'a3aaf7c1-48dd-4d0a-b1dc-70c04def672b'
  UNION ALL
  SELECT MIN(date_reception), MAX(date_reception) 
  FROM paroles_ecriture WHERE user_id = 'a3aaf7c1-48dd-4d0a-b1dc-70c04def672b'
  UNION ALL
  SELECT MIN(date), MAX(date) 
  FROM paroles_connaissance WHERE user_id = 'a3aaf7c1-48dd-4d0a-b1dc-70c04def672b'
  UNION ALL
  SELECT MIN(date), MAX(date) 
  FROM rencontres_missionnaires WHERE user_id = 'a3aaf7c1-48dd-4d0a-b1dc-70c04def672b'
) as date_ranges;

-- Liste des profils
SELECT 
  '👤 LISTE DES PROFILS' as section,
  prenom,
  nom,
  email
FROM profiles
WHERE prenom IS NOT NULL
ORDER BY prenom;
