import { Router } from 'express';
import configLoader from '../config/loader';
import schemaManager from '../db/schema';
import apiGenerator from '../services/api-generator.service';
import githubExportService from '../services/github-export.service';
import { authenticate } from '../middleware/auth';

const router = Router();

router.post('/load', async (req, res) => {
  try {
    const config = configLoader.loadFromJSON(req.body);
    
    if (config.database?.tables) {
      await schemaManager.initializeSchema(config.database.tables);
    }

    res.json({ 
      success: true, 
      config,
      message: 'Configuration loaded successfully' 
    });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

router.get('/current', (req, res) => {
  const config = configLoader.getConfig();
  res.json(config);
});

router.post('/export', authenticate, async (req, res) => {
  try {
    const { repoUrl, token } = req.body;
    const config = configLoader.getConfig();
    
    const result = await githubExportService.exportProject(config, { repoUrl, token });
    
    res.json(result);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

router.get('/tables', async (req, res) => {
  try {
    const config = configLoader.getConfig();
    const tables = config.database?.tables || [];
    res.json({ tables: tables.map(t => t.name) });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

export default router;
