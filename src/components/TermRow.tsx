import { Pressable, Text } from 'react-native';
import { router } from 'expo-router';
import type { Term } from '../db/repo';
import { useTheme } from '../theme';

export function TermRow({ term }: { term: Term }) {
  const { c } = useTheme();
  return (
    <Pressable
      onPress={() => router.push(`/term/${term.id}`)}
      android_ripple={{ color: c.border }}
      style={{ backgroundColor: c.card, borderRadius: 16, padding: 14, marginBottom: 10, borderWidth: 1, borderColor: c.border }}>
      <Text style={{ color: c.text, fontSize: 16, fontWeight: '700' }}>
        {term.name}{term.translation ? <Text style={{ color: c.sub, fontWeight: '400' }}>  ·  {term.translation}</Text> : null}
      </Text>
      <Text numberOfLines={2} style={{ color: c.sub, marginTop: 4 }}>{term.definition}</Text>
      <Text style={{ color: c.primary, marginTop: 6, fontSize: 12 }}>{term.difficulty}</Text>
    </Pressable>
  );
}
