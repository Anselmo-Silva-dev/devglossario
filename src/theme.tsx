import React, { createContext, useContext, useEffect, useState } from 'react';
import { useColorScheme } from 'react-native';
import { useSQLiteContext } from 'expo-sqlite';
import { getSetting, setSetting } from './db/repo';

export type Mode = 'dark' | 'light' | 'system';
const palettes = {
  dark: { bg: '#0D1117', card: '#161B22', text: '#E6EDF3', sub: '#8B949E', primary: '#3FB950', border: '#30363D' },
  light: { bg: '#F6F8FA', card: '#FFFFFF', text: '#1F2328', sub: '#656D76', primary: '#1A7F37', border: '#D0D7DE' },
};
export type Palette = typeof palettes.dark;
type Value = { mode: Mode; c: Palette; isDark: boolean; setMode: (m: Mode) => void };
const Ctx = createContext<Value | null>(null);

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const db = useSQLiteContext();
  const system = useColorScheme();
  const [mode, setM] = useState<Mode>('dark');
  useEffect(() => {
    getSetting(db, 'theme').then((v) => { if (v === 'dark' || v === 'light' || v === 'system') setM(v); });
  }, [db]);
  const setMode = (m: Mode) => { setM(m); setSetting(db, 'theme', m); };
  const eff = mode === 'system' ? (system === 'light' ? 'light' : 'dark') : mode;
  return <Ctx.Provider value={{ mode, c: palettes[eff], isDark: eff === 'dark', setMode }}>{children}</Ctx.Provider>;
}
export function useTheme(): Value {
  const v = useContext(Ctx);
  if (!v) throw new Error('ThemeProvider em falta');
  return v;
}
