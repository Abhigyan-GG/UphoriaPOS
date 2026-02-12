'use client';

import { useEffect, useState } from 'react';
import { useAuth } from '../provider';
import { onAuthStateChanged, type User } from 'firebase/auth';

export const useUser = () => {
  const auth = useAuth();
  const [state, setState] = useState<{
    user: User | null;
    loading: boolean;
    error: Error | null;
  }>({
    user: null,
    loading: true,
    error: null,
  });

  useEffect(() => {
    if (!auth) {
      setState({ user: null, loading: false, error: new Error('Firebase Auth not initialized') });
      return;
    }
    
    const unsubscribe = onAuthStateChanged(
      auth,
      (user) => {
        setState({ user, loading: false, error: null });
      },
      (error) => {
        setState({ user: null, loading: false, error });
      }
    );

    return () => unsubscribe();
  }, [auth]);

  return state;
};
