'use client'

import useFcmToken from "@/hooks/useFcmToken"

/**
 * Componente que inicializa notificações push para o aluno
 * O hook useFcmToken automaticamente:
 * 1. Solicita permissão de notificações ao usuário
 * 2. Obtém o token FCM do Firebase
 * 3. Salva o token no banco de dados com informações do dispositivo
 */
export function IncializarNotificacoes() {
    // O hook cuida de tudo automaticamente!
    // Você não precisa fazer nada com o retorno, a menos que queira mostrar o status
    const { token, notificationPermissionStatus } = useFcmToken()

    // Opcional: Mostrar algum indicador visual
    // if (notificationPermissionStatus === 'denied') {
    //   return <div className="text-xs text-muted-foreground">Notificações desabilitadas</div>
    // }

    // Este componente não renderiza nada visualmente, apenas inicializa o sistema
    return null
}
