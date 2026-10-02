import { z } from 'zod';

import { MAX_CONTENT_LENGTH } from './types';

export const createPostSchema = z.object({
  foodName: z.string().trim().min(1, 'Bạn ăn món gì?').max(128, 'Tên món tối đa 128 ký tự'),
  foodSlug: z.string().nullable(),
  rating: z.number().int().min(1, 'Chấm điểm cho món nhé').max(5),
  content: z.string().max(MAX_CONTENT_LENGTH, `Tối đa ${MAX_CONTENT_LENGTH} ký tự`),
  isPrivate: z.boolean(),
});

export type CreatePostValues = z.infer<typeof createPostSchema>;
