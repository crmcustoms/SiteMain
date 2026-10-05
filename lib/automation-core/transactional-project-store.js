import { randomUUID, randomBytes } from 'node:crypto';
import { composeProject } from './engine.js';
import { isProjectId, hashToken, canonicalCatalogDigest, ownsProject, validateProjectSnapshot, sameResult, ProjectError } from './project-snapshot.js';

const conflict = () => new ProjectError('Проєкт уже змінено в іншій вкладці. Оновіть сторінку.', 409);
const uncertain = () => new ProjectError('Прийняття цієї заявки ще не підтверджено. Перевірте її з CRMCUSTOMS перед повторним надсиланням.', 409);
export class TransactionalProjectStore {
  constructor(repository) { this.repository = repository; }
  owns(project, token) { return ownsProject(project, token); }
  async entry(id) {
    if (!isProjectId(id)) throw new ProjectError('Проєкт не знайдено.', 404);
    const entry = await this.repository.read(id);
    if (!entry) return null;
    if (!Number.isSafeInteger(entry.version) || entry.version < 1) throw new ProjectError('Непридатна версія сховища.', 500);
    validateProjectSnapshot(entry.snapshot, id, canonicalCatalogDigest);
    return entry;
  }
  async read(id) { return (await this.entry(id))?.snapshot ?? null; }
  async create(records, selections, hourly_rate = 30) {
    if (selections.length > 50) throw new ProjectError('У проєкті може бути до 50 обраних рішень.');
    const result = composeProject(records, selections, { hourly_rate });
    const token = randomBytes(32).toString('hex');
    const date = new Date().toISOString();
    const project = { version: 1, id: randomUUID(), revision: 1, owner_hash: hashToken(token), created_at: date, updated_at: date, records: structuredClone(records), catalog_digest: canonicalCatalogDigest(records), result, lead: null };
    await this.repository.create(project);
    return { project, token };
  }
  async update(id, token, revision, records, selections, hourly_rate) {
    const entry = await this.entry(id);
    const project = entry?.snapshot;
    if (!this.owns(project, token)) throw new ProjectError('Редагування цього проєкту недоступне.', 403);
    if (project.revision !== revision) throw conflict();
    if (selections.length > 50) throw new ProjectError('У проєкті може бути до 50 обраних рішень.');
    const result = composeProject(records, selections, { hourly_rate });
    const catalog_digest = canonicalCatalogDigest(records);
    if (catalog_digest === project.catalog_digest && sameResult(result, project.result)) return project;
    const updated = { ...project, revision: revision + 1, updated_at: new Date().toISOString(), records: structuredClone(records), catalog_digest, result };
    if (await this.repository.replace(id, entry.version, updated) === null) throw conflict();
    return updated;
  }
  async settle(id, key, status) {
    // Merge only this claim into fresh content. Never resend the external request.
    for (let attempt = 0; attempt < 5; attempt++) {
      const entry = await this.entry(id);
      if (!entry || entry.snapshot.lead?.key !== key) throw uncertain();
      const current = entry.snapshot;
      if (current.lead.status === status) return current;
      if (current.lead.status !== 'sending') throw uncertain();
      const settled = { ...current, lead: { ...current.lead, status } };
      if (await this.repository.replace(id, entry.version, settled) !== null) return settled;
    }
    throw uncertain();
  }
  async checkpointLead(id, key, receipt) {
    // Persist completed external stages before continuing; never resend on CAS failure.
    for (let attempt = 0; attempt < 5; attempt++) {
      const entry = await this.entry(id);
      if (!entry || entry.snapshot.lead?.key !== key || entry.snapshot.lead.status !== 'sending') throw uncertain();
      const updated = { ...entry.snapshot, lead: { ...entry.snapshot.lead, receipt: structuredClone(receipt) } };
      if (await this.repository.replace(id, entry.version, updated) !== null) return;
    }
    throw uncertain();
  }
  async submit(id, token, revision, send) {
    const entry = await this.entry(id);
    const project = entry?.snapshot;
    if (!this.owns(project, token)) throw new ProjectError('Заявка доступна власнику проєкту.', 403);
    if (project.revision !== revision) throw conflict();
    // An unresolved claim blocks another send even if content has since changed.
    if (project.lead && ['sending', 'unconfirmed'].includes(project.lead.status)) throw uncertain();
    if (project.lead?.revision === revision && project.lead.status === 'accepted') return project;
    const key = `${id}:${revision}`;
    const claimed = { ...project, lead: { revision, key, status: 'sending', date: new Date().toISOString() } };
    if (await this.repository.replace(id, entry.version, claimed) === null) throw conflict();
    let failure;
    try { await send(structuredClone(claimed), key, receipt => this.checkpointLead(id, key, receipt)); } catch (error) { failure = error || new Error(); }
    const status = failure ? failure.definitiveRejection ? 'rejected' : 'unconfirmed' : 'accepted';
    const settled = await this.settle(id, key, status);
    if (failure) throw new ProjectError(failure.definitiveRejection
      ? 'Шлюз відхилив заявку. Перевірте контакт або зверніться до CRMCUSTOMS; після виправлення можна спробувати ще раз.'
      : 'Не вдалося підтвердити прийняття заявки. Перевірте її з CRMCUSTOMS перед повторним надсиланням.', 502);
    return settled;
  }
}
