'use client';

import { useState, useEffect } from 'react';
import {
  onSnapshot,
  doc,
  DocumentReference,
  DocumentData,
  FirestoreError,
} from 'firebase/firestore';
import { errorEmitter } from '../error-emitter';
import { FirestorePermissionError } from '../errors';

interface DocState<T> {
  loading: boolean;
  data: T | null;
  error: FirestoreError | FirestorePermissionError | null;
}

export function useDoc<T>(ref: DocumentReference<DocumentData> | null) {
  const [state, setState] = useState<DocState<T>>({
    loading: true,
    data: null,
    error: null,
  });

  useEffect(() => {
    if (!ref) {
      setState({ loading: false, data: null, error: null });
      return;
    }

    setState((prevState) => ({ ...prevState, loading: true }));

    const unsubscribe = onSnapshot(
      ref,
      (snapshot) => {
        setState({
          loading: false,
          data: snapshot.exists()
            ? ({ id: snapshot.id, ...snapshot.data() } as T)
            : null,
          error: null,
        });
      },
      (err) => {
        const permissionError = new FirestorePermissionError({
          path: ref.path,
          operation: 'get',
        });
        errorEmitter.emit('permission-error', permissionError);
        setState({ loading: false, data: null, error: permissionError });
      }
    );

    return () => unsubscribe();
  }, [ref?.path]);

  return state;
}
