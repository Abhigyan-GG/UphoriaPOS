import * as admin from 'firebase-admin';

// This guard is needed to prevent the app from being initialized multiple times.
if (!admin.apps.length) {
  try {
    const serviceAccount = JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT_KEY as string);
    admin.initializeApp({
      credential: admin.credential.cert(serviceAccount),
    });
  } catch (e: any) {
    console.error('Failed to initialize Firebase Admin SDK:', e.message);
    // If the service account key is not set, we can't use the admin SDK.
    // The app will still work for client-side operations.
  }
}

const firestoreAdmin = admin.firestore();
const authAdmin = admin.auth();

export { firestoreAdmin, authAdmin, admin };
