import { Router, Request, Response } from 'express';
import { query } from '../db';
import { authenticate, AuthRequest } from '../middleware/auth';

export class DynamicAPIGenerator {
  generateRoutes(endpoints: any[]): Router {
    const router = Router();

    for (const endpoint of endpoints) {
      this.createEndpoint(router, endpoint);
    }

    return router;
  }

  private createEndpoint(router: Router, endpoint: any) {
    const { path, method, table, action, auth: requireAuth } = endpoint;
    
    if (!path || !method || !table) return;

    const handler = this.getHandler(table, action);
    const middleware = requireAuth ? [authenticate] : [];

    switch (method.toUpperCase()) {
      case 'GET':
        router.get(path, ...middleware, handler);
        break;
      case 'POST':
        router.post(path, ...middleware, handler);
        break;
      case 'PUT':
        router.put(path, ...middleware, handler);
        break;
      case 'DELETE':
        router.delete(path, ...middleware, handler);
        break;
      case 'PATCH':
        router.patch(path, ...middleware, handler);
        break;
    }
  }

  private getHandler(table: string, action: string) {
    return async (req: AuthRequest, res: Response) => {
      try {
        switch (action) {
          case 'list':
            return await this.handleList(req, res, table);
          case 'read':
            return await this.handleRead(req, res, table);
          case 'create':
            return await this.handleCreate(req, res, table);
          case 'update':
            return await this.handleUpdate(req, res, table);
          case 'delete':
            return await this.handleDelete(req, res, table);
          default:
            return res.status(400).json({ error: 'Invalid action' });
        }
      } catch (error: any) {
        console.error(`Error in ${action} ${table}:`, error);
        return res.status(500).json({ error: error.message || 'Internal server error' });
      }
    };
  }

  private async handleList(req: AuthRequest, res: Response, table: string) {
    const userId = req.user?.id;
    const { page = 1, limit = 50, ...filters } = req.query;
    
    const offset = (Number(page) - 1) * Number(limit);
    
    let whereClause = userId ? 'WHERE user_id = ?' : '';
    let params: any[] = userId ? [userId] : [];

    Object.entries(filters).forEach(([key, value]) => {
      if (value) {
        whereClause += whereClause ? ' AND' : 'WHERE';
        whereClause += ` ${key} = ?`;
        params.push(value);
      }
    });

    const result = await query(
      `SELECT * FROM ${table} ${whereClause} ORDER BY created_at DESC LIMIT ? OFFSET ?`,
      [...params, Number(limit), offset]
    );

    const countResult = await query(
      `SELECT COUNT(*) as count FROM ${table} ${whereClause}`,
      params
    );

    res.json({
      data: result.rows,
      total: countResult.rows[0].count,
      page: Number(page),
      limit: Number(limit)
    });
  }

  private async handleRead(req: AuthRequest, res: Response, table: string) {
    const { id } = req.params;
    const userId = req.user?.id;

    const whereClause = userId ? 'WHERE id = ? AND user_id = ?' : 'WHERE id = ?';
    const params = userId ? [id, userId] : [id];

    const result = await query(`SELECT * FROM ${table} ${whereClause}`, params);

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Not found' });
    }

    res.json(result.rows[0]);
  }

  private async handleCreate(req: AuthRequest, res: Response, table: string) {
    const data = req.body;
    const userId = req.user?.id;

    if (userId) {
      data.user_id = userId;
    }

    const keys = Object.keys(data);
    const values = Object.values(data);
    const placeholders = keys.map((_, i) => `?`).join(', ');

    const result = await query(
      `INSERT INTO ${table} (${keys.join(', ')}) VALUES (${placeholders})`,
      values
    );

    const insertedId = (result as any).lastID;
    const inserted = await query(`SELECT * FROM ${table} WHERE id = ?`, [insertedId]);

    res.status(201).json(inserted.rows[0]);
  }

  private async handleUpdate(req: AuthRequest, res: Response, table: string) {
    const { id } = req.params;
    const data = req.body;
    const userId = req.user?.id;

    delete data.id;
    delete data.user_id;
    delete data.created_at;

    data.updated_at = new Date().toISOString();

    const keys = Object.keys(data);
    const values = Object.values(data);
    const setClause = keys.map((key) => `${key} = ?`).join(', ');

    const whereClause = userId ? `WHERE id = ? AND user_id = ?` : `WHERE id = ?`;
    const params = userId ? [...values, id, userId] : [...values, id];

    await query(
      `UPDATE ${table} SET ${setClause} ${whereClause}`,
      params
    );

    const result = await query(`SELECT * FROM ${table} WHERE id = ?`, [id]);

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Not found' });
    }

    res.json(result.rows[0]);
  }

  private async handleDelete(req: AuthRequest, res: Response, table: string) {
    const { id } = req.params;
    const userId = req.user?.id;

    const whereClause = userId ? 'WHERE id = ? AND user_id = ?' : 'WHERE id = ?';
    const params = userId ? [id, userId] : [id];

    const result = await query(`DELETE FROM ${table} ${whereClause}`, params);

    if ((result as any).rowCount === 0) {
      return res.status(404).json({ error: 'Not found' });
    }

    res.json({ message: 'Deleted successfully' });
  }
}

export default new DynamicAPIGenerator();
