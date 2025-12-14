
const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
    console.error('Missing Supabase credentials');
    process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function inspectTable() {
    // On essaie d'insérer une ligne bidon pour voir la structure ou récupérer une ligne existante
    // Mais le mieux est d'utiliser la méthode rpc si on avait une fonction d'inspection, 
    // ou simplement de tenter un select * limit 1 pour voir les clés.

    console.log("Inspection de la table 'suivis_rencontre'...");

    const { data, error } = await supabase
        .from('suivis_rencontre')
        .select('*')
        .limit(1);

    if (error) {
        console.error("Erreur lors de la lecture:", error);
        return;
    }

    if (data && data.length > 0) {
        console.log("Une ligne trouvée, voici les colonnes disponibles :");
        console.log(Object.keys(data[0]));
    } else {
        console.log("Table vide mais accessible. Impossible de déduire les colonnes via un SELECT sur une table vide sans API admin.");
        console.log("Tentative d'insertion 'à l'aveugle' pour tester les colonnes standards...");
        // On ne va pas insérer pour ne pas polluer, on va supposer la structure standard
        // Mais l'utilisateur veut être sûr. 
        // Si la table est vide, le select ne renvoie pas les clés.
    }
}

inspectTable();

