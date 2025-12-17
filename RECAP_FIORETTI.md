# 🌸 RÉCAPITULATIF COMPLET - Fonctionnalité FIORETTI

## 📋 CONTEXTE GÉNÉRAL

**Objectif :** Permettre aux utilisateurs de partager leurs grâces, prières, écritures, paroles, et rencontres dans un "Jardin des Fioretti" public, après modération par un admin.

**Workflow complet :**
1. Utilisateur partage un élément (grâce, prière, etc.) via un bouton "Partager"
2. L'élément passe en statut "proposé" dans la table `fioretti`
3. Admin/Modérateur examine, peut modifier, et approuve/refuse
4. Si approuvé, l'élément apparaît dans le Jardin public (`/fioretti`)
5. Les visiteurs peuvent "prier" ou "rendre grâce" sur les fioretti

---

## 🗄️ SCHÉMA BASE DE DONNÉES

### Table `fioretti`
```sql
CREATE TABLE fioretti (
  id UUID PRIMARY KEY,
  user_id UUID REFERENCES profiles(id),
  element_type TEXT CHECK (element_type IN ('grace', 'priere', 'ecriture', 'parole', 'rencontre')),
  element_id UUID,  -- ID de l'élément source
  contenu_affiche JSONB,  -- Snapshot du contenu formaté
  message_ajout TEXT,  -- Message personnel optionnel de l'utilisateur
  anonyme BOOLEAN DEFAULT true,
  pseudo TEXT,
  moderateur_id UUID REFERENCES profiles(id),
  date_publication TIMESTAMP,
  statut TEXT DEFAULT 'propose' CHECK (statut IN ('propose', 'approuve', 'refuse')),
  
  -- Colonnes pour édition (ajoutées récemment)
  message_moderateur TEXT,  -- Message privé du modérateur à l'auteur
  contenu_original JSONB,   -- Backup du contenu avant modification
  date_moderation TIMESTAMP,
  
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);
```

### Table `notifications` (nouvelle)
```sql
CREATE TABLE notifications (
  id UUID PRIMARY KEY,
  user_id UUID REFERENCES profiles(id),
  type TEXT CHECK (type IN ('fioretto_approuve', 'fioretto_refuse', 'fioretto_modifie', 'message_moderateur')),
  fioretto_id UUID REFERENCES fioretti(id),
  message TEXT,
  lu BOOLEAN DEFAULT false,
  created_at TIMESTAMP DEFAULT NOW()
);
```

### Colonnes ajoutées aux tables sources
Chaque table source (`graces`, `prieres`, `paroles_ecriture`, `paroles_connaissance`, `rencontres_missionnaires`) a :
```sql
ALTER TABLE <table> ADD COLUMN statut_partage TEXT CHECK (statut_partage IN ('propose', 'approuve', 'refuse'));
```

### RLS Policies
```sql
-- fioretti : Public lit les approuvés, auteur voit ses proposés
CREATE POLICY "Public voyent approuvés" ON fioretti FOR SELECT USING (statut = 'approuve');
CREATE POLICY "Auteurs voyent leurs proposés" ON fioretti FOR SELECT USING (auth.uid() = user_id);

-- notifications : Users voient leurs propres notifications
CREATE POLICY "Users see their own notifications" ON notifications FOR SELECT USING (auth.uid() = user_id);
```

---

## 🎨 COMPOSANTS CRÉÉS

### 1. `FiorettiButton.tsx` ✅ TERMINÉ
**Emplacement :** `/app/components/FiorettiButton.tsx`

**Fonctionnalité :**
- Bouton "🌸 Partager" affiché en bas de chaque page détail
- Couleurs dynamiques selon le type d'élément
- Ouvre la modale `ShareFiorettoModal`

