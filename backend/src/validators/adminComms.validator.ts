import { z } from 'zod/v4';

export const announcementSchema = z.object({
  title: z.string().trim().min(3).max(180), message: z.string().trim().min(3).max(2000),
  audience: z.enum(['All', 'Students', 'Staff']).default('All'),
  status: z.enum(['Draft', 'Published']).default('Draft'), expiresAt: z.string().datetime().optional(),
});
export const broadcastSchema = z.object({
  title: z.string().trim().min(3).max(180), message: z.string().trim().min(3).max(2000),
  audience: z.enum(['AllStudents', 'PendingDocuments', 'Approved', 'Funded']),
});
export const ticketUpdateSchema = z.object({ status: z.enum(['Open', 'InProgress', 'Resolved']) });

export type AnnouncementInput = z.infer<typeof announcementSchema>;
export type BroadcastInput = z.infer<typeof broadcastSchema>;
