import { Router } from 'express';
import { authenticate, AuthRequest } from '../middleware/auth';
import { Contract } from '../models/Contract';

const router = Router();

router.use(authenticate);

router.get('/', async (req: AuthRequest, res) => {
  try {
    const contracts = await Contract.find({ userId: req.userId }).sort({ createdAt: -1 });
    res.json(contracts);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

router.post('/', async (req: AuthRequest, res) => {
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

export default router;
