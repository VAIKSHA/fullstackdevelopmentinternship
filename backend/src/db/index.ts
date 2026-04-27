// Using SQLite for local development
import { query as sqliteQuery, getClient as sqliteGetClient } from './sqlite';

export const query = sqliteQuery;
export const getClient = sqliteGetClient;

export default { query, getClient };
