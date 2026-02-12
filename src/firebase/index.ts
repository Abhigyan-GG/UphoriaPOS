'use client';

// This file is the public API for the Firebase module.
// It should not export any implementation details.

export { FirebaseClientProvider } from "./client-provider";
export { 
    useAuth, 
    useFirestore, 
    useFirebaseApp, 
    useFirebase,
    FirebaseProvider
} from './provider';

export { useUser } from './auth/use-user';

export { useCollection } from './firestore/use-collection';
export { useDoc } from './firestore/use-doc';

export { firebaseApp } from './config';
