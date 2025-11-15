import { Router, Response } from 'express';
import { authenticate, AuthRequest } from '../middleware/auth';
import { Contract } from '../models/Contract';

const router = Router();

router.use(authenticate);

// Get all contracts
router.get('/', async (req: AuthRequest, res: Response) => {
  try {
    const { type, status } = req.query;
    
    const filter: any = { userId: req.userId };
    if (type) filter.type = type;
    if (status) filter.status = status;
    
    const contracts = await Contract.find(filter).sort({ createdAt: -1 });
    res.json(contracts);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// Get single contract
router.get('/:id', async (req: AuthRequest, res: Response) => {
  try {
    const contract = await Contract.findOne({
      _id: req.params.id,
      userId: req.userId
    });
    
    if (!contract) {
      return res.status(404).json({ error: 'Contract not found' });
    }
    
    res.json(contract);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// Create contract
router.post('/', async (req: AuthRequest, res: Response) => {
  try {
    const contract = new Contract({
      userId: req.userId,
      ...req.body
    });
    await contract.save();
    res.json(contract);
  } catch (error: any) {
    res.status(400).json({ error: error.message });
  }
});

// Update contract
router.put('/:id', async (req: AuthRequest, res: Response) => {
  try {
    const contract = await Contract.findOneAndUpdate(
      { _id: req.params.id, userId: req.userId },
      { ...req.body, updatedAt: new Date() },
      { new: true }
    );
    
    if (!contract) {
      return res.status(404).json({ error: 'Contract not found' });
    }
    
    res.json(contract);
  } catch (error: any) {
    res.status(400).json({ error: error.message });
  }
});

// Delete contract
router.delete('/:id', async (req: AuthRequest, res: Response) => {
  try {
    const contract = await Contract.findOneAndDelete({
      _id: req.params.id,
      userId: req.userId
    });
    
    if (!contract) {
      return res.status(404).json({ error: 'Contract not found' });
    }
    
    res.json({ message: 'Contract deleted successfully' });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// Duplicate contract
router.post('/:id/duplicate', async (req: AuthRequest, res: Response) => {
  try {
    const original = await Contract.findOne({
      _id: req.params.id,
      userId: req.userId
    });
    
    if (!original) {
      return res.status(404).json({ error: 'Contract not found' });
    }
    
    const duplicate = new Contract({
      userId: req.userId,
      title: `${original.title} (Copy)`,
      type: original.type,
      content: original.content,
      parties: original.parties,
      terms: original.terms,
      status: 'draft',
      templateId: original.templateId
    });
    
    await duplicate.save();
    res.json(duplicate);
  } catch (error: any) {
    res.status(400).json({ error: error.message });
  }
});

// Get contract statistics
router.get('/stats/summary', async (req: AuthRequest, res: Response) => {
  try {
    const total = await Contract.countDocuments({ userId: req.userId });
    const draft = await Contract.countDocuments({ userId: req.userId, status: 'draft' });
    const active = await Contract.countDocuments({ userId: req.userId, status: 'active' });
    const completed = await Contract.countDocuments({ userId: req.userId, status: 'completed' });
    
    const byType = await Contract.aggregate([
      { $match: { userId: req.userId } },
      { $group: { _id: '$type', count: { $sum: 1 } } }
    ]);
    
    res.json({
      total,
      draft,
      active,
      completed,
      by_type: byType
    });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// Get contract templates
router.get('/templates/list', async (req: AuthRequest, res: Response) => {
  try {
    const templates = [
      {
        id: 'freelance',
        name: 'Freelance Contract',
        description: 'Standard freelance service agreement',
        type: 'freelance'
      },
      {
        id: 'employment',
        name: 'Employment Contract',
        description: 'Full-time employment agreement',
        type: 'employment'
      },
      {
        id: 'nda',
        name: 'Non-Disclosure Agreement',
        description: 'Confidentiality agreement',
        type: 'partnership'
      },
      {
        id: 'service',
        name: 'Service Agreement',
        description: 'General service contract',
        type: 'service'
      },
      {
        id: 'consulting',
        name: 'Consulting Agreement',
        description: 'Professional consulting contract',
        type: 'consulting'
      }
    ];
    
    res.json(templates);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

export default router;
