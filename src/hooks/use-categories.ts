'use client';
import { useFirestore, useCollection } from '@/firebase';
import { collection } from 'firebase/firestore';
import { useMemo } from 'react';
import type { Category } from '@/lib/types';

export function useCategories() {
  const firestore = useFirestore();
  const query = useMemo(() => {
    if (!firestore) return null;
    return collection(firestore, 'categories');
  }, [firestore]);

  return useCollection<Category>(query);
}
