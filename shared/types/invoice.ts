import { z } from 'zod';

export const InvoiceItemSchema = z.object({
  description: z.string(),
  quantity: z.number(),
  rate: z.number(),
  amount: z.number(),
});

export const InvoiceSchema = z.object({
  id: z.string(),
  userId: z.string(),
  clientId: z.string(),
  invoiceNumber: z.string(),
  date: z.date(),
  dueDate: z.date(),
  items: z.array(InvoiceItemSchema),
  subtotal: z.number(),
  tax: z.number(),
  total: z.number(),
  currency: z.string().default('USD'),
  status: z.enum(['draft', 'sent', 'paid', 'overdue']),
  notes: z.string().optional(),
  createdAt: z.date(),
  updatedAt: z.date(),
});

export type Invoice = z.infer<typeof InvoiceSchema>;
export type InvoiceItem = z.infer<typeof InvoiceItemSchema>;
