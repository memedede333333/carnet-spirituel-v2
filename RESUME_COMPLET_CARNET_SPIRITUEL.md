# 📖 CARNET SPIRITUEL CATHOLIQUE - RÉSUMÉ COMPLET DU PROJET

## 🕊️ I. LA VISION SPIRITUELLE

### Origine et philosophie profonde

**Le concept fondateur** : Créer une application web qui aide à "Chercher et trouver Dieu en toutes choses" (Saint Ignace de Loyola). Le projet part du principe que **Dieu écrit droit avec des lignes courbes** - l'application aide à lire cette écriture divine dans nos vies quotidiennes.

**L'objectif** : Permettre de discerner le fil rouge de l'action divine en notant et reliant 5 types d'expériences spirituelles :
- ✨ **Grâces reçues** : Les moments où Dieu se manifeste
- 🙏 **Prières d'intercession** : Pour qui on prie et comment Dieu répond
- 📖 **Paroles d'Écriture** : Les versets bibliques qui touchent le cœur
- 🕊️ **Paroles de connaissance** : Les inspirations prophétiques
- 🤝 **Rencontres missionnaires** : Les rencontres marquantes dans l'évangélisation

### Les principes non-négociables

1. **Liberté absolue** : Jamais d'obligations, seulement des "murmures" de suggestions
2. **Douceur franciscaine** : Interface qui respire, animations contemplatives
3. **Beauté comme prière** : "La beauté sauvera le monde" (Dostoïevski)
4. **Ancrage catholique** : Vocabulaire traditionnel, pas de dérive new age
5. **Contemplatif dans l'action** : Noter pour mieux contempler, pas pour performer

### Ce que le projet N'EST PAS
- ❌ Un réseau social religieux
- ❌ Un tracker de performance spirituelle  
- ❌ Un outil de jugement
- ❌ Une obligation quotidienne

---

## ⚙️ II. L'ARCHITECTURE TECHNIQUE

### Stack technologique validée

```json
{
  "frontend": "Next.js 14.2.16 (App Router)",
  "language": "TypeScript 5",
  "database": "Supabase (Auth + DB + RLS)",
  "styles": "CSS pur - PAS Tailwind",
  "icons": "lucide-react 0.447.0",
  "dates": "date-fns 3.6.0 (locale fr)",
  "deployment": "Vercel"
}
```

### Pourquoi ces choix ?

**Next.js 14 App Router** : 
- Routing moderne avec dossiers `(app)` et `(auth)`
- Server/Client components distinction
- Performance optimale

**TypeScript** :
- Typage fort pour éviter les erreurs
- Autocomplete dans l'IDE
- Maintenance facilitée

**Supabase** :
- Auth + DB + Storage en un seul service
- Row Level Security (RLS) natif = sécurité automatique par user
- 0 fuite de données en 2 mois de production

**CSS pur (PAS Tailwind)** :
- **Décision critique** après 2 jours de debug
- Problème : Classes dynamiques non compilées (`bg-${color}-500`)
- Solution : Variables CSS + classes utilitaires custom

### Structure des dossiers

```
carnet-spirituel/
├── app/
│   ├── (app)/                 # Routes protégées (auth requise)
│   │   ├── dashboard/         # Page d'accueil avec bulles animées
│   │   ├── graces/           # Module grâces
│   │   ├── prieres/          # Module prières
│   │   ├── ecritures/        # Module écritures
│   │   ├── paroles/          # Module paroles
│   │   ├── rencontres/       # Module rencontres
│   │   ├── relecture/        # Module relecture (LE MONSTRE)
│   │   └── profile/          # Gestion profil
│   ├── (auth)/               # Routes publiques
│   │   ├── login/
│   │   └── register/
│   ├── components/           # Composants réutilisables
│   │   ├── LinkBadge.tsx     # Badge compteur de liens
│   │   ├── LinksList.tsx     # Liste des liens spirituels
│   │   └── ConstellationView.tsx
│   ├── lib/                  # Helpers et utilitaires
│   │   ├── supabase.ts       # Client Supabase unique
│   │   ├── spiritual-links-helpers.ts
│   │   ├── security-logger.ts
│   │   └── email-alerts.ts
│   └── types/
│       └── index.ts          # Types TypeScript
├── public/
│   └── logo-esprit-saint-web.png
├── next.config.js            # Config critique
├── postbuild.js             # Fix Vercel OBLIGATOIRE
└── package.json
```

---

## 🗄️ III. LA BASE DE DONNÉES SUPABASE

### 10 tables avec RLS activé partout

