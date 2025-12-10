import admin from "@/lib/firebase-admin";
import { Message, MulticastMessage } from "firebase-admin/messaging";
import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
    const { token, tokens, title, message, link } = await request.json();

    // Suporta tanto single token quanto múltiplos tokens
    const targetTokens = tokens || (token ? [token] : []);

    if (!targetTokens || targetTokens.length === 0) {
        return NextResponse.json(
            { success: false, error: "No tokens provided" },
            { status: 400 }
        );
    }

    // Firebase tem limite de 500 tokens por request
    if (targetTokens.length > 500) {
        return NextResponse.json(
            { success: false, error: "Too many tokens (max 500 per request)" },
            { status: 400 }
        );
    }

    try {
        // Se for apenas 1 token, usa send (mais simples)
        if (targetTokens.length === 1) {
            const payload: Message = {
                token: targetTokens[0],
                notification: {
                    title: title,
                    body: message,
                },
                webpush: link && {
                    fcmOptions: {
                        link,
                    },
                },
            };

            await admin.messaging().send(payload);

            return NextResponse.json({
                success: true,
                message: "Notification sent!",
                successCount: 1,
                failureCount: 0,
                totalTokens: 1,
            });
        }

        // Para múltiplos tokens, usa sendEachForMulticast (mais eficiente)
        const multicastPayload: MulticastMessage = {
            tokens: targetTokens,
            notification: {
                title: title,
                body: message,
            },
            webpush: link ? {
                fcmOptions: {
                    link,
                },
            } : undefined,
        };

        const response = await admin.messaging().sendEachForMulticast(multicastPayload);

        // Identifica tokens inválidos para limpeza
        const invalidTokens: string[] = [];
        response.responses.forEach((resp, idx) => {
            if (!resp.success) {
                // Erros que indicam token inválido/expirado
                const errorCode = resp.error?.code;
                if (
                    errorCode === 'messaging/invalid-registration-token' ||
                    errorCode === 'messaging/registration-token-not-registered'
                ) {
                    invalidTokens.push(targetTokens[idx]);
                }
            }
        });

        return NextResponse.json({
            success: true,
            message: `Sent ${response.successCount} of ${targetTokens.length} notifications`,
            successCount: response.successCount,
            failureCount: response.failureCount,
            totalTokens: targetTokens.length,
            invalidTokens: invalidTokens,
        });
    } catch (error) {
        console.error('Error sending notification:', error);
        return NextResponse.json({
            success: false,
            error: error instanceof Error ? error.message : 'Unknown error',
            successCount: 0,
            failureCount: targetTokens.length,
            totalTokens: targetTokens.length,
        }, { status: 500 });
    }
}
