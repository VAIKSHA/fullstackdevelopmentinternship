import fs from 'fs';
import csv from 'csv-parser';
import { query } from '../db';

export class CSVImportService {
  async parseCSV(filePath: string): Promise<any[]> {
    return new Promise((resolve, reject) => {
      const results: any[] = [];
      
      fs.createReadStream(filePath)
        .pipe(csv())
        .on('data', (data) => results.push(data))
        .on('end', () => resolve(results))
        .on('error', (error) => reject(error));
    });
  }

  async importToTable(
    table: string,
    data: any[],
    mapping: Record<string, string>,
    userId?: number
  ) {
    const imported = [];
    const errors = [];

    for (let i = 0; i < data.length; i++) {
      try {
        const row = data[i];
        const mappedData: any = {};

        Object.entries(mapping).forEach(([csvColumn, dbColumn]) => {
          if (row[csvColumn] !== undefined) {
            mappedData[dbColumn] = row[csvColumn];
          }
        });

        if (userId) {
          mappedData.user_id = userId;
        }

        const keys = Object.keys(mappedData);
        const values = Object.values(mappedData);
        const placeholders = keys.map(() => '?').join(', ');

        const result = await query(
          `INSERT INTO ${table} (${keys.join(', ')}) VALUES (${placeholders})`,
          values
        );

        const insertedId = (result as any).lastID;
        const insertedResult = await query(`SELECT * FROM ${table} WHERE id = ?`, [insertedId]);
        imported.push(insertedResult.rows[0]);
      } catch (error: any) {
        errors.push({ row: i + 1, error: error.message });
      }
    }

    return { imported, errors, total: data.length };
  }

  async getTableColumns(table: string): Promise<string[]> {
    const result = await query(
      `PRAGMA table_info(${table})`
    );
    return result.rows.map(row => row.name);
  }

  async suggestMapping(csvHeaders: string[], tableColumns: string[]): Promise<Record<string, string>> {
    const mapping: Record<string, string> = {};

    csvHeaders.forEach(header => {
      const normalized = header.toLowerCase().replace(/[^a-z0-9]/g, '');
      
      const match = tableColumns.find(col => {
        const colNormalized = col.toLowerCase().replace(/[^a-z0-9]/g, '');
        return colNormalized === normalized || colNormalized.includes(normalized) || normalized.includes(colNormalized);
      });

      if (match) {
        mapping[header] = match;
      }
    });

    return mapping;
  }
}

export default new CSVImportService();
