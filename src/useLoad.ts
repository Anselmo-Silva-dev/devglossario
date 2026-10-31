import { useCallback, useState } from 'react';
import { useFocusEffect } from 'expo-router';
import { useSQLiteContext, type SQLiteDatabase } from 'expo-sqlite';

/** Carrega dados da BD sempre que o ecrã ganha foco. `fn` deve ser estável. */
export function useLoad<T>(fn: (db: SQLiteDatabase) => Promise<T>, initial: T): T {
  const db = useSQLiteContext();
  const [data, setData] = useState<T>(initial);
  useFocusEffect(useCallback(() => {
    let on = true;
    fn(db).then((r) => { if (on) setData(r); });
    return () => { on = false; };
  }, [db, fn]));
  return data;
}
