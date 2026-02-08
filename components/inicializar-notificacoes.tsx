
"use client";

import { useEffect, useState, useCallback } from "react";
import useWebPush from "@/hooks/useWebPush";
import { Bell } from "lucide-react";
import { toast } from "sonner";

interface InicializarNotificacoesProps {
  userId: string;
}

const SUBSCRIBE_TOAST_ID = 'subscribe-toast';
const IOS_INSTALL_TOAST_ID = 'ios-install-toast';

export function InicializarNotificacoes({ userId }: InicializarNotificacoesProps) {
  const {
    permission,
    isSubscribed,
    subscribe,
    isSupported,
    needsInstall,
    isIOS,
    isStandalone,
  } = useWebPush({ userId, handleMessages: false });

  const [showPrompt, setShowPrompt] = useState(false);
  const [showIOSInstructions, setShowIOSInstructions] = useState(false);

  // Efeito para agendar a exibição dos prompts
  useEffect(() => {
    if (isSupported && permission === "default" && !isSubscribed) {
      const timer = setTimeout(() => {
        setShowPrompt(true);
      }, 1500);
      return () => clearTimeout(timer);
    }
  }, [isSupported, permission, isSubscribed]);

  useEffect(() => {
    if (isIOS && !isStandalone && permission === "default") {
      const timer = setTimeout(() => {
        setShowIOSInstructions(true);
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [isIOS, isStandalone, permission]);

  const handleSubscribe = useCallback(async () => {
    const success = await subscribe();
    if (success) {
      setShowPrompt(false);
      setShowIOSInstructions(false);
      toast.dismiss(SUBSCRIBE_TOAST_ID);
    }
  }, [subscribe]);

  // Efeito para mostrar/esconder o toast de instalação no iOS
  useEffect(() => {
    if (showIOSInstructions && needsInstall) {
      toast.info('Instale o App e Ative as Notificações', {
        id: IOS_INSTALL_TOAST_ID,
        description: 'Para receber notificações no iOS em tempo real',
        descriptionClassName: 'text-xs',
        icon: <Bell size={16} />,
        duration: Infinity,
      });
    } else {
      toast.dismiss(IOS_INSTALL_TOAST_ID);
    }
  }, [showIOSInstructions, needsInstall]);

  // Efeito para mostrar/esconder o toast de inscrição
  useEffect(() => {
    if (showPrompt && !isSubscribed) {
      toast.info('Ativar Notificações', {
        id: SUBSCRIBE_TOAST_ID,
        description: 'Receba atualizações sobre suas redações e mentorias',
        descriptionClassName: 'text-xs',
        icon: <Bell size={16} />,
        action: {
          label: 'Ativar',
          onClick: handleSubscribe,
        },
        actionButtonStyle: {
          backgroundColor: 'var(--primary)',
        },
        duration: Infinity,
      });
    } else {
      toast.dismiss(SUBSCRIBE_TOAST_ID);
    }
  }, [showPrompt, isSubscribed, handleSubscribe]);

  // Efeito para limpar os toasts quando o componente for desmontado
  useEffect(() => {
    return () => {
      toast.dismiss(SUBSCRIBE_TOAST_ID);
      toast.dismiss(IOS_INSTALL_TOAST_ID);
    };
  }, []);

  return null;
}
