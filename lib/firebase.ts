
import { getApp, getApps, initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getStorage } from 'firebase/storage';
import { getMessaging, getToken, isSupported, onMessage } from 'firebase/messaging';

// Configuração do Firebase para o lado do cliente, usando variáveis de ambiente
const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
  measurementId: process.env.NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID,
};

// Inicializa o Firebase no lado do cliente, se ainda não estiver inicializado
const app = getApps().length ? getApp() : initializeApp(firebaseConfig);

export const getMessagingInstance = async () => {
  const supported = await isSupported();
  return supported ? getMessaging(app) : null;
};

export const requestNotificationPermission = async () => {
  try {
    const permission = await Notification.requestPermission();

    if (permission === 'granted') {
      console.log('Permissão de notificação concedida');

      const messaging = await getMessagingInstance();
      if (!messaging) {
        console.log('Messaging não suportado neste navegador');
        return null;
      }

      const token = await getToken(messaging, {
        vapidKey: process.env.NEXT_PUBLIC_FIREBASE_VAPID_KEY
      });

      console.log('FCM Token:', token);
      return token;
    } else {
      console.log('Permissão de notificação negada');
      return null;
    }
  } catch (error) {
    console.error('Erro ao solicitar permissão:', error);
    return null;
  }
};

export const onMessageListener = async (callback: any) => {
  const messaging = await getMessagingInstance();
  if (!messaging) return;

  return onMessage(messaging, (payload) => {
    console.log('Mensagem recebida (foreground):', payload);
    callback(payload);
  });
};

// Exporta os serviços do Firebase para uso no cliente
const auth = getAuth(app);
const storage = getStorage(app);

export { app, auth, storage };
