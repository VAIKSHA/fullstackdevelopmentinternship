import fs from 'fs';
import path from 'path';

export interface AppConfig {
  app?: {
    name?: string;
    version?: string;
    description?: string;
    locale?: string;
    supportedLocales?: string[];
  };
  database?: {
    tables?: any[];
  };
  ui?: {
    pages?: any[];
  };
  api?: {
    endpoints?: any[];
  };
  auth?: {
    enabled?: boolean;
    methods?: string[];
    userFields?: string[];
  };
}

export class ConfigLoader {
  private config: AppConfig = {};

  loadConfig(configPath: string): AppConfig {
    try {
      const configData = fs.readFileSync(configPath, 'utf-8');
      this.config = JSON.parse(configData);
      return this.normalizeConfig(this.config);
    } catch (error) {
      console.error('Error loading config:', error);
      return this.getDefaultConfig();
    }
  }

  loadFromJSON(configJSON: any): AppConfig {
    try {
      this.config = typeof configJSON === 'string' ? JSON.parse(configJSON) : configJSON;
      return this.normalizeConfig(this.config);
    } catch (error) {
      console.error('Error parsing config:', error);
      return this.getDefaultConfig();
    }
  }

  private normalizeConfig(config: any): AppConfig {
    return {
      app: {
        name: config.app?.name || 'Dynamic App',
        version: config.app?.version || '1.0.0',
        description: config.app?.description || '',
        locale: config.app?.locale || 'en',
        supportedLocales: config.app?.supportedLocales || ['en']
      },
      database: {
        tables: Array.isArray(config.database?.tables) ? config.database.tables : []
      },
      ui: {
        pages: Array.isArray(config.ui?.pages) ? config.ui.pages : []
      },
      api: {
        endpoints: Array.isArray(config.api?.endpoints) ? config.api.endpoints : []
      },
      auth: {
        enabled: config.auth?.enabled !== false,
        methods: Array.isArray(config.auth?.methods) ? config.auth.methods : ['email'],
        userFields: Array.isArray(config.auth?.userFields) ? config.auth.userFields : ['email', 'name']
      }
    };
  }

  private getDefaultConfig(): AppConfig {
    return {
      app: { name: 'Dynamic App', version: '1.0.0', locale: 'en', supportedLocales: ['en'] },
      database: { tables: [] },
      ui: { pages: [] },
      api: { endpoints: [] },
      auth: { enabled: true, methods: ['email'], userFields: ['email', 'name'] }
    };
  }

  getConfig(): AppConfig {
    return this.config;
  }
}

export default new ConfigLoader();
