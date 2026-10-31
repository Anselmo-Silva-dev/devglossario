import { Pressable, ScrollView, Text, View } from 'react-native';
import { router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import type { SQLiteDatabase } from 'expo-sqlite';
import { TermRow } from '../../src/components/TermRow';
import * as repo from '../../src/db/repo';
import { useTheme } from '../../src/theme';
import { useLoad } from '../../src/useLoad';

const EMPTY = { total: 0, learned: 0, favs: 0, cats: [] as repo.Category[], popular: [] as repo.Term[], recent: [] as repo.Term[], history: [] as repo.Term[] };
const load = async (db: SQLiteDatabase) => ({
  total: await repo.countTerms(db), learned: await repo.countLearned(db),
  favs: (await repo.favoriteTerms(db)).length, cats: await repo.listCategories(db),
  popular: await repo.popularTerms(db, 5), recent: await repo.recentTerms(db, 5), history: await repo.historyTerms(db, 5),
});

export default function Home() {
  const { c } = useTheme();
  const d = useLoad(load, EMPTY);
  const pct = d.total ? d.learned / d.total : 0;
  const H = ({ t }: { t: string }) => <Text style={{ color: c.text, fontSize: 18, fontWeight: '700', marginTop: 22, marginBottom: 10 }}>{t}</Text>;
  return (
    <ScrollView contentContainerStyle={{ padding: 16, paddingTop: 48 }}>
      <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10 }}>
        <Ionicons name="book" size={32} color={c.primary} />
        <Text style={{ color: c.text, fontSize: 28, fontWeight: '800' }}>DevGlossário</Text>
      </View>
      <Text style={{ color: c.sub, marginTop: 6 }}>Bem-vindo! Aprende os termos de tecnologia e programação, mesmo sem internet.</Text>
      <Pressable onPress={() => router.push('/search')} style={{ backgroundColor: c.card, borderColor: c.border, borderWidth: 1, borderRadius: 14, padding: 14, marginTop: 16, flexDirection: 'row', gap: 8 }}>
        <Ionicons name="search" size={20} color={c.sub} /><Text style={{ color: c.sub }}>Pesquisar termos…</Text>
      </Pressable>
      <View style={{ backgroundColor: c.card, borderColor: c.border, borderWidth: 1, borderRadius: 16, padding: 14, marginTop: 14 }}>
        <Text style={{ color: c.text }}>{d.total} termos · {d.learned} aprendidos</Text>
        <View style={{ height: 8, backgroundColor: c.border, borderRadius: 4, marginTop: 8 }}>
          <View style={{ height: 8, width: `${Math.round(pct * 100)}%`, backgroundColor: c.primary, borderRadius: 4 }} />
        </View>
      </View>
      <Pressable onPress={() => router.push('/favorites')} style={{ marginTop: 12 }}>
        <Text style={{ color: c.primary }}>♥ Favoritos ({d.favs})</Text>
      </Pressable>
      <H t="Categorias" />
      <ScrollView horizontal showsHorizontalScrollIndicator={false}>
        {d.cats.map((cat) => (
          <Pressable key={cat.id} onPress={() => router.push(`/category/${cat.id}`)} style={{ backgroundColor: c.card, borderColor: c.border, borderWidth: 1, borderRadius: 20, paddingHorizontal: 14, paddingVertical: 8, marginRight: 8 }}>
            <Text style={{ color: c.text }}>{cat.name}</Text>
          </Pressable>
        ))}
      </ScrollView>
      <H t="Mais consultados" />{d.popular.map((t) => <TermRow key={t.id} term={t} />)}
      <H t="Adicionados recentemente" />{d.recent.map((t) => <TermRow key={t.id} term={t} />)}
      {d.history.length > 0 && <><H t="Consultados por si" />{d.history.map((t) => <TermRow key={t.id} term={t} />)}</>}
    </ScrollView>
  );
}
