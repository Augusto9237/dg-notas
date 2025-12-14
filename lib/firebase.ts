import { getApp, getApps, initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getStorage } from 'firebase/storage';
import { getMessaging, getToken, isSupported, onMessage } from 'firebase/messaging';

const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
  measurementId: process.env.NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID,
};

const app = getApps().length ? getApp() : initializeApp(firebaseConfig);

export const getMessagingInstance = async () => {
  const supported = await isSupported();
  return supported ? getMessaging(app) : null;
};

const messaging = async () => {
  const supported = await isSupported();
  return supported ? getMessaging(app) : null;
};

export const fetchToken = async () => {
  try {
    if (typeof window === 'undefined' || !('serviceWorker' in navigator)) {
      console.log('Service Worker não suportado');
      return null;
    }

    const fcmMessaging = await messaging();
    if (!fcmMessaging) {
      console.log('Firebase Messaging não suportado');
      return null;
    }

    // ✅ CORREÇÃO: Registra sem especificar scope (usa o padrão)
    const registration = await navigator.serviceWorker.register('/firebase-messaging-sw.js');

    console.log('✅ Service Worker registrado:', registration);
    console.log('   Scope:', registration.scope);

    await navigator.serviceWorker.ready;

    const token = await getToken(fcmMessaging, {
      vapidKey: process.env.NEXT_PUBLIC_FIREBASE_FCM_VAPID_KEY,
      serviceWorkerRegistration: registration,
    });

    if (token) {
      console.log('✅ Token FCM obtido:', token.substring(0, 30) + '...');
      return token;
    } else {
      console.error('❌ Token não foi gerado. Verifique a VAPID Key.');
      return null;
    }
  } catch (err) {
    console.error("❌ Erro ao obter token:", err);
    return null;
  }
};

export const requestNotificationPermission = async () => {
  try {
    if (typeof window === 'undefined' || !('Notification' in window)) {
      console.log('Notificações não são suportadas neste navegador');
      return null;
    }

    const permission = await Notification.requestPermission();

    if (permission === 'granted') {
      console.log('Permissão de notificação concedida');
      return await fetchToken();
    } else {
      console.log('Permissão de notificação negada');
      return null;
    }
  } catch (err) {
    console.error('Erro ao solicitar permissão de notificação:', err);
    return null;
  }
};

export const onMessageListener = async () => {
  const fcmMessaging = await messaging();

  return new Promise((resolve) => {
    if (fcmMessaging) {
      onMessage(fcmMessaging, (payload) => {
        console.log('Mensagem recebida em foreground:', payload);
        resolve(payload);
      });
    }
  });
};

const auth = getAuth(app);
const storage = getStorage(app);

export { app, auth, storage, messaging };