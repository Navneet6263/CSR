import { ValidationError } from './errors';

export interface PageOptions {
  page: number;
  limit: number;
}

export function parsePage(
  pageValue: unknown,
  limitValue: unknown,
  defaultLimit = 25,
  maxLimit = 100,
): PageOptions {
  const page = pageValue === undefined ? 1 : Number(pageValue);
  const limit = limitValue === undefined ? defaultLimit : Number(limitValue);

  if (!Number.isInteger(page) || page < 1) {
    throw new ValidationError('page must be a positive integer.');
  }
  if (!Number.isInteger(limit) || limit < 1 || limit > maxLimit) {
    throw new ValidationError(`limit must be between 1 and ${maxLimit}.`);
  }

  return { page, limit };
}