**Couleurs par type :**
```typescript
grace: bg #FFFBEB, hover #FEF3C7, text #78350F
priere: bg #EFF6FF, hover #DBEAFE, text #1E3A8A
ecriture: bg #ECFDF5, hover #D1FAE5, text #065F46
parole: bg #F0F9FF, hover #E0F2FE, text #075985
rencontre: bg #FFF7ED, hover #FED7AA, text #92400E
```

**Intégration :** Ajouté dans :
- `/app/(app)/graces/[id]/page.tsx`
- `/app/(app)/prieres/[id]/page.tsx`
- `/app/(app)/ecritures/[id]/page.tsx`
- `/app/(app)/paroles/[id]/page.tsx`
- `/app/(app)/rencontres/[id]/page.tsx`

---

### 2. `ShareFiorettoModal.tsx` ✅ TERMINÉ
**Emplacement :** `/app/components/ShareFiorettoModal.tsx`

**Fonctionnalité :**
- Modale pour partager un élément
- Affiche le contenu formaté complet (texte + métadonnées)
- Champ optionnel "Message personnel" (textarea 200px fixe avec scroll)
- Toggle "Rester anonyme" / "Signature avec pseudo"
- Champ pseudo (si signature choisie)
- Bouton "Partager dans le jardin"

**Couleurs dynamiques :** Utilise `TYPE_CONFIG` pour adapter les couleurs (header, bordures, boutons, textarea, toggle switch, gradient fade)

**Formatage du contenu :**
Le contenu est formatté **dans les pages détails** (pas dans la modale) via `useState` + `useEffect` :

**Exemple pour Grâces :**
```typescript
const [formattedContent, setFormattedContent] = useState('');
useEffect(() => {
  if (!grace) return;
  setFormattedContent(`${grace.texte}\n\n📅 ${formatDate(grace.date_grace)}\n📍 ${grace.lieu || 'Non précisé'}`);
}, [grace]);
```

**Exemple pour Prières :**
```typescript
const [formattedContent, setFormattedContent] = useState('');
useEffect(() => {
  if (!priere) return;
  setFormattedContent(`🙏 ${priere.sujet}\n\n🗓️ Depuis le ${formatDate(priere.date_debut)}\n📊 ${priere.compteur || 0} prières`);
}, [priere]);
```

**Exemple pour Rencontres (complet avec suivis) :**
```typescript
const [formattedContent, setFormattedContent] = useState('');
useEffect(() => {
  if (!rencontre) return;
  let content = `${rencontre.texte}\n\n📅 ${formatDate(rencontre.date_rencontre)}\n👤 ${rencontre.prenom_personne}`;
  
  if (suivis && suivis.length > 0) {
    content += '\n\n--- SUIVIS ---\n';
    suivis.forEach((suivi, idx) => {
      content += `\n${idx + 1}. ${formatDate(suivi.date_suivi)}\n${suivi.notes}`;
      if (suivi.fruits?.length > 0) {
        content += `\n🍇 Fruits : ${suivi.fruits.join(', ')}`;
      }
    });
  }
  setFormattedContent(content);
}, [rencontre, suivis]);
```

**Soumission :**
Lors du partage, crée une entrée dans `fioretti` avec :
```typescript
{
  user_id: auth.uid(),
  element_type: 'grace' | 'priere' | ...,
  element_id: elementId,
  contenu_affiche: { texte: formattedContent, date: ..., ... },  // JSONB
  message_ajout: messageAjout || null,
  anonyme: anonyme,
  pseudo: anonyme ? null : pseudo,
  statut: 'propose'
}
```

ET met à jour la table source :
```typescript
UPDATE <table_source> SET statut_partage = 'propose' WHERE id = elementId;
```

---

### 3. `EditFiorettoModal.tsx` ✅ TERMINÉ
**Emplacement :** `/app/components/EditFiorettoModal.tsx`

