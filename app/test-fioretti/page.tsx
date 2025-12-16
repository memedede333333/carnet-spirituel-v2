'use client';

import { useState, useEffect } from 'react';
import FiorettiButton from '@/app/components/FiorettiButton';

export default function TestFiorettiPage() {
    // 1. Données de test (Mock data)
    const testPriere = {
        id: 'test-123',
        type: 'guerison',
        personne_prenom: 'Jean',
        personne_nom: 'Dupont',
        sujet: 'Mal de dos chronique',
        sujet_detail: 'Souffre depuis 10 ans, opération prévue le mois prochain.',
        notes: 'Prier pour que l\'opération se passe bien et pour sa famille.',
        statut_partage: 'brouillon'
    };

    const testSuivis = [
        {
            evolution: 'amelioration',
            notes: 'Il va mieux depuis la semaine dernière, moins de douleurs.'
        }
    ];

    // 2. Logique de formatage (identique à la page réelle)
    const [formattedContent, setFormattedContent] = useState('');

    useEffect(() => {
        const lines = [];
        lines.push(`🙏 Prière pour ${testPriere.personne_prenom} ${testPriere.personne_nom}`);
        lines.push('');

        if (testPriere.sujet) lines.push(testPriere.sujet);

        if (testPriere.sujet_detail) {
            lines.push('');
            lines.push(testPriere.sujet_detail);
        }

        if (testPriere.notes) {
            lines.push('');
            lines.push(`💭 ${testPriere.notes}`);
        }

        if (testSuivis.length > 0) {
            const latest = testSuivis[0];
            lines.push('');
            lines.push(`📊 Dernière évolution : Amélioration`);
            lines.push(latest.notes);
        }

        const res = lines.join('\n');
        console.log('TEST PAGE - Generated Content:', res);
        setFormattedContent(res);
    }, []);

    return (
        <div style={{ padding: '4rem', background: '#f0f0f0', minHeight: '100vh' }}>
            <h1>Page de Test Fioretti</h1>
            <p>Cette page isole le composant pour vérifier le formatage.</p>

            <div style={{ background: 'white', padding: '2rem', borderRadius: '1rem', marginTop: '2rem' }}>
                <h2>Prière de Test: Jean Dupont</h2>
                <p><strong>Notes:</strong> {testPriere.notes}</p>
                <p><strong>Suivi:</strong> {testSuivis[0].notes}</p>

                <div style={{ marginTop: '2rem', padding: '1rem', border: '1px dashed grey' }}>
                    <FiorettiButton
                        element={testPriere}
                        elementType="priere"
                        formattedContent={formattedContent}
                    />
                </div>
            </div>
        </div>
    );
}
