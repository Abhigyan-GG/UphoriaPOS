import { initializeApp, getApp, getApps, type FirebaseOptions } from 'firebase/app';

const firebaseConfig: FirebaseOptions = {
  projectId: "studio-3553753010-92c77",
  appId: "1:1000254178969:web:138a8dca0b02f2ab645a08",
  apiKey: "AIzaSyDAxbC4dOKO3FhRBp-SJ2_XOFmf5X_lJT4",
  authDomain: "studio-3553753010-92c77.firebaseapp.com",
  messagingSenderId: "1000254178969"
};

function initializeFirebase() {
    return !getApps().length ? initializeApp(firebaseConfig) : getApp();
}

export const firebaseApp = initializeFirebase();
