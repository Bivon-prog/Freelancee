import { Router } from 'express';
import { authenticate, AuthRequest } from '../middleware/auth';
import { pool } from '../config/database';

const router = Router();

router.use(authenticate);

router.get('/entries', async (req: AuthRequest, res) => {
  try {
    const result = await pool.query(
      'SELECT * FROM time_entries WHERE user_id = $1 ORDER BY start_time DESC',
      [req.userId]
    );
    res.json(result.rows);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

router.post('/entries', async (req: AuthRequest, res) => {
  try {
    const { clientId, projectId, description, startTime, endTime, hourlyRate } = req.body;
    
    const duration = endTime ? 
      Math.floor((new Date(endTime).getTime() - new Date(startTime).getTime()) / 60000) : 0;
    
    const result = await pool.query(
      `INSERT INTO time_entries (user_id, client_id, project_id, description, start_time, end_time, duration, hourly_rate)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8) RETURNING *`,
      [req.userId, clientId, projectId, description, startTime, endTime, duration, hourlyRate]
    );
    
    res.json(result.rows[0]);
  } catch (error: any) {
    res.status(400).json({ error: error.message });
  }
});

export default router;
