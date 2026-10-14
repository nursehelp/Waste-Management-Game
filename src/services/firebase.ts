import { initializeApp, getApps, getApp } from 'firebase/app';
import { getFirestore, doc, getDocFromServer, Firestore } from 'firebase/firestore';
import configJson from '../../firebase-applet-config.json';

const env = (import.meta as unknown as { env?: Record<string, string> }).env || {};

const firebaseConfig = {
  apiKey: env.VITE_FIREBASE_API_KEY || configJson.apiKey,
  authDomain: env.VITE_FIREBASE_AUTH_DOMAIN || configJson.authDomain,
  projectId: env.VITE_FIREBASE_PROJECT_ID || configJson.projectId,
  storageBucket: env.VITE_FIREBASE_STORAGE_BUCKET || configJson.storageBucket,
  messagingSenderId: env.VITE_FIREBASE_MESSAGING_SENDER_ID || configJson.messagingSenderId,
  appId: env.VITE_FIREBASE_APP_ID || configJson.appId,
};

const app = !getApps().length ? initializeApp(firebaseConfig) : getApp();

export const db: Firestore = (configJson.firestoreDatabaseId && configJson.firestoreDatabaseId !== '(default)')
  ? getFirestore(app, configJson.firestoreDatabaseId)
  : getFirestore(app);

// Connection test on boot
async function testConnection() {
  try {
    await getDocFromServer(doc(db, 'test', 'connection'));
  } catch (error) {
    if (error instanceof Error && error.message.includes('the client is offline')) {
      console.warn('Firebase client is offline or initializing.');
    }
  }
}

testConnection();

export default app;
