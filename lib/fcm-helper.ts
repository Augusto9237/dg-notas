import '@/lib/firebase-admin'; // Garante inicialização
import admin from 'firebase-admin';


interface NotificationResult {
    success: boolean;
    successCount: number;
    failureCount: number;
    totalTokens: number;
    error?: string;
    responses?: admin.messaging.SendResponse[];
    invalidTokens?: string[];
}

export async function sendNotifications(
    tokens: string[],
    title: string,
    body: string,
    link?: string,
    imageUrl?: string
): Promise<NotificationResult> {
    if (!tokens || tokens.length === 0) {
        return {
            success: false,
            successCount: 0,
            failureCount: 0,
            totalTokens: 0,
            error: 'No tokens provided',
        };
    }

    try {
        // ✅ Estrutura correta conforme o TypeScript do Firebase Admin
        const message: admin.messaging.MulticastMessage = {
            tokens: tokens,
            notification: {
                title: title,
                body: body,
                imageUrl: imageUrl, // Imagem grande (funciona em notification)
            },
            data: {
                link: link || '',
            },
            webpush: {
                notification: {
                    icon: "/Símbolo1.png", // ✅ Ícone vai aqui (webpush.notification)
                    badge: "/Símbolo1.png", // ✅ Badge vai aqui
                    requireInteraction: false,
                    tag: `notification-${Date.now()}`,
                },
                fcmOptions: {
                    link: link || undefined,
                },
            },
            android: {
                notification: {
                    imageUrl: imageUrl,
                    defaultSound: true,
                    defaultVibrateTimings: true,
                    // Android aceita icon como uma string de recurso do app
                    // Para web não precisa especificar aqui
                },
            },
            apns: {
                payload: {
                    aps: {
                        alert: {
                            title: title,
                            body: body,
                        },
                        sound: 'default',
                    },
                },
                fcmOptions: {
                    imageUrl: imageUrl,
                },
            },
        };

        const response = await admin.messaging().sendEachForMulticast(message);

        console.log('✅ Notificações enviadas:', {
            success: response.successCount,
            failure: response.failureCount,
            total: tokens.length,
        });

        // Identifica tokens inválidos para remoção
        const invalidTokens: string[] = [];
        if (response.responses && response.responses.length > 0) {
            response.responses.forEach((resp, index) => {
                if (!resp.success && resp.error && (
                    resp.error.code === 'messaging/registration-token-not-registered' ||
                    resp.error.code === 'messaging/invalid-registration-token'
                )) {
                    if (tokens[index]) {
                        invalidTokens.push(tokens[index]);
                    }
                }
            });
        }

        return {
            success: response.failureCount === 0,
            successCount: response.successCount,
            failureCount: response.failureCount,
            totalTokens: tokens.length,
            responses: response.responses,
            invalidTokens: invalidTokens,
        };
    } catch (error) {
        console.error('❌ Erro ao enviar notificações:', error);
        return {
            success: false,
            successCount: 0,
            failureCount: tokens.length,
            totalTokens: tokens.length,
            error: error instanceof Error ? error.message : 'Unknown error',
        };
    }
}

export async function sendNotificationToToken(
    token: string,
    title: string,
    body: string,
    link?: string,
    imageUrl?: string
): Promise<{ success: boolean; error?: string }> {
    const result = await sendNotifications([token], title, body, link, imageUrl);
    return {
        success: result.success,
        error: result.error,
    };
}