"use client";

import { useEffect, useRef } from "react";
import { toast } from "sonner";

// Evento não é padronizado no TS DOM lib; tipamos localmente.
interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: "accepted" | "dismissed"; platform?: string }>;
}

export function PwaInstallPrompt() {
  const deferredPromptRef = useRef<BeforeInstallPromptEvent | null>(null);
  const hasShownRef = useRef(false);
  const toastIdRef = useRef<string | number | null>(null);

  // 1) Registrar Service Worker cedo (sem depender do hook de push)
  useEffect(() => {
    if (typeof window === "undefined") return;
    if (!("serviceWorker" in navigator)) return;

    navigator.serviceWorker
      .register("/sw.js", { scope: "/" })
      .then(() => navigator.serviceWorker.ready)
      .then(() => {
        // Mantém log mínimo para debug em produção
        console.log("✅ [PWA] Service Worker pronto");
      })
      .catch((err) => {
        console.warn("⚠️ [PWA] Falha ao registrar Service Worker:", err);
      });
  }, []);

  // 2) Capturar beforeinstallprompt e expor CTA (desktop/android)
  useEffect(() => {
    if (typeof window === "undefined") return;

    const onBeforeInstallPrompt = (event: Event) => {
      // Impede o mini-infobar automático e nos dá controle
      event.preventDefault?.();

      deferredPromptRef.current = event as BeforeInstallPromptEvent;
      if (hasShownRef.current) return;
      hasShownRef.current = true;

      toastIdRef.current = toast.info("Instale o app para acesso mais rápido", {
        duration: 12000,
        action: {
          label: "Instalar",
          onClick: async () => {
            const deferred = deferredPromptRef.current;
            if (!deferred) return;
            try {
              await deferred.prompt();
              await deferred.userChoice;
            } finally {
              deferredPromptRef.current = null;
              if (toastIdRef.current != null) toast.dismiss(toastIdRef.current);
              toastIdRef.current = null;
            }
          },
        },
      });
    };

    const onAppInstalled = () => {
      deferredPromptRef.current = null;
      if (toastIdRef.current != null) toast.dismiss(toastIdRef.current);
      toastIdRef.current = null;
    };

    window.addEventListener(
      "beforeinstallprompt",
      onBeforeInstallPrompt as EventListener
    );
    window.addEventListener("appinstalled", onAppInstalled);

    return () => {
      window.removeEventListener(
        "beforeinstallprompt",
        onBeforeInstallPrompt as EventListener
      );
      window.removeEventListener("appinstalled", onAppInstalled);
    };
  }, []);

  return null;
}


