/**
 * ============================================================================
 * BIBLE REFERENCE PARSER INTELLIGENT
 * ============================================================================
 * 
 * Parse intelligemment les références bibliques avec :
 * - Gestion des accents (ezekiel = ézéchiel)
 * - Formats multiples (1 tim 5, timothée 1 ch 5, etc.)
 * - Suggestions pour les livres ambigus (timothée → 1Tm ou 2Tm ?)
 */

import { BOOK_MAPPING, AELF_BOOKS_LIST } from './aelf-mapping-table';

export interface ParseResult {
    success: boolean;
    bookCode?: string;
    bookName?: string;
    chapter?: number;
    error?: string;
    suggestions?: BookSuggestion[];
}

export interface BookSuggestion {
    code: string;
    fullName: string;
    chapters: number;
}

/**
 * Supprime les accents d'une chaîne
 */
function removeAccents(str: string): string {
    return str.normalize('NFD').replace(/[\u0300-\u036f]/g, '');
}

/**
 * Nettoie et normalise l'entrée utilisateur
 */
function normalizeInput(input: string): string {
    return removeAccents(input.toLowerCase().trim());
}

/**
 * Trouve les livres qui correspondent partiellement à une recherche
 */
export function findMatchingBooks(searchTerm: string): BookSuggestion[] {
    const normalized = normalizeInput(searchTerm);
    const matches: BookSuggestion[] = [];

    for (const book of AELF_BOOKS_LIST) {
        const normalizedName = normalizeInput(book.fullName);
        const normalizedCode = book.code.toLowerCase();

        // Correspondance exacte du code
        if (normalizedCode === normalized) {
            matches.push({
                code: book.code,
                fullName: book.fullName,
                chapters: book.chapters
            });
            continue;
        }

        // Correspondance partielle du nom
        if (normalizedName.includes(normalized) || normalized.includes(normalizedCode)) {
            matches.push({
                code: book.code,
                fullName: book.fullName,
                chapters: book.chapters
            });
        }
    }

    return matches;
}

/**
 * Parse une référence biblique flexible
 * Exemples supportés :
 * - "Mt 5"
 * - "Matthieu 5"
 * - "jean 3"
 * - "1 timothée 5"
 * - "timothée 1 ch 5"
 * - "timothée 1 chap 5"
 * - "1tm5"
 * - "ezekiel 1"
 */
export function parseBibleReference(input: string): ParseResult {
    if (!input || !input.trim()) {
        return { success: false, error: 'Référence vide' };
    }

    const original = input.trim();
    const normalized = normalizeInput(original);

    // Pattern 1: Livre numéroté classique "1 tim 5", "2 cor 3"
    // Pattern 2: Livre simple "mt 5", "jean 3"
    // Pattern 3: Livre avec "ch" ou "chap" : "matthieu ch 5", "timothée 1 chap 2"

    // Nettoyer les séparateurs communs
    let cleaned = normalized
        .replace(/\s*[,:]\s*/g, ' ')      // remplace , et : par espace
        .replace(/\s+ch(ap)?\s*/gi, ' ')  // retire "ch" et "chap"
        .replace(/\s+v(erset)?\s*/gi, ' ') // retire "v" et "verset"
        .replace(/\s+/g, ' ')             // normalise les espaces
        .trim();

    // Essayer de parser avec différentes stratégies

    // Stratégie 1: Format "NLivre Chapitre" ex: "1tim 5" ou "2cor 3"
    const numberedBookPattern = /^([123])\s*([a-z]+)\s+(\d+)$/;
    let match = cleaned.match(numberedBookPattern);
    if (match) {
        const [, num, book, chapter] = match;
        const bookKey = `${num} ${book}`;
        const bookKeyAlt = `${num}${book}`;

        // Chercher dans le mapping
        const code = BOOK_MAPPING[bookKey] || BOOK_MAPPING[bookKeyAlt] || findInMapping(`${num}${book}`);
        if (code) {
            return {
                success: true,
                bookCode: code,
                bookName: getBookName(code),
                chapter: parseInt(chapter, 10)
            };
        }
    }

    // Stratégie 2: Format "Livre N Chapitre" ex: "timothée 1 5" (livre 1 Timothée, chapitre 5)
    const bookThenNumberPattern = /^([a-z]+)\s+([123])\s+(\d+)$/;
    match = cleaned.match(bookThenNumberPattern);
    if (match) {
        const [, book, num, chapter] = match;
        const bookKey = `${num} ${book}`;
        const bookKeyAlt = `${book} ${num}`;

        const code = BOOK_MAPPING[bookKey] || BOOK_MAPPING[bookKeyAlt] || findInMapping(`${num}${book}`);
        if (code) {
            return {
                success: true,
                bookCode: code,
                bookName: getBookName(code),
                chapter: parseInt(chapter, 10)
            };
        }
    }

    // Stratégie 3: Format simple "Livre Chapitre" ex: "matthieu 5"
    const simplePattern = /^([a-z0-9\s]+?)\s+(\d+)$/;
    match = cleaned.match(simplePattern);
    if (match) {
        const [, book, chapterStr] = match;
        const bookTrimmed = book.trim();
        const requestedChapter = parseInt(chapterStr, 10);

        // Chercher correspondance exacte
        const code = findInMapping(bookTrimmed);
        if (code) {
            return {
                success: true,
                bookCode: code,
                bookName: getBookName(code),
                chapter: requestedChapter
            };
        }

        // Chercher correspondances partielles (pour suggestions)
        // IMPORTANT: Filtrer les suggestions selon si le chapitre demandé existe
        const allMatches = findAmbiguousBooks(bookTrimmed);
        const validSuggestions = allMatches.filter(s => {
            const bookInfo = AELF_BOOKS_LIST.find(b => b.code === s.code);
            if (!bookInfo) return false;

            const minChapter = bookInfo.startsAt ?? 1;
            const maxChapter = bookInfo.chapters;

            return requestedChapter >= minChapter && requestedChapter <= maxChapter;
        });

        if (validSuggestions.length > 1) {
            return {
                success: false,
                error: `Plusieurs livres correspondent à "${bookTrimmed}" pour le chapitre ${requestedChapter}`,
                suggestions: validSuggestions
            };
        }
        if (validSuggestions.length === 1) {
            return {
                success: true,
                bookCode: validSuggestions[0].code,
                bookName: validSuggestions[0].fullName,
                chapter: requestedChapter
            };
        }

        // Si aucune suggestion valide mais qu'il y avait des correspondances
        if (allMatches.length > 0) {
            return {
                success: false,
                error: `"${bookTrimmed}" trouvé mais le chapitre ${requestedChapter} n'existe dans aucun de ces livres`,
                suggestions: allMatches
            };
        }
    }

    // Stratégie 4: Juste le nom du livre (sans chapitre)
    const justBook = findInMapping(cleaned);
    if (justBook) {
        return {
            success: false,
            error: 'Numéro de chapitre manquant',
            bookCode: justBook,
            bookName: getBookName(justBook)
        };
    }

    // Chercher des suggestions
    const suggestions = findAmbiguousBooks(cleaned);
    if (suggestions.length > 0) {
        return {
            success: false,
            error: suggestions.length > 1
                ? `Plusieurs livres correspondent. Précisez votre recherche.`
                : 'Numéro de chapitre manquant',
            suggestions
        };
    }

    return {
        success: false,
        error: `Livre non reconnu: "${original}"`
    };
}

