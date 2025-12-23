import { NextRequest, NextResponse } from 'next/server';
import { sendWelcomeEmail } from '@/app/lib/email';

export async function POST(request: NextRequest) {
    try {
        const body = await request.json();

        // Support both direct format and Supabase webhook format
        let userEmail: string;
        let userName: string;

        if (body.record) {
            // Supabase webhook format
            userEmail = body.record.email;
            userName = body.record.raw_user_meta_data?.prenom || body.record.email;
        } else {
            // Direct format
            userEmail = body.userEmail;
            userName = body.userName;
        }

        if (!userEmail) {
            return NextResponse.json(
                { error: 'Missing email' },
                { status: 400 }
            );
        }

        const result = await sendWelcomeEmail(userEmail, userName || userEmail);

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
