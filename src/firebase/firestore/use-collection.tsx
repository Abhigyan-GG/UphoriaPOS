'use client';

import { useState, useEffect } from 'react';
import {
  onSnapshot,
  Query,
  DocumentData,
  FirestoreError,
} from 'firebase/firestore';
import { errorEmitter } from '../error-emitter';
import { FirestorePermissionError } from '../errors';

interface CollectionState<T> {
  loading: boolean;
  data: T[];
  error: FirestoreError | FirestorePermissionError | null;
}

export function useCollection<T>(q: Query<DocumentData> | null) {
  const [state, setState] = useState<CollectionState<T>>({
    loading: true,
    data: [],
    error: null,
  });

  useEffect(() => {
    if (!q) {
      setState({ loading: false, data: [], error: null });
      return () => {};
    }

    setState((prevState) => ({ ...prevState, loading: true, error: null }));

    const unsubscribe = onSnapshot(
      q,
      (snapshot) => {
        const data: T[] = snapshot.docs.map(
          (doc) => ({ id: doc.id, ...doc.data() } as unknown as T)
        );
        setState({ loading: false, data, error: null });
      },
      (err) => {
        let path = 'unknown path';
        // This is a hacky way to get the path, might not always work.
        if ((q as any)._query?.path?.segments) {
            path = (q as any)._query.path.segments.join('/');
        }
        const permissionError = new FirestorePermissionError({
          path: path,
          operation: 'list',
        });
        errorEmitter.emit('permission-error', permissionError);
        setState({ loading: false, data: [], error: permissionError });
      }
    );

    return () => unsubscribe();
  }, [q]);

  return state;
}
