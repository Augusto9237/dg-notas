
import admin from 'firebase-admin';

// Verifica se o app do Firebase já foi inicializado
if (!admin.apps.length) {
  try {
    if (process.env.FIREBASE_SERVICE_ACCOUNT_JSON) {
      const serviceAccount = JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT_JSON);
      // Inicializa o app do Firebase com as credenciais do ambiente
      admin.initializeApp({
        credential: admin.credential.cert(serviceAccount),
        databaseURL: process.env.FIREBASE_DATABASE_URL,
      });
    } else {
      console.warn('FIREBASE_SERVICE_ACCOUNT_JSON não definido. Firebase Admin não inicializado.');
    }
  } catch (error) {
    console.error('Erro na inicialização do Firebase Admin:', error);
  }
}

export default admin;
