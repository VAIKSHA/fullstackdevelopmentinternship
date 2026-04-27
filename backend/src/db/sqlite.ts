import Database from 'better-sqlite3';
import path from 'path';

const dbPath = path.join(__dirname, '../../data/app.db');
const db = new Database(dbPath);

db.pragma('journal_mode = WAL');

export const query = async (text: string, params: any[] = []) => {
  try {
    const isSelect = text.trim().toUpperCase().startsWith('SELECT');
    const isReturning = text.toUpperCase().includes('RETURNING');
    
    if (isSelect || isReturning) {
      const stmt = db.prepare(text);
      const rows = stmt.all(...params);
      return { rows, rowCount: rows.length };
    } else {
      const stmt = db.prepare(text);
      const info = stmt.run(...params);
      return { rows: [], rowCount: info.changes, lastID: info.lastInsertRowid };
    }
  } catch (error: any) {
    console.error('Database query error:', error.message);
    throw error;
  }
};

export const getClient = async () => {
  return {
    query: async (text: string, params?: any[]) => query(text, params),
    release: () => {}
  };
};

export default db;
