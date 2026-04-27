import { Router } from 'express';
import multer from 'multer';
import path from 'path';
import fs from 'fs';
import csvImportService from '../services/csv-import.service';
import { authenticate, AuthRequest } from '../middleware/auth';

const router = Router();

const upload = multer({
  dest: '/tmp/uploads/',
  fileFilter: (req, file, cb) => {
    if (path.extname(file.originalname).toLowerCase() === '.csv') {
      cb(null, true);
    } else {
      cb(new Error('Only CSV files allowed'));
    }
  }
});

router.post('/parse', authenticate, upload.single('file'), async (req: any, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No file uploaded' });
    }

    const data = await csvImportService.parseCSV(req.file.path);
    const headers = data.length > 0 ? Object.keys(data[0]) : [];

    fs.unlinkSync(req.file.path);

    res.json({ 
      headers, 
      preview: data.slice(0, 5),
      totalRows: data.length 
    });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

router.post('/import', authenticate, upload.single('file'), async (req: any, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No file uploaded' });
    }

    const { table, mapping } = req.body;
    
    if (!table || !mapping) {
      fs.unlinkSync(req.file.path);
      return res.status(400).json({ error: 'Table and mapping required' });
    }

    const parsedMapping = typeof mapping === 'string' ? JSON.parse(mapping) : mapping;
    const data = await csvImportService.parseCSV(req.file.path);
    
    const result = await csvImportService.importToTable(
      table,
      data,
      parsedMapping,
      req.user?.id
    );

    fs.unlinkSync(req.file.path);

    res.json(result);
  } catch (error: any) {
    if (req.file) fs.unlinkSync(req.file.path);
    res.status(500).json({ error: error.message });
  }
});

router.get('/columns/:table', authenticate, async (req, res) => {
  try {
    const table = req.params.table as string;
    const columns = await csvImportService.getTableColumns(table);
    res.json({ columns });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

router.post('/suggest-mapping', authenticate, async (req, res) => {
  try {
    const { csvHeaders, table } = req.body;
    
    if (!csvHeaders || !table) {
      return res.status(400).json({ error: 'CSV headers and table required' });
    }

    const tableStr = Array.isArray(table) ? table[0] : table;
    const tableColumns = await csvImportService.getTableColumns(tableStr);
    const mapping = await csvImportService.suggestMapping(csvHeaders, tableColumns);
    
    res.json({ mapping });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

export default router;
