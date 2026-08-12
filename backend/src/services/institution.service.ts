import db from '../config/database';

interface InstitutionFilters { type?: string; state?: string; search?: string; limit?: number; }

const publicColumns = [
  'InstitutionID', 'Name', 'Type', 'District', 'State', 'Address', 'IsVerified',
];

export async function getAllInstitutions(filters: InstitutionFilters = {}) {
  const query = db('Institutions').select(publicColumns).where({ IsVerified: true });
  if (filters.type) query.where({ Type: filters.type });
  if (filters.state) query.where({ State: filters.state });
  if (filters.search) query.where('Name', 'like', `%${filters.search}%`);
  return query.orderBy('Name').limit(filters.limit ?? 100);
}

export async function getInstitutionById(id: number) {
  return db('Institutions').select(publicColumns).where({ InstitutionID: id, IsVerified: true }).first();
}
