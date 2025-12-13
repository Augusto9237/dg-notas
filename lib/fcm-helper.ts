import admin from "@/lib/firebase-admin";
import { Message, MulticastMessage } from "firebase-admin/messaging";

export interface NotificationResult {
    success: boolean;
    successCount: number;
    failureCount: number;
    totalTokens: number;
    invalidTokens: string[];
    error?: string;
}

/**
 * Sends FCM notifications to one or multiple tokens.
 * Handles batching and invalid token detection.
 */
export async function sendNotifications(
    tokens: string | string[],
    title: string,
    message: string,
    link?: string
): Promise<NotificationResult> {
    // Normalize tokens to array
    const targetTokens = Array.isArray(tokens) ? tokens : [tokens];

    if (!targetTokens || targetTokens.length === 0) {
        return {
            success: false,
            successCount: 0,
            failureCount: 0,
            totalTokens: 0,
            invalidTokens: [],
            error: "No tokens provided"
        };
    }

    try {
        // Optimization for single token
        if (targetTokens.length === 1) {
            const payload: Message = {
                token: targetTokens[0],
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

            await admin.messaging().send(payload);

            return {
                success: true,
                successCount: 1,
                failureCount: 0,
                totalTokens: 1,
                invalidTokens: []
            };
        }

        // For multiple tokens, use sendEachForMulticast
        // Note: verify if batching > 500 is needed if the list is huge, 
        // but for now relying on the caller or basic usage. 
        // If > 500 logic is needed, we can implement chunking here.
        // Let's implement basic chunking for safety.

        const CHUNK_SIZE = 500;
        let successCount = 0;
        let failureCount = 0;
        const invalidTokens: string[] = [];

        for (let i = 0; i < targetTokens.length; i += CHUNK_SIZE) {
            const chunk = targetTokens.slice(i, i + CHUNK_SIZE);

            const multicastPayload: MulticastMessage = {
                tokens: chunk,
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

            successCount += response.successCount;
            failureCount += response.failureCount;

            response.responses.forEach((resp, idx) => {
                if (!resp.success) {
                    const errorCode = resp.error?.code;
                    if (
                        errorCode === 'messaging/invalid-registration-token' ||
                        errorCode === 'messaging/registration-token-not-registered'
                    ) {
                        invalidTokens.push(chunk[idx]);
                    }
                }
            });
        }

        return {
            success: true,
            successCount,
            failureCount,
            totalTokens: targetTokens.length,
            invalidTokens,
        };

    } catch (error) {
        console.error('Error sending notification:', error);
        return {
            success: false,
            successCount: 0,
            failureCount: targetTokens.length,
            totalTokens: targetTokens.length,
            invalidTokens: [],
            error: error instanceof Error ? error.message : 'Unknown error'
        };
    }
}
