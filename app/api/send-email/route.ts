import { NextRequest, NextResponse } from 'next/server';
import { sendFiorettoNotification } from '@/app/lib/email';

export async function POST(request: NextRequest) {
    try {
        const { userEmail, userName, status, moderatorMessage } = await request.json();

        if (!userEmail || !userName || !status) {
            return NextResponse.json(
                { error: 'Missing required fields' },
                { status: 400 }
            );
        }

        const result = await sendFiorettoNotification(
            userEmail,
            userName,
            status,
            moderatorMessage
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