**Fonctionnalité :**
- Modale pour modérateur : modifier un fioretto avant approbation
- Textarea d'édition (pré-rempli avec `contenu_affiche.texte`)
- Textarea "Message privé au contributeur" (optionnel)
- Info bulle : "💡 Ce message sera visible uniquement par l'auteur"
- Bouton "Enregistrer et Approuver"

**Workflow :**
1. Modérateur clique sur ✏️ Modifier
2. Peut corriger texte (orthographe, reformulation)
3. Peut ajouter message privé (ex: "J'ai corrigé l'orthographe")
4. Enregistrement = Approbation automatique + notification auteur

---

### 4. Page Modération Admin ✅ TERMINÉ
**Emplacement :** `/app/(app)/admin/moderation/page.tsx`

**Accès :** `/admin/moderation` (réservé rôle `superadmin` ou `moderateur`)

**Fonctionnalités :**
✅ Vérification rôle admin
✅ Fetch fioretti en statut `propose`
✅ Filtres par type (Tout, Grâce, Prière, Écriture, Parole, Rencontre)
✅ Compteurs par type
✅ Cartes colorées par type
✅ **UX Améliorée :**
  - Cadre complet cliquable pour prévisualisation
  - Indicateur discret "(...)" en bas à droite
  - Tooltips natifs sur les boutons
✅ Modale de prévisualisation (`PreviewModal`)
✅ Modale d'édition (`EditFiorettoModal`) avec message privé
✅ Notifications automatiques

**État :** Fonctionnel et ergonomique.

---

### 5. Page Jardin Public 🚧 À REFACTORER COMPLÈTEMENT
**Emplacement :** `/app/(app)/fioretti/page.tsx`

**État actuel :**
- Existe avec fetch basique des fioretti approuvés
- Utilise `FiorettoCard` pour affichage
- **PROBLÈME :** Ne correspond PAS aux specs du cahier des charges
  
**À REFAIRE selon cahier des charges :**
1. Design moderne et "waouh"
2. Cards améliorées par type
3. Modal détail au clic (pas de navigation)
4. Interactions (prier/rendre grâce) nécessitent login
5. Page publique (accessible sans login pour lecture)

**Plan à suivre :** Voir `/implementation_plan.md` créé précédemment

---

## 📝 FICHIERS SQL À EXÉCUTER

### ⚠️ IMPORTANT : Scripts à exécuter dans Supabase

1. **`/scripts/create_fioretti_tables.sql`** - Création tables initiales ✅ FAIT
2. **`/scripts/add_moderation_edit_feature.sql`** - Ajout colonnes édition + notifications ⚠️ À VÉRIFIER SI EXÉCUTÉ

Contenu du script `add_moderation_edit_feature.sql` :
```sql
-- 1. Ajouter colonnes à fioretti
ALTER TABLE fioretti ADD COLUMN IF NOT EXISTS message_moderateur TEXT;
ALTER TABLE fioretti ADD COLUMN IF NOT EXISTS contenu_original JSONB;
ALTER TABLE fioretti ADD COLUMN IF NOT EXISTS date_moderation TIMESTAMP WITH TIME ZONE;

-- 2. Créer table notifications
CREATE TABLE IF NOT EXISTS notifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  type TEXT NOT NULL CHECK (type IN ('fioretto_approuve', 'fioretto_refuse', 'fioretto_modifie', 'message_moderateur')),
  fioretto_id UUID REFERENCES fioretti(id) ON DELETE CASCADE,
  message TEXT,
  lu BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 3. RLS
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users see their own notifications" ON notifications FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users mark their notifications as read" ON notifications FOR UPDATE USING (auth.uid() = user_id);

-- 4. Index
CREATE INDEX IF NOT EXISTS idx_notifications_user_id ON notifications(user_id);
CREATE INDEX IF NOT EXISTS idx_notifications_lu ON notifications(lu) WHERE lu = false;
```

---

## 🔄 WORKFLOW TECHNIQUE COMPLET

### Partage d'un élément

