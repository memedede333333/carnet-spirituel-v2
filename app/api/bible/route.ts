
import { NextResponse } from 'next/server';
import { fetchAelfChapter } from '@/app/lib/aelf-scraper';

export async function GET(request: Request) {
    const { searchParams } = new URL(request.url);
    const ref = searchParams.get('ref');

    if (!ref) {
        return NextResponse.json({ error: 'Référence requise (ex: ?ref=Mt 5)' }, { status: 400 });
    }

    try {
        const chapterData = await fetchAelfChapter(ref);
        return NextResponse.json(chapterData);
    } catch (error: any) {
        console.error('API Bible Error:', error);

        // Gestion des erreurs spécifiques
        if (error.message.includes('Livre inconnu')) {
            return NextResponse.json({ error: 'Livre biblique non reconnu ou abréviation invalide.' }, { status: 400 });
        }
        if (error.message.includes('Chapitre introuvable') || error.message.includes('404')) {
            return NextResponse.json({ error: 'Chapitre introuvable sur AELF.' }, { status: 404 });
        }

        return NextResponse.json({ error: 'Erreur lors de la récupération du texte.' }, { status: 500 });
    }
}
