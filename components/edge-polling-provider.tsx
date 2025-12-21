"use client";

import { useEdgePolling } from '@/hooks/useEdgePolling';

/**
 * Componente Provider para Edge Polling
 * Ativa automaticamente polling de notificações para usuários do Edge
 */
export function EdgePollingProvider({ userId }: { userId: string }) {
    useEdgePolling(userId);
    return null; // Componente invisível
}