1. **Page détail** (ex: `/graces/[id]`)
   - `useEffect` formate le contenu → `setFormattedContent(...)`
   - Bouton `FiorettiButton` → `onClick` → ouvre `ShareFiorettoModal`

2. **Dans ShareFiorettoModal**
   - Affiche `formattedContent` (passé en prop)
   - User remplit message optionnel
   - User choisit anonymat
   - Clic "Partager" :
     ```typescript
     // 1. Insert fioretto
     await supabase.from('fioretti').insert({
       user_id: auth.uid(),
       element_type: elementType,
       element_id: elementId,
       contenu_affiche: { texte: formattedContent, ...metadata },
       message_ajout: message || null,
       anonyme: isAnonymous,
       pseudo: isAnonymous ? null : pseudo,
       statut: 'propose'
     });
     
     // 2. Update source table
     await supabase.from(tableName).update({
       statut_partage: 'propose'
     }).eq('id', elementId);
     ```

### Modération

1. **Admin va sur `/admin/moderation`**
   - Vérif rôle
   - Fetch `fioretti` WHERE `statut = 'propose'`
   - Affiche cartes

2. **Actions possibles :**

   **A. Approuver directement :**
   ```typescript
   await supabase.from('fioretti').update({
     statut: 'approuve',
     moderateur_id: user.id,
     date_publication: NOW()
   }).eq('id', fiorettoId);
   
   await supabase.from(tableName).update({
     statut_partage: 'approuve'
   }).eq('id', elementId);
   
   // Notification
   await supabase.from('notifications').insert({
     user_id: fioretto.user_id,
     type: 'fioretto_approuve',
     fioretto_id: fiorettoId,
     message: 'Votre fioretto a été approuvé...'
   });
   ```

   **B. Refuser :**
   ```typescript
   await supabase.from('fioretti').update({
     statut: 'refuse',
     moderateur_id: user.id
   }).eq('id', fiorettoId);
   
   await supabase.from(tableName).update({
     statut_partage: 'refuse'
   }).eq('id', elementId);
   
   // Notification
   await supabase.from('notifications').insert({
     user_id: fioretto.user_id,
     type: 'fioretto_refuse',
     fioretto_id: fiorettoId,
     message: 'Votre fioretto n\'a pas été approuvé...'
   });
   ```

   **C. Modifier puis approuver :**
   ```typescript
   // Modale EditFiorettoModal
   // User modifie texte + ajoute message
   
   await supabase.from('fioretti').update({
     contenu_original: fioretto.contenu_affiche,  // Backup
     contenu_affiche: { ...currentContent, texte: editedText },
     message_moderateur: moderatorMessage,
     statut: 'approuve',
     moderateur_id: user.id,
     date_publication: NOW(),
     date_moderation: NOW()
   }).eq('id', fiorettoId);
   
   await supabase.from(tableName).update({
     statut_partage: 'approuve'
   }).eq('id', elementId);
   
   // Notification
   await supabase.from('notifications').insert({
     user_id: fioretto.user_id,
     type: moderatorMessage ? 'message_moderateur' : 'fioretto_approuve',
     fioretto_id: fiorettoId,
     message: moderatorMessage || 'Votre fioretto a été approuvé...'
   });
   ```

### Affichage public (À FAIRE)

1. Page `/fioretti`
   - Fetch `fioretti` WHERE `statut = 'approuve'` ORDER BY `date_publication DESC`
   - Affichage cards stylées
   - Clic card → Modale détail
   - Boutons interaction (nécessitent auth)

---

## ✅ CHECKLIST - Ce qui est FAIT

