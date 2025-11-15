import { Router } from 'express';
import { authenticate, AuthRequest } from '../middleware/auth';
import { Resume } from '../models/Resume';

const router = Router();

router.use(authenticate);

router.get('/', async (req: AuthRequest, res) => {
  try {
    const resumes = await Resume.find({ userId: req.userId }).sort({ updatedAt: -1 });
    res.json(resumes);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

router.post('/', async (req: AuthRequest, res) => {
  try {
    const resume = new Resume({
      userId: req.userId,
      ...req.body
    });
    await resume.save();
    res.json(resume);
  } catch (error: any) {
    res.status(400).json({ error: error.message });
  }
});

export default router;
