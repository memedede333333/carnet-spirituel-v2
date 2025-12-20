'use client';

interface StatusFilterProps {
    selected: 'propose' | 'approuve' | 'refuse';
    onSelect: (status: 'propose' | 'approuve' | 'refuse') => void;
}

export default function StatusFilter({ selected, onSelect }: StatusFilterProps) {
    return (
        <div style={{
            display: 'flex',
            gap: '0.5rem',
            marginBottom: '1rem',
            paddingBottom: '1rem',
            borderBottom: '1px solid #E2E8F0'
        }}>
            <button
                onClick={() => onSelect('propose')}
                style={{
                    padding: '0.5rem 1rem',
                    borderRadius: '0.5rem',
                    background: selected === 'propose' ? '#3B82F6' : 'white',
                    color: selected === 'propose' ? 'white' : '#64748B',
                    border: selected === 'propose' ? 'none' : '1px solid #E2E8F0',
                    fontWeight: '600',
                    cursor: 'pointer',
                    transition: 'all 0.2s'
                }}
            >
                ⏳ En attente
            </button>
            <button
                onClick={() => onSelect('approuve')}
                style={{
                    padding: '0.5rem 1rem',
                    borderRadius: '0.5rem',
                    background: selected === 'approuve' ? '#10B981' : 'white',
                    color: selected === 'approuve' ? 'white' : '#64748B',
                    border: selected === 'approuve' ? 'none' : '1px solid #E2E8F0',
                    fontWeight: '600',
                    cursor: 'pointer',
                    transition: 'all 0.2s'
                }}
            >
                ✅ Validés
            </button>
            <button
                onClick={() => onSelect('refuse')}
                style={{
                    padding: '0.5rem 1rem',
                    borderRadius: '0.5rem',
                    background: selected === 'refuse' ? '#EF4444' : 'white',
                    color: selected === 'refuse' ? 'white' : '#64748B',
                    border: selected === 'refuse' ? 'none' : '1px solid #E2E8F0',
                    fontWeight: '600',
                    cursor: 'pointer',
                    transition: 'all 0.2s'
                }}
            >
                ❌ Refusés
            </button>
        </div>
    );
}
