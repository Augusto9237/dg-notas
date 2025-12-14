"use client";

import { useEffect, useRef, useState } from "react";
import { getToken, onMessage, Unsubscribe } from "firebase/messaging";
import { fetchToken, messaging } from "@/lib/firebase";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { authClient } from "@/lib/auth-client";
import { salvarFcmToken } from "@/actions/notificacoes";

async function obterPermissaoETokenNotificacao() {
  // Passo 1: Verificar se as notificações são suportadas no navegador
  if (!("Notification" in window)) {
    console.info("Este navegador não suporta notificações desktop");
    return null;
  }

  // Passo 2: Verificar se a permissão já foi concedida
  if (Notification.permission === "granted") {
    console.log("✅ Permissão já concedida, buscando token...");
    return await fetchToken();
  }

  // Passo 3: Se a permissão não foi negada, solicitar permissão do usuário
  if (Notification.permission !== "denied") {
    console.log("🔔 Solicitando permissão de notificação...");
    const permissao = await Notification.requestPermission();
    if (permissao === "granted") {
      console.log("✅ Permissão concedida, buscando token...");
      return await fetchToken();
    }
  }

  console.log("❌ Permissão de notificação não concedida.");
  return null;
}

const useTokenFcm = () => {
  const roteador = useRouter();
  const { data: sessao } = authClient.useSession();
  const [statusPermissaoNotificacao, setStatusPermissaoNotificacao] =
    useState<NotificationPermission | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const tentativasCarregarToken = useRef(0);
  const estaCarregando = useRef(false);
  const tokenSalvo = useRef(false);

  const carregarToken = async () => {
    // Passo 4: Prevenir múltiplas buscas se já foi buscado ou está em progresso
    if (estaCarregando.current) {
      console.log("⏳ Já existe uma requisição de token em andamento...");
      return;
    }

    estaCarregando.current = true;
    console.log("🔄 Iniciando busca de token FCM...");

    const token = await obterPermissaoETokenNotificacao();

    // Passo 5: Tratar o caso onde a permissão foi negada
    if (Notification.permission === "denied") {
      setStatusPermissaoNotificacao("denied");
      console.info(
        "%cProblema com Notificações Push - permissão negada",
        "color: red; background: #ffcccc; padding: 8px; font-size: 16px"
      );
      estaCarregando.current = false;
      return;
    }

    // Passo 6: Tentar buscar o token novamente se necessário (até 3 vezes)
    // Este passo é típico inicialmente pois o service worker pode não estar pronto/instalado ainda
    if (!token) {
      if (tentativasCarregarToken.current >= 3) {
        console.error(
          "%cProblema com Notificações Push - impossível carregar token após 3 tentativas",
          "color: red; background: #ffcccc; padding: 8px; font-size: 16px"
        );
        toast.error("Não foi possível obter token de notificação. Recarregue a página.");
        estaCarregando.current = false;
        return;
      }

      tentativasCarregarToken.current += 1;
      console.error(`❌ Erro ao obter token. Tentativa ${tentativasCarregarToken.current} de 3...`);
      estaCarregando.current = false;

      // Aguarda 2 segundos antes de tentar novamente
      await new Promise(resolver => setTimeout(resolver, 2000));
      await carregarToken();
      return;
    }

    // Passo 7: Definir o token buscado e marcar como buscado
    console.log("✅ Token FCM obtido com sucesso:", token.substring(0, 20) + "...");
    setStatusPermissaoNotificacao(Notification.permission);
    setToken(token);
    estaCarregando.current = false;
  };

  useEffect(() => {
    // Passo 8: Inicializar o carregamento do token quando o componente montar
    if ("Notification" in window) {
      console.log("🚀 Iniciando configuração de notificações...");
      carregarToken();
    }
  }, []);

  // Passo 8.5: Salvar token no banco de dados quando disponível e usuário estiver autenticado
  useEffect(() => {
    const salvarTokenNoBancoDados = async () => {
      // Aguarda tanto o token quanto a sessão estarem disponíveis
      if (!token) {
        console.log("⏳ Aguardando token FCM...");
        return;
      }

      if (!sessao?.user) {
        console.log("⏳ Aguardando autenticação do usuário...");
        return;
      }

      if (tokenSalvo.current) {
        console.log("ℹ️ Token já foi salvo anteriormente");
        return;
      }

      try {
        console.log("💾 Salvando token FCM no banco de dados...");

        const infoDispositivo = typeof navigator !== 'undefined' ? navigator.userAgent : undefined;

        await salvarFcmToken(sessao.user.id, token, infoDispositivo);

        tokenSalvo.current = true;
        console.log("✅ Token FCM salvo no banco de dados com sucesso!");
      } catch (erro) {
        console.error("❌ Falha ao salvar token FCM:", erro);
        toast.error("Erro ao ativar notificações. Tente novamente.");
      }
    };

    salvarTokenNoBancoDados();
  }, [token, sessao]);

  useEffect(() => {
    const configurarListener = async () => {
      if (!token) return; // Sai se nenhum token estiver disponível

      console.log(`👂 Listener de mensagens registrado com token`);
      const mensageria = await messaging();
      if (!mensageria) return;

      // Passo 9: Registrar um listener para mensagens FCM recebidas
      const cancelarInscricao = onMessage(mensageria, (cargaUtil) => {
        if (Notification.permission !== "granted") return;

        console.log("📬 Notificação push recebida em primeiro plano:", cargaUtil);
        const link = cargaUtil.fcmOptions?.link || cargaUtil.data?.link;

        if (link) {
          toast.info(
            `${cargaUtil.notification?.title}: ${cargaUtil.notification?.body}`,
            {
              action: {
                label: "Visitar",
                onClick: () => {
                  const link = cargaUtil.fcmOptions?.link || cargaUtil.data?.link;
                  if (link) {
                    roteador.push(link);
                  }
                },
              },
            }
          );
        } else {
          toast.info(
            `${cargaUtil.notification?.title}: ${cargaUtil.notification?.body}`
          );
        }

        // --------------------------------------------
        // Desabilite isso se você quiser apenas notificações toast
        const notificacao = new Notification(
          cargaUtil.notification?.title || "Nova mensagem",
          {
            body: cargaUtil.notification?.body || "Você tem uma nova mensagem",
            data: link ? { url: link } : undefined,
          }
        );

        // Passo 10: Tratar evento de clique na notificação para navegar para um link se presente
        notificacao.onclick = (evento) => {
          evento.preventDefault();
          const link = (evento.target as any)?.data?.url;
          if (link) {
            roteador.push(link);
          } else {
            console.log("Nenhum link encontrado na carga útil da notificação");
          }
        };
        // --------------------------------------------
      });

      return cancelarInscricao;
    };

    let cancelarInscricao: Unsubscribe | null = null;

    configurarListener().then((cancelar) => {
      if (cancelar) {
        cancelarInscricao = cancelar;
      }
    });

    // Passo 11: Limpar o listener quando o componente desmontar
    return () => cancelarInscricao?.();
  }, [token, roteador]);

  return { token, statusPermissaoNotificacao }; // Retorna o token e o status da permissão
};

export default useTokenFcm;