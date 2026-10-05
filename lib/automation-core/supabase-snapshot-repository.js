import { isProjectId, ProjectError } from './project-snapshot.js';

const unavailable = () => new ProjectError('Сховище проєктів тимчасово недоступне. Спробуйте пізніше.', 503);
const storageVersion = value => {
  if (typeof value !== 'number' && !(typeof value === 'string' && /^[1-9][0-9]*$/.test(value))) throw unavailable();
  const version = Number(value);
  if (!Number.isSafeInteger(version) || version < 1) throw unavailable();
  return version;
};

// Server-only PostgREST RPC adapter. Never retries a potentially committed write.
export class SupabaseSnapshotRepository {
  constructor({ url, serviceKey, fetchImpl = globalThis.fetch, timeoutMs = 10000 }) {
    let base;
    try { base = new URL(url); } catch { throw unavailable(); }
    if (base.protocol !== 'https:' || base.username || base.password || base.search || base.hash ||
        typeof serviceKey !== 'string' || !serviceKey.trim() || /[\r\n]/.test(serviceKey) ||
        typeof fetchImpl !== 'function' || !Number.isSafeInteger(timeoutMs) || timeoutMs < 1 || timeoutMs > 60000) throw unavailable();
    this.base = `${base.href.replace(/\/$/, '')}/rest/v1/rpc/`;
    this.serviceKey = serviceKey;
    this.fetch = fetchImpl;
    this.timeoutMs = timeoutMs;
  }
  async rpc(name, parameters) {
    try {
      const response = await this.fetch(`${this.base}${name}`, {
        method: 'POST', redirect: 'error', cache: 'no-store',
        signal: AbortSignal.timeout(this.timeoutMs),
        headers: { 'Content-Type': 'application/json', Accept: 'application/json',
          apikey: this.serviceKey, Authorization: `Bearer ${this.serviceKey}` },
        body: JSON.stringify(parameters)
      });
      if (!response.ok) { await response.body?.cancel(); throw unavailable(); }
      const reader = response.body?.getReader();
      if (!reader) throw unavailable();
      let size = 0;
      const chunks = [];
      while (true) {
        const chunk = await reader.read();
        if (chunk.done) break;
        size += chunk.value.byteLength;
        if (size > 16 * 1024 * 1024) { await reader.cancel(); throw unavailable(); }
        chunks.push(chunk.value);
      }
      const rows = JSON.parse(Buffer.concat(chunks).toString('utf8'));
      if (!Array.isArray(rows) || rows.length > 1) throw unavailable();
      return rows;
    } catch { throw unavailable(); }
  }
  async create(snapshot) {
    const rows = await this.rpc('automation_project_create', { p_snapshot: snapshot });
    if (rows.length !== 1) throw unavailable();
    return storageVersion(rows[0]?.storage_version);
  }
  async read(id) {
    if (!isProjectId(id)) throw new ProjectError('Проєкт не знайдено.', 404);
    const rows = await this.rpc('automation_project_read', { p_id: id });
    if (!rows.length) return null;
    if (!rows[0]?.snapshot || typeof rows[0].snapshot !== 'object' || Array.isArray(rows[0].snapshot)) throw unavailable();
    return { version: storageVersion(rows[0].storage_version), snapshot: rows[0].snapshot };
  }
  async replace(id, expectedVersion, snapshot) {
    if (!isProjectId(id)) throw new ProjectError('Проєкт не знайдено.', 404);
    const rows = await this.rpc('automation_project_replace', {
      p_id: id, p_expected_version: storageVersion(expectedVersion), p_snapshot: snapshot
    });
    return rows.length ? storageVersion(rows[0]?.storage_version) : null;
  }
}
