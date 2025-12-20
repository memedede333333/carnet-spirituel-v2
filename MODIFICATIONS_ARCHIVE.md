# Modifications à apporter à /app/(app)/admin/moderation/page.tsx

## 1. Ligne ~272 - Ajouter le toggle après les filtres

CHERCHER (ligne ~271-272):
```tsx
                    )))}
                </div>
```

REMPLACER PAR:
```tsx
                    )))}
                </div>

                {/* Toggle archivés */}
                <div style={{ marginTop: '1rem' }}>
                    <ArchiveToggle showArchived={showArchived} onToggle={setShowArchived} />
                </div>
```

---

## 2. Ligne ~310 - Ajouter onArchiveChange à l'appel

CHERCHER (ligne ~310-311):
```tsx
                                onEdit={() => setEditingFioretto(fioretto)}
                            />
```

REMPLACER PAR:
```tsx
                                onEdit={() => setEditingFioretto(fioretto)}
                                onArchiveChange={checkAdminAndFetch}
                            />
```

---

## 3. Ligne ~363-374 - Modifier la signature de FiorettoModerationCard

CHERCHER (ligne ~363-375):
```tsx
function FiorettoModerationCard({
    fioretto,
    onApprove,
    onReject,
    onPreview,
    onEdit
}: {
    fioretto: Fioretto;
    onApprove: () => void;
    onReject: () => void;
    onPreview: () => void;
    onEdit: () => void;
}) {
```

REMPLACER PAR:
```tsx
function FiorettoModerationCard({
    fioretto,
    onApprove,
    onReject,
    onPreview,
    onEdit,
    onArchiveChange
}: {
    fioretto: Fioretto;
    onApprove: () => void;
    onReject: () => void;
    onPreview: () => void;
    onEdit: () => void;
    onArchiveChange: () => void;
}) {
```

---

## 4. Dans FiorettoModerationCard - Ajouter le badge et le bouton

Cherchez dans le corps de `FiorettoModerationCard` où est affiché le contenu du fioretto.

### A. Ajouter le badge archivé (probablement vers ligne ~400, dans le header de la carte)

AJOUTER après le titre ou le type :
```tsx
{fioretto.archived_at && <ArchivedBadge />}
```

### B. Ajouter le bouton archiver (dans la zone des actions, probablement vers ligne ~450-500)

CHERCHER où sont les boutons "Valider" et "Refuser", et AJOUTER :
```tsx
<ArchiveManager fioretto={fioretto} onArchiveChange={onArchiveChange} />
```

---

## Résumé

✅ 4 modifications à faire
✅ Toutes les lignes sont indiquées
✅ Copier-coller le code de remplacement

Une fois fait, rafraîchissez la page `/admin/moderation` et testez !
