import { query, getClient } from './index';

interface Field {
  name: string;
  type: string;
  required?: boolean;
  unique?: boolean;
  default?: any;
}

interface Table {
  name: string;
  fields: Field[];
}

const typeMapping: Record<string, string> = {
  string: 'TEXT',
  text: 'TEXT',
  number: 'REAL',
  boolean: 'INTEGER',
  date: 'DATETIME',
  json: 'TEXT'
};

export class SchemaManager {
  async initializeSchema(tables: Table[]) {
    try {
      await query(`
        CREATE TABLE IF NOT EXISTS users (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          email TEXT UNIQUE NOT NULL,
          password TEXT,
          name TEXT,
          avatar TEXT,
          provider TEXT DEFAULT 'email',
          provider_id TEXT,
          created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
          updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
        )
      `);

      for (const table of tables) {
        await this.createTable(table);
      }
    } catch (error) {
      console.error('Schema initialization error:', error);
      throw error;
    }
  }

  private async createTable(table: Table) {
    const fields = table.fields.map(field => {
      const sqlType = typeMapping[field.type] || 'TEXT';
      const constraints = [];
      
      if (field.required) constraints.push('NOT NULL');
      if (field.unique) constraints.push('UNIQUE');
      if (field.default !== undefined) {
        const defaultValue = typeof field.default === 'string' 
          ? `'${field.default}'` 
          : field.default;
        constraints.push(`DEFAULT ${defaultValue}`);
      }
      
      return `${field.name} ${sqlType} ${constraints.join(' ')}`;
    });

    const sql = `
      CREATE TABLE IF NOT EXISTS ${table.name} (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        user_id INTEGER,
        ${fields.join(',\n        ')},
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
      )
    `;

    await query(sql);
  }

  async addColumn(tableName: string, field: Field) {
    try {
      const sqlType = typeMapping[field.type] || 'TEXT';
      await query(`ALTER TABLE ${tableName} ADD COLUMN IF NOT EXISTS ${field.name} ${sqlType}`);
    } catch (error) {
      console.error(`Error adding column ${field.name} to ${tableName}:`, error);
    }
  }

  async tableExists(tableName: string): Promise<boolean> {
    const result = await query(
      `SELECT name FROM sqlite_master WHERE type='table' AND name=?`,
      [tableName]
    );
    return result.rows.length > 0;
  }
}

export default new SchemaManager();
