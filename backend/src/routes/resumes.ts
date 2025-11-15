import { Router, Response } from 'express';
import { authenticate, AuthRequest } from '../middleware/auth';
import { Resume } from '../models/Resume';

const router = Router();

router.use(authenticate);

// Get all resumes
router.get('/', async (req: AuthRequest, res: Response) => {
  try {
    const resumes = await Resume.find({ userId: req.userId }).sort({ updatedAt: -1 });
    res.json(resumes);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// Get single resume
router.get('/:id', async (req: AuthRequest, res: Response) => {
  try {
    const resume = await Resume.findOne({
      _id: req.params.id,
      userId: req.userId
    });
    
    if (!resume) {
      return res.status(404).json({ error: 'Resume not found' });
    }
    
    res.json(resume);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// Create resume
router.post('/', async (req: AuthRequest, res: Response) => {
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

// Update resume
router.put('/:id', async (req: AuthRequest, res: Response) => {
  try {
    const resume = await Resume.findOneAndUpdate(
      { _id: req.params.id, userId: req.userId },
      { ...req.body, updatedAt: new Date() },
      { new: true }
    );
    
    if (!resume) {
      return res.status(404).json({ error: 'Resume not found' });
    }
    
    res.json(resume);
  } catch (error: any) {
    res.status(400).json({ error: error.message });
  }
});

// Delete resume
router.delete('/:id', async (req: AuthRequest, res: Response) => {
  try {
    const resume = await Resume.findOneAndDelete({
      _id: req.params.id,
      userId: req.userId
    });
    
    if (!resume) {
      return res.status(404).json({ error: 'Resume not found' });
    }
    
    res.json({ message: 'Resume deleted successfully' });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// Duplicate resume
router.post('/:id/duplicate', async (req: AuthRequest, res: Response) => {
  try {
    const original = await Resume.findOne({
      _id: req.params.id,
      userId: req.userId
    });
    
    if (!original) {
      return res.status(404).json({ error: 'Resume not found' });
    }
    
    const duplicate = new Resume({
      userId: req.userId,
      title: `${original.title} (Copy)`,
      personalInfo: original.personalInfo,
      experience: original.experience,
      education: original.education,
      skills: original.skills,
      projects: original.projects,
      certifications: original.certifications,
      templateId: original.templateId
    });
    
    await duplicate.save();
    res.json(duplicate);
  } catch (error: any) {
    res.status(400).json({ error: error.message });
  }
});

// Get resume templates
router.get('/templates/list', async (req: AuthRequest, res: Response) => {
  try {
    const templates = [
      {
        id: 'modern',
        name: 'Modern',
        description: 'Clean and contemporary design',
        preview: '/templates/modern.png'
      },
      {
        id: 'professional',
        name: 'Professional',
        description: 'Traditional corporate style',
        preview: '/templates/professional.png'
      },
      {
        id: 'creative',
        name: 'Creative',
        description: 'Bold and artistic layout',
        preview: '/templates/creative.png'
      },
      {
        id: 'minimal',
        name: 'Minimal',
        description: 'Simple and elegant',
        preview: '/templates/minimal.png'
      },
      {
        id: 'tech',
        name: 'Tech',
        description: 'Perfect for developers',
        preview: '/templates/tech.png'
      }
    ];
    
    res.json(templates);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// AI: Improve resume section
router.post('/:id/improve-section', async (req: AuthRequest, res: Response) => {
  try {
    const { section, content } = req.body;
    
    // TODO: Call AI service to improve content
    // const improved = await aiService.improveResumeSection(section, content)
    
    // Mock response
    const improved = {
      original: content,
      improved: `[AI-Improved] ${content}`,
      suggestions: [
        'Use more action verbs',
        'Add quantifiable metrics',
        'Highlight key achievements'
      ]
    };
    
    res.json(improved);
  } catch (error: any) {
    res.status(400).json({ error: error.message });
  }
});

// Calculate ATS score
router.post('/:id/ats-score', async (req: AuthRequest, res: Response) => {
  try {
    const resume = await Resume.findOne({
      _id: req.params.id,
      userId: req.userId
    });
    
    if (!resume) {
      return res.status(404).json({ error: 'Resume not found' });
    }
    
    // Simple ATS score calculation
    let score = 0;
    
    // Check completeness
    if (resume.personalInfo?.fullName) score += 10;
    if (resume.personalInfo?.email) score += 10;
    if (resume.personalInfo?.phone) score += 5;
    if (resume.personalInfo?.summary) score += 15;
    if (resume.experience && resume.experience.length > 0) score += 20;
    if (resume.education && resume.education.length > 0) score += 15;
    if (resume.skills && resume.skills.length > 0) score += 15;
    if (resume.projects && resume.projects.length > 0) score += 10;
    
    res.json({
      score,
      maxScore: 100,
      feedback: score >= 80 ? 'Excellent!' : score >= 60 ? 'Good' : 'Needs improvement'
    });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

export default router;
