/**
 * ============================================================================
 * TABLE DE CORRESPONDANCE COMPLÈTE AELF
 * ============================================================================
 * 
 * URL Pattern: https://www.aelf.org/bible/{CODE}/{CHAPITRE}
 * 
 * Générée le: 2026-01-04
 * Source: https://www.aelf.org/bible + recherches web
 * 
 * NOTES IMPORTANTES:
 * - Les URLs sont insensibles à la casse
 * - Certains livres commencent au chapitre 0 (marqués avec *)
 * - La Lettre de Jérémie utilise le code spécial "XXX"
 * - Les Psaumes incluent: 1-150 + 9A, 9B, 113A, 113B
 */

// ============================================================================
// LISTE COMPLÈTE DES 73 LIVRES + PSAUMES
// ============================================================================

export const AELF_BOOKS_LIST = [
  // -------------------------------------------------------------------------
  // ANCIEN TESTAMENT - PENTATEUQUE (5 livres)
  // -------------------------------------------------------------------------
  { code: 'Gn', fullName: 'Livre de la Genèse', chapters: 50, testament: 'AT' },
  { code: 'Ex', fullName: "Livre de l'Exode", chapters: 40, testament: 'AT' },
  { code: 'Lv', fullName: 'Livre du Lévitique', chapters: 27, testament: 'AT' },
  { code: 'Nb', fullName: 'Livre des Nombres', chapters: 36, testament: 'AT' },
  { code: 'Dt', fullName: 'Livre du Deutéronome', chapters: 34, testament: 'AT' },

  // -------------------------------------------------------------------------
  // ANCIEN TESTAMENT - LIVRES HISTORIQUES (16 livres)
  // -------------------------------------------------------------------------
  { code: 'Jos', fullName: 'Livre de Josué', chapters: 24, testament: 'AT' },
  { code: 'Jg', fullName: 'Livre des Juges', chapters: 21, testament: 'AT' },
  { code: 'Rt', fullName: 'Livre de Ruth', chapters: 4, testament: 'AT' },
  { code: '1S', fullName: 'Premier livre de Samuel', chapters: 31, testament: 'AT' },
  { code: '2S', fullName: 'Deuxième livre de Samuel', chapters: 24, testament: 'AT' },
  { code: '1R', fullName: 'Premier livre des Rois', chapters: 22, testament: 'AT' },
  { code: '2R', fullName: 'Deuxième livre des Rois', chapters: 25, testament: 'AT' },
  { code: '1Ch', fullName: 'Premier livre des Chroniques', chapters: 29, testament: 'AT' },
  { code: '2Ch', fullName: 'Deuxième livre des Chroniques', chapters: 36, testament: 'AT' },
  { code: 'Esd', fullName: "Livre d'Esdras", chapters: 10, testament: 'AT' },
  { code: 'Ne', fullName: 'Livre de Néhémie', chapters: 13, testament: 'AT' },
  { code: 'Tb', fullName: 'Livre de Tobie', chapters: 14, testament: 'AT' },
  { code: 'Jdt', fullName: 'Livre de Judith', chapters: 16, testament: 'AT' },
  { code: 'Est', fullName: "Livre d'Esther", chapters: 10, testament: 'AT', startsAt: 0 },
  { code: '1M', fullName: "Premier Livre des Martyrs d'Israël", chapters: 16, testament: 'AT' },
  { code: '2M', fullName: "Deuxième Livre des Martyrs d'Israël", chapters: 15, testament: 'AT' },

  // -------------------------------------------------------------------------
  // ANCIEN TESTAMENT - LIVRES POÉTIQUES ET SAPIENTIAUX (7 livres)
  // -------------------------------------------------------------------------
  { code: 'Jb', fullName: 'Livre de Job', chapters: 42, testament: 'AT' },
  { code: 'Ps', fullName: 'Psaumes', chapters: 150, testament: 'PS', special: ['9A', '9B', '113A', '113B'] },
  { code: 'Pr', fullName: 'Livre des Proverbes', chapters: 31, testament: 'AT' },
  { code: 'Qo', fullName: "L'ecclésiaste (Qohélet)", chapters: 12, testament: 'AT' },
  { code: 'Ct', fullName: 'Cantique des cantiques', chapters: 8, testament: 'AT' },
  { code: 'Sg', fullName: 'Livre de la Sagesse', chapters: 19, testament: 'AT' },
  { code: 'Si', fullName: 'Livre de Ben Sira le Sage (Siracide)', chapters: 51, testament: 'AT', startsAt: 0 },

  // -------------------------------------------------------------------------
  // ANCIEN TESTAMENT - PROPHÈTES (18 livres)
  // -------------------------------------------------------------------------
  { code: 'Is', fullName: "Livre d'Isaïe", chapters: 66, testament: 'AT' },
  { code: 'Jr', fullName: 'Livre de Jérémie', chapters: 52, testament: 'AT' },
  { code: 'Lm', fullName: 'Livre des lamentations de Jérémie', chapters: 5, testament: 'AT' },
  { code: 'Ba', fullName: 'Livre de Baruch', chapters: 5, testament: 'AT' },
  { code: 'XXX', fullName: 'Lettre de Jérémie', chapters: 1, testament: 'AT', startsAt: 0 },
  { code: 'Ez', fullName: "Livre d'Ezekiel", chapters: 48, testament: 'AT' },
  { code: 'Dn', fullName: 'Livre de Daniel', chapters: 14, testament: 'AT' },
  { code: 'Os', fullName: "Livre d'Osée", chapters: 14, testament: 'AT' },
  { code: 'Jl', fullName: 'Livre de Joël', chapters: 4, testament: 'AT' },
  { code: 'Am', fullName: "Livre d'Amos", chapters: 9, testament: 'AT' },
  { code: 'Ab', fullName: "Livre d'Abdias", chapters: 1, testament: 'AT', startsAt: 0 },
  { code: 'Jon', fullName: 'Livre de Jonas', chapters: 4, testament: 'AT' },
  { code: 'Mi', fullName: 'Livre de Michée', chapters: 7, testament: 'AT' },
  { code: 'Na', fullName: 'Livre de Nahum', chapters: 3, testament: 'AT' },
  { code: 'Ha', fullName: "Livre d'Habaquc", chapters: 3, testament: 'AT' },
  { code: 'So', fullName: 'Livre de Sophonie', chapters: 3, testament: 'AT' },
  { code: 'Ag', fullName: "Livre d'Aggée", chapters: 2, testament: 'AT' },
  { code: 'Za', fullName: 'Livre de Zacharie', chapters: 14, testament: 'AT' },
  { code: 'Ml', fullName: 'Livre de Malachie', chapters: 3, testament: 'AT' },

  // -------------------------------------------------------------------------
  // NOUVEAU TESTAMENT - ÉVANGILES (4 livres)
  // -------------------------------------------------------------------------
  { code: 'Mt', fullName: 'Evangile de Jésus-Christ selon saint Matthieu', chapters: 28, testament: 'NT' },
  { code: 'Mc', fullName: 'Evangile de Jésus-Christ selon saint Marc', chapters: 16, testament: 'NT' },
  { code: 'Lc', fullName: 'Evangile de Jésus-Christ selon saint Luc', chapters: 24, testament: 'NT' },
  { code: 'Jn', fullName: 'Evangile de Jésus-Christ selon saint Jean', chapters: 21, testament: 'NT' },

  // -------------------------------------------------------------------------
  // NOUVEAU TESTAMENT - ACTES (1 livre)
  // -------------------------------------------------------------------------
  { code: 'Ac', fullName: 'Livre des Actes des Apôtres', chapters: 28, testament: 'NT' },

  // -------------------------------------------------------------------------
  // NOUVEAU TESTAMENT - LETTRES DE PAUL (13 livres)
  // -------------------------------------------------------------------------
  { code: 'Rm', fullName: 'Lettre de saint Paul Apôtre aux Romains', chapters: 16, testament: 'NT' },
  { code: '1Co', fullName: 'Première lettre de saint Paul Apôtre aux Corinthiens', chapters: 16, testament: 'NT' },
  { code: '2Co', fullName: 'Deuxième lettre de saint Paul Apôtre aux Corinthiens', chapters: 13, testament: 'NT' },
  { code: 'Ga', fullName: 'Lettre de saint Paul Apôtre aux Galates', chapters: 6, testament: 'NT' },
  { code: 'Ep', fullName: 'Lettre de saint Paul Apôtre aux Ephésiens', chapters: 6, testament: 'NT' },
  { code: 'Ph', fullName: 'Lettre de saint Paul Apôtre aux Philippiens', chapters: 4, testament: 'NT' },
  { code: 'Col', fullName: 'Lettre de saint Paul Apôtre aux Colossiens', chapters: 4, testament: 'NT' },
  { code: '1Th', fullName: 'Première lettre de saint Paul Apôtre aux Thessaloniciens', chapters: 5, testament: 'NT' },
  { code: '2Th', fullName: 'Deuxième lettre de saint Paul Apôtre aux Thessaloniciens', chapters: 3, testament: 'NT' },
  { code: '1Tm', fullName: 'Première lettre de saint Paul Apôtre à Timothée', chapters: 6, testament: 'NT' },
  { code: '2Tm', fullName: 'Deuxième lettre de saint Paul Apôtre à Timothée', chapters: 4, testament: 'NT' },
  { code: 'Tt', fullName: 'Lettre de saint Paul Apôtre à Tite', chapters: 3, testament: 'NT' },
  { code: 'Phm', fullName: 'Lettre de saint Paul Apôtre à Philémon', chapters: 1, testament: 'NT' },

  // -------------------------------------------------------------------------
  // NOUVEAU TESTAMENT - AUTRES LETTRES (8 livres)
  // -------------------------------------------------------------------------
  { code: 'He', fullName: 'Lettre aux Hébreux', chapters: 13, testament: 'NT' },
  { code: 'Jc', fullName: 'Lettre de saint Jacques Apôtre', chapters: 5, testament: 'NT' },
  { code: '1P', fullName: 'Première lettre de saint Pierre Apôtre', chapters: 5, testament: 'NT' },
  { code: '2P', fullName: 'Deuxième lettre de saint Pierre Apôtre', chapters: 3, testament: 'NT' },
  { code: '1Jn', fullName: 'Première lettre de saint Jean', chapters: 5, testament: 'NT' },
  { code: '2Jn', fullName: 'Deuxième lettre de saint Jean', chapters: 1, testament: 'NT' },
  { code: '3Jn', fullName: 'Troisième lettre de saint Jean', chapters: 1, testament: 'NT' },
  { code: 'Jude', fullName: 'Lettre de saint Jude', chapters: 1, testament: 'NT' },

  // -------------------------------------------------------------------------
  // NOUVEAU TESTAMENT - APOCALYPSE (1 livre)
  // -------------------------------------------------------------------------
  { code: 'Ap', fullName: "Livre de l'Apocalypse", chapters: 22, testament: 'NT' },
];

