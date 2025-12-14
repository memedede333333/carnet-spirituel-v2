const { createClient } = require('@supabase/supabase-js');

// Configuration
const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
const SUPABASE_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!SUPABASE_URL || !SUPABASE_KEY) {
    console.error('❌ Erreur : Les variables d\'environnement NEXT_PUBLIC_SUPABASE_URL et NEXT_PUBLIC_SUPABASE_ANON_KEY sont requises.');
    process.exit(1);
}

const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

async function keepAlive() {
    console.log('🔄 Tentative de connexion à Supabase pour maintenir la base active...');

    try {
        // On fait une requête simple sur la table 'profiles' (limit 1) juste pour réveiller la base
        const { data, error } = await supabase
            .from('profiles')
            .select('count', { count: 'exact', head: true });

        if (error) {
            throw error;
        }

        console.log('✅ Succès ! La base de données a répondu.');
        console.log('ℹ️  Info : Cette action empêche Supabase de mettre le projet en pause pour inactivité.');
    } catch (error) {
        console.error('❌ Erreur lors de la connexion :', error.message);
        process.exit(1);
    }
}

keepAlive();
