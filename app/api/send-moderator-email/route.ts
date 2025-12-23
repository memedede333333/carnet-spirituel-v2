import { NextRequest, NextResponse } from 'next/server';
import { sendModeratorNotification } from '@/app/lib/email';

export async function POST(request: NextRequest) {
    try {
        const { moderatorEmail, moderatorName, fiorettoData } = await request.json();

        if (!moderatorEmail || !moderatorName || !fiorettoData) {
            return NextResponse.json(
                { error: 'Missing required fields' },
                { status: 400 }
            );
        }

        const result = await sendModeratorNotification(
            moderatorEmail,
            moderatorName,
            fiorettoData
        );

        if (result.success) {
            return NextResponse.json({ success: true, messageId: result.messageId });
        } else {
            return NextResponse.json(
                { error: 'Failed to send email', details: result.error },
                { status: 500 }
            );
        }
    } catch (error) {
        console.error('API Error:', error);
        return NextResponse.json(
            { error: 'Internal server error' },
            { status: 500 }
        );
    }
}
