// A transaction-safe persistence primitive. It does not authorize public requests.
// query must belong to a server-only PostgreSQL client; never pass browser credentials.
export class PostgresSnapshotRepository {
  constructor(query) { this.query = query; }
  async create(snapshot) {
    const { rows } = await this.query('SELECT * FROM public.automation_project_create($1::jsonb)', [JSON.stringify(snapshot)]);
    return Number(rows[0].storage_version);
  }
  async read(id) {
    const { rows } = await this.query('SELECT * FROM public.automation_project_read($1::uuid)', [id]);
    if (!rows.length) return null;
    return { version: Number(rows[0].storage_version), snapshot: rows[0].snapshot };
  }
  async replace(id, expectedVersion, snapshot) {
    const { rows } = await this.query('SELECT * FROM public.automation_project_replace($1::uuid,$2::bigint,$3::jsonb)', [id, expectedVersion, JSON.stringify(snapshot)]);
    return rows.length ? Number(rows[0].storage_version) : null;
  }
}
