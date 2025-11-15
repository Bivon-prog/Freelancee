import { Router, Response } from 'express';
import { authenticate, AuthRequest } from '../middleware/auth';
import { pool } from '../config/database';

const router = Router();

router.use(authenticate);

router.get('/', async (req: AuthRequest, res: Response) => {
  try {
    const result = await pool.query(
      'SELECT * FROM clients WHERE user_id = $1 ORDER BY name',
      [req.userId]
    );
    res.json(result.rows);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

router.get('/:id', async (req: AuthRequest, res: Response) => {
  try {
    const result = await pool.query(
      'SELECT * FROM clients WHERE id = $1 AND user_id = $2',
      [req.params.id, req.userId]
    );
    
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Client not found' });
    }
    
    res.json(result.rows[0]);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

router.post('/', async (req: AuthRequest, res: Response) => {
  try {
    const { name, email, phone, address, company } = req.body;
    
    const result = await pool.query(
      `INSERT INTO clients (user_id, name, email, phone, address, company)
       VALUES ($1, $2, $3, $4, $5, $6) RETURNING *`,
      [req.userId, name, email, phone, address, company]
    );
    
    res.json(result.rows[0]);
  } catch (error: any) {
    res.status(400).json({ error: error.message });
  }
});

router.put('/:id', async (req: AuthRequest, res: Response) => {
  try {
    const { name, email, phone, address, company } = req.body;
    
    const result = await pool.query(
      `UPDATE clients SET name = $1, email = $2, phone = $3, address = $4, company = $5, updated_at = CURRENT_TIMESTAMP
       WHERE id = $6 AND user_id = $7 RETURNING *`,
      [name, email, phone, address, company, req.params.id, req.userId]
    );
    
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Client not found' });
    }
    
    res.json(result.rows[0]);
  } catch (error: any) {
    res.status(400).json({ error: error.message });
  }
});

router.delete('/:id', async (req: AuthRequest, res: Response) => {
  try {
    const result = await pool.query(
      'DELETE FROM clients WHERE id = $1 AND user_id = $2 RETURNING id',
      [req.params.id, req.userId]
    );
    
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Client not found' });
    }
    
    res.json({ message: 'Client deleted successfully' });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// Get client statistics
router.get('/:id/stats', async (req: AuthRequest, res: Response) => {
  try {
    const invoiceStats = await pool.query(
      `SELECT 
        COUNT(*) as total_invoices,
        COUNT(CASE WHEN status = 'paid' THEN 1 END) as paid_invoices,
        COUNT(CASE WHEN status = 'pending' THEN 1 END) as pending_invoices,
        COALESCE(SUM(CASE WHEN status = 'paid' THEN total ELSE 0 END), 0) as total_paid,
        COALESCE(SUM(CASE WHEN status = 'pending' THEN total ELSE 0 END), 0) as total_pending
       FROM invoices 
       WHERE client_id = $1 AND user_id = $2`,
      [req.params.id, req.userId]
    );
    
    const timeStats = await pool.query(
      `SELECT 
        COUNT(*) as total_entries,
        COALESCE(SUM(duration), 0) as total_minutes,
        COALESCE(SUM(CASE WHEN billable THEN duration * hourly_rate / 60 ELSE 0 END), 0) as total_earnings
       FROM time_entries 
       WHERE client_id = $1 AND user_id = $2`,
      [req.params.id, req.user
