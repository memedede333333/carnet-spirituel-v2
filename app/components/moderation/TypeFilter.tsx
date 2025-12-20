'use client';

interface TypeFilterProps {
    selected: 'all' | 'grace' | 'priere' | 'ecriture' | 'parole' | 'rencontre';
    onSelect: (type: 'all' | 'grace' | 'priere' | 'ecriture' | 'parole' | 'rencontre') => void;
    counts: Record<string, number>;
}

const TYPE_CONFIG: Record<string, { icon: string; label: string }> = {
    grace: { icon: '✨', label: 'Grâce' },
    priere: { icon: '🙏', label: 'Prière' },
    ecriture: { icon: '📖', label: 'Écriture' },
    parole: { icon: '🕊️', label: 'Parole' },
    rencontre: { icon: '🤝', label: 'Rencontre' },
};

export default function TypeFilter({ selected, onSelect, counts }: TypeFilterProps) {
    return (
        <div style={{
            display: 'flex',
            flexWrap: 'wrap',
            gap: '0.75rem',
        }}>
            <FilterButton
                active={selected === 'all'}
                onClick={() => onSelect('all')}
                label={`Tout (${counts.all || 0})`}
                emoji="🌸"
            />
            {Object.entries(TYPE_CONFIG).map(([key, config]) => (
                <FilterButton
                    key={key}
                    active={selected === key}
                    onClick={() => onSelect(key as any)}
                    label={`${config.label} (${counts[key] || 0})`}
                    emoji={config.icon}
                />
            ))}
        </div>
    );
}

function FilterButton({ active, onClick, label, emoji }: {
    active: boolean;
    onClick: () => void;
    label: string;
    emoji: string;
}) {
    return (
        <button
            onClick={onClick}
            style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '0.5rem',
                padding: '0.625rem 1rem',
                borderRadius: '9999px',
                border: active ? 'none' : '2px solid #E2E8F0',
                background: active ? '#3B82F6' : 'white',
                color: active ? 'white' : '#475569',
                fontWeight: active ? '600' : '500',
                cursor: 'pointer',
                fontSize: '0.875rem',
                boxShadow: active ? '0 2px 4px rgba(59, 130, 246, 0.3)' : 'none',
                transition: 'all 0.2s'
            }}
        >
            <span>{emoji}</span>
            <span>{label}</span>
        </button>
    );
}
