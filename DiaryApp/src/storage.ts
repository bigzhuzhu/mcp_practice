import { Platform } from 'react-native';
import { DiaryEntry } from './types';

const DB_KEY = 'diary_local_storage_v1';

// Simple web fallback using localStorage. It stores an array of entries keyed by date.
class WebDB {
  data: Record<string, any> = {};

  async openDatabaseAsync() {
    const raw = localStorage.getItem(DB_KEY);
    this.data = raw ? JSON.parse(raw) : {};
    return this;
  }

  async execAsync(_query: string) {
    // noop for web fallback
    return;
  }

  async getAllAsync<T = any>(_query?: string, _params?: any[]): Promise<T[]> {
    const rows = Object.values(this.data) as T[];
    // sort by date desc if date property exists
    rows.sort((a: any, b: any) => (b.date || '').localeCompare(a.date || ''));
    return rows;
  }

  async getFirstAsync<T = any>(_query?: string, _params?: any[]): Promise<T | null> {
    const params = _params || [];
    // simple implementation for `WHERE date = ?`
    if (params.length >= 1) {
      const key = params[0];
      return (this.data[key] as T) || null;
    }
    return null;
  }

  async runAsync(_query: string, _params: any[] = []) {
    // implement simple INSERT/UPDATE/DELETE emulation for the storage.ts usage
    // We'll detect by query type via startsWith
    const q = (_query || '').trim().toUpperCase();
    if (q.startsWith('INSERT')) {
      // params ordering expected: date, content, images, videos, city, temp, desc, icon, created_at, updated_at
      const [date, content, images, videos, city, temp, desc, icon, created_at, updated_at] = _params;
      this.data[date] = {
        id: date,
        date,
        content,
        images,
        videos,
        city,
        weather_temperature: temp,
        weather_description: desc,
        weather_icon: icon,
        created_at,
        updated_at,
      };
      localStorage.setItem(DB_KEY, JSON.stringify(this.data));
      return { lastInsertRowId: date } as any;
    }
    if (q.startsWith('UPDATE')) {
      // params expect updated values then date
      const params = _params;
      const date = params[params.length - 1];
      const entry = this.data[date] || {};
      entry.content = params[0];
      entry.images = params[1];
      entry.videos = params[2];
      entry.city = params[3];
      entry.weather_temperature = params[4];
      entry.weather_description = params[5];
      entry.weather_icon = params[6];
      entry.updated_at = params[7];
      this.data[date] = entry;
      localStorage.setItem(DB_KEY, JSON.stringify(this.data));
      return {} as any;
    }
    if (q.startsWith('DELETE')) {
      const date = _params[0];
      delete this.data[date];
      localStorage.setItem(DB_KEY, JSON.stringify(this.data));
      return {} as any;
    }
    return {} as any;
  }
}

class Database {
  private db: any = null;

  async init() {
    try {
      if (Platform.OS === 'web') {
        this.db = await new WebDB().openDatabaseAsync();
      } else {
        // native: try require expo-sqlite (use require to avoid some bundlers failing if missing)
        let SQLite: any = null;
        try {
          // eslint-disable-next-line @typescript-eslint/no-var-requires
          SQLite = require('expo-sqlite');
        } catch (e) {
          SQLite = null;
        }
        if (!SQLite) throw new Error('expo-sqlite not available');
        // If a helper wrapper exists that offers openDatabaseAsync, use it; otherwise fallback to basic openDatabase
        const maybeOpen = SQLite.openDatabaseAsync || SQLite.openDatabase || SQLite.openDatabaseIOS;
        if (maybeOpen) {
          this.db = await maybeOpen('diary.db');
        } else {
          this.db = SQLite.openDatabase('diary.db');
        }
        // create table via execAsync if available, otherwise leave it to native transactions
        try {
          await (this.db.execAsync ? this.db.execAsync.bind(this.db) : async () => {})(`CREATE TABLE IF NOT EXISTS diaries (id INTEGER PRIMARY KEY AUTOINCREMENT, date TEXT UNIQUE NOT NULL)`);
        } catch (err) {
          // ignore
        }
      }
      console.log('Database initialized');
    } catch (error) {
      console.error('Failed to initialize database:', error);
      throw error;
    }
  }

