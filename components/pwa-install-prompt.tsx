"use client";

import { useEffect, useRef, useState } from "react";
import { toast } from "sonner";

// Evento não é padronizado no TS DOM lib; tipamos localmente.
interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: "accepted" | "dismissed"; platform?: string }>;
}

// Função helper para detectar modo standalone
function isStandaloneMode(): boolean {
  if (typeof window === "undefined") return false;
  return (
    window.matchMedia("(display-mode: standalone)").matches ||
    (window.navigator as any).standalone === true ||
    document.referrer.includes("android-app://")
  );
}

export function PwaInstallPrompt() {
  const deferredPromptRef = useRef<BeforeInstallPromptEvent | null>(null);
  const hasShownRef = useRef(false);
  const toastIdRef = useRef<string | number | null>(null);
  const [isStandalone, setIsStandalone] = useState(false);
  const [isClient, setIsClient] = useState(false);

  // 1) Registrar Service Worker cedo (sem depender do hook de push)
  useEffect(() => {
    if (typeof window === "undefined") return;
    if (!("serviceWorker" in navigator)) return;

    // Detecta se está em modo standalone
    setIsStandalone(isStandaloneMode());
    setIsClient(true);

    // Se já está instalado, não precisa fazer nada
    if (isStandaloneMode()) {
      return;
    }

    navigator.serviceWorker
      .register("/sw.js", { scope: "/" })
      .then(() => navigator.serviceWorker.ready)
      .then(() => {
        // Mantém log mínimo para debug em produção
        if (process.env.NODE_ENV === "development") {
          console.log("✅ [PWA] Service Worker pronto");
        }
      })
      .catch((err) => {
        // Silencia erro em produção, apenas loga em dev
        if (process.env.NODE_ENV === "development") {
          console.warn("⚠️ [PWA] Falha ao registrar Service Worker:", err);
        }
      });
  }, []);

  // 2) Capturar beforeinstallprompt e expor CTA (desktop/android)
  useEffect(() => {
    if (typeof window === "undefined") return;
    if (!isClient) return;
    
    // Não faz nada se já está instalado (standalone)
    if (isStandalone) {
      return;
    }

    const onBeforeInstallPrompt = (event: Event) => {
      try {
        // Impede o mini-infobar automático e nos dá controle
        event.preventDefault?.();

        deferredPromptRef.current = event as BeforeInstallPromptEvent;
        if (hasShownRef.current) return;
        hasShownRef.current = true;

        toastIdRef.current = toast.warning("Instale o app para acesso mais rápido", {
          duration: 12000,
          action: {
            label: "Instalar",
            onClick: async () => {
              const deferred = deferredPromptRef.current;
              if (!deferred) return;
              try {
                await deferred.prompt();
                await deferred.userChoice;
              } catch (error) {
                // Silencia erros de instalação
                if (process.env.NODE_ENV === "development") {
                  console.warn("⚠️ [PWA] Erro ao instalar:", error);
                }
              } finally {
                deferredPromptRef.current = null;
                if (toastIdRef.current != null) {
                  toast.dismiss(toastIdRef.current);
                }
                toastIdRef.current = null;
              }
            },
          },
        });
      } catch (error) {
        // Proteção contra erros em modo standalone
        if (process.env.NODE_ENV === "development") {
          console.warn("⚠️ [PWA] Erro no beforeinstallprompt:", error);
        }
      }
    };

    const onAppInstalled = () => {
      deferredPromptRef.current = null;
      if (toastIdRef.current != null) {
        toast.dismiss(toastIdRef.current);
      }
      toastIdRef.current = null;
    };

    try {
      window.addEventListener(
        "beforeinstallprompt",
        onBeforeInstallPrompt as EventListener
      );
      window.addEventListener("appinstalled", onAppInstalled);
    } catch (error) {
      // Proteção contra navegadores que não suportam esses eventos
      if (process.env.NODE_ENV === "development") {
        console.warn("⚠️ [PWA] Eventos de instalação não suportados:", error);
      }
    }

    return () => {
      try {
        window.removeEventListener(
          "beforeinstallprompt",
          onBeforeInstallPrompt as EventListener
        );
        window.removeEventListener("appinstalled", onAppInstalled);
      } catch (error) {
        // Ignora erros no cleanup
      }
    };
  }, [isClient, isStandalone]);

  return null;
}


