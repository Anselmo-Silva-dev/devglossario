import { useCallback, useEffect, useState } from 'react';
import { Pressable, ScrollView, Share, Text, View } from 'react-native';
import { Stack, router, useLocalSearchParams } from 'expo-router';
import { useSQLiteContext } from 'expo-sqlite';
import { addHistory, getCategory, getTerm, isIn, relatedTerms, toggle, type Term } from '../../src/db/repo';
import { useTheme } from '../../src/theme';

type State = { term: Term; category: string; rel: Term[]; fav: boolean; learned: boolean };

export default function TermScreen() {
  const { c } = useTheme();
  const db = useSQLiteContext();
  const id = Number(useLocalSearchParams<{ id: string }>().id);
  const [s, setS] = useState<State | null>(null);
  const load = useCallback(async () => {
    const term = await getTerm(db, id);
    if (!term) return;
    setS({
      term, category: (await getCategory(db, term.category_id))?.name ?? '', rel: await relatedTerms(db, id),
      fav: await isIn(db, 'favorites', id), learned: await isIn(db, 'learned', id),
    });
  }, [db, id]);
  useEffect(() => { addHistory(db, id).then(load); }, [db, id, load]);
  if (!s) return null;
  const { term } = s;
  const act = async (t: 'favorites' | 'learned') => { await toggle(db, t, id); await load(); };
  const share = () => Share.share({ message: `${term.name}${term.translation ? ` (${term.translation})` : ''}: ${term.definition}\n\nDevGlossário` });
  const Btn = ({ label, on, onPress }: { label: string; on?: boolean; onPress: () => void }) => (
    <Pressable onPress={onPress} style={{ borderRadius: 20, borderWidth: 1, borderColor: on ? c.primary : c.border, backgroundColor: on ? c.primary : c.card, paddingHorizontal: 14, paddingVertical: 8 }}>
      <Text style={{ color: on ? '#fff' : c.text }}>{label}</Text>
    </Pressable>
  );
  const Sec = ({ t, children }: { t: string; children: string }) => (
    <><Text style={{ color: c.primary, fontWeight: '700', marginTop: 18 }}>{t}</Text><Text style={{ color: c.text, marginTop: 4, lineHeight: 22 }}>{children}</Text></>
  );
  return (
    <ScrollView contentContainerStyle={{ padding: 16 }}>
      <Stack.Screen options={{ title: term.name }} />
      <Text style={{ color: c.text, fontSize: 28, fontWeight: '800' }}>{term.name}</Text>
      {term.translation && <Text style={{ color: c.sub, fontSize: 16 }}>{term.translation}</Text>}
      <Text style={{ color: c.sub, marginTop: 6 }}>{s.category} · {term.difficulty}</Text>
      <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginTop: 14 }}>
        <Btn label={s.fav ? '♥ Favorito' : '♡ Favorito'} on={s.fav} onPress={() => act('favorites')} />
        <Btn label={s.learned ? '✓ Aprendido' : 'Marcar como aprendido'} on={s.learned} onPress={() => act('learned')} />
        <Btn label="Partilhar" onPress={share} />
      </View>
      <Sec t="Definição">{term.definition}</Sec>
      <Sec t="Explicação técnica">{term.detailed}</Sec>
      <Sec t="Exemplo prático">{term.example}</Sec>
      {term.code && (
        <ScrollView horizontal style={{ backgroundColor: c.card, borderColor: c.border, borderWidth: 1, borderRadius: 12, marginTop: 12 }}>
          <Text selectable style={{ color: c.text, fontFamily: 'monospace', padding: 12 }}>{term.code}</Text>
        </ScrollView>
      )}
      {s.rel.length > 0 && (
        <>
          <Text style={{ color: c.primary, fontWeight: '700', marginTop: 18, marginBottom: 8 }}>Termos relacionados</Text>
          <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8 }}>
            {s.rel.map((r) => <Btn key={r.id} label={r.name} onPress={() => router.push(`/term/${r.id}`)} />)}
          </View>
        </>
      )}
    </ScrollView>
  );
}