// ============================================================================
// MAPPING COMPLET: NOMS/ALIAS → CODE AELF
// ============================================================================

export const BOOK_MAPPING: Record<string, string> = {
  // --- PENTATEUQUE ---
  'genèse': 'Gn', 'genese': 'Gn', 'gen': 'Gn', 'gn': 'Gn', 'genesis': 'Gn',
  'exode': 'Ex', 'ex': 'Ex', 'exodus': 'Ex',
  'lévitique': 'Lv', 'levitique': 'Lv', 'lev': 'Lv', 'lv': 'Lv',
  'nombres': 'Nb', 'nb': 'Nb', 'nom': 'Nb',
  'deutéronome': 'Dt', 'deuteronome': 'Dt', 'deut': 'Dt', 'dt': 'Dt',

  // --- LIVRES HISTORIQUES ---
  'josué': 'Jos', 'josue': 'Jos', 'jos': 'Jos',
  'juges': 'Jg', 'jg': 'Jg', 'jug': 'Jg',
  'ruth': 'Rt', 'rt': 'Rt', 'ru': 'Rt',

  '1 samuel': '1S', '1samuel': '1S', '1 sam': '1S', '1sam': '1S', '1s': '1S',
  'i samuel': '1S', 'premier samuel': '1S', '1er samuel': '1S',
  '2 samuel': '2S', '2samuel': '2S', '2 sam': '2S', '2sam': '2S', '2s': '2S',
  'ii samuel': '2S', 'deuxième samuel': '2S', '2e samuel': '2S',

  '1 rois': '1R', '1rois': '1R', '1 r': '1R', '1r': '1R',
  'i rois': '1R', 'premier rois': '1R', '1er rois': '1R',
  '2 rois': '2R', '2rois': '2R', '2 r': '2R', '2r': '2R',
  'ii rois': '2R', 'deuxième rois': '2R', '2e rois': '2R',

  '1 chroniques': '1Ch', '1chroniques': '1Ch', '1 ch': '1Ch', '1ch': '1Ch',
  'i chroniques': '1Ch', 'premier chroniques': '1Ch', '1er chroniques': '1Ch',
  '2 chroniques': '2Ch', '2chroniques': '2Ch', '2 ch': '2Ch', '2ch': '2Ch',
  'ii chroniques': '2Ch', 'deuxième chroniques': '2Ch', '2e chroniques': '2Ch',

  'esdras': 'Esd', 'esd': 'Esd', 'ezr': 'Esd', 'ezra': 'Esd',
  'néhémie': 'Ne', 'nehemie': 'Ne', 'ne': 'Ne', 'neh': 'Ne',
  'tobie': 'Tb', 'tb': 'Tb', 'tob': 'Tb', 'tobit': 'Tb',
  'judith': 'Jdt', 'jdt': 'Jdt',
  'esther': 'Est', 'est': 'Est', 'esth': 'Est',

  '1 maccabées': '1M', '1maccabées': '1M', '1 m': '1M', '1m': '1M',
  'i maccabées': '1M', '1 mac': '1M', '1mac': '1M',
  'premier maccabées': '1M', "premier livre des martyrs d'israël": '1M',
  '2 maccabées': '2M', '2maccabées': '2M', '2 m': '2M', '2m': '2M',
  'ii maccabées': '2M', '2 mac': '2M', '2mac': '2M',
  'deuxième maccabées': '2M', "deuxième livre des martyrs d'israël": '2M',

  // --- LIVRES POÉTIQUES ET SAPIENTIAUX ---
  'job': 'Jb', 'jb': 'Jb',
  'psaume': 'Ps', 'psaumes': 'Ps', 'ps': 'Ps', 'psalm': 'Ps',
  'proverbes': 'Pr', 'pr': 'Pr', 'prov': 'Pr',

  'ecclésiaste': 'Qo', 'ecclesiaste': 'Qo', 'qohélet': 'Qo', 'qohelet': 'Qo',
  'qo': 'Qo', 'ecc': 'Qo', 'ec': 'Qo', 'qoheleth': 'Qo',

  'cantique des cantiques': 'Ct', 'cantique': 'Ct', 'ct': 'Ct', 'cant': 'Ct',
  'sagesse': 'Sg', 'sg': 'Sg', 'sag': 'Sg',

  'ben sira': 'Si', 'ben sira le sage': 'Si', 'siracide': 'Si',
  'si': 'Si', 'sir': 'Si', 'ecclésiastique': 'Si', 'ecclesiastique': 'Si',

  // --- PROPHÈTES ---
  'isaïe': 'Is', 'isaie': 'Is', 'is': 'Is', 'isa': 'Is',
  'jérémie': 'Jr', 'jeremie': 'Jr', 'jr': 'Jr', 'jer': 'Jr',

  'lamentations': 'Lm', 'lamentations de jérémie': 'Lm', 'lm': 'Lm', 'lam': 'Lm',
  'baruch': 'Ba', 'ba': 'Ba', 'bar': 'Ba',

  'lettre de jérémie': 'XXX', 'lettre de jeremie': 'XXX', 'xxx': 'XXX',
  'épître de jérémie': 'XXX', 'epitre de jeremie': 'XXX',

  'ezékiel': 'Ez', 'ezechiel': 'Ez', 'ézékiel': 'Ez', 'ez': 'Ez', 'ezek': 'Ez', 'ezekiel': 'Ez',
  'daniel': 'Dn', 'dn': 'Dn', 'dan': 'Dn',
  'osée': 'Os', 'osee': 'Os', 'os': 'Os',
  'joël': 'Jl', 'joel': 'Jl', 'jl': 'Jl',
  'amos': 'Am', 'am': 'Am',
  'abdias': 'Ab', 'ab': 'Ab', 'obadiah': 'Ab',
  'jonas': 'Jon', 'jon': 'Jon',
  'michée': 'Mi', 'michee': 'Mi', 'mi': 'Mi', 'mic': 'Mi',
  'nahum': 'Na', 'na': 'Na', 'nah': 'Na',
  'habacuc': 'Ha', 'habaquq': 'Ha', 'habaquc': 'Ha', 'ha': 'Ha', 'hab': 'Ha',
  'sophonie': 'So', 'so': 'So', 'soph': 'So',
  'aggée': 'Ag', 'aggee': 'Ag', 'ag': 'Ag',
  'zacharie': 'Za', 'za': 'Za', 'zach': 'Za',
  'malachie': 'Ml', 'ml': 'Ml', 'mal': 'Ml',

  // --- ÉVANGILES ---
  'matthieu': 'Mt', 'mt': 'Mt', 'mat': 'Mt', 'matt': 'Mt', 'matthew': 'Mt',
  'saint matthieu': 'Mt', 'évangile selon matthieu': 'Mt',
  'marc': 'Mc', 'mc': 'Mc', 'mr': 'Mc', 'mark': 'Mc', 'saint marc': 'Mc',
  'luc': 'Lc', 'lc': 'Lc', 'luke': 'Lc', 'saint luc': 'Lc',
  'jean': 'Jn', 'jn': 'Jn', 'john': 'Jn', 'saint jean': 'Jn',

  // --- ACTES ---
  'actes': 'Ac', 'actes des apôtres': 'Ac', 'actes des apotres': 'Ac',
  'ac': 'Ac', 'act': 'Ac', 'acts': 'Ac',

  // --- LETTRES DE PAUL ---
  'romains': 'Rm', 'rm': 'Rm', 'rom': 'Rm',

  '1 corinthiens': '1Co', '1corinthiens': '1Co', '1 co': '1Co', '1co': '1Co',
  'i corinthiens': '1Co', 'premier corinthiens': '1Co', '1 cor': '1Co',
  '2 corinthiens': '2Co', '2corinthiens': '2Co', '2 co': '2Co', '2co': '2Co',
  'ii corinthiens': '2Co', 'deuxième corinthiens': '2Co', '2 cor': '2Co',

  'galates': 'Ga', 'ga': 'Ga', 'gal': 'Ga',
  'éphésiens': 'Ep', 'ephesiens': 'Ep', 'ep': 'Ep', 'eph': 'Ep',
  'philippiens': 'Ph', 'ph': 'Ph', 'phil': 'Ph',
  'colossiens': 'Col', 'col': 'Col',

  '1 thessaloniciens': '1Th', '1thessaloniciens': '1Th', '1 th': '1Th', '1th': '1Th',
  'i thessaloniciens': '1Th', '1 thess': '1Th',
  '2 thessaloniciens': '2Th', '2thessaloniciens': '2Th', '2 th': '2Th', '2th': '2Th',
  'ii thessaloniciens': '2Th', '2 thess': '2Th',

  '1 timothée': '1Tm', '1timothée': '1Tm', '1 tm': '1Tm', '1tm': '1Tm',
  'i timothée': '1Tm', '1 tim': '1Tm', '1timothee': '1Tm', '1 timothee': '1Tm', 'timothee 1': '1Tm', 'timothée 1': '1Tm',
  '2 timothée': '2Tm', '2timothée': '2Tm', '2 tm': '2Tm', '2tm': '2Tm',
  'ii timothée': '2Tm', '2 tim': '2Tm', '2timothee': '2Tm', '2 timothee': '2Tm', 'timothee 2': '2Tm', 'timothée 2': '2Tm',

  'tite': 'Tt', 'tt': 'Tt', 'tit': 'Tt',
  'philémon': 'Phm', 'philemon': 'Phm', 'phm': 'Phm',

  // --- AUTRES LETTRES ---
  'hébreux': 'He', 'hebreux': 'He', 'he': 'He', 'heb': 'He',
  'jacques': 'Jc', 'jc': 'Jc', 'jac': 'Jc',

  '1 pierre': '1P', '1pierre': '1P', '1 p': '1P', '1p': '1P',
  'i pierre': '1P', 'premier pierre': '1P', '1 pet': '1P',
  '2 pierre': '2P', '2pierre': '2P', '2 p': '2P', '2p': '2P',
  'ii pierre': '2P', 'deuxième pierre': '2P', '2 pet': '2P',

  '1 jean': '1Jn', '1jean': '1Jn', '1 jn': '1Jn', '1jn': '1Jn', 'i jean': '1Jn',
  '2 jean': '2Jn', '2jean': '2Jn', '2 jn': '2Jn', '2jn': '2Jn', 'ii jean': '2Jn',
  '3 jean': '3Jn', '3jean': '3Jn', '3 jn': '3Jn', '3jn': '3Jn', 'iii jean': '3Jn',

  'jude': 'Jude', 'jd': 'Jude',

  // --- APOCALYPSE ---
  'apocalypse': 'Ap', 'ap': 'Ap', 'apoc': 'Ap', 'revelation': 'Ap',
  "livre de l'apocalypse": 'Ap',
};

