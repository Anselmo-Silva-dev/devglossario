import { Tabs } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../../src/theme';

type Icon = React.ComponentProps<typeof Ionicons>['name'];
const TABS: [string, string, Icon][] = [
  ['index', 'Início', 'home'], ['categories', 'Categorias', 'grid'], ['search', 'Pesquisa', 'search'],
  ['favorites', 'Favoritos', 'heart'], ['settings', 'Definições', 'settings'],
];
export default function TabsLayout() {
  const { c } = useTheme();
  return (
    <Tabs screenOptions={{
      headerStyle: { backgroundColor: c.bg }, headerTintColor: c.text,
      tabBarStyle: { backgroundColor: c.card, borderTopColor: c.border },
      tabBarActiveTintColor: c.primary, tabBarInactiveTintColor: c.sub,
    }}>
      {TABS.map(([name, title, icon]) => (
        <Tabs.Screen key={name} name={name}
          options={{ title, headerShown: name !== 'index', tabBarIcon: ({ color, size }) => <Ionicons name={icon} color={color} size={size} /> }} />
      ))}
    </Tabs>
  );
}
