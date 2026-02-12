'use server';

import * as admin from 'firebase-admin';

let firestoreAdmin: admin.firestore.Firestore | undefined;
let authAdmin: admin.auth.Auth | undefined;
let adminInitError: Error | null = null;

function initializeAdmin() {
  if (admin.apps.length > 0) {
    firestoreAdmin = admin.firestore();
    authAdmin = admin.auth();
    return;
  }
  
  try {
    const serviceAccountKey = process.env.FIREBASE_SERVICE_ACCOUNT_KEY;
    if (!serviceAccountKey || serviceAccountKey.trim() === '') {
      throw new Error(
        'The FIREBASE_SERVICE_ACCOUNT_KEY environment variable is not set. Please add it to your .env file and restart the server.'
      );
    }
    
    const serviceAccount = JSON.parse(serviceAccountKey);
    
    admin.initializeApp({
      credential: admin.credential.cert(serviceAccount),
    });

    firestoreAdmin = admin.firestore();
    authAdmin = admin.auth();
  } catch (e: any) {
    console.error('Failed to initialize Firebase Admin SDK:', e);
    adminInitError = new Error(`Firebase Admin SDK initialization failed. Please check that your FIREBASE_SERVICE_ACCOUNT_KEY in .env is a valid JSON object. Internal error: ${e.message}`);
  }
}

initializeAdmin();

export { firestoreAdmin, authAdmin, admin, adminInitError };