- [x] Schéma DB `fioretti` + `fioretti_interactions`
- [x] Colonnes `statut_partage` dans tables sources
- [x] RLS policies
- [x] Composant `FiorettiButton`
- [x] Composant `ShareFiorettoModal`
- [x] Intégration boutons dans pages détails (5 modules)
- [x] Formatage du contenu dans pages détails
- [x] Composant `EditFiorettoModal`
- [x] Page modération `/admin/moderation`
  - [x] Fetch pending
  - [x] Filtres par type
  - [x] Cards colorées
  - [x] Actions Approuver/Refuser
  - [x] Prévisualisation
  - [x] Édition avec feedback privé
  - [x] Notifications automatiques
- [x] Schéma DB `notifications`
- [x] Script SQL édition/notifications

---

## 🐛 BUGS / PROBLÈMES ACTUELS

### CRITIQUE
1. **Tooltip zone de contenu ne s'affiche pas** (page modération)
2. **Clic sur zone de contenu** (à vérifier si fonctionne)

### UX
3. **Indicateur "..." pas assez clair** que c'est cliquable
4. **Pas de hover visuel** sur zone de contenu cliquable

### MANQUANT
5. **Page Jardin `/fioretti`** - À refactorer complètement selon cahier des charges
6. **Page "Mes Fioretti"** - Pour que l'utilisateur voie ses soumissions + messages modérateur
7. **Centre notifications** - Badge + liste des notifications
8. **Tests complets** - Workflow end-to-end pas testé

---

## 🎯 PROCHAINES ÉTAPES POUR CLAUDE

### 1. PRIORITÉ IMMÉDIATE : Débugger page modération

**Problèmes à résoudre :**
- Tooltip qui ne s'affiche pas → Tester avec `className` + CSS hover au lieu de inline events
- Vérifier que `onClick` fonctionne sur zone de contenu
- Améliorer UX indicateur de contenu continue

**Solution recommandée :**
Créer fichier CSS module `/app/(app)/admin/moderation/moderation.module.css` :
```css
.contentPreview {
  background: #FFFEF7;
  border: 2px solid #FEF3C7;
  border-radius: 0.75rem;
  padding: 1rem;
  margin-bottom: 1rem;
  position: relative;
  cursor: pointer;
  transition: all 0.2s;
}

.contentPreview:hover {
  border-color: #F59E0B;
  box-shadow: 0 0 0 3px rgba(245, 158, 11, 0.1);
}

.contentPreview:hover .hoverBadge {
  opacity: 1;
}

.hoverBadge {
  position: absolute;
  top: 0.5rem;
  right: 0.5rem;
  background: rgba(245, 158, 11, 0.95);
  color: white;
  padding: 0.25rem 0.5rem;
  border-radius: 0.375rem;
  font-size: 0.7rem;
  font-weight: 500;
  opacity: 0;
  transition: opacity 0.2s;
  pointer-events: none;
}
```

Et utiliser dans le composant :
```typescript
import styles from './moderation.module.css';

<div 
  className={styles.contentPreview}
  onClick={onPreview}
>
  ...
  <div className={styles.hoverBadge}>
    👁️ Voir tout
  </div>
</div>
```

### 2. Refactorer Jardin des Fioretti

Suivre le plan d'implémentation créé avec :
- Design moderne et waouh
- Cards améliorées
- Modal détail
- Auth pour interactions

### 3. Créer page "Mes Fioretti"

Pour que l'utilisateur voie :
- Ses fioretti soumis
- Statut (proposé/approuvé/refusé)
- Messages du modérateur

### 4. Implémenter centre de notifications

Avec badge nombre non lus + liste

---

## 📦 FICHIERS IMPORTANTS

### Composants
- `/app/components/FiorettiButton.tsx`
- `/app/components/ShareFiorettoModal.tsx`
- `/app/components/EditFiorettoModal.tsx`
- `/app/components/FiorettoCard.tsx` (à améliorer)

