-- =====================================================================
-- PARTIE 3/3 : GRÂCES ET FIORETTI DES AUTRES UTILISATEURS
-- Date : 2025-12-24
-- ⚠️ EXÉCUTER APRÈS LES PARTIES 1 ET 2
-- =====================================================================

DO $$
DECLARE
  user_antoine UUID;
  user_pierre UUID;
  user_marie UUID;
  user_therese UUID;
  user_jean UUID;
  user_claude UUID;
  user_elisabeth UUID;
  user_francois UUID;
BEGIN
  RAISE NOTICE '🌸 CRÉATION DES GRÂCES ET FIORETTI...';
  
  -- Récupérer les IDs
  SELECT id INTO user_antoine FROM profiles WHERE email = 'aymeri.achat@gmail.com';
  SELECT id INTO user_pierre FROM profiles WHERE email = 'aymeri.appli@gmail.com';
  SELECT id INTO user_marie FROM profiles WHERE email = 'aymeri.catho@gmail.com';
  SELECT id INTO user_therese FROM profiles WHERE email = 'aymeri.info2@gmail.com';
  SELECT id INTO user_jean FROM profiles WHERE email = 'aymeri.video@gmail.com';
  SELECT id INTO user_claude FROM profiles WHERE email = 'claude@saintho.fr';
  SELECT id INTO user_elisabeth FROM profiles WHERE email = 'memeofthegarden@gmail.com';
  SELECT id INTO user_francois FROM profiles WHERE email = 'ofthegardenmeme@gmail.com';

  -- ===== ANTOINE MOREAU =====
  -- Grâce 1 (privée)
  INSERT INTO graces (id, user_id, texte, date, lieu, tags, visibilite, statut_partage)
  VALUES ('aa000001-0000-0000-0000-000000000001', user_antoine, 
    'Moment de paix profonde pendant la messe dominicale.', 
    CURRENT_DATE - INTERVAL '10 days', 'Église Saint-Pierre', 
    ARRAY['messe', 'paix'], 'prive', 'brouillon');
  
  -- Grâce 2 (partagée → Fioretti ANONYME)
  INSERT INTO graces (id, user_id, texte, date, lieu, tags, visibilite, statut_partage)
  VALUES ('aa000001-0000-0000-0000-000000000002', user_antoine,
    'J''ai croisé mon ancien professeur qui m''avait marqué. Il m''a dit qu''il priait pour moi depuis 10 ans. J''étais bouleversé.', 
    CURRENT_DATE - INTERVAL '18 days', 'Rue de la République', 
    ARRAY['providence', 'témoignage'], 'prive', 'approuve');

  INSERT INTO fioretti (user_id, element_type, element_id, contenu_affiche, anonyme, statut, date_publication, created_at)
  VALUES (user_antoine, 'grace', 'aa000001-0000-0000-0000-000000000002',
    jsonb_build_object(
      'texte', 'J''ai croisé mon ancien professeur qui m''avait marqué. Il m''a dit qu''il priait pour moi depuis 10 ans. J''étais bouleversé.',
      'date', CURRENT_DATE - INTERVAL '18 days',
      'lieu', 'Rue de la République'
    ),
    true, 'approuve', CURRENT_DATE - INTERVAL '18 days', CURRENT_DATE - INTERVAL '18 days');

  -- ===== PIERRE DUBOIS =====
  -- Grâce 1 (privée)
  INSERT INTO graces (id, user_id, texte, date, lieu, tags, visibilite, statut_partage)
  VALUES ('bb000001-0000-0000-0000-000000000001', user_pierre,
    'Réconciliation avec mon frère après 2 ans de silence.', 
    CURRENT_DATE - INTERVAL '7 days', 'Maison familiale', 
    ARRAY['famille', 'pardon'], 'prive', 'brouillon');
  
  -- Grâce 2 (partagée → Fioretti NON ANONYME)
  INSERT INTO graces (id, user_id, texte, date, lieu, tags, visibilite, statut_partage)
  VALUES ('bb000001-0000-0000-0000-000000000002', user_pierre,
    'Ce matin, en me rendant au travail, j''ai croisé un sans-abri devant la gare. Au lieu de passer mon chemin, j''ai senti un appel à m''arrêter. Nous avons parlé 20 minutes. Il s''appelle Michel. Je lui ai offert un café. En repartant, il m''a dit : "Vous êtes le premier à me regarder comme un homme depuis des mois."', 
    CURRENT_DATE - INTERVAL '3 days', 'Gare SNCF', 
    ARRAY['rencontre', 'charité', 'dignité'], 'prive', 'approuve');

  INSERT INTO fioretti (user_id, element_type, element_id, contenu_affiche, anonyme, statut, date_publication, created_at)
  VALUES (user_pierre, 'grace', 'bb000001-0000-0000-0000-000000000002',
    jsonb_build_object(
      'texte', 'Ce matin, en me rendant au travail, j''ai croisé un sans-abri devant la gare. Au lieu de passer mon chemin, j''ai senti un appel à m''arrêter. Nous avons parlé 20 minutes. Il s''appelle Michel. Je lui ai offert un café. En repartant, il m''a dit : "Vous êtes le premier à me regarder comme un homme depuis des mois."',
      'date', CURRENT_DATE - INTERVAL '3 days',
      'lieu', 'Gare SNCF'
    ),
    false, 'approuve', CURRENT_DATE - INTERVAL '3 days', CURRENT_DATE - INTERVAL '3 days');

  -- ===== MARIE LEFÈVRE =====
  -- Grâce 1 (privée)
  INSERT INTO graces (id, user_id, texte, date, lieu, tags, visibilite, statut_partage)
  VALUES ('cc000001-0000-0000-0000-000000000001', user_marie,
    'Mes enfants ont prié spontanément avant le repas.', 
    CURRENT_DATE - INTERVAL '5 days', 'Maison', 
    ARRAY['famille', 'éducation'], 'prive', 'brouillon');
  
  -- Grâce 2 (partagée → Fioretti ANONYME)
  INSERT INTO graces (id, user_id, texte, date, lieu, tags, visibilite, statut_partage)
  VALUES ('cc000001-0000-0000-0000-000000000002', user_marie,
    'Ma voisine âgée était hospitalisée. Personne ne lui rendait visite. J''ai décidé d''y aller chaque jour pendant deux semaines. Au début méfiante, elle s''est ouverte. Elle m''a confié avoir perdu la foi après la mort de son mari. Nous avons prié ensemble hier. Elle pleurait de joie : "Je pensais que Dieu m''avait oubliée."', 
    CURRENT_DATE - INTERVAL '8 days', 'Hôpital', 
    ARRAY['visite', 'foi', 'espérance'], 'prive', 'approuve');

  INSERT INTO fioretti (user_id, element_type, element_id, contenu_affiche, anonyme, statut, date_publication, created_at)
  VALUES (user_marie, 'grace', 'cc000001-0000-0000-0000-000000000002',
    jsonb_build_object(
      'texte', 'Ma voisine âgée était hospitalisée. Personne ne lui rendait visite. J''ai décidé d''y aller chaque jour pendant deux semaines. Au début méfiante, elle s''est ouverte. Elle m''a confié avoir perdu la foi après la mort de son mari. Nous avons prié ensemble hier. Elle pleurait de joie : "Je pensais que Dieu m''avait oubliée."',
      'date', CURRENT_DATE - INTERVAL '8 days',
      'lieu', 'Hôpital'
    ),
    true, 'approuve', CURRENT_DATE - INTERVAL '8 days', CURRENT_DATE - INTERVAL '8 days');

  -- Grâce 3 (partagée → Fioretti NON ANONYME)
  INSERT INTO graces (id, user_id, texte, date, lieu, tags, visibilite, statut_partage)
  VALUES ('cc000001-0000-0000-0000-000000000003', user_marie,
    'Ma fille adolescente traversait une crise de foi. Au lieu de la forcer, j''ai prié et continué à vivre ma foi avec joie. Un soir, elle est entrée pendant mon chapelet et s''est assise à côté de moi. Aujourd''hui, elle prie avec moi chaque soir. Elle m''a dit : "C''est ta paix qui m''a donné envie de revenir."', 
    CURRENT_DATE - INTERVAL '12 days', 'Maison', 
    ARRAY['famille', 'témoignage', 'foi'], 'prive', 'approuve');

  INSERT INTO fioretti (user_id, element_type, element_id, contenu_affiche, anonyme, statut, date_publication, created_at)
  VALUES (user_marie, 'grace', 'cc000001-0000-0000-0000-000000000003',
    jsonb_build_object(
      'texte', 'Ma fille adolescente traversait une crise de foi. Au lieu de la forcer, j''ai prié et continué à vivre ma foi avec joie. Un soir, elle est entrée pendant mon chapelet et s''est assise à côté de moi. Aujourd''hui, elle prie avec moi chaque soir. Elle m''a dit : "C''est ta paix qui m''a donné envie de revenir."',
      'date', CURRENT_DATE - INTERVAL '12 days',
      'lieu', 'Maison'
    ),
    false, 'approuve', CURRENT_DATE - INTERVAL '12 days', CURRENT_DATE - INTERVAL '12 days');

  -- ===== THÉRÈSE MARTIN =====
  -- Grâce 1 (privée)
  INSERT INTO graces (id, user_id, texte, date, lieu, tags, visibilite, statut_partage)
  VALUES ('dd000001-0000-0000-0000-000000000001', user_therese,
    'Consolation profonde pendant l''adoration.', 
    CURRENT_DATE - INTERVAL '4 days', 'Chapelle', 
    ARRAY['adoration', 'consolation'], 'prive', 'brouillon');
  
  -- Grâce 2 (partagée → Fioretti NON ANONYME)
  INSERT INTO graces (id, user_id, texte, date, lieu, tags, visibilite, statut_partage)
  VALUES ('dd000001-0000-0000-0000-000000000002', user_therese,
    'Durant l''adoration, j''ai ressenti l''appel à prier pour une personne sans savoir qui. Le lendemain, ma petite-fille m''a appelée en larmes : enceinte et effrayée. Je lui ai dit que je priais pour elle depuis la veille. Elle a fondu en larmes : "Mamie, c''est un signe de Dieu." Aujourd''hui, elle garde son bébé avec joie.', 
    CURRENT_DATE - INTERVAL '15 days', 'Chapelle', 
    ARRAY['prière', 'providence', 'famille'], 'prive', 'approuve');

  INSERT INTO fioretti (user_id, element_type, element_id, contenu_affiche, anonyme, statut, date_publication, created_at)
  VALUES (user_therese, 'grace', 'dd000001-0000-0000-0000-000000000002',
    jsonb_build_object(
      'texte', 'Durant l''adoration, j''ai ressenti l''appel à prier pour une personne sans savoir qui. Le lendemain, ma petite-fille m''a appelée en larmes : enceinte et effrayée. Je lui ai dit que je priais pour elle depuis la veille. Elle a fondu en larmes : "Mamie, c''est un signe de Dieu." Aujourd''hui, elle garde son bébé avec joie.',
      'date', CURRENT_DATE - INTERVAL '15 days',
      'lieu', 'Chapelle'
    ),
    false, 'approuve', CURRENT_DATE - INTERVAL '15 days', CURRENT_DATE - INTERVAL '15 days');

  -- Grâce 3 (partagée → Fioretti ANONYME)
  INSERT INTO graces (id, user_id, texte, date, lieu, tags, visibilite, statut_partage)
  VALUES ('dd000001-0000-0000-0000-000000000003', user_therese,
    'J''ai perdu mon mari il y a 5 ans. La solitude était insupportable. J''ai décidé d''offrir ma souffrance pour les couples en difficulté. Ma nièce au bord du divorce m''a appelée. Nous avons prié ensemble. Aujourd''hui, son couple est restauré. Elle m''a dit : "Tes prières ont tout changé." Ma solitude a porté du fruit.', 
    CURRENT_DATE - INTERVAL '25 days', 'Maison', 
    ARRAY['offrande', 'intercession', 'couple'], 'prive', 'approuve');

  INSERT INTO fioretti (user_id, element_type, element_id, contenu_affiche, anonyme, statut, date_publication, created_at)
  VALUES (user_therese, 'grace', 'dd000001-0000-0000-0000-000000000003',
    jsonb_build_object(
      'texte', 'J''ai perdu mon mari il y a 5 ans. La solitude était insupportable. J''ai décidé d''offrir ma souffrance pour les couples en difficulté. Ma nièce au bord du divorce m''a appelée. Nous avons prié ensemble. Aujourd''hui, son couple est restauré. Elle m''a dit : "Tes prières ont tout changé." Ma solitude a porté du fruit.',
      'date', CURRENT_DATE - INTERVAL '25 days',
      'lieu', 'Maison'
    ),
    true, 'approuve', CURRENT_DATE - INTERVAL '25 days', CURRENT_DATE - INTERVAL '25 days');

  -- ===== JEAN ROUSSEAU =====
  -- Grâce 1 (privée)
  INSERT INTO graces (id, user_id, texte, date, lieu, tags, visibilite, statut_partage)
  VALUES ('ee000001-0000-0000-0000-000000000001', user_jean,
    'Réussite inattendue à mon examen.', 
    CURRENT_DATE - INTERVAL '6 days', 'Université', 
    ARRAY['études', 'providence'], 'prive', 'brouillon');
  
  -- Grâce 2 (partagée → Fioretti ANONYME)
  INSERT INTO graces (id, user_id, texte, date, lieu, tags, visibilite, statut_partage)
  VALUES ('ee000001-0000-0000-0000-000000000002', user_jean,
    'À la fac, un camarade athée se moquait de ma foi. Son père a eu un cancer. Il est venu me voir effondré : "Tu crois que prier peut changer quelque chose ?" On a prié ensemble. Trois mois plus tard, son père est en rémission. Il m''a dit : "Je ne me moquerai plus jamais de ta foi."', 
    CURRENT_DATE - INTERVAL '22 days', 'Université', 
    ARRAY['témoignage', 'prière', 'guérison'], 'prive', 'approuve');

  INSERT INTO fioretti (user_id, element_type, element_id, contenu_affiche, anonyme, statut, date_publication, created_at)
  VALUES (user_jean, 'grace', 'ee000001-0000-0000-0000-000000000002',
    jsonb_build_object(
      'texte', 'À la fac, un camarade athée se moquait de ma foi. Son père a eu un cancer. Il est venu me voir effondré : "Tu crois que prier peut changer quelque chose ?" On a prié ensemble. Trois mois plus tard, son père est en rémission. Il m''a dit : "Je ne me moquerai plus jamais de ta foi."',
      'date', CURRENT_DATE - INTERVAL '22 days',
      'lieu', 'Université'
    ),
    true, 'approuve', CURRENT_DATE - INTERVAL '22 days', CURRENT_DATE - INTERVAL '22 days');

  -- Grâce 3 (partagée → Fioretti NON ANONYME)
  INSERT INTO graces (id, user_id, texte, date, lieu, tags, visibilite, statut_partage)
  VALUES ('ee000001-0000-0000-0000-000000000003', user_jean,
    'Lors d''une soirée, un ami ivre allait repartir en voiture. J''ai insisté pour le ramener. Il était furieux. En chemin, il s''est effondré : il voulait en finir. Nous avons parlé toute la nuit. Je l''ai accompagné voir un psychologue. Six mois plus tard, il va mieux. Il m''a dit : "Tu m''as sauvé la vie."', 
    CURRENT_DATE - INTERVAL '18 days', 'Soirée étudiante', 
    ARRAY['amitié', 'sauvetage', 'présence'], 'prive', 'approuve');

  INSERT INTO fioretti (user_id, element_type, element_id, contenu_affiche, anonyme, statut, date_publication, created_at)
  VALUES (user_jean, 'grace', 'ee000001-0000-0000-0000-000000000003',
    jsonb_build_object(
      'texte', 'Lors d''une soirée, un ami ivre allait repartir en voiture. J''ai insisté pour le ramener. Il était furieux. En chemin, il s''est effondré : il voulait en finir. Nous avons parlé toute la nuit. Je l''ai accompagné voir un psychologue. Six mois plus tard, il va mieux. Il m''a dit : "Tu m''as sauvé la vie."',
      'date', CURRENT_DATE - INTERVAL '18 days',
      'lieu', 'Soirée étudiante'
    ),
    false, 'approuve', CURRENT_DATE - INTERVAL '18 days', CURRENT_DATE - INTERVAL '18 days');

  -- ===== CLAUDE FONTAINE =====
  -- Grâce 1 (privée)
  INSERT INTO graces (id, user_id, texte, date, lieu, tags, visibilite, statut_partage)
  VALUES ('ff000001-0000-0000-0000-000000000001', user_claude,
    'Joie profonde en célébrant la messe.', 
    CURRENT_DATE - INTERVAL '2 days', 'Église', 
    ARRAY['eucharistie', 'joie'], 'prive', 'brouillon');
  
  -- Grâce 2 (partagée → Fioretti NON ANONYME)
  INSERT INTO graces (id, user_id, texte, date, lieu, tags, visibilite, statut_partage)
  VALUES ('ff000001-0000-0000-0000-000000000002', user_claude,
    'Un jeune homme est venu au confessionnal après 15 ans d''absence. Il portait un fardeau : accident mortel causé en conduisant ivre. Il ne se pardonnait pas. Après la confession, je l''ai accompagné devant le Saint-Sacrement. Il a pleuré une heure. En repartant : "Pour la première fois depuis 15 ans, je peux respirer." La miséricorde de Dieu est infinie.', 
    CURRENT_DATE - INTERVAL '28 days', 'Confessionnal', 
    ARRAY['confession', 'miséricorde', 'pardon'], 'prive', 'approuve');

  INSERT INTO fioretti (user_id, element_type, element_id, contenu_affiche, anonyme, statut, date_publication, created_at)
  VALUES (user_claude, 'grace', 'ff000001-0000-0000-0000-000000000002',
    jsonb_build_object(
      'texte', 'Un jeune homme est venu au confessionnal après 15 ans d''absence. Il portait un fardeau : accident mortel causé en conduisant ivre. Il ne se pardonnait pas. Après la confession, je l''ai accompagné devant le Saint-Sacrement. Il a pleuré une heure. En repartant : "Pour la première fois depuis 15 ans, je peux respirer." La miséricorde de Dieu est infinie.',
      'date', CURRENT_DATE - INTERVAL '28 days',
      'lieu', 'Confessionnal'
    ),
    false, 'approuve', CURRENT_DATE - INTERVAL '28 days', CURRENT_DATE - INTERVAL '28 days');

  -- ===== ÉLISABETH DUPONT =====
  -- Grâce 1 (privée)
  INSERT INTO graces (id, user_id, texte, date, lieu, tags, visibilite, statut_partage)
  VALUES ('11000001-0000-0000-0000-000000000001', user_elisabeth,
    'Présence de Dieu dans le silence de la prière.', 
    CURRENT_DATE - INTERVAL '1 day', 'Monastère', 
    ARRAY['silence', 'présence'], 'prive', 'brouillon');
  
  -- Grâce 2 (partagée → Fioretti ANONYME)
  INSERT INTO graces (id, user_id, texte, date, lieu, tags, visibilite, statut_partage)
  VALUES ('11000001-0000-0000-0000-000000000002', user_elisabeth,
    'Dans notre communauté, nous prions pour les âmes du purgatoire. Une nuit, j''ai rêvé d''une femme qui me suppliait de prier. Le lendemain, en rangeant la sacristie, j''ai trouvé une vieille photo tombée d''un missel : c''était elle. Au dos : un nom et 1987. J''ai fait célébrer une messe. Depuis, une paix inexplicable m''habite. La communion des saints est réelle.', 
    CURRENT_DATE - INTERVAL '35 days', 'Monastère', 
    ARRAY['purgatoire', 'communion', 'prière'], 'prive', 'approuve');

  INSERT INTO fioretti (user_id, element_type, element_id, contenu_affiche, anonyme, statut, date_publication, created_at)
  VALUES (user_elisabeth, 'grace', '11000001-0000-0000-0000-000000000002',
    jsonb_build_object(
      'texte', 'Dans notre communauté, nous prions pour les âmes du purgatoire. Une nuit, j''ai rêvé d''une femme qui me suppliait de prier. Le lendemain, en rangeant la sacristie, j''ai trouvé une vieille photo tombée d''un missel : c''était elle. Au dos : un nom et 1987. J''ai fait célébrer une messe. Depuis, une paix inexplicable m''habite. La communion des saints est réelle.',
      'date', CURRENT_DATE - INTERVAL '35 days',
      'lieu', 'Monastère'
    ),
    true, 'approuve', CURRENT_DATE - INTERVAL '35 days', CURRENT_DATE - INTERVAL '35 days');

  -- Grâce 3 (partagée → Fioretti NON ANONYME)
  INSERT INTO graces (id, user_id, texte, date, lieu, tags, visibilite, statut_partage)
  VALUES ('11000001-0000-0000-0000-000000000003', user_elisabeth,
    'Une jeune femme a frappé à 3h du matin, en pleurs. Elle voulait se suicider. Nous l''avons accueillie, écoutée, priée avec elle toute la nuit. Elle est restée une semaine. Aujourd''hui, elle a retrouvé goût à la vie et vient régulièrement. Elle m''a dit : "Vous m''avez montré que l''Église est une mère." La vie consacrée, c''est être disponible.', 
    CURRENT_DATE - INTERVAL '5 days', 'Monastère', 
    ARRAY['accueil', 'vie', 'espérance'], 'prive', 'approuve');

  INSERT INTO fioretti (user_id, element_type, element_id, contenu_affiche, anonyme, statut, date_publication, created_at)
  VALUES (user_elisabeth, 'grace', '11000001-0000-0000-0000-000000000003',
    jsonb_build_object(
      'texte', 'Une jeune femme a frappé à 3h du matin, en pleurs. Elle voulait se suicider. Nous l''avons accueillie, écoutée, priée avec elle toute la nuit. Elle est restée une semaine. Aujourd''hui, elle a retrouvé goût à la vie et vient régulièrement. Elle m''a dit : "Vous m''avez montré que l''Église est une mère." La vie consacrée, c''est être disponible.',
      'date', CURRENT_DATE - INTERVAL '5 days',
      'lieu', 'Monastère'
    ),
    false, 'approuve', CURRENT_DATE - INTERVAL '5 days', CURRENT_DATE - INTERVAL '5 days');

  -- ===== FRANÇOIS BERNARD =====
  -- Grâce 1 (privée)
  INSERT INTO graces (id, user_id, texte, date, lieu, tags, visibilite, statut_partage)
  VALUES ('22000001-0000-0000-0000-000000000001', user_francois,
    'Rencontre touchante avec une famille dans le besoin.', 
    CURRENT_DATE - INTERVAL '9 days', 'Paroisse', 
    ARRAY['charité', 'service'], 'prive', 'brouillon');
  
  -- Grâce 2 (partagée → Fioretti NON ANONYME)
  INSERT INTO graces (id, user_id, texte, date, lieu, tags, visibilite, statut_partage)
  VALUES ('22000001-0000-0000-0000-000000000002', user_francois,
    'Chaque semaine, je visite les détenus. Un homme condamné à perpétuité ne croyait pas au pardon. Pendant 6 mois, je suis venu sans rien attendre. Un jour, il m''a demandé une Bible. Aujourd''hui, il anime un groupe de prière en prison et a écrit à sa victime. Il m''a dit : "Vous m''avez montré que l''amour est plus fort que la haine."', 
    CURRENT_DATE - INTERVAL '42 days', 'Prison', 
    ARRAY['prison', 'pardon', 'persévérance'], 'prive', 'approuve');

  INSERT INTO fioretti (user_id, element_type, element_id, contenu_affiche, anonyme, statut, date_publication, created_at)
  VALUES (user_francois, 'grace', '22000001-0000-0000-0000-000000000002',
    jsonb_build_object(
      'texte', 'Chaque semaine, je visite les détenus. Un homme condamné à perpétuité ne croyait pas au pardon. Pendant 6 mois, je suis venu sans rien attendre. Un jour, il m''a demandé une Bible. Aujourd''hui, il anime un groupe de prière en prison et a écrit à sa victime. Il m''a dit : "Vous m''avez montré que l''amour est plus fort que la haine."',
      'date', CURRENT_DATE - INTERVAL '42 days',
      'lieu', 'Prison'
    ),
    false, 'approuve', CURRENT_DATE - INTERVAL '42 days', CURRENT_DATE - INTERVAL '42 days');

  RAISE NOTICE '✅ GRÂCES ET FIORETTI CRÉÉS';
