import { useEffect, useState } from 'react';
import { FlatList, Pressable, Text, TextInput, View } from 'react-native';
import { router } from 'expo-router';
import { useSQLiteContext } from 'expo-sqlite';
import { TermRow } from '../../src/components/TermRow';
import { popularTerms, search, type Term } from '../../src/db/repo';
import { useTheme } from '../../src/theme';

export default function Search() {
  const { c } = useTheme();
  const db = useSQLiteContext();
  const [q, setQ] = useState('');
  const [res, setRes] = useState<Term[]>([]);
  const [sug, setSug] = useState<Term[]>([]);
  useEffect(() => { popularTerms(db, 6).then(setSug); }, [db]);
  useEffect(() => {
    let on = true;
    if (!q.trim()) { setRes([]); return; }
    search(db, q).then((r) => { if (on) setRes(r); });
    return () => { on = false; };
  }, [db, q]);
  const typing = q.trim().length > 0;
  return (
    <View style={{ flex: 1, padding: 16 }}>
      <TextInput value={q} onChangeText={setQ} placeholder="Nome, tradução ou definição…" placeholderTextColor={c.sub}
        autoCorrect={false} style={{ backgroundColor: c.card, color: c.text, borderColor: c.border, borderWidth: 1, borderRadius: 14, padding: 12, marginBottom: 12 }} />
      {!typing && (
        <>
          <Text style={{ color: c.sub, marginBottom: 8 }}>Sugestões</Text>
          <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8 }}>
            {sug.map((t) => (
              <Pressable key={t.id} onPress={() => router.push(`/term/${t.id}`)} style={{ backgroundColor: c.card, borderColor: c.border, borderWidth: 1, borderRadius: 20, paddingHorizontal: 14, paddingVertical: 8 }}>
                <Text style={{ color: c.text }}>{t.name}</Text>
              </Pressable>
            ))}
          </View>
        </>
      )}
      {typing && (
        <FlatList data={res} keyExtractor={(t) => String(t.id)} keyboardShouldPersistTaps="handled"
          ListEmptyComponent={<Text style={{ color: c.sub }}>Nenhum termo encontrado para “{q.trim()}”.</Text>}
          renderItem={({ item }) => <TermRow term={item} />} />
      )}
    </View>
  );
}
