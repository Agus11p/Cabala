import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore, doc, getDocFromServer } from 'firebase/firestore';
import { firebaseAppConfig } from './firebaseConfig';

export const app = initializeApp(firebaseAppConfig);
export const db = getFirestore(app, firebaseAppConfig.firestoreDatabaseId);
export const auth = getAuth(app);

// Connection test as required by Firebase integration skill
export async function testFirebaseConnection() {
  try {
    await getDocFromServer(doc(db, 'seasons', '2026'));
  } catch (error) {
    if (error instanceof Error && error.message.includes('the client is offline')) {
      console.warn('Firebase connection test: client is offline or network is waiting.');
    }
  }
}
