import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import passport from 'passport';
import authRoutes from './routes/auth.routes';
import csvRoutes from './routes/csv.routes';
import configRoutes from './routes/config.routes';
import configLoader from './config/loader';
import schemaManager from './db/schema';
import apiGenerator from './services/api-generator.service';
import path from 'path';

dotenv.config();

const app = express();

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(passport.initialize());

app.use('/api/auth', authRoutes);
app.use('/api/csv', csvRoutes);
app.use('/api/config', configRoutes);

const initializeApp = async () => {
  try {
    const configPath = process.env.CONFIG_PATH || path.join(__dirname, '../../shared/example-config.json');
    
    let config;
    try {
      config = configLoader.loadConfig(configPath);
      console.log('✓ Configuration loaded');
    } catch (error) {
      console.log('Using default configuration');
      config = configLoader.getConfig();
    }

    if (config.database?.tables) {
      await schemaManager.initializeSchema(config.database.tables);
      console.log('✓ Database schema initialized');
    }

    if (config.api?.endpoints) {
      const dynamicRoutes = apiGenerator.generateRoutes(config.api.endpoints);
      app.use(dynamicRoutes);
      console.log(`✓ Generated ${config.api.endpoints.length} API endpoints`);
      config.api.endpoints.forEach(ep => {
        console.log(`  - ${ep.method} ${ep.path}`);
      });
    }

    app.get('/health', (req, res) => {
      res.json({ status: 'ok', app: config.app?.name });
    });

    app.use((err: any, req: express.Request, res: express.Response, next: express.NextFunction) => {
      console.error(err.stack);
      res.status(err.status || 500).json({
        error: err.message || 'Internal server error'
      });
    });

    const PORT = process.env.PORT || 3001;
    app.listen(PORT, () => {
      console.log(`\n🚀 Server running on port ${PORT}`);
      console.log(`📱 App: ${config.app?.name || 'Dynamic App'}`);
      console.log(`🔗 Health: http://localhost:${PORT}/health\n`);
    });
  } catch (error) {
    console.error('Failed to initialize app:', error);
    process.exit(1);
  }
};

initializeApp();

export default app;
