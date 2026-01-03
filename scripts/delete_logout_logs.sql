-- Script pour supprimer tous les logs de déconnexion
-- À exécuter dans Supabase SQL Editor

-- 1. Compter les logs de déconnexion avant suppression
SELECT COUNT(*) as nb_logout_logs 
FROM security_logs 
WHERE action = 'logout';

-- 2. Supprimer tous les logs de déconnexion
DELETE FROM security_logs 
WHERE action = 'logout';

-- 3. Vérifier le résultat
SELECT COUNT(*) as nb_logout_logs_apres 
FROM security_logs 
WHERE action = 'logout';

-- 4. Voir les types d'actions restantes
SELECT action, COUNT(*) as count 
FROM security_logs 
GROUP BY action 
ORDER BY count DESC;
