import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { SQLiteProvider } from 'expo-sqlite';
import { migrate } from '../src/db/repo';
import { ThemeProvider, useTheme } from '../src/theme';

function Inner() {
  const { c, isDark } = useTheme();
  return (
    <>
      <StatusBar style={isDark ? 'light' : 'dark'} />
      <Stack screenOptions={{ headerStyle: { backgroundColor: c.bg }, headerTintColor: c.text, contentStyle: { backgroundColor: c.bg } }}>
        <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
        <Stack.Screen name="term/[id]" options={{ title: 'Termo' }} />
        <Stack.Screen name="category/[id]" options={{ title: 'Categoria' }} />
      </Stack>
    </>
  );
}
export default function Root() {
  return (
    <SQLiteProvider databaseName="devglossario.db" onInit={migrate}>
      <ThemeProvider><Inner /></ThemeProvider>
    </SQLiteProvider>
  );
}
