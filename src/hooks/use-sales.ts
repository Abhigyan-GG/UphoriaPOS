'use client';
import { useFirestore, useCollection } from '@/firebase';
import { collection, query as firestoreQuery, orderBy } from 'firebase/firestore';
import { useMemo } from 'react';
import type { Sale } from '@/lib/types';

export function useSales() {
  const firestore = useFirestore();
  const query = useMemo(() => {
    if (!firestore) return null;
    return firestoreQuery(collection(firestore, 'sales'), orderBy('created_at', 'desc'));
  }, [firestore]);

  return useCollection<Sale>(query);
}
