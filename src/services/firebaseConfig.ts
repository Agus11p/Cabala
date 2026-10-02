// Firebase Configuration supporting both Client (Vite) and Serverless (Node/Vercel) environments
// Preconfigured with provisioned Firebase Firestore database: ai-studio-cbala-63a2342d-3d0f-4b66-9d07-fce26693b18e

const getEnvVar = (key: string, viteKey: string, fallback: string): string => {
  if (typeof import.meta !== 'undefined' && (import.meta as any).env && (import.meta as any).env[viteKey]) {
    return (import.meta as any).env[viteKey];
  }
  if (typeof process !== 'undefined' && process.env && process.env[key]) {
    return process.env[key] as string;
  }
  return fallback;
};

export const firebaseAppConfig = {
  projectId: getEnvVar("FIREBASE_PROJECT_ID", "VITE_FIREBASE_PROJECT_ID", "long-pointer-ls7sz"),
  appId: getEnvVar("FIREBASE_APP_ID", "VITE_FIREBASE_APP_ID", "1:172127007990:web:587fbde6a4716a7bf5e8d7"),
  apiKey: getEnvVar("FIREBASE_API_KEY", "VITE_FIREBASE_API_KEY", "AIzaSyDMdAA8FQxwxhpplB51qbctUCTFIRXHne8"),
  authDomain: getEnvVar("FIREBASE_AUTH_DOMAIN", "VITE_FIREBASE_AUTH_DOMAIN", "long-pointer-ls7sz.firebaseapp.com"),
  firestoreDatabaseId: getEnvVar("FIREBASE_DATABASE_ID", "VITE_FIREBASE_DATABASE_ID", "ai-studio-cbala-63a2342d-3d0f-4b66-9d07-fce26693b18e"),
  storageBucket: getEnvVar("FIREBASE_STORAGE_BUCKET", "VITE_FIREBASE_STORAGE_BUCKET", "long-pointer-ls7sz.firebasestorage.app"),
  messagingSenderId: getEnvVar("FIREBASE_MESSAGING_SENDER_ID", "VITE_FIREBASE_MESSAGING_SENDER_ID", "172127007990"),
  measurementId: getEnvVar("FIREBASE_MEASUREMENT_ID", "VITE_FIREBASE_MEASUREMENT_ID", ""),
  oAuthClientId: getEnvVar("FIREBASE_OAUTH_CLIENT_ID", "VITE_FIREBASE_OAUTH_CLIENT_ID", "172127007990-v32hfk1p68be4h7oaf5mddskpffj6ebl.apps.googleusercontent.com"),
  recaptchaSiteKey: ""
};

export default firebaseAppConfig;
