import { z } from 'zod';

export const TimeEntrySchema = z.object({
  id: z.string(),
  userId: z.string(),
  clientId: z.string().optional(),
  projectId: z.string().optional(),
  description: z.string(),
  startTime: z.date(),
  endTime: z.date().optional(),
  duration: z.number(), // in minutes
  hourlyRate: z.number().optional(),
  billable: z.boolean().default(true),
  createdAt: z.date(),
  updatedAt: z.date(),
});

export const ProjectSchema = z.object({
  id: z.string(),
  userId: z.string(),
  clientId: z.string().optional(),
  name: z.string(),
  description: z.string().optional(),
  hourlyRate: z.number().optional(),
  budget: z.number().optional(),
  deadline: z.date().optional(),
  status: z.enum(['active', 'completed', 'archived']),
  createdAt: z.date(),
  updatedAt: z.date(),
});

export type TimeEntry = z.infer<typeof TimeEntrySchema>;
export type Project = z.infer<typeof ProjectSchema>;
