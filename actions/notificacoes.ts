'use server'
import { prisma } from "@/lib/prisma";
import { sendNotifications } from "@/lib/fcm-helper";

/**
 * Salva ou atualiza um token FCM para um usuário
 * Suporta múltiplos tokens por usuário (múltiplos dispositivos)
 */
export async function salvarFcmToken(
    userId: string,
    token: string,
    deviceInfo?: string
): Promise<void> {
    try {
        // Usa upsert para criar ou atualizar o token
        // A chave única @@unique([userId, token]) garante que não haverá duplicatas
        await prisma.fcmToken.upsert({
            where: {
                userId_token: {
                    userId: userId,
                    token: token,
                },
            },
            update: {
                deviceInfo: deviceInfo,
                updatedAt: new Date(),
            },
            create: {
                userId: userId,
                token: token,
                deviceInfo: deviceInfo,
            },
        });
    } catch (error) {
        console.error('Erro ao salvar token FCM:', error);
        throw new Error('Falha ao salvar token FCM');
    }
}

/**
 * Remove um token FCM específico
 * Útil quando usuário faz logout ou revoga permissão
 */
export async function removerFcmToken(token: string): Promise<void> {
    try {
        await prisma.fcmToken.deleteMany({
            where: {
                token: token,
            },
        });
    } catch (error) {
        console.error('Erro ao remover token FCM:', error);
        // Não lança erro pois a remoção é não crítica
    }
}

/**
 * Busca todos os tokens FCM de usuários com um determinado role
 * Retorna um array de tokens para envio de notificações
 */
export async function buscarTokensPorRole(role: string): Promise<string[]> {
    try {
        const tokens = await prisma.fcmToken.findMany({
            where: {
                user: {
                    role: role,
                },
            },
            select: {
                token: true,
            },
        });

        return tokens.map(t => t.token);
    } catch (error) {
        console.error('Erro ao buscar tokens por role:', error);
        return [];
    }
}

/**
 * Busca todos os tokens FCM de um usuário específico
 * Retorna um array de tokens para envio de notificações
 */
export async function buscarTokensPorUsuario(userId: string): Promise<string[]> {
    try {
        const tokens = await prisma.fcmToken.findMany({
            where: {
                userId: userId,
            },
            select: {
                token: true,
            },
        });

        return tokens.map(t => t.token);
    } catch (error) {
        console.error('Erro ao buscar tokens por usuário:', error);
        return [];
    }
}

/**
 * Envia notificações para todos os usuários de um determinado role
 * Retorna estatísticas de envio
 */
export async function enviarNotificacaoParaTodos(
    role: string,
    title: string,
    message: string,
    link?: string
): Promise<{ successCount: number; failureCount: number; totalTokens: number }> {
    try {
        // Busca todos os tokens do role especificado
        const tokens = await buscarTokensPorRole(role);

        if (tokens.length === 0) {
            return { successCount: 0, failureCount: 0, totalTokens: 0 };
        }

        const result = await sendNotifications(tokens, title, message, link);

        // Remove tokens inválidos se retornados
        if (result.invalidTokens && result.invalidTokens.length > 0) {
            await prisma.fcmToken.deleteMany({
                where: {
                    token: {
                        in: result.invalidTokens,
                    },
                },
            });
        }

        return {
            successCount: result.successCount,
            failureCount: result.failureCount,
            totalTokens: result.totalTokens,
        };
    } catch (error) {
        console.error('Erro ao enviar notificações:', error);
        throw new Error('Falha ao enviar notificações');
    }
}

/**
 * Envia notificações para um usuário específico (todos os seus dispositivos)
 * Retorna estatísticas de envio
 */
export async function enviarNotificacaoParaUsuario(
    userId: string,
    title: string,
    message: string,
    link?: string
): Promise<{ successCount: number; failureCount: number; totalTokens: number }> {
    try {
        // Busca todos os tokens do usuário específico
        const tokens = await buscarTokensPorUsuario(userId);

        if (tokens.length === 0) {
            return { successCount: 0, failureCount: 0, totalTokens: 0 };
        }

        const result = await sendNotifications(tokens, title, message, link);

        // Remove tokens inválidos se retornados
        if (result.invalidTokens && result.invalidTokens.length > 0) {
            await prisma.fcmToken.deleteMany({
                where: {
                    token: {
                        in: result.invalidTokens,
                    },
                },
            });
        }

        return {
            successCount: result.successCount,
            failureCount: result.failureCount,
            totalTokens: result.totalTokens,
        };
    } catch (error) {
        console.error('Erro ao enviar notificações para usuário:', error);
        throw new Error('Falha ao enviar notificações');
    }
}


/**
 * Remove tokens FCM não utilizados há mais de 90 dias
 * Função de manutenção para limpeza do banco
 */
export async function limparTokensAntigos(): Promise<number> {
    try {
        const threeMonthsAgo = new Date();
        threeMonthsAgo.setDate(threeMonthsAgo.getDate() - 90);

        const result = await prisma.fcmToken.deleteMany({
            where: {
                updatedAt: {
                    lt: threeMonthsAgo,
                },
            },
        });

        return result.count;
    } catch (error) {
        console.error('Erro ao limpar tokens antigos:', error);
        return 0;
    }
}
