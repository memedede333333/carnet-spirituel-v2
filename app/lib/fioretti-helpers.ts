// Helpers pour formater le contenu des fioretti

export function formatFiorettoContent(type: string, content: any): {
    mainText: string;
    metadata: { icon: string; label: string; value: string }[];
} {
    const mainText = content.texte || content.sujet || "...";
    const metadata: { icon: string; label: string; value: string }[] = [];

    switch (type) {
        case 'grace':
            if (content.date) {
                metadata.push({
                    icon: '📅',
                    label: 'Date',
                    value: new Date(content.date).toLocaleDateString('fr-FR', {
                        day: 'numeric',
                        month: 'long',
                        year: 'numeric'
                    })
                });
            }
            if (content.lieu) {
                metadata.push({
                    icon: '📍',
                    label: 'Lieu',
                    value: content.lieu
                });
            }
            if (content.tags && content.tags.length > 0) {
                metadata.push({
                    icon: '🏷️',
                    label: 'Tags',
                    value: content.tags.join(' • ')
                });
            }
            break;

        case 'priere':
            if (content.personne) {
                const nom = typeof content.personne === 'string'
                    ? content.personne
                    : `${content.personne.prenom || ''} ${content.personne.nom || ''}`.trim();
                metadata.push({
                    icon: '👤',
                    label: 'Pour',
                    value: nom
                });
            }
            if (content.date) {
                metadata.push({
                    icon: '📅',
                    label: 'Date',
                    value: new Date(content.date).toLocaleDateString('fr-FR')
                });
            }
            if (content.type) {
                metadata.push({
                    icon: '🙏',
                    label: 'Type',
                    value: content.type.charAt(0).toUpperCase() + content.type.slice(1)
                });
            }
            break;

        case 'ecriture':
            if (content.reference) {
                metadata.push({
                    icon: '📖',
                    label: 'Référence',
                    value: content.reference
                });
            }
            if (content.traduction) {
                metadata.push({
                    icon: '📚',
                    label: 'Traduction',
                    value: content.traduction
                });
            }
            if (content.contexte) {
                metadata.push({
                    icon: '⛪',
                    label: 'Contexte',
                    value: content.contexte
                });
            }
            break;

        case 'parole':
            if (content.date) {
                metadata.push({
                    icon: '📅',
                    label: 'Date',
                    value: new Date(content.date).toLocaleDateString('fr-FR')
                });
            }
            if (content.contexte) {
                metadata.push({
                    icon: '🕊️',
                    label: 'Contexte',
                    value: content.contexte
                });
            }
            if (content.destinataire && content.destinataire !== 'moi') {
                const dest = content.destinataire === 'personne' && content.personneDestinataire
                    ? content.personneDestinataire
                    : content.destinataire;
                metadata.push({
                    icon: '👤',
                    label: 'Pour',
                    value: dest
                });
            }
            break;

        case 'rencontre':
            if (content.personne) {
                const nom = typeof content.personne === 'string'
                    ? content.personne
                    : `${content.personne.prenom || ''} ${content.personne.nom || ''}`.trim();
                metadata.push({
                    icon: '👤',
                    label: 'Personne',
                    value: nom
                });
            }
            if (content.date) {
                metadata.push({
                    icon: '📅',
                    label: 'Date',
                    value: new Date(content.date).toLocaleDateString('fr-FR')
                });
            }
            if (content.lieu) {
                metadata.push({
                    icon: '📍',
                    label: 'Lieu',
                    value: content.lieu
                });
            }
            if (content.contexte) {
                metadata.push({
                    icon: '🤝',
                    label: 'Contexte',
                    value: content.contexte
                });
            }
            break;
    }

    return { mainText, metadata };
}
