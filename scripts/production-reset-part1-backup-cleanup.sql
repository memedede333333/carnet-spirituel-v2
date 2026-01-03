-- =====================================================================
-- PARTIE 1/3 : BACKUP ET NETTOYAGE
-- Date : 2025-12-24
-- =====================================================================

-- =====================================================================
-- ÉTAPE 1 : BACKUP AUTOMATIQUE
-- =====================================================================

DO $$
BEGIN
  RAISE NOTICE '🔒 DÉBUT DU BACKUP...';
END $$;

-- Créer les tables de backup si elles n'existent pas
DROP TABLE IF EXISTS backup_graces CASCADE;
DROP TABLE IF EXISTS backup_prieres CASCADE;
DROP TABLE IF EXISTS backup_suivis_priere CASCADE;
DROP TABLE IF EXISTS backup_paroles_ecriture CASCADE;
DROP TABLE IF EXISTS backup_paroles_connaissance CASCADE;
DROP TABLE IF EXISTS backup_rencontres_missionnaires CASCADE;
DROP TABLE IF EXISTS backup_liens_spirituels CASCADE;
DROP TABLE IF EXISTS backup_fioretti CASCADE;
DROP TABLE IF EXISTS backup_profiles CASCADE;

-- Backup des données
CREATE TABLE backup_graces AS SELECT * FROM graces;
CREATE TABLE backup_prieres AS SELECT * FROM prieres;
CREATE TABLE backup_suivis_priere AS SELECT * FROM suivis_priere;
CREATE TABLE backup_paroles_ecriture AS SELECT * FROM paroles_ecriture;
CREATE TABLE backup_paroles_connaissance AS SELECT * FROM paroles_connaissance;
CREATE TABLE backup_rencontres_missionnaires AS SELECT * FROM rencontres_missionnaires;
CREATE TABLE backup_liens_spirituels AS SELECT * FROM liens_spirituels;
CREATE TABLE backup_fioretti AS SELECT * FROM fioretti;
CREATE TABLE backup_profiles AS SELECT * FROM profiles;

DO $$
BEGIN
  RAISE NOTICE '✅ BACKUP TERMINÉ - Tables backup_* créées';
  RAISE NOTICE '⚠️  Pour restaurer : renommer backup_* en tables originales';
END $$;

-- =====================================================================
-- ÉTAPE 2 : NETTOYAGE DE TOUS LES COMPTES
-- =====================================================================

DO $$
BEGIN
  RAISE NOTICE '🧹 NETTOYAGE DE TOUS LES COMPTES...';
END $$;

-- Supprimer toutes les données (dans l'ordre des contraintes)
DELETE FROM liens_spirituels;
DELETE FROM suivis_priere;
DELETE FROM fioretti;
DELETE FROM graces;
DELETE FROM prieres;
DELETE FROM paroles_ecriture;
DELETE FROM paroles_connaissance;
DELETE FROM rencontres_missionnaires;

DO $$
BEGIN
  RAISE NOTICE '✅ TOUTES LES DONNÉES SUPPRIMÉES';
END $$;

-- =====================================================================
-- ÉTAPE 3 : MISE À JOUR DES PROFILS
-- =====================================================================

DO $$
BEGIN
  RAISE NOTICE '👥 MISE À JOUR DES PROFILS...';
END $$;

-- Mise à jour des profils avec noms réalistes
UPDATE profiles SET prenom = 'Antoine', nom = 'Moreau' 
WHERE email = 'aymeri.achat@gmail.com';

UPDATE profiles SET prenom = 'Pierre', nom = 'Dubois' 
WHERE email = 'aymeri.appli@gmail.com';

UPDATE profiles SET prenom = 'Marie', nom = 'Lefèvre', role = 'superadmin'
WHERE email = 'aymeri.catho@gmail.com';

UPDATE profiles SET prenom = 'Thérèse', nom = 'Martin' 
WHERE email = 'aymeri.info2@gmail.com';

UPDATE profiles SET prenom = 'Jean', nom = 'Rousseau' 
WHERE email = 'aymeri.video@gmail.com';

UPDATE profiles SET prenom = 'Claude', nom = 'Fontaine', role = 'moderateur'
WHERE email = 'claude@saintho.fr';

UPDATE profiles SET prenom = 'Élisabeth', nom = 'Dupont', role = 'moderateur'
WHERE email = 'memeofthegarden@gmail.com';

UPDATE profiles SET prenom = 'François', nom = 'Bernard' 
WHERE email = 'ofthegardenmeme@gmail.com';

UPDATE profiles SET prenom = 'Marie', nom = 'Durand', role = 'superadmin'
WHERE email = 'utilisateur@mission.fr';

DO $$
BEGIN
  RAISE NOTICE '✅ PROFILS MIS À JOUR';
END $$;

-- Afficher le résumé
SELECT 
  '✅ PARTIE 1/3 TERMINÉE' as message,
  'Backup créé, données nettoyées, profils mis à jour' as details;

SELECT 
  '👥 PROFILS' as section,
  prenom || ' ' || nom as nom_complet,
  email,
  COALESCE(role, 'utilisateur') as role
FROM profiles
WHERE prenom IS NOT NULL
ORDER BY 
  CASE role 
    WHEN 'admin' THEN 1 
    WHEN 'moderator' THEN 2 
    ELSE 3 
  END,
  prenom;
