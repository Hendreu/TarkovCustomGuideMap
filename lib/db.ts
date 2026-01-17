import Database from 'better-sqlite3';
import path from 'path';

// Create database connection
const dbPath = path.join(process.cwd(), 'tarkov-pins.db');
const db = new Database(dbPath);

// Enable foreign keys
db.pragma('foreign_keys = ON');

// Initialize database schema
export function initDatabase() {
  // Create pins table
  db.exec(`
    CREATE TABLE IF NOT EXISTS pins (
      id TEXT PRIMARY KEY,
      map_id TEXT NOT NULL,
      type TEXT NOT NULL CHECK(type IN ('loot', 'boss', 'extract')),
      name TEXT NOT NULL,
      x REAL NOT NULL,
      y REAL NOT NULL,
      description TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )
  `);

  // Create loot_pins table for loot-specific data
  db.exec(`
    CREATE TABLE IF NOT EXISTS loot_pins (
      pin_id TEXT PRIMARY KEY,
      loot_type TEXT NOT NULL CHECK(loot_type IN ('weapon', 'medical', 'tech', 'valuables', 'food')),
      quality TEXT NOT NULL CHECK(quality IN ('high', 'medium', 'low')),
      FOREIGN KEY (pin_id) REFERENCES pins(id) ON DELETE CASCADE
    )
  `);

  // Create boss_pins table for boss-specific data
  db.exec(`
    CREATE TABLE IF NOT EXISTS boss_pins (
      pin_id TEXT PRIMARY KEY,
      boss_name TEXT NOT NULL,
      spawn_chance INTEGER NOT NULL,
      guards INTEGER DEFAULT 0,
      FOREIGN KEY (pin_id) REFERENCES pins(id) ON DELETE CASCADE
    )
  `);

  // Create extract_pins table for extraction-specific data
  db.exec(`
    CREATE TABLE IF NOT EXISTS extract_pins (
      pin_id TEXT PRIMARY KEY,
      requirements TEXT,
      always_available INTEGER DEFAULT 0,
      pmc INTEGER DEFAULT 0,
      scav_only INTEGER DEFAULT 0,
      FOREIGN KEY (pin_id) REFERENCES pins(id) ON DELETE CASCADE
    )
  `);

  // Create keys table for key items
  db.exec(`
    CREATE TABLE IF NOT EXISTS keys (
      id TEXT PRIMARY KEY,
      map_id TEXT NOT NULL,
      name TEXT NOT NULL,
      location TEXT NOT NULL,
      uses INTEGER NOT NULL,
      worth TEXT NOT NULL CHECK(worth IN ('high', 'medium', 'low')),
      unlocks TEXT NOT NULL,
      x REAL,
      y REAL,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )
  `);

  console.log('Database initialized successfully');
}

// Initialize on import
initDatabase();

export default db;
