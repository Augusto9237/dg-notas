// components/inicializar-notificacoes.tsx
'use client';


import useTokenFcm from '@/hooks/useFcmToken';
import { useEffect } from 'react';

export function IncializarNotificacoes() {
    const { token, statusPermissaoNotificacao } = useTokenFcm();

    useEffect(() => {
        if (token) {
            console.log('✅ Notificações inicializadas com token:', token.substring(0, 20) + '...');
        }

        if (statusPermissaoNotificacao === 'denied') {
            console.warn('⚠️ Usuário negou permissão para notificações');
        }
    }, [token, statusPermissaoNotificacao]);

    return null; // Componente invisível
}
