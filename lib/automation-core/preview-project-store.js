import { mkdir, readFile, writeFile, rename, unlink } from 'node:fs/promises';
import path from 'node:path';
import { randomUUID, randomBytes } from 'node:crypto';
import { composeProject } from './engine.js';
import { isProjectId, catalogDigest, hashToken as hash, ProjectError, ownsProject, validateProjectSnapshot } from './project-snapshot.js';
export { isProjectId, catalogDigest, ProjectError } from './project-snapshot.js';

const locks = new Map();

// One server process owns this directory. Atomic replacement protects completed snapshots.
export class ProjectStore {
  constructor(directory) { this.directory = path.resolve(directory); }
  file(id) {
    if (!isProjectId(id)) throw new ProjectError('Проєкт не знайдено.', 404);
    return path.join(this.directory, `${id}.json`);
  }
  async lock(id, action) {
    const key = this.file(id);
    const previous = locks.get(key) ?? Promise.resolve();
    const next = previous.catch(() => {}).then(action);
    locks.set(key, next);
    try { return await next; } finally { if (locks.get(key) === next) locks.delete(key); }
  }
  async read(id) {
    let project;
    try { project = JSON.parse(await readFile(this.file(id), 'utf8')); }
    catch (error) {
      if (error.code === 'ENOENT') return null;
      if (error instanceof ProjectError) throw error;
      throw new ProjectError('Збережений проєкт пошкоджено.', 500);
    }
    return validateProjectSnapshot(project, id);
  }
  owns(project, token) {
    return ownsProject(project, token);
  }
  async write(project) {
    await mkdir(this.directory, { recursive: true });
    const target = this.file(project.id);
    const temporary = `${target}.${randomUUID()}.tmp`;
    try {
      await writeFile(temporary, JSON.stringify(project), { flag: 'wx', mode: 0o600 });
      await rename(temporary, target);
    } finally { await unlink(temporary).catch(() => {}); }
    return project;
  }
  async create(records, selections, hourly_rate = 30) {
    if (selections.length > 50) throw new ProjectError('У проєкті може бути до 50 обраних рішень.');
    const result = composeProject(records, selections, { hourly_rate });
    const token = randomBytes(32).toString('hex');
    const date = new Date().toISOString();
    const project = { version: 1, id: randomUUID(), revision: 1, owner_hash: hash(token), created_at: date, updated_at: date, records: structuredClone(records), catalog_digest: catalogDigest(records), result, lead: null };
    await this.write(project);
    return { project, token };
  }
  async update(id, token, revision, records, selections, hourly_rate) {
    return this.lock(id, async () => {
      const project = await this.read(id);
      if (!this.owns(project, token)) throw new ProjectError('Редагування цього проєкту недоступне.', 403);
      if (project.revision !== revision) throw new ProjectError('Проєкт уже змінено в іншій вкладці. Оновіть сторінку.', 409);
      if (selections.length > 50) throw new ProjectError('У проєкті може бути до 50 обраних рішень.');
      const result = composeProject(records, selections, { hourly_rate });
      const catalog_digest = catalogDigest(records);
      // A repeated save must not turn an already accepted lead into a new eligible version.
      if (catalog_digest === project.catalog_digest && JSON.stringify(result) === JSON.stringify(project.result)) return project;
      return this.write({ ...project, revision: revision + 1, updated_at: new Date().toISOString(), records: structuredClone(records), catalog_digest, result });
    });
  }
  async submit(id, token, revision, send) {
    return this.lock(id, async () => {
      const project = await this.read(id);
      if (!this.owns(project, token)) throw new ProjectError('Заявка доступна власнику проєкту.', 403);
      if (project.revision !== revision) throw new ProjectError('Перед заявкою оновіть сторінку проєкту.', 409);
      if (project.lead?.revision === revision && project.lead.status !== 'rejected') {
        if (project.lead.status === 'accepted') return project;
        // An interrupted request may already have been delivered. Never retry silently.
        throw new ProjectError('Прийняття цієї заявки ще не підтверджено. Перевірте її з CRMCUSTOMS перед повторним надсиланням.', 409);
      }
      const key = `${id}:${revision}`;
      project.lead = { revision, key, status: 'sending', date: new Date().toISOString() };
      await this.write(project);
      try {
        await send(project, key);
        project.lead.status = 'accepted';
        await this.write(project);
        return project;
      } catch (error) {
        project.lead.status = error.definitiveRejection ? 'rejected' : 'unconfirmed';
        await this.write(project);
        if (error.definitiveRejection) throw new ProjectError('Шлюз відхилив заявку. Перевірте контакт або зверніться до CRMCUSTOMS; після виправлення можна спробувати ще раз.', 502);
        throw new ProjectError('Не вдалося підтвердити прийняття заявки. Перевірте її з CRMCUSTOMS перед повторним надсиланням.', 502);
      }
    });
  }
}
