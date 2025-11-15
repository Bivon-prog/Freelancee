import { Router } from 'express';
import { authenticate, AuthRequest } from '../middleware/auth';
import { pool } from '../config/database';

const router = Router();

router.use(authenticate);

router.get('/', async (req: AuthRequest, res) => {
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

router.post('/', async (req: AuthRequest, res) => {
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

export default router;
