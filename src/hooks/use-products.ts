'use client';
import { useFirestore, useCollection } from '@/firebase';
import { collection } from 'firebase/firestore';
import { useMemo } from 'react';
import type { Product } from '@/lib/types';

export function useProducts() {
  const firestore = useFirestore();
  const query = useMemo(() => {
    if (!firestore) return null;
    return collection(firestore, 'products');
  }, [firestore]);

  return useCollection<Product>(query);
}
