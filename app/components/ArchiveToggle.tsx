'use client';

interface ArchiveToggleProps {
    showArchived: boolean;
    onToggle: (show: boolean) => void;
}

export default function ArchiveToggle({ showArchived, onToggle }: ArchiveToggleProps) {
    return (
        <label style={{
            display: 'flex',
            alignItems: 'center',
            gap: '0.75rem',
            padding: '0.75rem 1rem',
            background: showArchived ? '#FEF3C7' : 'white',
            border: '2px solid #E2E8F0',
            borderRadius: '0.5rem',
            cursor: 'pointer',
            fontSize: '0.875rem',
            fontWeight: '500',
            color: showArchived ? '#92400E' : '#475569',
            transition: 'all 0.2s',
            userSelect: 'none'
        }}
            onMouseEnter={(e) => {
                if (!showArchived) e.currentTarget.style.background = '#F8FAFC';
            }}
            onMouseLeave={(e) => {
                if (!showArchived) e.currentTarget.style.background = 'white';
            }}
        >
            <input
                type="checkbox"
                checked={showArchived}
                onChange={(e) => onToggle(e.target.checked)}
                style={{
                    cursor: 'pointer',
                    width: '18px',
                    height: '18px',
                    accentColor: '#F59E0B'
                }}
            />
            <span style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                🗄️ Afficher les fioretti archivés
            </span>
        </label>
    );
}
