import db from '../config/database';

// ─── Get All Institutions ───────────────────────────────────────────────────

interface InstitutionFilters {
  type?: string;
  state?: string;
}

export async function getAllInstitutions(filters: InstitutionFilters = {}) {
  const query = db('Institutions').select('*');

  if (filters.type) {
    query.where({ Type: filters.type });
  }
  if (filters.state) {
    query.where({ State: filters.state });
  }

  return query.orderBy('Name');
}

// ─── Get Institution By ID ──────────────────────────────────────────────────

export async function getInstitutionById(id: number) {
  return db('Institutions').where({ InstitutionID: id }).first();
}
