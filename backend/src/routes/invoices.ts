import { Router } from 'express';
import { authenticate, AuthRequest } from '../middleware/auth';
import { pool } from '../config/database';

const router = Router();

router.use(authenticate);

router.get('/', async (req: AuthRequest, res) => {
  try {
    const result = await pool.query(
      'SELECT * FROM invoices WHERE user_id = $1 ORDER BY created_at DESC',
      [req.userId]
    );
    res.json(result.rows);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

router.post('/', async (req: AuthRequest, res) => {
  try {
    const { clientId, items, dueDate, tax, notes } = req.body;
    
    const subtotal = items.reduce((sum: number, item: any) => sum + item.amount, 0);
    const total = subtotal + (tax || 0);
    
    const result = await pool.query(
      `INSERT INTO invoices (user_id, client_id, items, due_date, subtotal, tax, total, notes, status)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9) RETURNING *`,
      [req.userId, clientId, JSON.stringify(items), dueDate, subtotal, tax, total, notes, 'draft']
    );
    
    res.json(result.rows[0]);
  } catch (error: any) {
    res.status(400).json({ error: error.message });
  }
});

export default router;
