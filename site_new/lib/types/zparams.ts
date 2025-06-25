import { z } from 'zod';

// zod schema protect on server side.
//zparams means schema for search params.

export const IntSchema = z.number().int().nonnegative();
export const StringSchema = z.string().min(1, "输入词不能为空");
