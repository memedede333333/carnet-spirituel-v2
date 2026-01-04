/**
 * Endpoint de santé pour vérifier que le scraping AELF fonctionne
 * 
 * Usage:
 * - GET /api/health/aelf → Teste et renvoie le statut
 * - GET /api/health/aelf?notify=true → Teste et envoie un email récap
 * 
 * Ce endpoint peut être appelé par un cron job (Vercel, UptimeRobot, etc.)
 */

import { NextRequest, NextResponse } from 'next/server';
import { fetchAelfChapter } from '@/app/lib/aelf-scraper';
import { sendEmail } from '@/app/lib/email';

// Livres à tester (variété : Évangile, Psaume, AT, Lettres Paul, Apocalypse)
const TEST_BOOKS = [
    { code: 'Mt', chapter: 5, name: 'Matthieu' },
    { code: 'Ps', chapter: 23, name: 'Psaumes' },
    { code: 'Gn', chapter: 1, name: 'Genèse' },
    { code: '1Tm', chapter: 1, name: '1 Timothée' },
    { code: 'Ap', chapter: 1, name: 'Apocalypse' },
];

interface TestResult {
    book: string;
    code: string;
    chapter: number;
    success: boolean;
    versesCount?: number;
    error?: string;
    responseTime: number;
}

export async function GET(request: NextRequest) {
    const { searchParams } = new URL(request.url);
    const notify = searchParams.get('notify') === 'true';
    const adminEmail = process.env.ADMIN_EMAIL || process.env.GMAIL_USER;

    const results: TestResult[] = [];
    const startTime = Date.now();

    // Tester chaque livre
    for (const book of TEST_BOOKS) {
        const bookStartTime = Date.now();

        try {
            const data = await fetchAelfChapter(`${book.code} ${book.chapter}`);

            results.push({
                book: book.name,
                code: book.code,
                chapter: book.chapter,
                success: data.verses.length > 0,
                versesCount: data.verses.length,
                responseTime: Date.now() - bookStartTime,
                error: data.verses.length === 0 ? 'Aucun verset extrait' : undefined,
            });
        } catch (err: any) {
            results.push({
                book: book.name,
                code: book.code,
                chapter: book.chapter,
                success: false,
                error: err.message,
                responseTime: Date.now() - bookStartTime,
            });
        }

        // Petit délai entre les requêtes
        await new Promise(resolve => setTimeout(resolve, 100));
    }

    const totalTime = Date.now() - startTime;
    const successCount = results.filter(r => r.success).length;
    const failCount = results.filter(r => !r.success).length;
    const allSuccess = failCount === 0;

    const summary = {
        status: allSuccess ? 'healthy' : 'degraded',
        timestamp: new Date().toISOString(),
        totalBooks: TEST_BOOKS.length,
        successCount,
        failCount,
        totalTimeMs: totalTime,
        results,
    };

    // Envoyer un email si demandé ou si erreurs détectées
    if (notify || failCount > 0) {
        if (adminEmail) {
            await sendHealthReportEmail(adminEmail, summary);
        }
    }

    return NextResponse.json(summary, {
        status: allSuccess ? 200 : 500,
        headers: {
            'Cache-Control': 'no-store',
        },
    });
}