/**
 * Cherche dans le mapping avec normalisation des accents
 */
function findInMapping(input: string): string | null {
    const normalized = normalizeInput(input);

    // Recherche directe
    if (BOOK_MAPPING[normalized]) {
        return BOOK_MAPPING[normalized];
    }

    // Recherche sans accents dans les clés
    for (const [key, code] of Object.entries(BOOK_MAPPING)) {
        if (normalizeInput(key) === normalized) {
            return code;
        }
    }

    return null;
}

/**
 * Trouve les livres ambigus (ex: "timothée" → 1Tm et 2Tm)
 */
function findAmbiguousBooks(searchTerm: string): BookSuggestion[] {
    const normalized = normalizeInput(searchTerm);
    const matchingCodes = new Set<string>();

    // Chercher dans les alias
    for (const [key, code] of Object.entries(BOOK_MAPPING)) {
        const normalizedKey = normalizeInput(key);
        if (normalizedKey.includes(normalized) || normalized.includes(normalizedKey)) {
            matchingCodes.add(code);
        }
    }

    // Chercher par nom complet
    for (const book of AELF_BOOKS_LIST) {
        const normalizedName = normalizeInput(book.fullName);
        if (normalizedName.includes(normalized)) {
            matchingCodes.add(book.code);
        }
    }

    // Convertir en suggestions
    return AELF_BOOKS_LIST.filter(b => matchingCodes.has(b.code)).map(b => ({
        code: b.code,
        fullName: b.fullName,
        chapters: b.chapters
    }));
}

/**
 * Obtient le nom complet d'un livre depuis son code
 */
function getBookName(code: string): string {
    const book = AELF_BOOKS_LIST.find(b => b.code === code);
    return book?.fullName || code;
}

/**
 * Valide qu'un chapitre existe pour un livre donné
 */
export function validateChapter(bookCode: string, chapter: number): { valid: boolean; error?: string; maxChapter?: number } {
    const book = AELF_BOOKS_LIST.find(b => b.code === bookCode);
    if (!book) {
        return { valid: false, error: 'Livre non trouvé' };
    }

    const minChapter = book.startsAt ?? 1;
    const maxChapter = book.chapters;

    if (chapter < minChapter || chapter > maxChapter) {
        return {
            valid: false,
            error: `Ce livre a ${maxChapter} chapitres (${minChapter}-${maxChapter})`,
            maxChapter
        };
    }

    return { valid: true };
}
