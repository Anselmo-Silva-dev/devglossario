import type { SQLiteDatabase } from 'expo-sqlite';
import { CATEGORIES, SEED_VERSION, TERMS } from './seed';

export type Term = {
  id: number; name: string; translation: string | null; definition: string; detailed: string;
  example: string; code: string | null; category_id: number; difficulty: string; created_at: string;
};
export type Category = { id: number; name: string; icon: string; total: number };

export async function getSetting(db: SQLiteDatabase, key: string): Promise<string | null> {
  const r = await db.getFirstAsync<{ value: string }>('SELECT value FROM settings WHERE key = ?', [key]);
  return r ? r.value : null;
}
export const setSetting = (db: SQLiteDatabase, key: string, value: string) =>
  db.runAsync('INSERT OR REPLACE INTO settings (key, value) VALUES (?, ?)', [key, value]);

export async function migrate(db: SQLiteDatabase): Promise<void> {
  await db.execAsync(`
    PRAGMA journal_mode = WAL;
    CREATE TABLE IF NOT EXISTS categories (id INTEGER PRIMARY KEY, name TEXT NOT NULL, icon TEXT NOT NULL);
    CREATE TABLE IF NOT EXISTS terms (id INTEGER PRIMARY KEY AUTOINCREMENT, name TEXT NOT NULL UNIQUE,
      translation TEXT, definition TEXT NOT NULL, detailed TEXT NOT NULL, example TEXT NOT NULL, code TEXT,
      category_id INTEGER NOT NULL REFERENCES categories(id), difficulty TEXT NOT NULL,
      created_at TEXT NOT NULL, views INTEGER NOT NULL DEFAULT 0);
    CREATE TABLE IF NOT EXISTS related (term_id INTEGER NOT NULL, related_id INTEGER NOT NULL, PRIMARY KEY (term_id, related_id));
    CREATE TABLE IF NOT EXISTS favorites (term_id INTEGER PRIMARY KEY);
    CREATE TABLE IF NOT EXISTS learned (term_id INTEGER PRIMARY KEY);
    CREATE TABLE IF NOT EXISTS history (term_id INTEGER PRIMARY KEY, viewed_at TEXT NOT NULL);
    CREATE TABLE IF NOT EXISTS settings (key TEXT PRIMARY KEY, value TEXT NOT NULL);
  `);
  if ((await getSetting(db, 'seed_version')) === String(SEED_VERSION)) return;
  const now = new Date().toISOString();
  await db.withTransactionAsync(async () => {
    for (const [id, name, icon] of CATEGORIES)
      await db.runAsync('INSERT OR IGNORE INTO categories (id, name, icon) VALUES (?, ?, ?)', [id, name, icon]);
    for (const t of TERMS)
      await db.runAsync(
        `INSERT OR IGNORE INTO terms (name, translation, definition, detailed, example, code, category_id, difficulty, created_at)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [t.name, t.translation, t.definition, t.detailed, t.example, t.code, t.categoryId, t.difficulty, now]);
    for (const t of TERMS)
      for (const r of t.related)
        await db.runAsync(
          'INSERT OR IGNORE INTO related (term_id, related_id) SELECT a.id, b.id FROM terms a, terms b WHERE a.name = ? AND b.name = ?',
          [t.name, r]);
    await setSetting(db, 'seed_version', String(SEED_VERSION));
  });
}

const ORDER = 'ORDER BY name COLLATE NOCASE';
export const countTerms = async (db: SQLiteDatabase) =>
  (await db.getFirstAsync<{ n: number }>('SELECT COUNT(*) n FROM terms'))?.n ?? 0;
export const countLearned = async (db: SQLiteDatabase) =>
  (await db.getFirstAsync<{ n: number }>('SELECT COUNT(*) n FROM learned'))?.n ?? 0;
export const listCategories = (db: SQLiteDatabase) =>
  db.getAllAsync<Category>(
    `SELECT c.id, c.name, c.icon, COUNT(t.id) total FROM categories c LEFT JOIN terms t ON t.category_id = c.id
     GROUP BY c.id ORDER BY c.name COLLATE NOCASE`);
export const getCategory = (db: SQLiteDatabase, id: number) =>
  db.getFirstAsync<{ id: number; name: string }>('SELECT id, name FROM categories WHERE id = ?', [id]);
export const listTerms = (db: SQLiteDatabase, categoryId: number) =>
  categoryId === 0
    ? db.getAllAsync<Term>(`SELECT * FROM terms ${ORDER}`)
    : db.getAllAsync<Term>(`SELECT * FROM terms WHERE category_id = ? ${ORDER}`, [categoryId]);
export const search = (db: SQLiteDatabase, q: string) => {
  const like = `%${q.trim()}%`;
  return db.getAllAsync<Term>(
    `SELECT * FROM terms WHERE name LIKE ? OR translation LIKE ? OR definition LIKE ?
     ORDER BY (name LIKE ?) DESC, name COLLATE NOCASE`, [like, like, like, like]);
};
export const popularTerms = (db: SQLiteDatabase, n: number) =>
  db.getAllAsync<Term>('SELECT * FROM terms ORDER BY views DESC, name COLLATE NOCASE LIMIT ?', [n]);
export const recentTerms = (db: SQLiteDatabase, n: number) =>
  db.getAllAsync<Term>('SELECT * FROM terms ORDER BY created_at DESC, id DESC LIMIT ?', [n]);
export const historyTerms = (db: SQLiteDatabase, n: number) =>
  db.getAllAsync<Term>('SELECT t.* FROM history h JOIN terms t ON t.id = h.term_id ORDER BY h.viewed_at DESC LIMIT ?', [n]);
export const favoriteTerms = (db: SQLiteDatabase) =>
  db.getAllAsync<Term>(`SELECT t.* FROM favorites f JOIN terms t ON t.id = f.term_id ORDER BY t.name COLLATE NOCASE`);
export const getTerm = (db: SQLiteDatabase, id: number) =>
  db.getFirstAsync<Term>('SELECT * FROM terms WHERE id = ?', [id]);
export const relatedTerms = (db: SQLiteDatabase, id: number) =>
  db.getAllAsync<Term>('SELECT t.* FROM related r JOIN terms t ON t.id = r.related_id WHERE r.term_id = ? ORDER BY t.name COLLATE NOCASE', [id]);
export const isIn = async (db: SQLiteDatabase, table: 'favorites' | 'learned', id: number) =>
  (await db.getFirstAsync('SELECT 1 x FROM ' + table + ' WHERE term_id = ?', [id])) !== null;
export async function toggle(db: SQLiteDatabase, table: 'favorites' | 'learned', id: number): Promise<void> {
  if (await isIn(db, table, id)) await db.runAsync('DELETE FROM ' + table + ' WHERE term_id = ?', [id]);
  else await db.runAsync('INSERT INTO ' + table + ' (term_id) VALUES (?)', [id]);
}
export async function addHistory(db: SQLiteDatabase, id: number): Promise<void> {
  await db.runAsync('INSERT OR REPLACE INTO history (term_id, viewed_at) VALUES (?, ?)', [id, new Date().toISOString()]);
  await db.runAsync('UPDATE terms SET views = views + 1 WHERE id = ?', [id]);
}
