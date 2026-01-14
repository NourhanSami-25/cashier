import Database from 'better-sqlite3';
import path from 'path';
import fs from 'fs';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

// Database file path from environment or default
const DB_PATH = process.env.DATABASE_PATH || path.join(__dirname, '../../data/cafe_pos.db');

// Singleton database instance
let db: Database.Database | null = null;

/**
 * Get database instance (singleton pattern)
 * Creates database file and directory if they don't exist
 */
export function getDatabase(): Database.Database {
  if (!db) {
    // Ensure data directory exists
    const dataDir = path.dirname(DB_PATH);
    if (!fs.existsSync(dataDir)) {
      fs.mkdirSync(dataDir, { recursive: true });
    }
    
    // Create database connection
    db = new Database(DB_PATH);
    
    // Enable WAL mode for better concurrency
    db.pragma('journal_mode = WAL');
    
    // Enable foreign keys
    db.pragma('foreign_keys = ON');
  }
  
  return db;
}

/**
 * Initialize database schema
 * Creates all required tables if they don't exist
 */
export function initializeDatabase(): void {
  const database = getDatabase();
  
  // Create categories table
  database.exec(`
    CREATE TABLE IF NOT EXISTS categories (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )
  `);

  // Create products table
  database.exec(`
    CREATE TABLE IF NOT EXISTS products (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      price REAL NOT NULL,
      category_id TEXT NOT NULL,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (category_id) REFERENCES categories(id)
    )
  `);

  // Create invoices table
  database.exec(`
    CREATE TABLE IF NOT EXISTS invoices (
      id TEXT PRIMARY KEY,
      invoice_number TEXT NOT NULL UNIQUE,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      completed_at DATETIME,
      subtotal REAL NOT NULL DEFAULT 0,
      service_charge REAL NOT NULL DEFAULT 0,
      tax REAL NOT NULL DEFAULT 0,
      total REAL NOT NULL DEFAULT 0
    )
  `);

  // Create invoice_items table
  database.exec(`
    CREATE TABLE IF NOT EXISTS invoice_items (
      id TEXT PRIMARY KEY,
      invoice_id TEXT NOT NULL,
      product_id TEXT NOT NULL,
      product_name TEXT NOT NULL,
      product_price REAL NOT NULL,
      quantity INTEGER NOT NULL,
      line_total REAL NOT NULL,
      FOREIGN KEY (invoice_id) REFERENCES invoices(id),
      FOREIGN KEY (product_id) REFERENCES products(id)
    )
  `);

  // Create settings table with single-row constraint
  database.exec(`
    CREATE TABLE IF NOT EXISTS settings (
      id INTEGER PRIMARY KEY CHECK (id = 1),
      tax_rate REAL NOT NULL DEFAULT 0.15,
      service_rate REAL NOT NULL DEFAULT 0.10
    )
  `);

  // Seed default settings if not exist
  seedDefaultSettings(database);
}

/**
 * Seed default settings (tax rate 15%, service rate 10%)
 */
function seedDefaultSettings(database: Database.Database): void {
  const settings = database.prepare('SELECT * FROM settings WHERE id = 1').get();
  
  if (!settings) {
    database.prepare(`
      INSERT INTO settings (id, tax_rate, service_rate) 
      VALUES (1, 0.15, 0.10)
    `).run();
  }
}

/**
 * Close database connection
 */
export function closeDatabase(): void {
  if (db) {
    db.close();
    db = null;
  }
}

/**
 * Reset database for testing purposes
 * Deletes all data but preserves schema and default settings
 */
export function resetDatabase(): void {
  const database = getDatabase();
  
  // Delete in correct order to respect foreign keys
  database.exec('DELETE FROM invoice_items');
  database.exec('DELETE FROM invoices');
  database.exec('DELETE FROM products');
  database.exec('DELETE FROM categories');
  
  // Reset settings to defaults
  database.exec('DELETE FROM settings');
  seedDefaultSettings(database);
}
