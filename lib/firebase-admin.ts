
import admin from 'firebase-admin';

// Verifica se o app do Firebase já foi inicializado
if (!admin.apps.length) {
  try {
    const serviceAccount = JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT_JSON as string);
    // Inicializa o app do Firebase com as credenciais do ambiente
    admin.initializeApp({
      credential: admin.credential.cert(serviceAccount),
      databaseURL: process.env.FIREBASE_DATABASE_URL,
    });
  } catch (error) {
    console.error('Erro na inicialização do Firebase Admin:', error);
  }
}

// Exporta as instâncias do Firebase Admin
const firestoreDb = admin.firestore();
const authAdmin = admin.auth();
const storageAdmin = admin.storage();

export { firestoreDb, authAdmin, storageAdmin };
export default admin;
