import { getDatabase } from '../config/database';
import { Product } from '../models';
import { v4 as uuidv4 } from 'uuid';

export class ProductRepository {
  /**
   * Create a new product
   */
  create(name: string, price: number, categoryId: string): Product {
    const db = getDatabase();
    const id = uuidv4();
    const createdAt = new Date();
    
    db.prepare(`
      INSERT INTO products (id, name, price, category_id, created_at)
      VALUES (?, ?, ?, ?, ?)
    `).run(id, name, price, categoryId, createdAt.toISOString());
    
    return {
      id,
      name,
      price,
      categoryId,
      createdAt
    };
  }

  /**
   * Retrieve all products
   */
  findAll(): Product[] {
    const db = getDatabase();
    const rows = db.prepare('SELECT * FROM products ORDER BY name').all() as any[];
    
    return rows.map(row => ({
      id: row.id,
      name: row.name,
      price: row.price,
      categoryId: row.category_id,
      createdAt: new Date(row.created_at)
    }));
  }

  /**
   * Retrieve product by ID
   */
  findById(id: string): Product | null {
    const db = getDatabase();
    const row = db.prepare('SELECT * FROM products WHERE id = ?').get(id) as any;
    
    if (!row) {
      return null;
    }
    
    return {
      id: row.id,
      name: row.name,
      price: row.price,
      categoryId: row.category_id,
      createdAt: new Date(row.created_at)
    };
  }

  /**
   * Retrieve products by category ID
   */
  findByCategoryId(categoryId: string): Product[] {
    const db = getDatabase();
    const rows = db.prepare('SELECT * FROM products WHERE category_id = ? ORDER BY name').all(categoryId) as any[];
    
    return rows.map(row => ({
      id: row.id,
      name: row.name,
      price: row.price,
      categoryId: row.category_id,
      createdAt: new Date(row.created_at)
    }));
  }

  /**
   * Update product
   */
  update(id: string, name: string, price: number, categoryId: string): Product | null {
    const db = getDatabase();
    
    const result = db.prepare(`
      UPDATE products 
      SET name = ?, price = ?, category_id = ?
      WHERE id = ?
    `).run(name, price, categoryId, id);
    
    if (result.changes === 0) {
      return null;
    }
    
    return this.findById(id);
  }

  /**
   * Delete product by ID
   */
  delete(id: string): boolean {
    const db = getDatabase();
    const result = db.prepare('DELETE FROM products WHERE id = ?').run(id);
    return result.changes > 0;
  }
}