### Pages
- `/app/(app)/admin/moderation/page.tsx` (bugs UX à fix)
- `/app/(app)/fioretti/page.tsx` (à refactorer)
- `/app/(app)/graces/[id]/page.tsx` (intégration fioretti OK)
- `/app/(app)/prieres/[id]/page.tsx` (intégration fioretti OK)
- `/app/(app)/ecritures/[id]/page.tsx` (intégration fioretti OK)
- `/app/(app)/paroles/[id]/page.tsx` (intégration fioretti OK)
- `/app/(app)/rencontres/[id]/page.tsx` (intégration fioretti OK)

### Scripts SQL
- `/scripts/create_fioretti_tables.sql` ✅ Exécuté
- `/scripts/add_moderation_edit_feature.sql` ⚠️ À vérifier si exécuté
- `/scripts/grant_admin.sql` (donner rôle superadmin)

### Types
- `/app/types/index.ts` - Définition type `Fioretto`

---

## 🎨 DESIGN SYSTEM FIORETTI

### Couleurs par type
```typescript
TYPE_CONFIG = {
  grace: {
    icon: '✨', label: 'Grâce',
    bg: '#FFFBEB', border: '#FEF3C7', text: '#78350F'
  },
  priere: {
    icon: '🙏', label: 'Prière',
    bg: '#EFF6FF', border: '#DBEAFE', text: '#1E3A8A'
  },
  ecriture: {
    icon: '📖', label: 'Écriture',
    bg: '#ECFDF5', border: '#D1FAE5', text: '#065F46'
  },
  parole: {
    icon: '🕊️', label: 'Parole',
    bg: '#F0F9FF', border: '#E0F2FE', text: '#075985'
  },
  rencontre: {
    icon: '🤝', label: 'Rencontre',
    bg: '#FFF7ED', border: '#FED7AA', text: '#92400E'
  }
};
```

### Principes ergonomiques
- Couleurs cohérentes à travers toute l'interface
- Feedback visuel au hover
- Tooltips explicites
- Design moderne et premium
- Pas de placeholders - tout doit fonctionner

---

## 💡 NOTES IMPORTANTES POUR CLAUDE

1. **Ne PAS utiliser Tailwind** - Tout en inline styles ou CSS modules
2. **Toujours tester les tooltips natifs** - Le `title` HTML devrait suffire
3. **Hover effects en CSS** - Pas d'events handlers inline (onMouseEnter/Leave)
4. **Types cohérents** - Vérifier que `Fioretto` type est à jour dans `/app/types/index.ts`
5. **RLS crucial** - Vérifier que les policies permettent bien :
   - Public lecture fioretti approuvés
   - Auteur lecture ses proposés
   - Admin modification
6. **Notifications** - Créer systématiquement lors des actions de modération
7. **Backup contenu_original** - Toujours sauvegarder avant modification

---

## 🧪 TESTS À EFFECTUER

### Workflow complet
- [ ] Partager une grâce → Vérifier DB `fioretti` + `graces.statut_partage`
- [ ] Partager une prière → Vérifier DB
- [ ] Partager une rencontre avec suivis → Vérifier formatage complet
- [ ] Approuver un fioretto → Vérifier `statut`, `date_publication`, notification
- [ ] Refuser un fioretto → Vérifier `statut`, notification
- [ ] Modifier puis approuver → Vérifier `contenu_original`, `message_moderateur`, notification
- [ ] Voir fioretti approuvés dans jardin public
- [ ] Interactions (prier/grâce) nécessitent auth

### Permissions
- [ ] Non-connecté : peut voir jardin, pas d'interactions
- [ ] User : peut partager, voir jardin, interagir
- [ ] Non-admin : pas accès `/admin/moderation`
- [ ] Admin/Moderateur : accès modération

### UI/UX
- [ ] Tooltips s'affichent
- [ ] Hover effects fonctionnent
- [ ] Modales responsive
- [ ] Couleurs cohérentes
- [ ] Animations fluides

---

**FIN DU RÉCAPITULATIF**

Ce document doit être lu ENTIÈREMENT par Claude avant de continuer le travail sur les Fioretti.
