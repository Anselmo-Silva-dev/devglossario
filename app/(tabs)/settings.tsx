import { Alert, Pressable, ScrollView, Text, View } from 'react-native';
import Constants from 'expo-constants';
import { useTheme, type Mode } from '../../src/theme';

const MODES: [Mode, string][] = [['dark', 'Escuro'], ['light', 'Claro'], ['system', 'Sistema']];

export default function Settings() {
  const { c, mode, setMode } = useTheme();
  const Row = ({ label, onPress }: { label: string; onPress: () => void }) => (
    <Pressable onPress={onPress} style={{ backgroundColor: c.card, borderColor: c.border, borderWidth: 1, borderRadius: 14, padding: 14, marginTop: 10 }}>
      <Text style={{ color: c.text }}>{label}</Text>
    </Pressable>
  );
  return (
    <ScrollView contentContainerStyle={{ padding: 16 }}>
      <Text style={{ color: c.sub }}>Tema</Text>
      <View style={{ flexDirection: 'row', gap: 8, marginTop: 8 }}>
        {MODES.map(([m, label]) => (
          <Pressable key={m} onPress={() => setMode(m)} style={{ borderRadius: 20, borderWidth: 1, borderColor: mode === m ? c.primary : c.border, backgroundColor: mode === m ? c.primary : c.card, paddingHorizontal: 16, paddingVertical: 8 }}>
            <Text style={{ color: mode === m ? '#fff' : c.text }}>{label}</Text>
          </Pressable>
        ))}
      </View>
      <Text style={{ color: c.sub, marginTop: 20 }}>Idioma</Text>
      <Text style={{ color: c.text, marginTop: 6 }}>Português (único idioma disponível por agora)</Text>
      <Text style={{ color: c.sub, marginTop: 20 }}>Versão {Constants.expoConfig?.version ?? '1.0.0'}</Text>
      <Row label="Política de privacidade" onPress={() => Alert.alert('Privacidade', 'O DevGlossário funciona offline e não recolhe, envia nem partilha dados pessoais. Favoritos, histórico e progresso ficam apenas guardados no teu dispositivo.')} />
      <Row label="Sobre o projeto" onPress={() => Alert.alert('DevGlossário', 'Dicionário offline de tecnologia e programação, em português, feito com React Native, TypeScript, Expo e SQLite.')} />
    </ScrollView>
  );
}
