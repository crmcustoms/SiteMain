import { createHash, timingSafeEqual } from 'node:crypto';
import { isDeepStrictEqual } from 'node:util';
import { composeProject } from './engine.js';

export class ProjectError extends Error {
  constructor(message, status = 400) { super(message); this.status = status; }
}
export const isProjectId = id => /^[a-f0-9]{8}-[a-f0-9]{4}-4[a-f0-9]{3}-[89ab][a-f0-9]{3}-[a-f0-9]{12}$/.test(id ?? '');
export const hashToken = value => createHash('sha256').update(value).digest('hex');
export const catalogDigest = records => hashToken(JSON.stringify(records));
const canonical = value => Array.isArray(value) ? value.map(canonical) : value && typeof value === 'object'
  ? Object.fromEntries(Object.keys(value).sort().map(key => [key, canonical(value[key])])) : value;
// JSONB may reorder object keys. List order remains meaningful.
export const canonicalCatalogDigest = records => hashToken(JSON.stringify(canonical(records)));
export const sameResult = isDeepStrictEqual;
export function ownsProject(project, token) {
  if (!project || !/^[a-f0-9]{64}$/.test(project.owner_hash ?? '') || typeof token !== 'string' || !/^[a-f0-9]{64}$/.test(token)) return false;
  return timingSafeEqual(Buffer.from(project.owner_hash, 'hex'), Buffer.from(hashToken(token), 'hex'));
}
export function validateProjectSnapshot(project, id, digest = catalogDigest) {
  try {
    if (!project || project.version !== 1 || project.id !== id || !isProjectId(id) || !Number.isSafeInteger(project.revision) || project.revision < 1 || !/^[a-f0-9]{64}$/.test(project.owner_hash) || !Array.isArray(project.records)) throw new Error();
    const calculated = composeProject(project.records, project.result.selections, { hourly_rate: project.result.hourly_rate });
    if (!sameResult(calculated, project.result) || digest(project.records) !== project.catalog_digest) throw new Error();
    if (project.lead !== null) {
      if (!project.lead || !Number.isSafeInteger(project.lead.revision) || project.lead.revision < 1 || project.lead.revision > project.revision || project.lead.key !== `${id}:${project.lead.revision}` || !['sending', 'accepted', 'rejected', 'unconfirmed'].includes(project.lead.status)) throw new Error();
    }
  } catch { throw new ProjectError('Збережений проєкт має непридатний формат.', 500); }
  return project;
}
