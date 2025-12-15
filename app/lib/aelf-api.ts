
export interface AelfLecture {
    type: string; // "evangile", "premiere_lecture", etc.
    titre: string;
    reference: string;
    texte: string; // HTML ou texte brut
    key: string;
}

export interface AelfMesseResponse {
    date: string;
    zone: string;
    messes: {
        nom: string;
        lectures: AelfLecture[];
    }[];
}

export async function fetchTodayReadings(): Promise<AelfLecture[]> {
    const today = new Date().toISOString().split('T')[0];
    const url = `https://api.aelf.org/v1/messes/${today}/fr`;

    try {
        const response = await fetch(url);
        if (!response.ok) {
            throw new Error(`Erreur API AELF: ${response.status}`);
        }

        const data: AelfMesseResponse = await response.json();

        // On agrège toutes les lectures de toutes les messes (souvent une seule, mais parfois plusieurs)
        const lectures: AelfLecture[] = [];

        data.messes.forEach((messe) => {
            messe.lectures.forEach((lecture) => {
                // Nettoyage basique du type pour l'affichage
                // L'API renvoie souvent des clés comme "evangile", "psaume"
                lectures.push({
                    ...lecture,
                    key: `${messe.nom}-${lecture.type}` // Clé unique pour React
                });
            });
        });

        return lectures;
    } catch (error) {
        console.error('Error fetching AELF readings:', error);
        throw error;
    }
}
