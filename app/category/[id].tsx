import { useCallback } from 'react';
import { FlatList, Text } from 'react-native';
import { Stack, useLocalSearchParams } from 'expo-router';
import type { SQLiteDatabase } from 'expo-sqlite';
import { TermRow } from '../../src/components/TermRow';
import { getCategory, listTerms, type Term } from '../../src/db/repo';
import { useTheme } from '../../src/theme';
import { useLoad } from '../../src/useLoad';

export default function CategoryScreen() {
  const { c } = useTheme();
  const id = Number(useLocalSearchParams<{ id: string }>().id);
  const load = useCallback(async (db: SQLiteDatabase) => ({
    name: id === 0 ? 'Todos os termos' : (await getCategory(db, id))?.name ?? 'Categoria',
    terms: await listTerms(db, id),
  }), [id]);
  const d = useLoad<{ name: string; terms: Term[] }>(load, { name: '', terms: [] });
  return (
    <>
      <Stack.Screen options={{ title: d.name }} />
      <FlatList data={d.terms} keyExtractor={(t) => String(t.id)} contentContainerStyle={{ padding: 16 }}
        ListEmptyComponent={<Text style={{ color: c.sub }}>Sem termos nesta categoria.</Text>}
        renderItem={({ item }) => <TermRow term={item} />} />
    </>
  );
}
