"use client";

import { useEffect, useState } from "react";
import useWebPush from "@/hooks/useWebPush";
import { Button } from "@/components/ui/button";
import { Bell, Download, X } from "lucide-react";
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
    return (
      <div className="fixed bottom-4 right-4 z-50 max-w-sm animate-in slide-in-from-bottom">
        <Card className="shadow-lg border-blue-200">
          <CardHeader className="pb-3">
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-2">
                <Download className="h-5 w-5 text-blue-600" />
                <CardTitle className="text-lg">Instale o App</CardTitle>
              </div>
              <Button
                variant="ghost"
                size="icon"
                className="h-6 w-6 -mt-1 -mr-1"
                onClick={() => setShowIOSInstructions(false)}
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
            <CardDescription>
              Para receber notificações no iOS
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="text-sm space-y-2">
              <p className="font-medium">Como instalar:</p>
              <ol className="list-decimal list-inside space-y-1 text-muted-foreground">
                <li>Toque no botão <span className="font-semibold">Compartilhar</span> (⎋)</li>
                <li>Role para baixo e toque em <span className="font-semibold">&quot;Adicionar à Tela Inicial&quot;</span> (➕)</li>
                <li>Toque em <span className="font-semibold">&quot;Adicionar&quot;</span></li>
                <li>Abra o app pela tela inicial</li>
                <li>Ative as notificações dentro do app</li>
              </ol>
            </div>
            <div className="bg-blue-50 p-3 rounded-md text-sm text-blue-800">
              <p className="font-medium">⚠️ Importante:</p>
              <p className="text-xs mt-1">
                No iOS, notificações só funcionam quando o app está instalado na tela inicial.
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Prompt normal de ativação de notificações
  if (showPrompt && !isSubscribed) {
    return (
      <div className="fixed bottom-4 right-4 z-50 max-w-sm animate-in slide-in-from-bottom">
        <Card className="shadow-lg">
          <CardHeader className="pb-3">
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-2">
                <Bell className="h-5 w-5 text-blue-600" />
                <CardTitle className="text-lg">Ativar Notificações</CardTitle>
              </div>
              <Button
                variant="ghost"
                size="icon"
                className="h-6 w-6 -mt-1 -mr-1"
                onClick={() => setShowPrompt(false)}
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
            <CardDescription>
              Receba atualizações sobre suas redações e mentorias
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            <p className="text-sm text-muted-foreground">
              Você será notificado quando:
            </p>
            <ul className="text-sm space-y-1 text-muted-foreground ml-4">
              <li>• Sua redação for corrigida</li>
              <li>• Uma mentoria for agendada</li>
              <li>• Houver mensagens importantes</li>
            </ul>
            <div className="flex gap-2 pt-2">
              <Button
                onClick={handleSubscribe}
                disabled={isLoading}
                className="flex-1"
              >
                {isLoading ? "Ativando..." : "Ativar"}
              </Button>
              <Button
                variant="outline"
                onClick={() => setShowPrompt(false)}
              >
                Agora não
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return null;
}