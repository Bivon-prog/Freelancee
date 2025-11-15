import { Router, Response } from 'express';
import { authenticate, AuthRequest } from '../middleware/auth';
import { pool } from '../config/database';

const router = Router();

router.use(authenticate);

// Get all invoices for user
router.get('/', async (req: AuthRequest, res: Response) => {
  try {
    const { status, clientId } = req.query;
    
    let query = `
      SELECT i.*, c.name as client_name, c.email as client_email 
      FROM invoices i 
      LEFT JOIN clients c ON i.client_id = c.id 
      WHERE i.user_id = $1
    `;
    const params: any[] = [req.userId];
    
    if (status) {
      query += ` AND i.status = $${params.length + 1}`;
      params.push(status);
    }
    
    if (clientId) {
      query += ` AND i.client_id = $${params.length + 1}`;
      params.push(clientId);
    }
    
    query += ' ORDER BY i.created_at DESC';
    
    const result = await pool.query(query, params);
    res.json(result.rows);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// Get single invoice
router.get('/:id', async (req: AuthRequest, res: Response) => {
  try {
    const result = await pool.query(
      `SELECT i.*, c.name as client_name, c.email as client_email, c.address as client_address, c.phone as client_phone
       FROM invoices i 
       LEFT JOIN clients c ON i.client_id = c.id 
       WHERE i.id = $1 AND i.user_id = $2`,
      [req.params.id, req.userId]
    );
    
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Invoice not found' });
    }
    
    res.json(result.rows[0]);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// Create invoice
router.post('/', async (req: AuthRequest, res: Response) => {
  try {
    const { clientId, items, dueDate, tax, discount, notes, currency } = req.body;
    
    // Generate invoice number
    const countResult = await pool.query(
      'SELECT COUNT(*) FROM invoices WHERE user_id = $1',
      [req.userId]
    );
    const invoiceNumber = `INV-${String(parseInt(countResult.rows[0].count) + 1).padStart(5, '0')}`;
    
    // Calculate totals
    const subtotal = items.reduce((sum: number, item: any) => 
      sum + (item.quantity * item.rate), 0
    );
    const taxAmount = tax || 0;
    const discountAmount = discount || 0;
    const total = subtotal + taxAmount - discountAmount;
    
    const result = await pool.query(
      `INSERT INTO invoices (
        user_id, client_id, invoice_number, items, due_date, 
        subtotal, tax, discount, total, notes, currency, status
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12) 
      RETURNING *`,
      [
        req.userId, clientId, invoiceNumber, JSON.stringify(items), 
        dueDate, subtotal, taxAmount, discountAmount, total, 
        notes, currency || 'USD', 'draft'
      ]
    );
    
    res.json(result.rows[0]);
  } catch (error: any) {
    res.status(400).json({ error: error.message });
  }
});

// Update invoice
router.put('/:id', async (req: AuthRequest, res: Response) => {
  try {
    const { clientId, items, dueDate, tax, discount, notes, currency, status } = req.body;
    
    // Calculate totals
    const subtotal = items.reduce((sum: number, item: any) => 
      sum + (item.quantity * item.rate), 0
    );
    const taxAmount = tax || 0;
    const discountAmount = discount || 0;
    const total = subtotal + taxAmount - discountAmount;
    
    const result = await pool.query(
      `UPDATE invoices SET 
        client_id = $1, items = $2, due_date = $3, 
        subtotal = $4, tax = $5, discount = $6, total = $7, 
        notes = $8, currency = $9, status = $10, updated_at = CURRENT_TIMESTAMP
       WHERE id = $11 AND user_id = $12 
       RETURNING *`,
      [
        clientId, JSON.stringify(items), dueDate, 
        subtotal, taxAmount, discountAmount, total, 
        notes, currency || 'USD', status || 'draft',
        req.params.id, req.userId
      ]
    );
    
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Invoice not found' });
    }
    
    res.json(result.rows[0]);
  } catch (error: any) {
    res.status(400).json({ error: error.message });
  }
});

// Delete invoice
router.delete('/:id', async (req: AuthRequest, res: Response) => {
  try {
    const result = await pool.query(
      'DELETE FROM invoices WHERE id = $1 AND user_id = $2 RETURNING id',
      [req.params.id, req.userId]
    );
    
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Invoice not found' });
    }
    
    res.json({ message: 'Invoice deleted successfully' });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// Update invoice status
router.patch('/:id/status', async (req: AuthRequest, res: Response) => {
  try {
    const { status } = req.body;
    
    const result = await pool.query(
      `UPDATE invoices SET status = $1, updated_at = CURRENT_TIMESTAMP 
       WHERE id = $2 AND user_id = $3 RETURNING *`,
      [status, req.params.id, req.userId]
    );
    
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Invoice not found' });
    }
    
    res.json(result.rows[0]);
  } catch (error: any) {
    res.status(400).json({ error: error.message });
  }
});

// Duplicate invoice
router.post('/:id/duplicate', async (req: AuthRequest, res: Response) => {
  try {
    const original = await pool.query(
      'SELECT * FROM invoices WHERE id = $1 AND user_id = $2',
      [req.params.id, req.userId]
    );
    
    if (original.rows.length === 0) {
      return res.status(404).json({ error: 'Invoice not found' });
    }
    
    const invoice = original.rows[0];
    
    // Generate new invoice number
    const countResult = await pool.query(
      'SELECT COUNT(*) FROM invoices WHERE user_id = $1',
      [req.userId]
    );
    const invoiceNumber = `INV-${String(parseInt(countResult.rows[0].count) + 1).padStart(5, '0')}`;
    
    const result = await pool.query(
      `INSERT INTO invoices (
        user_id, client_id, invoice_number, items, due_date, 
        subtotal, tax, discount, total, notes, currency, status
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12) 
      RETURNING *`,
      [
        req.userId, invoice.client_id, invoiceNumber, invoice.items,
        invoice.due_date, invoice.subtotal, invoice.tax, invoice.discount,
        invoice.total, invoice.notes, invoice.currency, 'draft'
      ]
    );
    
    res.json(result.rows[0]);
  } catch (error: any) {
    res.status(400).json({ error: error.message });
  }
});

// Get invoice statistics
router.get('/stats/summary', async (req: AuthRequest, res: Response) => {
  try {
    const stats = await pool.query(
      `SELECT 
        COUNT(*) as total_invoices,
        COUNT(CASE WHEN status = 'paid' THEN 1 END) as paid_count,
        COUNT(CASE WHEN status = 'pending' THEN 1 END) as pending_count,
        COUNT(CASE WHEN status = 'overdue' THEN 1 END) as overdue_count,
        COALESCE(SUM(CASE WHEN status = 'paid' THEN total ELSE 0 END), 0) as total_paid,
        COALESCE(SUM(CASE WHEN status = 'pending' THEN total ELSE 0 END), 0) as total_pending,
        COALESCE(SUM(total), 0) as total_amount
       FROM invoices 
       WHERE user_id = $1`,
      [req.userId]
    );
    
    res.json(stats.rows[0]);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

export default router;
