const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const path = require('path');

// Lire .env.local manuellement
const envPath = path.join(__dirname, '../.env.local');
const envContent = fs.readFileSync(envPath, 'utf8');

const env = {};
envContent.split('\n').forEach(line => {
    const [key, value] = line.split('=');
    if (key && value) {
        env[key.trim()] = value.trim().replace(/^["']|["']$/g, '');
    }
});

const supabaseUrl = env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
    console.error('Erreur: Variables d\'environnement manquantes');
    process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function getUserIds() {
    console.log('🔍 Recherche des utilisateurs...');

    const { data: users, error } = await supabase.auth.admin.listUsers();

    if (error) {
        console.error('Erreur:', error.message);
        return;
    }

    console.log('\n📋 Liste des utilisateurs trouvés :');
    console.log('-----------------------------------');
    users.users.forEach(user => {
        console.log(`📧 Email: ${user.email}`);
        console.log(`🆔 ID:    ${user.id}`);
        console.log('-----------------------------------');
    });
}

getUserIds();
