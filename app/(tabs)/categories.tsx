import { FlatList, Pressable, Text } from 'react-native';
import { router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import type { SQLiteDatabase } from 'expo-sqlite';
import { listCategories, type Category } from '../../src/db/repo';
import { useTheme } from '../../src/theme';
import { useLoad } from '../../src/useLoad';

const load = (db: SQLiteDatabase) => listCategories(db);
type Icon = React.ComponentProps<typeof Ionicons>['name'];

export default function Categories() {
  const { c } = useTheme();
  const cats = useLoad<Category[]>(load, []);
  const all: Category = { id: 0, name: 'Todos os termos (A–Z)', icon: 'list', total: cats.reduce((s, x) => s + x.total, 0) };
  return (
    <FlatList data={[all, ...cats]} keyExtractor={(x) => String(x.id)} contentContainerStyle={{ padding: 16 }}
      renderItem={({ item }) => (
        <Pressable onPress={() => router.push(`/category/${item.id}`)} style={{ backgroundColor: c.card, borderColor: c.border, borderWidth: 1, borderRadius: 16, padding: 14, marginBottom: 10, flexDirection: 'row', alignItems: 'center', gap: 12 }}>
          <Ionicons name={item.icon as Icon} size={24} color={c.primary} />
          <Text style={{ color: c.text, flex: 1, fontSize: 16 }}>{item.name}</Text>
          <Text style={{ color: c.sub }}>{item.total}</Text>
        </Pressable>
      )} />
  );
}
