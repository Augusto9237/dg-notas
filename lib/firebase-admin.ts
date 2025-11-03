
import admin from 'firebase-admin';

// Verifica se o app do Firebase já foi inicializado
if (!admin.apps.length) {
  try {
    // Inicializa o app do Firebase com as credenciais do ambiente
    admin.initializeApp({
      credential: admin.credential.cert({
        projectId: process.env.FIREBASE_PROJECT_ID,
        clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
        // A chave privada precisa de um tratamento especial para substituir os caracteres de nova linha
        privateKey: process.env.FIREBASE_PRIVATE_KEY?.replace(/\n/g, '\n'),
      }),
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
