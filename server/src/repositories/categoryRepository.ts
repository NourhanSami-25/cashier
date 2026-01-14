import { getDatabase } from '../config/database';
import { Category } from '../models';
import { v4 as uuidv4 } from 'uuid';

export class CategoryRepository {
  /**
   * Create a new category
   */
  create(name: string): Category {
    const db = getDatabase();
    const id = uuidv4();
    const createdAt = new Date();
    
    db.prepare(`
      INSERT INTO categories (id, name, created_at)
      VALUES (?, ?, ?)
    `).run(id, name, createdAt.toISOString());
    
    return {
      id,
      name,
      createdAt
    };
  }

  /**
   * Retrieve all categories
   */
  findAll(): Category[] {
    const db = getDatabase();
    const rows = db.prepare('SELECT * FROM categories ORDER BY name').all() as any[];
    
    return rows.map(row => ({
      id: row.id,
      name: row.name,
      createdAt: new Date(row.created_at)
    }));
  }

  /**
   * Retrieve category by ID
   */
  findById(id: string): Category | null {
    const db = getDatabase();
    const row = db.prepare('SELECT * FROM categories WHERE id = ?').get(id) as any;
    
    if (!row) {
      return null;
    }
    
    return {
      id: row.id,
      name: row.name,
      createdAt: new Date(row.created_at)
    };
  }

  /**
   * Delete category by ID
   */
  delete(id: string): boolean {
    const db = getDatabase();
    const result = db.prepare('DELETE FROM categories WHERE id = ?').run(id);
    return result.changes > 0;
  }
}