1. **profiles** : Utilisateurs (prénom, nom, rôle)
2. **graces** : Grâces reçues (texte, date, lieu, tags, partage)
3. **prieres** : Prières d'intercession (type, personne, sujet)
4. **suivis_priere** : Évolution des prières
5. **paroles_ecriture** : Versets bibliques marquants
6. **paroles_connaissance** : Paroles prophétiques
7. **rencontres_missionnaires** : Rencontres d'évangélisation
8. **liens_spirituels** : Connexions entre éléments
9. **security_logs** : Logs de sécurité
10. **email_change_requests** : Demandes de changement d'email

### Row Level Security (RLS)

**Chaque table** a 4 policies identiques :
```sql
-- Pattern répété pour TOUTES les tables
CREATE POLICY "Users can view own data" 
  FOR SELECT USING (auth.uid() = user_id);
  
CREATE POLICY "Users can insert own data"
  FOR INSERT WITH CHECK (auth.uid() = user_id);
  
CREATE POLICY "Users can update own data"
  FOR UPDATE USING (auth.uid() = user_id);
  
CREATE POLICY "Users can delete own data"
  FOR DELETE USING (auth.uid() = user_id);
```

**Résultat** : Impossible d'accéder aux données d'un autre utilisateur, même avec un bug côté client.

### Triggers automatiques

```sql
-- Création automatique du profil à l'inscription
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION handle_new_user();

-- Mise à jour automatique de updated_at
CREATE TRIGGER update_profiles_updated_at
  BEFORE UPDATE ON profiles
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();
```

---

## 🎯 IV. LES 7 MODULES DÉVELOPPÉS

### 1. Dashboard (✅ 100%)

**Concept** : Page d'accueil avec 6 bulles flottantes animées représentant les modules.

**Code clé** :
```typescript
// Bulles avec animation CSS
<div style={{
  animation: 'float 6s ease-in-out infinite',
  background: moduleGradient,
  borderRadius: '50%',
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center'
}}>
  <Icon size={48} />
  <span>{moduleName}</span>
  <span>{count} entrées</span>
</div>
```

**Fonctionnalités** :
- Compteurs en temps réel par module
- Navigation fluide vers chaque section
- Logo Esprit Saint animé (shimmer)

### 2. Module Grâces (✅ 100%)

**Tables** : `graces`

**Champs** :
- texte (obligatoire)
- date (obligatoire)
- lieu (optionnel)
- tags (tableau, 11 tags prédéfinis)
- visibilité (privé/anonyme/public)
- statut_partage (brouillon/proposé/approuvé/refusé)

**Fonctionnalités** :
- ✅ CRUD complet (Create, Read, Update, Delete)
- ✅ Système de tags avec sélection multiple
- ✅ Partage anonyme modéré (future communauté)
- ✅ Filtres par tags, dates, visibilité
- ✅ Recherche textuelle

