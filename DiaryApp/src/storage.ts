import * as SQLite from 'expo-sqlite';
import { DiaryEntry } from './types';

const DB_NAME = 'diary.db';
const TABLE_NAME = 'diaries';

class Database {
  private db: SQLite.SQLiteDatabase | null = null;

  async init() {
    try {
      this.db = await SQLite.openDatabaseAsync(DB_NAME);
      await this.createTable();
      console.log('Database initialized');
    } catch (error) {
      console.error('Failed to initialize database:', error);
      throw error;
    }
  }

  private async createTable() {
    if (!this.db) throw new Error('Database not initialized');

    const query = `
      CREATE TABLE IF NOT EXISTS ${TABLE_NAME} (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        date TEXT UNIQUE NOT NULL,
        content TEXT,
        images TEXT,
        videos TEXT,
        city TEXT,
        weather_temperature REAL,
        weather_description TEXT,
        weather_icon TEXT,
        created_at TEXT DEFAULT (datetime('now')),
        updated_at TEXT DEFAULT (datetime('now'))
      )
    `;

    await this.db.execAsync(query);
  }

  async getAllEntries(): Promise<DiaryEntry[]> {
    if (!this.db) throw new Error('Database not initialized');

    const rows = await this.db.getAllAsync<{
      id: number;
      date: string;
      content: string;
      images: string;
      videos: string;
      city: string;
      weather_temperature: number;
      weather_description: string;
      weather_icon: string;
      created_at: string;
      updated_at: string;
    }>(
      `SELECT * FROM ${TABLE_NAME} ORDER BY date DESC`
    );

    return rows.map(row => ({
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

  async getEntryByDate(date: string): Promise<DiaryEntry | null> {
    if (!this.db) throw new Error('Database not initialized');

    const row = await this.db.getFirstAsync<{
      id: number;
      date: string;
      content: string;
      images: string;
      videos: string;
      city: string;
      weather_temperature: number;
      weather_description: string;
      weather_icon: string;
      created_at: string;
      updated_at: string;
    }>(
      `SELECT * FROM ${TABLE_NAME} WHERE date = ?`,
      [date]
    );

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

    const rows = await this.db.getAllAsync<{
      id: number;
      date: string;
      content: string;
      images: string;
      videos: string;
      city: string;
      weather_temperature: number;
      weather_description: string;
      weather_icon: string;
      created_at: string;
      updated_at: string;
    }>(
      `SELECT * FROM ${TABLE_NAME} 
       WHERE content LIKE ? OR city LIKE ? 
       ORDER BY date DESC`,
      [`%${keyword}%`, `%${keyword}%`]
    );

    return rows.map(row => ({
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

    // Check if entry exists
    const existing = await this.getEntryByDate(entry.date);

    if (existing) {
      // Update
      await this.db.runAsync(
        `UPDATE ${TABLE_NAME} 
         SET content = ?, images = ?, videos = ?, city = ?, 
             weather_temperature = ?, weather_description = ?, weather_icon = ?,
             updated_at = ?
         WHERE date = ?`,
        [
          entry.content,
          JSON.stringify(entry.images),
          JSON.stringify(entry.videos),
          entry.city,
          entry.weather.temperature,
          entry.weather.description,
          entry.weather.icon,
          now,
          entry.date,
        ]
      );
      return existing.id;
    } else {
      // Insert
      const result = await this.db.runAsync(
        `INSERT INTO ${TABLE_NAME} 
         (date, content, images, videos, city, weather_temperature, weather_description, weather_icon, created_at, updated_at)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [
          entry.date,
          entry.content,
          JSON.stringify(entry.images),
          JSON.stringify(entry.videos),
          entry.city,
          entry.weather.temperature,
          entry.weather.description,
          entry.weather.icon,
          now,
          now,
        ]
      );
      return result.lastInsertRowId;
    }
  }

  async deleteEntry(date: string): Promise<void> {
    if (!this.db) throw new Error('Database not initialized');

    await this.db.runAsync(`DELETE FROM ${TABLE_NAME} WHERE date = ?`, [date]);
  }

  async getEntriesForMonth(year: number, month: number): Promise<string[]> {
    if (!this.db) throw new Error('Database not initialized');

    const rows = await this.db.getAllAsync<{ date: string }>(
      `SELECT date FROM ${TABLE_NAME} 
       WHERE strftime('%Y', date) = ? AND strftime('%m', date) = ?`,
      [year.toString(), month.toString().padStart(2, '0')]
    );

    return rows.map(row => row.date);
  }
}

export default new Database();