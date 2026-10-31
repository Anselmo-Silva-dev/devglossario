import { FlatList, Text } from 'react-native';
import { TermRow } from '../../src/components/TermRow';
import { favoriteTerms, type Term } from '../../src/db/repo';
import { useTheme } from '../../src/theme';
import { useLoad } from '../../src/useLoad';

export default function Favorites() {
  const { c } = useTheme();
  const favs = useLoad<Term[]>(favoriteTerms, []);
  return (
    <FlatList data={favs} keyExtractor={(t) => String(t.id)} contentContainerStyle={{ padding: 16 }}
      ListEmptyComponent={<Text style={{ color: c.sub }}>Ainda não tens favoritos. Abre um termo e toca em “Favorito”.</Text>}
      renderItem={({ item }) => <TermRow term={item} />} />
  );
}
