"use client";

import { useEffect, useState } from "react";
import useWebPush from "@/hooks/useWebPush";
import { Button } from "@/components/ui/button";
import { Bell, Download, X } from "lucide-react";
import { toast } from "sonner"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

interface InicializarNotificacoesProps {
  userId: string;
}

export function InicializarNotificacoes({ userId }: InicializarNotificacoesProps) {
  const {
    permission,
    isSubscribed,
    isLoading,
    subscribe,
    unsubscribe,
    isSupported,
    needsInstall,
    isIOS,
    isStandalone,
  } = useWebPush({ userId });

  const [showPrompt, setShowPrompt] = useState(false);
  const [showIOSInstructions, setShowIOSInstructions] = useState(false);

  useEffect(() => {
    // Mostra prompt após 3 segundos se:
    // 1. Notificações são suportadas
    // 2. Usuário ainda não decidiu (default)
    // 3. Não está subscrito
    if (isSupported && permission === "default" && !isSubscribed) {
      const timer = setTimeout(() => {
        setShowPrompt(true);
      }, 1500);
      return () => clearTimeout(timer);
    }

    // Se está no iOS mas não em modo standalone, mostra instruções
    if (isIOS && !isStandalone && permission === "default") {
      const timer = setTimeout(() => {
        setShowIOSInstructions(true);
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [isSupported, permission, isSubscribed, isIOS, isStandalone]);

  const handleSubscribe = async () => {
    const success = await subscribe();
    if (success) {
      setShowPrompt(false);
      setShowIOSInstructions(false);
    }
  };



  // Não mostra nada se não for suportado
  if (!isSupported && !needsInstall) {
    return null;
  }

  // Instruções para iOS (instalar PWA)
  if (showIOSInstructions && needsInstall) {
    return toast.info('Instale o App e Ative as Notificações', {
      description: 'Para receber notificações no iOS em tempo real',
      descriptionClassName: 'text-xs' ,
      icon: <Bell size={16}/>,
    })
  }

  // Prompt normal de ativação de notificações
  if (showPrompt && !isSubscribed) {
    toast.info('Ativar Notificações', {
      description: 'Receba atualizações sobre suas redações e mentorias',
      descriptionClassName: 'text-xs' ,
      icon: <Bell size={16}/>,
      action: {
        label: 'Ativar',
        onClick: () => handleSubscribe()
      },
      actionButtonStyle:{
        backgroundColor: 'var(--primary)',
      },
    })
  }

  return null;
}