END $$;

-- =====================================================================
-- RÉSUMÉ FINAL
-- =====================================================================

SELECT '🎉 PARTIE 3/3 TERMINÉE - BASE DE DONNÉES PRÊTE !' as message;

SELECT 
  '📊 RÉSUMÉ FINAL' as section,
  (SELECT COUNT(*) FROM profiles WHERE prenom IS NOT NULL) as profils_total,
  (SELECT COUNT(*) FROM profiles WHERE role = 'superadmin') as superadmins,
  (SELECT COUNT(*) FROM profiles WHERE role = 'moderateur') as moderateurs,
  (SELECT COUNT(*) FROM graces) as graces_total,
  (SELECT COUNT(*) FROM fioretti WHERE statut = 'approuve') as fioretti_approuves,
  (SELECT COUNT(*) FROM fioretti WHERE anonyme = true) as fioretti_anonymes,
  (SELECT COUNT(*) FROM fioretti WHERE anonyme = false) as fioretti_non_anonymes;

SELECT 
  '👥 PROFILS FINAUX' as section,
  prenom || ' ' || nom as nom_complet,
  email,
  COALESCE(role, 'user') as role
FROM profiles
WHERE prenom IS NOT NULL
ORDER BY 
  CASE role 
    WHEN 'superadmin' THEN 1 
    WHEN 'moderateur' THEN 2 
    ELSE 3 
  END,
  prenom;

SELECT 
  '🌸 FIORETTI PAR UTILISATEUR' as section,
  p.prenom || ' ' || p.nom as auteur,
  COUNT(*) as nombre_fioretti,
  SUM(CASE WHEN f.anonyme THEN 1 ELSE 0 END) as anonymes,
  SUM(CASE WHEN NOT f.anonyme THEN 1 ELSE 0 END) as non_anonymes
FROM fioretti f
JOIN profiles p ON f.user_id = p.id
GROUP BY p.id, p.prenom, p.nom
ORDER BY nombre_fioretti DESC;