async function sendHealthReportEmail(
    to: string,
    summary: {
        status: string;
        timestamp: string;
        totalBooks: number;
        successCount: number;
        failCount: number;
        totalTimeMs: number;
        results: TestResult[];
    }
) {
    const isHealthy = summary.failCount === 0;
    const statusEmoji = isHealthy ? '✅' : '⚠️';
    const statusColor = isHealthy ? '#10B981' : '#EF4444';
    const statusText = isHealthy ? 'Tous les tests OK' : `${summary.failCount} erreur(s) détectée(s)`;

    const resultsHtml = summary.results.map(r => `
    <tr style="border-bottom: 1px solid #e5e7eb;">
      <td style="padding: 12px; font-weight: 500;">${r.success ? '✅' : '❌'} ${r.book}</td>
      <td style="padding: 12px; color: #6b7280;">${r.code} ${r.chapter}</td>
      <td style="padding: 12px; color: ${r.success ? '#10B981' : '#EF4444'};">
        ${r.success ? `${r.versesCount} versets` : r.error}
      </td>
      <td style="padding: 12px; color: #9ca3af; text-align: right;">${r.responseTime}ms</td>
    </tr>
  `).join('');

    const html = `
    <!DOCTYPE html>
    <html lang="fr">
    <head>
      <meta charset="utf-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <style>
        body { 
          font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; 
          line-height: 1.6; 
          color: #1f2345; 
          background: #f9f9f9;
          margin: 0;
          padding: 20px;
        }
        .container { 
          max-width: 600px; 
          margin: 0 auto; 
          background: white;
          border-radius: 12px;
          overflow: hidden;
          box-shadow: 0 2px 8px rgba(0,0,0,0.08);
        }
        .header { 
          background: ${statusColor}; 
          color: white; 
          padding: 24px 32px; 
          text-align: center; 
        }
        .header h1 {
          font-size: 1.5rem;
          font-weight: 600;
          margin: 0;
        }
        .content { 
          padding: 24px 32px; 
        }
        .summary-box {
          background: #f8fafc;
          border-radius: 8px;
          padding: 16px;
          margin-bottom: 24px;
          display: flex;
          justify-content: space-around;
          text-align: center;
        }
        .summary-item {
          flex: 1;
        }
        .summary-item .value {
          font-size: 1.5rem;
          font-weight: 700;
          color: #1f2345;
        }
        .summary-item .label {
          font-size: 0.85rem;
          color: #6b7280;
        }
        table {
          width: 100%;
          border-collapse: collapse;
          margin-top: 16px;
        }
        th {
          text-align: left;
          padding: 12px;
          background: #f8fafc;
          color: #6b7280;
          font-weight: 600;
          font-size: 0.85rem;
          text-transform: uppercase;
        }
        .footer { 
          text-align: center; 
          padding: 20px; 
          background: #fafafa;
          border-top: 1px solid #e9e8f0;
          font-size: 0.85rem;
          color: #9ca3af;
        }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>${statusEmoji} Rapport Santé AELF - ${statusText}</h1>
        </div>
        
        <div class="content">
          <div class="summary-box">
            <div class="summary-item">
              <div class="value">${summary.successCount}/${summary.totalBooks}</div>
              <div class="label">Tests réussis</div>
            </div>
            <div class="summary-item">
              <div class="value">${summary.totalTimeMs}ms</div>
              <div class="label">Temps total</div>
            </div>
          </div>
          
          <table>
            <thead>
              <tr>
                <th>Livre</th>
                <th>Référence</th>
                <th>Résultat</th>
                <th style="text-align: right;">Temps</th>
              </tr>
            </thead>
            <tbody>
              ${resultsHtml}
            </tbody>
          </table>
          
          ${!isHealthy ? `
            <div style="margin-top: 24px; padding: 16px; background: #FEF2F2; border-radius: 8px; border-left: 4px solid #EF4444;">
              <strong style="color: #991B1B;">⚠️ Action requise</strong>
              <p style="margin: 8px 0 0 0; color: #7F1D1D; font-size: 0.9rem;">
                Le site AELF a peut-être changé de structure. Vérifiez les sélecteurs CSS dans 
                <code>aelf-scraper.ts</code> (.block-single-reading, .verse_number).
              </p>
            </div>
          ` : ''}
        </div>
        
        <div class="footer">
          <strong>Carnet Spirituel</strong> · Monitoring AELF<br>
          ${new Date().toLocaleDateString('fr-FR', {
        day: 'numeric',
        month: 'long',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
    })}
        </div>
      </div>
    </body>
    </html>
  `;

    await sendEmail({
        to,
        subject: `${statusEmoji} Monitoring AELF - ${statusText}`,
        html,
    });
}
