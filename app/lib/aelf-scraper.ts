
import * as cheerio from 'cheerio';

export interface BibleVerse {
    ref: string;
    text: string;
    verseNumber: number;
}

export interface BibleChapter {
    book: string;
    chapter: number;
    verses: BibleVerse[];
    sourceUrl: string;
}

// Mapping des abréviations courantes vers les slugs AELF (respectant la casse)
const BOOK_MAPPING: Record<string, string> = {
    // Ancien Testament
    'gn': 'Gn', 'gen': 'Gn', 'genese': 'Gn', 'genèse': 'Gn',
    'ex': 'Ex', 'exode': 'Ex',
    'lv': 'Lv', 'lev': 'Lv', 'levitique': 'Lv', 'lévitique': 'Lv',
    'nb': 'Nb', 'nombres': 'Nb',
    'dt': 'Dt', 'deut': 'Dt', 'deuteronome': 'Dt', 'deutéronome': 'Dt',
    'jos': 'Jos', 'josue': 'Jos', 'josué': 'Jos',
    'jg': 'Jg', 'juges': 'Jg',
    'rt': 'Rt', 'ruth': 'Rt',
    '1s': '1S', '1sam': '1S', '1_samuel': '1S', '1samuel': '1S',
    '2s': '2S', '2sam': '2S', '2_samuel': '2S', '2samuel': '2S',
    '1r': '1R', '1rois': '1R', '1_rois': '1R',
    '2r': '2R', '2rois': '2R', '2_rois': '2R',
    '1ch': '1Ch', '1chron': '1Ch', '1_chroniques': '1Ch', '1chroniques': '1Ch',
    '2ch': '2Ch', '2chron': '2Ch', '2_chroniques': '2Ch', '2chroniques': '2Ch',
    'esd': 'Esd', 'esdras': 'Esd',
    'ne': 'Ne', 'neh': 'Ne', 'nehemie': 'Ne', 'néhémie': 'Ne',
    'tb': 'Tb', 'tob': 'Tb', 'tobie': 'Tb',
    'jdt': 'Jdt', 'judith': 'Jdt',
    'est': 'Est', 'esther': 'Est',
    '1m': '1M', '1mac': '1M', '1_maccabees': '1M', '1maccabees': '1M', '1maccabées': '1M', '1macchabées': '1M',
    '2m': '2M', '2mac': '2M', '2_maccabees': '2M', '2maccabees': '2M', '2maccabées': '2M', '2macchabées': '2M',
    'jb': 'Jb', 'job': 'Jb',
    'ps': 'Ps', 'psaume': 'Ps', 'psaumes': 'Ps',
    'pr': 'Pr', 'prov': 'Pr', 'proverbes': 'Pr',
    'qo': 'Qo', 'eccl': 'Qo', 'qohleth': 'Qo', 'ecclesiaste': 'Qo', 'ecclés': 'Qo', 'ecclésiaste': 'Qo',
    'ct': 'Ct', 'cant': 'Ct', 'cantique': 'Ct', 'cantiques': 'Ct',
    'sg': 'Sg', 'sag': 'Sg', 'sagesse': 'Sg',
    'si': 'Si', 'sir': 'Si', 'ecclesiastique': 'Si', 'siracide': 'Si', 'ecclésiastique': 'Si',
    'is': 'Is', 'isaie': 'Is', 'isaïe': 'Is', 'isa': 'Is',
    'jr': 'Jr', 'jer': 'Jr', 'jeremie': 'Jr', 'jérémie': 'Jr',
    'lm': 'Lm', 'lam': 'Lm', 'lamentations': 'Lm',
    'ba': 'Ba', 'bar': 'Ba', 'baruch': 'Ba',
    'ez': 'Ez', 'ezek': 'Ez', 'ezechiel': 'Ez', 'ézéchiel': 'Ez', 'ezéchiel': 'Ez',
    'dn': 'Dn', 'dan': 'Dn', 'daniel': 'Dn',
    'os': 'Os', 'osee': 'Os', 'osée': 'Os',
    'jl': 'Jl', 'joel': 'Jl', 'joël': 'Jl',
    'am': 'Am', 'amos': 'Am',
    'ab': 'Ab', 'abd': 'Ab', 'abdias': 'Ab',
    'jon': 'Jon', 'jonas': 'Jon',
    'mi': 'Mi', 'mich': 'Mi', 'michee': 'Mi', 'michée': 'Mi',
    'na': 'Na', 'nah': 'Na', 'nahoum': 'Na',
    'ha': 'Ha', 'hab': 'Ha', 'habaquq': 'Ha', 'habacuc': 'Ha',
    'so': 'So', 'soph': 'So', 'sophonie': 'So',
    'ag': 'Ag', 'agg': 'Ag', 'aggee': 'Ag', 'aggée': 'Ag',
    'za': 'Za', 'zach': 'Za', 'zacharie': 'Za',
    'ml': 'Ml', 'mal': 'Ml', 'malachie': 'Ml',

    // Nouveau Testament
    'mt': 'Mt', 'mat': 'Mt', 'matthieu': 'Mt', 'matth': 'Mt',
    'mc': 'Mc', 'marc': 'Mc', 'mar': 'Mc',
    'lc': 'Lc', 'luc': 'Lc',
    'jn': 'Jn', 'jean': 'Jn',
    'ac': 'Ac', 'act': 'Ac', 'actes': 'Ac',
    'rm': 'Rm', 'rom': 'Rm', 'romains': 'Rm',
    '1co': '1Co', '1cor': '1Co', '1_corinthiens': '1Co', '1corinthiens': '1Co',
    '2co': '2Co', '2cor': '2Co', '2_corinthiens': '2Co', '2corinthiens': '2Co',
    'ga': 'Ga', 'gal': 'Ga', 'galates': 'Ga',
    'ep': 'Ep', 'eph': 'Ep', 'ephesiens': 'Ep', 'éphésiens': 'Ep',
    'ph': 'Ph', 'phil': 'Ph', 'philippiens': 'Ph',
    'col': 'Col', 'colossiens': 'Col',
    '1th': '1Th', '1thes': '1Th', '1_thessaloniciens': '1Th', '1thessaloniciens': '1Th',
    '2th': '2Th', '2thes': '2Th', '2_thessaloniciens': '2Th', '2thessaloniciens': '2Th',
    '1tm': '1Tm', '1tim': '1Tm', '1_timothee': '1Tm', '1timothée': '1Tm', '1timothee': '1Tm',
    '2tm': '2Tm', '2tim': '2Tm', '2_timothee': '2Tm', '2timothée': '2Tm', '2timothee': '2Tm',
    'tt': 'Tt', 'tit': 'Tt', 'tite': 'Tt',
    'phm': 'Phm', 'philem': 'Phm', 'philemon': 'Phm', 'philémon': 'Phm',
    'he': 'He', 'heb': 'He', 'hebreux': 'He', 'hébreux': 'He',
    'jc': 'Jc', 'jac': 'Jc', 'jacques': 'Jc',
    '1p': '1P', '1pier': '1P', '1_pierre': '1P', '1pierre': '1P',
    '2p': '2P', '2pier': '2P', '2_pierre': '2P', '2pierre': '2P',
    '1jn': '1Jn', '1_jean': '1Jn', '1jean': '1Jn',
    '2jn': '2Jn', '2_jean': '2Jn', '2jean': '2Jn',
    '3jn': '3Jn', '3_jean': '3Jn', '3jean': '3Jn',
    'jud': 'Jude', 'jude': 'Jude',
    'ap': 'Ap', 'apoc': 'Ap', 'apocalypse': 'Ap'
};

