
import * as cheerio from 'cheerio';
import { BOOK_MAPPING, AELF_BOOKS_LIST } from './aelf-mapping-table';

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

/**
 * Supprime les accents d'une chaîne
 */
function removeAccents(str: string): string {
    return str.normalize('NFD').replace(/[\u0300-\u036f]/g, '');
}

/**
 * Normalise une entrée de livre vers son code AELF
 */
function normalizeBook(input: string): string | null {
    // Nettoyer et normaliser l'entrée
    const cleanInput = removeAccents(input.toLowerCase().trim());

    // Recherche directe dans le mapping
    if (BOOK_MAPPING[cleanInput]) {
        return BOOK_MAPPING[cleanInput];
    }

    // Recherche sans accents ni espaces
    const compactInput = cleanInput.replace(/[^a-z0-9]/g, '');

    for (const [key, code] of Object.entries(BOOK_MAPPING)) {
        const normalizedKey = removeAccents(key).replace(/[^a-z0-9]/g, '');
        if (normalizedKey === compactInput) {
            return code;
        }
    }

    // Recherche dans les codes des livres directement
    const upperInput = input.toUpperCase().trim();
    const book = AELF_BOOKS_LIST.find(b =>
        b.code.toUpperCase() === upperInput ||
        b.code.toUpperCase() === compactInput.toUpperCase()
    );
    if (book) {
        return book.code;
    }

    return null;
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