// ============================================================================
// RÉCAPITULATIF RAPIDE
// ============================================================================
/*
TOTAL: 73 livres + Psaumes

ANCIEN TESTAMENT (46 livres):
- Pentateuque: Gn, Ex, Lv, Nb, Dt (5)
- Historiques: Jos, Jg, Rt, 1S, 2S, 1R, 2R, 1Ch, 2Ch, Esd, Ne, Tb, Jdt, Est*, 1M, 2M (16)
- Poétiques: Jb, Ps, Pr, Qo, Ct, Sg, Si* (7)
- Prophètes: Is, Jr, Lm, Ba, XXX*, Ez, Dn, Os, Jl, Am, Ab, Jon, Mi, Na, Ha, So, Ag, Za, Ml (18)

NOUVEAU TESTAMENT (27 livres):
- Évangiles: Mt, Mc, Lc, Jn (4)
- Actes: Ac (1)
- Lettres Paul: Rm, 1Co, 2Co, Ga, Ep, Ph, Col, 1Th, 2Th, 1Tm, 2Tm, Tt, Phm (13)
- Autres lettres: He, Jc, 1P, 2P, 1Jn, 2Jn, 3Jn, Jude (8)
- Apocalypse: Ap (1)

* = commence au chapitre 0

PSAUMES SPÉCIAUX: 9A, 9B, 113A, 113B (en plus de 1-150)

ATTENTION - CODE SPÉCIAL:
- La "Lettre de Jérémie" utilise le code "XXX" (pas de code standard)
  URL: https://www.aelf.org/bible/XXX/0
*/