function normalizeBook(input: string): string | null {
    const cleanInput = input.toLowerCase().replace(/[^a-z0-9]/g, '');
    return BOOK_MAPPING[cleanInput] || null;
}

export async function fetchAelfChapter(reference: string): Promise<BibleChapter> {
    // Parsing simple de la référence (ex: "Mt 5" ou "Jean 3")
    const match = reference.match(/^([1-9]?[a-zA-Z]+)\s*(\d+)/);

    if (!match) {
        throw new Error('Format invalide. Utilisez le format "Livre Chapitre" (ex: Mt 5)');
    }

    const [, bookRaw, chapterRaw] = match;
    const bookSlug = normalizeBook(bookRaw);
    const chapter = parseInt(chapterRaw, 10);

    if (!bookSlug) {
        throw new Error(`Livre inconnu: ${bookRaw}`);
    }

    const url = `https://www.aelf.org/bible/${bookSlug}/${chapter}`;
    console.log(`Fetching AELF: ${url}`);

    const response = await fetch(url);

    if (!response.ok) {
        if (response.status === 404) {
            throw new Error('Chapitre introuvable');
        }
        throw new Error('Erreur de connexion à AELF');
    }

    const html = await response.text();
    const $ = cheerio.load(html);

    const verses: BibleVerse[] = [];

    // AELF structure: <p><span class="verse_number">01</span> Texte du verset...</p>
    const contentBlock = $('.block-single-reading');

    if (!contentBlock.length) {
        throw new Error('Impossible de lire le texte sur la page AELF');
    }

    // Trouver tous les paragraphes contenant des numéros de verset
    contentBlock.find('p').each((_, el) => {
        const $p = $(el);
        // Les Évangiles utilisent .verse_number, les Psaumes utilisent .text-danger
        let $verseNum = $p.find('.verse_number');
        if ($verseNum.length === 0) {
            $verseNum = $p.find('.text-danger');
        }

        if ($verseNum.length > 0) {
            // Récupérer le numéro
            const numText = $verseNum.text().trim();
            const num = parseInt(numText, 10);

            if (!isNaN(num)) {
                // Récupérer le texte complet du paragraphe
                const fullText = $p.text();
                // Retirer le numéro de verset
                let text = fullText.replace(numText, '').trim();

                // Assurer que le texte commence par une majuscule
                if (text && text.length > 0) {
                    text = text.charAt(0).toUpperCase() + text.slice(1);
                }

                if (text) {
                    verses.push({
                        ref: `${bookSlug} ${chapter}, ${num}`,
                        verseNumber: num,
                        text: text
                    });
                }
            }
        }
    });

    // Si l'extraction échoue
    if (verses.length === 0) {
        throw new Error("Aucun verset trouvé sur cette page");
    }

    // Capitaliser le nom du livre pour l'affichage
    const capitalizedBook = bookRaw.charAt(0).toUpperCase() + bookRaw.slice(1);

    return {
        book: capitalizedBook,
        chapter,
        verses,
        sourceUrl: url
    };
}