  async getAllEntries(): Promise<DiaryEntry[]> {
    if (!this.db) throw new Error('Database not initialized');
    const rows = await this.db.getAllAsync?.() ?? (await this.db.getAllAsync?.());
    // If using WebDB, rows are already in expected shape
    if (Array.isArray(rows)) {
      return rows.map((row: any) => ({
        id: row.id,
        date: row.date,
        content: row.content || '',
        images: row.images ? JSON.parse(row.images) : [],
        videos: row.videos ? JSON.parse(row.videos) : [],
        city: row.city,
        weather: {
          temperature: row.weather_temperature,
          description: row.weather_description,
          icon: row.weather_icon,
        },
        createdAt: row.created_at,
        updatedAt: row.updated_at,
      }));
    }
    return [];
  }

  async getEntryByDate(date: string): Promise<DiaryEntry | null> {
    if (!this.db) throw new Error('Database not initialized');
    const row = await this.db.getFirstAsync?.('', [date]) ?? null;
    if (!row) return null;
    return {
      id: row.id,
      date: row.date,
      content: row.content || '',
      images: row.images ? JSON.parse(row.images) : [],
      videos: row.videos ? JSON.parse(row.videos) : [],
      city: row.city,
      weather: {
        temperature: row.weather_temperature,
        description: row.weather_description,
        icon: row.weather_icon,
      },
      createdAt: row.created_at,
      updatedAt: row.updated_at,
    };
  }

  async searchEntries(keyword: string): Promise<DiaryEntry[]> {
    if (!this.db) throw new Error('Database not initialized');
    const rows = await this.db.getAllAsync?.() ?? [];
    const q = keyword.toLowerCase();
    const filtered = rows.filter((r: any) => ((r.content || '').toLowerCase().includes(q) || (r.city || '').toLowerCase().includes(q)));
    return filtered.map((row: any) => ({
      id: row.id,
      date: row.date,
      content: row.content || '',
      images: row.images ? JSON.parse(row.images) : [],
      videos: row.videos ? JSON.parse(row.videos) : [],
      city: row.city,
      weather: {
        temperature: row.weather_temperature,
        description: row.weather_description,
        icon: row.weather_icon,
      },
      createdAt: row.created_at,
      updatedAt: row.updated_at,
    }));
  }

  async createOrUpdateEntry(entry: DiaryEntry): Promise<number> {
    if (!this.db) throw new Error('Database not initialized');
    const now = new Date().toISOString();
    const existing = await this.getEntryByDate(entry.date);
    if (existing) {
      await this.db.runAsync?.(`UPDATE diaries SET content = ?, images = ?, videos = ?, city = ?, weather_temperature = ?, weather_description = ?, weather_icon = ?, updated_at = ? WHERE date = ?`, [entry.content, JSON.stringify(entry.images), JSON.stringify(entry.videos), entry.city, entry.weather?.temperature, entry.weather?.description, entry.weather?.icon, now, entry.date]);
      return existing.id as any;
    } else {
      const res = await this.db.runAsync?.(`INSERT INTO diaries (date, content, images, videos, city, weather_temperature, weather_description, weather_icon, created_at, updated_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`, [entry.date, entry.content, JSON.stringify(entry.images), JSON.stringify(entry.videos), entry.city, entry.weather?.temperature, entry.weather?.description, entry.weather?.icon, now, now]);
      return (res && res.lastInsertRowId) || entry.date;
    }
  }

  async deleteEntry(date: string): Promise<void> {
    if (!this.db) throw new Error('Database not initialized');
    await this.db.runAsync?.(`DELETE FROM diaries WHERE date = ?`, [date]);
  }

  async getEntriesForMonth(year: number, month: number): Promise<string[]> {
    if (!this.db) throw new Error('Database not initialized');
    const rows = await this.db.getAllAsync?.() ?? [];
    const filtered = rows.filter((r: any) => {
      const d = r.date || '';
      return d.startsWith(`${year.toString()}-${month.toString().padStart(2, '0')}`);
    });
    return filtered.map((r: any) => r.date);
  }
}

export default new Database();