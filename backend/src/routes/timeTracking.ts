import { Router, Response } from 'express';
import { authenticate, AuthRequest } from '../middleware/auth';
import { pool } from '../config/database';

const router = Router();

router.use(authenticate);

// Get all time entries
router.get('/entries', async (req: AuthRequest, res: Response) => {
  try {
    const { clientId, projectId, startDate, endDate } = req.query;
    
    let query = `
      SELECT te.*, c.name as client_name, p.name as project_name
      FROM time_entries te
      LEFT JOIN clients c ON te.client_id = c.id
      LEFT JOIN projects p ON te.project_id = p.id
      WHERE te.user_id = $1
    `;
    const params: any[] = [req.userId];
    
    if (clientId) {
      query += ` AND te.client_id = $${params.length + 1}`;
      params.push(clientId);
    }
    
    if (projectId) {
      query += ` AND te.project_id = $${params.length + 1}`;
      params.push(projectId);
    }
    
    if (startDate) {
      query += ` AND te.start_time >= $${params.length + 1}`;
      params.push(startDate);
    }
    
    if (endDate) {
      query += ` AND te.start_time <= $${params.length + 1}`;
      params.push(endDate);
    }
    
    query += ' ORDER BY te.start_time DESC';
    
    const result = await pool.query(query, params);
    res.json(result.rows);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// Get single time entry
router.get('/entries/:id', async (req: AuthRequest, res: Response) => {
  try {
    const result = await pool.query(
      `SELECT te.*, c.name as client_name, p.name as project_name
       FROM time_entries te
       LEFT JOIN clients c ON te.client_id = c.id
       LEFT JOIN projects p ON te.project_id = p.id
       WHERE te.id = $1 AND te.user_id = $2`,
      [req.params.id, req.userId]
    );
    
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Time entry not found' });
    }
    
    res.json(result.rows[0]);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// Create time entry
router.post('/entries', async (req: AuthRequest, res: Response) => {
  try {
    const { clientId, projectId, description, startTime, endTime, hourlyRate, billable } = req.body;
    
    const duration = endTime ? 
      Math.floor((new Date(endTime).getTime() - new Date(startTime).getTime()) / 60000) : 0;
    
    const result = await pool.query(
      `INSERT INTO time_entries (
        user_id, client_id, project_id, description, 
        start_time, end_time, duration, hourly_rate, billable
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9) 
      RETURNING *`,
      [req.userId, clientId, projectId, description, startTime, endTime, duration, hourlyRate, billable ?? true]
    );
    
    res.json(result.rows[0]);
  } catch (error: any) {
    res.status(400).json({ error: error.message });
  }
});

// Update time entry
router.put('/entries/:id', async (req: AuthRequest, res: Response) => {
  try {
    const { clientId, projectId, description, startTime, endTime, hourlyRate, billable } = req.body;
    
    const duration = endTime ? 
      Math.floor((new Date(endTime).getTime() - new Date(startTime).getTime()) / 60000) : 0;
    
    const result = await pool.query(
      `UPDATE time_entries SET
        client_id = $1, project_id = $2, description = $3,
        start_time = $4, end_time = $5, duration = $6,
        hourly_rate = $7, billable = $8, updated_at = CURRENT_TIMESTAMP
       WHERE id = $9 AND user_id = $10
       RETURNING *`,
      [clientId, projectId, description, startTime, endTime, duration, hourlyRate, billable, req.params.id, req.userId]
    );
    
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Time entry not found' });
    }
    
    res.json(result.rows[0]);
  } catch (error: any) {
    res.status(400).json({ error: error.message });
  }
});

// Delete time entry
router.delete('/entries/:id', async (req: AuthRequest, res: Response) => {
  try {
    const result = await pool.query(
      'DELETE FROM time_entries WHERE id = $1 AND user_id = $2 RETURNING id',
      [req.params.id, req.userId]
    );
    
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Time entry not found' });
    }
    
    res.json({ message: 'Time entry deleted successfully' });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// Start timer (create entry without end time)
router.post('/timer/start', async (req: AuthRequest, res: Response) => {
  try {
    const { clientId, projectId, description, hourlyRate } = req.body;
    
    // Check if there's already a running timer
    const runningTimer = await pool.query(
      'SELECT * FROM time_entries WHERE user_id = $1 AND end_time IS NULL',
      [req.userId]
    );
    
    if (runningTimer.rows.length > 0) {
      return res.status(400).json({ error: 'Timer already running' });
    }
    
    const result = await pool.query(
      `INSERT INTO time_entries (
        user_id, client_id, project_id, description, 
        start_time, hourly_rate, billable
      ) VALUES ($1, $2, $3, $4, CURRENT_TIMESTAMP, $5, true) 
      RETURNING *`,
      [req.userId, clientId, projectId, description, hourlyRate]
    );
    
    res.json(result.rows[0]);
  } catch (error: any) {
    res.status(400).json({ error: error.message });
  }
});

// Stop timer
router.post('/timer/stop/:id', async (req: AuthRequest, res: Response) => {
  try {
    const endTime = new Date();
    
    const entry = await pool.query(
      'SELECT * FROM time_entries WHERE id = $1 AND user_id = $2',
      [req.params.id, req.userId]
    );
    
    if (entry.rows.length === 0) {
      return res.status(404).json({ error: 'Time entry not found' });
    }
    
    const startTime = new Date(entry.rows[0].start_time);
    const duration = Math.floor((endTime.getTime() - startTime.getTime()) / 60000);
    
    const result = await pool.query(
      `UPDATE time_entries SET
        end_time = $1, duration = $2, updated_at = CURRENT_TIMESTAMP
       WHERE id = $3 AND user_id = $4
       RETURNING *`,
      [endTime, duration, req.params.id, req.userId]
    );
    
    res.json(result.rows[0]);
  } catch (error: any) {
    res.status(400).json({ error: error.message });
  }
});

// Get active timer
router.get('/timer/active', async (req: AuthRequest, res: Response) => {
  try {
    const result = await pool.query(
      `SELECT te.*, c.name as client_name, p.name as project_name
       FROM time_entries te
       LEFT JOIN clients c ON te.client_id = c.id
       LEFT JOIN projects p ON te.project_id = p.id
       WHERE te.user_id = $1 AND te.end_time IS NULL`,
      [req.userId]
    );
    
    res.json(result.rows[0] || null);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// Get time tracking statistics
router.get('/stats/summary', async (req: AuthRequest, res: Response) => {
  try {
    const stats = await pool.query(
      `SELECT 
        COUNT(*) as total_entries,
        COALESCE(SUM(duration), 0) as total_minutes,
        COALESCE(SUM(CASE WHEN billable THEN duration ELSE 0 END), 0) as billable_minutes,
        COALESCE(SUM(CASE WHEN billable THEN duration * hourly_rate / 60 ELSE 0 END), 0) as total_earnings
       FROM time_entries 
       WHERE user_id = $1`,
      [req.userId]
    );
    
    const thisWeek = await pool.query(
      `SELECT COALESCE(SUM(duration), 0) as minutes
       FROM time_entries 
       WHERE user_id = $1 
       AND start_time >= date_trunc('week', CURRENT_DATE)`,
      [req.userId]
    );
    
    const thisMonth = await pool.query(
      `SELECT COALESCE(SUM(duration), 0) as minutes
       FROM time_entries 
       WHERE user_id = $1 
       AND start_time >= date_trunc('month', CURRENT_DATE)`,
      [req.userId]
    );
    
    res.json({
      ...stats.rows[0],
      this_week_minutes: thisWeek.rows[0].minutes,
      this_month_minutes: thisMonth.rows[0].minutes
    });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// Generate invoice from time entries
router.post('/generate-invoice', async (req: AuthRequest, res: Response) => {
  try {
    const { entryIds, clientId, dueDate, tax, notes } = req.body;
    
    // Get time entries
    const entries = await pool.query(
      `SELECT * FROM time_entries 
       WHERE id = ANY($1) AND user_id = $2 AND billable = true`,
      [entryIds, req.userId]
    );
    
    if (entries.rows.length === 0) {
      return res.status(400).json({ error: 'No billable entries found' });
    }
    
    // Convert time entries to invoice items
    const items = entries.rows.map((entry: any) => ({
      description: entry.description,
      quantity: entry.duration / 60, // Convert minutes to hours
      rate: entry.hourly_rate,
      amount: (entry.duration / 60) * entry.hourly_rate
    }));
    
    const subtotal = items.reduce((sum: number, item: any) => sum + item.amount, 0);
    const taxAmount = tax || 0;
    const total = subtotal + taxAmount;
    
    // Generate invoice number
    const countResult = await pool.query(
      'SELECT COUNT(*) FROM invoices WHERE user_id = $1',
      [req.userId]
    );
    const invoiceNumber = `INV-${String(parseInt(countResult.rows[0].count) + 1).padStart(5, '0')}`;
    
    // Create invoice
    const invoice = await pool.query(
      `INSERT INTO invoices (
        user_id, client_id, invoice_number, items, due_date,
        subtotal, tax, total, notes, currency, status
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)
      RETURNING *`,
      [req.userId, clientId, invoiceNumber, JSON.stringify(items), dueDate, subtotal, taxAmount, total, notes, 'USD', 'draft']
    );
    
    res.json(invoice.rows[0]);
  } catch (error: any) {
    res.status(400).json({ error: error.message });
  }
});

// Projects routes
router.get('/projects', async (req: AuthRequest, res: Response) => {
  try {
    const result = await pool.query(
      `SELECT p.*, c.name as client_name
       FROM projects p
       LEFT JOIN clients c ON p.client_id = c.id
       WHERE p.user_id = $1
       ORDER BY p.created_at DESC`,
      [req.userId]
    );
    res.json(result.rows);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

router.post('/projects', async (req: AuthRequest, res: Response) => {
  try {
    const { clientId, name, description, hourlyRate, budget, deadline } = req.body;
    
    const result = await pool.query(
      `INSERT INTO projects (user_id, client_id, name, description, hourly_rate, budget, deadline, status)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8) RETURNING *`,
      [req.userId, clientId, name, description, hourlyRate, budget, deadline, 'active']
    );
    
    res.json(result.rows[0]);
  } catch (error: any) {
    res.status(400).json({ error: error.message });
  }
});

export default router;
