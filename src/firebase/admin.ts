import * as admin from 'firebase-admin';

// This guard is needed to prevent the app from being initialized multiple times.
if (!admin.apps.length) {
  try {
    const serviceAccountKey = process.env.FIREBASE_SERVICE_ACCOUNT_KEY;
    if (!serviceAccountKey) {
        throw new Error("FIREBASE_SERVICE_ACCOUNT_KEY environment variable is not set.");
    }
    const serviceAccount = JSON.parse(serviceAccountKey);
    admin.initializeApp({
      credential: admin.credential.cert(serviceAccount),
    });
  } catch (e: any) {
    console.error('Failed to initialize Firebase Admin SDK:', e.message);
  }
}

const firestoreAdmin = admin.apps.length > 0 ? admin.firestore() : undefined;
const authAdmin = admin.apps.length > 0 ? admin.auth() : undefined;

export { firestoreAdmin, authAdmin, admin };