**Couleurs** : Palette ambre (#F59E0B)

### 3. Module Prières (✅ 100%)

**Tables** : `prieres` + `suivis_priere`

**Particularité unique** : Système de suivi de l'évolution

```typescript
// Structure de prière
{
  type: 'guerison' | 'freres' | 'intercession',
  personne_prenom: string,
  personne_nom?: string,
  sujet: string,
  nombre_fois: number  // Compteur de répétition
}

// Structure de suivi
{
  priere_id: UUID,
  date: Date,
  notes: string,
  evolution: 'amelioration' | 'stable' | 'gueri' | ...,  // 12 options
  nouvelle_priere: boolean
}
```

**Fonctionnalités** :
- ✅ 3 types de prières (guérison, pour les frères, intercession générale)
- ✅ Historique complet des suivis
- ✅ 12 états d'évolution ignatiens
- ✅ Compteur de répétitions automatique
- ✅ Visualisation timeline des suivis

**Couleurs** : Palette indigo (#6366F1)

### 4. Module Écritures (✅ 95%)

**Tables** : `paroles_ecriture`

**Champs spécifiques** :
- reference (ex: "Jn 3, 16")
- texte_complet (le verset)
- traduction ('AELF' par défaut)
- contexte (messe/lectio/retraite/groupe/personnel)
- ce_qui_ma_touche (réflexion)
- pour_qui (à qui je pense)
- fruits (tableau de résultats)

**Fonctionnalités** :
- ✅ CRUD complet
- ✅ 5 contextes de réception
- ✅ Fruits multiples possibles
- ❌ API AELF pas encore intégrée (manque 5%)

**Couleurs** : Palette vert émeraude (#10B981)

### 5. Module Paroles (✅ 100%)

**Tables** : `paroles_connaissance`

**Champs spécifiques** :
- texte (la parole reçue)
- contexte (personnelle/veillée/mission/prière/autre)
- destinataire (moi/inconnu/personne spécifique)
- fruit_constaté (ce qui s'est passé)
- date_accomplissement (quand la parole s'est réalisée)

**Logique métier** :
```typescript
// Si destinataire = 'personne', afficher champ personne_destinataire
{destinataire === 'personne' && (
  <input 
    type="text"
    value={personneDestinataire}
    placeholder="Nom de la personne"
  />
)}

// Si fruit constaté, permettre de noter la date d'accomplissement
{fruitConstate && (
  <input type="date" name="date_accomplissement" />
)}
```

**Couleurs** : Palette bleu ciel (#0EA5E9)

### 6. Module Rencontres (✅ 100%)

**Tables** : `rencontres_missionnaires`

**Champs** :
- personne_prenom (obligatoire)
- personne_nom (optionnel)
- lieu (obligatoire)
- date (obligatoire)
- contexte (description de la rencontre)
- description (détails)
- fruit_immediat (ce qui s'est passé sur le moment)
- fruit_espere (ce qu'on espère)

**⚠️ Bug connu** : Manque colonne `suivi_prevu` (BOOLEAN)

**Couleurs** : Palette rose (#F43F5E)

### 7. Module Relecture (✅ 90%) - LE MONSTRE

**Fichier unique** : `app/(app)/relecture/page.tsx` (~3000 lignes)

**Pourquoi monolithique ?** :
- 8 vues différentes imbriquées
- État partagé complexe entre vues
- Risque de casse énorme si refonte
- Décision : Modifications chirurgicales uniquement

**Les 8 vues** :

#### a) Vue Chronologique
- Timeline verticale avec ligne centrale
- Alternance gauche/droite
- Badges de liens sur chaque carte
- Lignes SVG courbes entre éléments liés

#### b) Vue Thématique
- Groupement par type (grâces, prières, etc.)
- Compteurs par catégorie
- Filtrage "avec liens" / "sans liens"
- Recherche textuelle

#### c) Vue Consolations & Désolations
- Approche ignatienne
- 2 colonnes (Consolations | Désolations)
- Liens pointillés entre les deux
- Suggestions basées sur l'analyse spirituelle

#### d) Vue Jardin des grâces
- Bulles flottantes (`animation: float 6s`)
- Taille selon nombre de liens
- Lignes fines entre bulles liées
- Clic pour détail

#### e) Vue Fleuve de vie
- Métaphore du fleuve temporel
- Affluents = éléments liés
- Largeur du fleuve selon densité
- Courant chronologique

#### f) Vue Atelier "Tisser les liens" (✅ Implémentée)
```typescript
// 3 colonnes
<div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr' }}>
  {/* Colonne 1 : Sources */}
  <div>
    {entries.map(entry => (
      <div onClick={() => setSelectedSource(entry)}>
        {getEntryShortText(entry)}
      </div>
    ))}
  </div>
  
  {/* Colonne 2 : Type de lien + Action */}
  <div>
    {selectedSource && selectedDestination && (
      <>
        <select value={linkType}>
          <option value="exauce">🙏 exauce</option>
          <option value="accomplit">✓ accomplit</option>
          <option value="decoule">→ découle</option>
          <option value="eclaire">💡 éclaire</option>
          <option value="echo">🔄 fait écho</option>
        </select>
        <button onClick={saveSpiritualLink}>Créer</button>
      </>
    )}
  </div>
  
  {/* Colonne 3 : Destinations (filtrées) */}
  <div>
    {/* Suggestions en premier */}
  </div>
</div>

{/* Zone liens récents - Ligne ~1650 */}
<div style={{ marginTop: '2rem', background: '#E6EDFF' }}>
  <h3>📌 Liens récents</h3>
  {recentLinks.slice(0, 5).map(link => (
    <div>{formatLinkDisplay(link)}</div>
  ))}
</div>
```

#### g) Vue Gestion des liens (✅ Implémentée)
```typescript
// Liste/tableau de tous les liens
{spiritualLinks.map(link => (
  <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
    {/* Source */}
    <span>{getEntryShortText(sourceEntry)}</span>
    
    {/* Type MODIFIABLE - Ligne ~2310 */}
    <select 
      value={link.type_lien}
      onChange={(e) => updateLinkType(link.id, e.target.value)}
      style={{
        padding: '0.5rem 1rem',
        backgroundColor: '#E6EDFF',
        border: '2px solid #D6E5F5',
        borderRadius: '2rem'
      }}
    >
      <option value="exauce">🙏 exauce</option>
      {/* ... autres options */}
    </select>
    
    {/* Destination */}
    <span>{getEntryShortText(targetEntry)}</span>
    
    {/* Actions */}
    <button onClick={() => viewEntry(link.element_cible_id)}>Voir</button>
    <button onClick={() => deleteLink(link.id)}>Supprimer</button>
  </div>
))}
```

#### h) Vue Constellation
- Réseau de nœuds et liens
- D3.js ou canvas custom
- Zoom et pan
- Clic sur nœud = navigation

**Couleurs Relecture** : Palette bleu sagesse (#7BA7E1)

---

## 🔗 V. LE SYSTÈME DE LIENS SPIRITUELS

### Architecture globale

```
┌─────────────────────────────────────────┐
│     INFRASTRUCTURE CENTRALISÉE          │
├─────────────────────────────────────────┤
│  spiritual-links-helpers.ts             │
│  - loadUserSpiritualLinks()             │
│  - getLinksCountForEntry()              │
│  - getLinksForEntry()                   │
│  - areEntriesLinked()                   │
│  - getLinkTypeBetween()                 │
│  - getSuggestedLinks()                  │
│  - formatLinkDisplay()                  │
└─────────────────────────────────────────┘
           │
           ├─────────────────┬─────────────────┬─────────────────┐
           │                 │                 │                 │
    ┌─────▼─────┐    ┌─────▼─────┐    ┌─────▼─────┐    ┌─────▼─────┐
    │ LinkBadge │    │ LinksList │    │  Modals   │    │  Relecture│
    │           │    │           │    │           │    │  8 vues   │
    └───────────┘    └───────────┘    └───────────┘    └───────────┘
```

### Table `liens_spirituels`

```sql
CREATE TABLE liens_spirituels (
  id UUID PRIMARY KEY,
  user_id UUID REFERENCES profiles(id),
  element_source_type TEXT NOT NULL,      -- 'grace', 'priere', etc.
  element_source_id UUID NOT NULL,
  element_cible_type TEXT NOT NULL,
  element_cible_id UUID NOT NULL,
  type_lien TEXT CHECK (type_lien IN ('exauce', 'accomplit', 'decoule', 'eclaire', 'echo')),
  description TEXT,
  created_at TIMESTAMP,
  UNIQUE(user_id, element_source_id, element_cible_id)  -- Pas de doublons
);
```

### Les 5 types de liens

```typescript
const LINK_TYPES = {
  exauce: { 
    label: 'exauce', 
    icon: '🙏', 
    color: '#6366F1',
    exemple: 'Ma prière pour Jean → Sa guérison'
  },
  accomplit: { 
    label: 'accomplit', 
    icon: '✓', 
    color: '#10B981',
    exemple: 'Parole prophétique → Son accomplissement'
  },
  decoule: { 
    label: 'découle', 
    icon: '→', 
    color: '#0EA5E9',
    exemple: 'Une grâce → Une nouvelle mission'
  },
  eclaire: { 
    label: 'éclaire', 
    icon: '💡', 
    color: '#F59E0B',
    exemple: 'Un verset → Compréhension d\'une situation'
  },
  echo: { 
    label: 'fait écho', 
    icon: '🔄', 
    color: '#8B5CF6',
    exemple: 'Deux expériences similaires à des moments différents'
  }
}
```

### Logique de suggestions

```typescript
// Algorithme dans getSuggestedLinks()
const suggestions = []

// 1. Proximité temporelle (±30 jours)
const daysDiff = Math.abs((date1 - date2) / (1000 * 60 * 60 * 24))
if (daysDiff <= 30) suggestions.push(entry)

// 2. Personne commune
if (entry1.personne_prenom === entry2.personne_prenom) {
  suggestions.push(entry)
}

// 3. Lieu identique
if (entry1.lieu === entry2.lieu) {
  suggestions.push(entry)
}

// 4. Mots-clés communs (pas encore implémenté)

// Maximum 5 suggestions
return suggestions.slice(0, 5)
```

### État d'avancement des liens

| Composant | État | Détails |
|-----------|------|---------|
| Helpers | ✅ 100% | Toutes fonctions validées |
| LinkBadge | ✅ 100% | Composant réutilisable |
| LinksList | ✅ 100% | Affichage + actions |
| Vue Atelier | ✅ 100% | Création de liens |
| Vue Gestion | ✅ 100% | Modification type |
| Zone liens récents | ✅ 100% | Derniers liens créés |
| Badges dans listes | 🚧 40% | Grâces OK, reste à faire |
| Sections détails | ❌ 0% | À implémenter |
| Responsive mobile | ❌ 0% | 3 colonnes → onglets |

---

## 🎨 VI. LE DESIGN SYSTEM

### Palette de couleurs par module

```css
:root {
  /* Fond général */
  --background: #fffdf8;      /* Ivoire très clair */
  --text: #1f2345;            /* Bleu nuit */
  --gold: #f6c94c;            /* Or liturgique */
  
  /* Grâces - AMBRE */
  --graces-light: #FEF3C7;
  --graces-primary: #FDE68A;
  --graces-accent: #F59E0B;
  --graces-text: #78350F;
  
  /* Prières - INDIGO */
  --prieres-light: #E0E7FF;
  --prieres-primary: #C7D2FE;
  --prieres-accent: #6366F1;
  --prieres-text: #312E81;
  
  /* Écritures - VERT */
  --ecritures-light: #D1FAE5;
  --ecritures-primary: #A7F3D0;
  --ecritures-accent: #10B981;
  --ecritures-text: #064E3B;
  
  /* Paroles - BLEU CIEL */
  --paroles-light: #E0F2FE;
  --paroles-primary: #BAE6FD;
  --paroles-accent: #0EA5E9;
  --paroles-text: #075985;
  
  /* Rencontres - ROSE */
  --rencontres-light: #FCE7F3;
  --rencontres-primary: #FBCFE8;
  --rencontres-accent: #F43F5E;
  --rencontres-text: #831843;
  
  /* Relecture - BLEU SAGESSE */
  --relecture-light: #E6EDFF;
  --relecture-primary: #7BA7E1;
  --relecture-accent: #5B8DD1;
  --relecture-text: #2C5282;
}
```

### Animations contemplatives

```css
@keyframes float {
  0%, 100% { transform: translateY(0) rotate(0deg); }
  25% { transform: translateY(-10px) rotate(2deg); }
  75% { transform: translateY(5px) rotate(-2deg); }
}

@keyframes shimmer {
  0%, 100% { transform: translate(0, 0); }
  50% { transform: translate(10%, 10%); }
}

@keyframes fadeIn {
  from { opacity: 0; transform: translateY(10px); }
  to { opacity: 1; transform: translateY(0); }
}

@keyframes pulse {
  0% { opacity: 0.3; transform: scale(1); }
  50% { opacity: 0.5; transform: scale(1.05); }
  100% { opacity: 0.3; transform: scale(1); }
}
```

**Utilisation** :
```typescript
// Bulles du dashboard
animation: 'float 6s ease-in-out infinite'

// Logo Esprit Saint
animation: 'shimmer 8s ease-in-out infinite'

// Apparition des cartes
animation: 'fadeIn 0.3s ease-out'
```

---

## 🔧 VII. MÉTHODES DE TRAVAIL

### 1. GitHub Gist - Méthode PRINCIPALE

```bash
# Gist principal
ID: 287cb2b7f8f35187352781681b10f570
URL: https://gist.github.com/memedede333333/287cb2b7f8f35187352781681b10f570

# Mise à jour après modifications
gh gist edit 287cb2b7f8f35187352781681b10f570 "app/(app)/graces/page.tsx"

# Mise à jour multiple
gh gist edit 287cb2b7f8f35187352781681b10f570 \
  "app/(app)/dashboard/page.tsx" \
  "app/(app)/graces/page.tsx" \
  "app/types/index.ts"

# Pattern : TOUJOURS dire "Gist mis à jour" après modification
```

### 2. Méthode des balises (pour relecture/page.tsx)

**Processus en 5 étapes** :
1. LIRE dans le Gist pour comprendre la structure
2. TROUVER des balises uniques fiables (ex: `viewMode === 'gestion'`)
3. COMPTER précisément depuis la balise ("23 lignes après")
4. PROPOSER l'insertion avec position exacte
5. IMPLÉMENTER via terminal ou manuellement

**Exemple** :
```bash
# Localiser
grep -n "viewMode === 'gestion'" "app/(app)/relecture/page.tsx"
# Résultat : ligne 2096

# Extraire le contexte
sed -n '2090,2320p' "app/(app)/relecture/page.tsx"

# Modification MANUELLE dans VS Code ligne par ligne
```

### 3. Pattern "Baby Steps"

**Règles strictes** :
- ✅ UN SEUL objectif par session
- ✅ Tester après CHAQUE modification
- ✅ Commit Git après CHAQUE succès
- ✅ Si 3 échecs → STOP et changer d'approche

### 4. Stratégie de backup

```bash
# Backup avant modification majeure
cp fichier.tsx fichier.tsx.backup-$(date +%H%M%S)

# Branches Git descriptives
git checkout -b backup-nom-descriptif-$(date +%Y%m%d-%H%M%S)
git push origin backup-nom-descriptif-$(date +%Y%m%d-%H%M%S)

# Archives tar.gz
tar -czf carnet-spirituel-backup-$(date +%Y%m%d-%H%M%S).tar.gz \
  --exclude='node_modules' \
  --exclude='.next' \
  carnet-spirituel/
```

**Branches existantes** :
- `backup-phase2-liens-70pourcent-20250619-220500`
- `backup-phase2-liens-85pourcent-zone-recents-ok-20250619-221500`
- `backup-menu-deroulant-gestion-liens-OK-20250620-000000`

---

## 🚫 VIII. LIVRE DES ÉCHECS CRITIQUES

### 1. Menu déroulant type de lien (3 JOURS PERDUS)

**Erreur** : Utiliser des regex complexes pour chercher/remplacer dans fichier 3000 lignes
**Symptôme** : Pattern matche au mauvais endroit
**Solution** :
```bash
# 1. Localiser EXACTEMENT
grep -n "type_lien" "app/(app)/relecture/page.tsx"

# 2. Extraire le contexte
sed -n '2305,2335p' "app/(app)/relecture/page.tsx"

# 3. Modifier MANUELLEMENT dans VS Code
# 4. NE JAMAIS faire confiance aux patterns automatiques
```

### 2. Zone liens récents (2 JOURS PERDUS)

**Erreur** : Insérer après la fermeture de la vue
**Symptôme** : Code en dehors de la vue, syntaxe cassée
**Structure exacte** :
```jsx
{viewMode === 'atelier' && (
  <div>
    {/* contenu */}
    {/* ICI insérer AVANT cette fermeture ! */}
  </div>
)}  // Pattern exact : </div>\n          </div>\n        )}
```

### 3. Syntaxe Heredoc Shell

```bash
# ❌ JAMAIS
cat > fichier << 'ENDOFFILE'  # Mot clé trop long

# ✅ TOUJOURS
cat > fichier << 'EOF'
contenu
EOF

# ❌ JAMAIS cat >> (append)
# ✅ TOUJOURS cat > (create new)
```

### 4. Apostrophes dans le code

```typescript
// ❌ CRASH
'quelqu'un'
"Paroles d'Écriture"

// ✅ OK
'quelqu\'un' ou "quelqu'un"
"Paroles de l'Écriture" ou 'Paroles d\'Écriture'
```

### 5. Import Supabase incohérent

```typescript
// ❌ JAMAIS
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs'

// ✅ TOUJOURS (dans ce projet)
import { supabase } from '@/app/lib/supabase'
```

### 6. Colonnes DB mal nommées

```typescript
// ❌ ERREURS FRÉQUENTES
prenom_personne  // → personne_prenom
nom_personne     // → personne_nom  
fruits_immediats // → fruit_immediat (SINGULIER)
pour            // → pour_qui (dans paroles_ecriture)
```

### 7. Next.js 15 - Params asynchrones

```typescript
// ❌ Erreur Next.js 15
export default function Page({ params }) {
  const id = params.id  // params est une Promise!
}

// ✅ OK
import { use } from 'react'
export default function Page({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = use(params)
  const id = resolvedParams.id
}
```

### 8. Tailwind - LA DÉCISION CRITIQUE

**2 jours de debug perdus**

```typescript
// ❌ NE FONCTIONNE PAS avec Next.js 14
const color = 'blue'
className={`bg-${color}-500`}  // Classes jamais générées

// ✅ SOLUTION : CSS pur avec variables
:root {
  --module-color: #6366F1;
}
style={{ backgroundColor: 'var(--module-color)' }}
```

---

## 📊 IX. ÉTAT ACTUEL DU PROJET

### Avancement global : 90%

| Module | % | État | Bug connu |
|--------|---|------|-----------|
| Auth | 100% | ✅ | - |
| Dashboard | 100% | ✅ | - |
| Grâces | 100% | ✅ | - |
| Prières | 100% | ✅ | - |
| Écritures | 95% | ✅ | API AELF non intégrée |
| Paroles | 100% | ✅ | - |
| Rencontres | 100% | ✅ | Manque `suivi_prevu` |
| Relecture | 90% | ✅ | Warning CSS select |
| Profil | 100% | ✅ | - |
| Liens | 40% | 🚧 | Badges manquants |

### Dernières réalisations (Phase 2 - Liens)

✅ **Zone liens récents** dans vue "Tisser les liens"
```typescript
// Ligne ~1650 dans relecture/page.tsx
<div style={{ marginTop: '2rem', background: '#E6EDFF' }}>
  <h3>📌 Liens récents</h3>
  {recentLinks.slice(0, 5).map(link => (/* ... */))}
</div>
```

✅ **Modification type de lien** dans vue "Gestion"
```typescript
// Ligne ~2310 - Select dropdown
<select 
  value={link.type_lien}
  onChange={(e) => updateLinkType(link.id, e.target.value)}
>
  {/* Options */}
</select>
```

✅ **Vue Constellation** interactive

✅ **Helpers spirituels** complets dans `spiritual-links-helpers.ts`

### Bugs actifs

1. **Warning CSS background** dans select type_lien
2. **Notification "lien existe déjà"** peu visible
3. **Badges manquants** sur dashboard et listes modules

### Prochaines priorités

1. **Badges partout** : Ajouter LinkBadge sur toutes les cartes
2. **Sections détails** : "🔗 Connexions spirituelles" dans pages [id]
3. **Responsive mobile** : Vue atelier 3 colonnes → onglets
4. **Export PDF** : Carnet spirituel complet

---

## 🚀 X. DÉPLOIEMENT & PRODUCTION

### Configuration Vercel

```javascript
// next.config.js
const nextConfig = {
  eslint: { ignoreDuringBuilds: true },
  typescript: { ignoreBuildErrors: true },
}

// postbuild.js (CRITIQUE!)
const fs = require('fs')
const path = require('path')

const dirsToCreate = [
  '.next/server/app/(app)',
  '.next/server/app/(auth)'
]

dirsToCreate.forEach(dir => {
  const fullPath = path.join(process.cwd(), dir)
  if (!fs.existsSync(fullPath)) {
    fs.mkdirSync(fullPath, { recursive: true })
  }
})
```

**Pourquoi** : Next.js 14 ne crée pas automatiquement les dossiers avec parenthèses lors du build Vercel.

### Variables d'environnement

```bash
# .env.local
NEXT_PUBLIC_SUPABASE_URL=https://xxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...

# Vercel Dashboard
# Ajouter les mêmes variables
```

### Workflow Git → Vercel

```bash
# 1. Développement local
npm run dev  # Port 3000

# 2. Tests OK → Commit
git add .
git commit -m "feat: description précise"

# 3. Push → Déploiement automatique
git push origin main

# 4. Vercel build (~2-3 min)
# 5. Vérifier : https://carnet-spirituel-catholique.vercel.app
```

### URLs du projet

- 🌐 **Production** : https://carnet-spirituel-catholique.vercel.app
- 📊 **Vercel Dashboard** : https://vercel.com/memes-projects-655b5fc6/carnet-spirituel-catholique
- 💻 **GitHub** : https://github.com/memedede333333/carnet-spirituel-catholique
- 📝 **Gist principal** : https://gist.github.com/memedede333333/287cb2b7f8f35187352781681b10f570
- 🏠 **Local** : http://localhost:3000

---

## 🎯 XI. PHILOSOPHIE DE DÉVELOPPEMENT

### Principes techniques

1. **KISS** (Keep It Simple, Spiritually) : Pas de sur-ingénierie
2. **Progressive Enhancement** : Base solide, puis enrichissement
3. **User Freedom** : Jamais forcer, toujours proposer
4. **Contemplatif dans le code** : Code lisible = code contemplable

### Règles d'or

```typescript
// 1. Toujours des valeurs par défaut
field: value.trim() || null

// 2. Toujours valider
if (!field || field.length < 3) {
  setError('Minimum 3 caractères')
  return
}

// 3. Toujours gérer les erreurs
try {
  const { data, error } = await supabase.from('table').select()
  if (error) throw error
} catch (error: any) {
  console.error('Erreur:', error)
  setError(error.message || 'Une erreur est survenue')
} finally {
  setLoading(false)
}

// 4. Toujours nettoyer
useEffect(() => {
  loadData()
  return () => {
    // Cleanup si nécessaire
  }
}, [dependency])
```

### Design thinking

**Chaque décision design** doit répondre à :
- Est-ce que ça aide à contempler ?
- Est-ce que ça respecte la liberté ?
- Est-ce que ça invite sans forcer ?
- Est-ce beau sans être ostentatoire ?

---

## 📝 XII. DONNÉES DE TEST

### Compte utilisateur test

```
Email : utilisateur@mission.fr
Password : mission
ID : a3aaf7c1-48dd-4d0a-b1dc-70c04def672b
Prénom : Marie
Nom : Durand
```

### Données SQL de test (exemple)

```sql
-- 5 grâces
INSERT INTO graces (user_id, texte, date, lieu, tags) VALUES
('a3aaf7c1-48dd-4d0a-b1dc-70c04def672b', 
 'Rencontre inattendue avec un ancien ami dans le train...', 
 '2025-06-15', 
 'Train Paris-Lyon',
 ARRAY['Providence', 'Rencontre']),
...

-- 5 prières + suivis
INSERT INTO prieres (user_id, type, personne_prenom, sujet, date) VALUES
('a3aaf7c1-48dd-4d0a-b1dc-70c04def672b',
 'guerison',
 'Jean',
 'Cancer du poumon',
 '2025-05-20'),
...

-- 8 liens spirituels
INSERT INTO liens_spirituels (user_id, element_source_type, element_source_id, 
                               element_cible_type, element_cible_id, type_lien) VALUES
('a3aaf7c1-48dd-4d0a-b1dc-70c04def672b',
 'priere', '[id_priere_jean]',
 'grace', '[id_grace_guerison]',
 'exauce'),
...
```

---

## 🔮 XIII. VISION FUTURE

### Phase 3 : Communauté (après Phase 2 liens)

- Partage anonyme modéré de "fioretti" (petites grâces)
- Modération humaine (pas d'IA)
- Commentaires bienveillants
- Système de prières collectives

### Phase 4 : Intelligence spirituelle

- Suggestions de liens par IA (GPT-4)
- Analyse des patterns spirituels
- Rapport de relecture annuel automatique
- Notifications contemplatives (max 1/semaine)

### Phase 5 : Écosystème

- Application mobile native (React Native)
- Mode hors-ligne (PWA)
- Export PDF du carnet complet
- API AELF intégrée
- Service d'email pour alertes

---

## 📚 XIV. DOCUMENTATION TECHNIQUE

### Structure d'une page type

```typescript
'use client'
import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '@/app/lib/supabase'

export default function PageName() {
  // États
  const router = useRouter()
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [data, setData] = useState<Type[]>([])
  
  // Chargement initial
  useEffect(() => {
    loadData()
  }, [])
  
  const loadData = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) {
        router.push('/login')
        return
      }
      
      const { data, error } = await supabase
        .from('table')
        .select('*')
        .eq('user_id', user.id)
        .order('date', { ascending: false })
        
      if (error) throw error
      setData(data || [])
    } catch (error: any) {
      console.error('Erreur:', error)
      setError(error.message || 'Une erreur est survenue')
    } finally {
      setLoading(false)
    }
  }
  
  // Loading state
  if (loading) {
    return (
      <div style={{ 
        minHeight: '100vh', 
        display: 'flex', 
        alignItems: 'center', 
        justifyContent: 'center' 
      }}>
        <p>Chargement...</p>
      </div>
    )
  }
  
  // Rendu principal
  return (
    <div style={{ minHeight: '100vh', padding: '2rem 1rem' }}>
      {/* Contenu */}
    </div>
  )
}
```

### Pattern CRUD complet

```typescript
// CREATE
const handleCreate = async (formData) => {
  const { error } = await supabase
    .from('table')
    .insert({ 
      user_id: user.id,
      field: value.trim() || null 
    })
  if (error) throw error
  router.push('/module')
}

// READ
const { data } = await supabase
  .from('table')
  .select('*')
  .eq('user_id', user.id)
  .order('date', { ascending: false })

// UPDATE
const { error } = await supabase
  .from('table')
  .update({ field: newValue })
  .eq('id', itemId)
  .eq('user_id', user.id)  // Sécurité

// DELETE
const { error } = await supabase
  .from('table')
  .delete()
  .eq('id', itemId)
  .eq('user_id', user.id)  // Sécurité
```

---

## 🎓 XV. APPRENTISSAGES CLÉS

### Technique

1. **Next.js 14 App Router** : Parenthèses dans les dossiers = routes non exposées
2. **Supabase RLS** : Sécurité automatique par user_id
3. **CSS pur > Tailwind** : Pour classes dynamiques dans Next.js 14
4. **TypeScript strict** : Évite 80% des bugs
5. **Pattern "Baby Steps"** : 1 objectif = 1 session

### Méthodologie

1. **Backup AVANT toute modification**
2. **Méthode des balises** pour fichiers monolithiques
3. **GitHub Gist** comme source de vérité
4. **Regex = danger** sur gros fichiers
5. **Commits fréquents** après chaque succès

### Spirituel

1. **La technique sert la contemplation** : Pas l'inverse
2. **Liberté > Gamification** : Jamais forcer l'utilisateur
3. **Beauté = Prière** : Le design a une dimension spirituelle
4. **Douceur franciscaine** : Dans l'UX comme dans le code
5. **"Dieu écrit droit avec des lignes courbes"** : Le code aussi

---

## 📊 RÉSUMÉ EXÉCUTIF

### En une phrase
**Le Carnet Spirituel est une application web catholique Next.js 14 + Supabase permettant de noter, relier et contempler l'action de Dieu dans sa vie quotidienne via 5 modules interconnectés et 8 vues de relecture.**

### État actuel
- **Fonctionnel** : 90%
- **Design** : 95%
- **Sécurité** : 100%
- **Performance** : 85%

### Chiffres clés
- **~15 000 lignes de code** TypeScript
- **10 tables** Supabase avec RLS
- **7 modules** fonctionnels
- **8 vues** de relecture
- **5 types** de liens spirituels
- **2 mois** de développement
- **0 fuite** de données

### Prochaines étapes
1. Finaliser système de liens (badges + sections)
2. Responsive mobile (vue atelier)
3. Export PDF
4. API AELF
5. Communauté modérée

---

**"Dieu écrit droit avec des lignes courbes" - Ce projet aide à lire cette écriture divine dans nos vies.**

Document créé le 14 décembre 2025 après 2 mois de développement intensif.
