import { ProjectError } from './project-snapshot.js';

export function validateContact(form) {
  const name = (form.get('name') ?? '').trim();
  const email = (form.get('email') ?? '').trim();
  const phone = (form.get('phone') ?? '').trim();
  const message = (form.get('message') ?? '').trim();
  if (name.length < 2 || name.length > 120) throw new ProjectError('Вкажіть ім’я від 2 до 120 символів.');
  if (!email && !phone) throw new ProjectError('Вкажіть телефон або електронну пошту.');
  if (email && (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) || email.length > 254)) throw new ProjectError('Перевірте електронну пошту.');
  if (phone && (!/^[+()\d .-]{7,40}$/.test(phone) || phone.replace(/\D/g, '').length < 7)) throw new ProjectError('Перевірте номер телефону.');
  if (message.length > 3000 || form.get('consent') !== 'yes') throw new ProjectError('Підтвердьте передачу контакту CRMCUSTOMS; опис — до 3000 символів.');
  return { name, email: email || 'Не вказано', phone: phone || 'Не вказано', message };
}

/** @param {{url?: string, secret?: string, projectPath?: string}} config */
export function createLeadSender({ url, secret, projectPath = '/projects' } = {}, fetcher = fetch) {
  if (!url || !secret) return null;
  const endpoint = new URL(url);
  if (!['http:', 'https:'].includes(endpoint.protocol) || endpoint.username || endpoint.password) throw new Error('Некоректний N8N_ORDERS_URL');
  return async (project, key, contact, siteUrl) => {
    const result = project.result;
    const lines = result.items.map(item => {
      const record = project.records.find(record => record.id === item.automation_id);
      const variant = record.variants.find(variant => variant.id === item.variant_id);
      return `${item.automation_id}: ${record.title} — ${variant.title}; ${item.hours_min}–${item.hours_max} год; ${item.price_usd_min}–${item.price_usd_max} USD`;
    });
    const projectUrl = new URL(`${projectPath}/${project.id}`, siteUrl).href;
    // Same contact branch and headers as SiteMain/lib/actions.ts.
    const payload = { ...contact, to: 'your-email@example.com', subject: 'Заявка на впровадження автоматизацій CRMCUSTOMS', formType: 'contact',
      message: [contact.message, 'Конструктор автоматизацій CRMCUSTOMS', projectUrl, ...lines,
        `Разом: ${result.hours_min}–${result.hours_max} год; ${result.price_usd_min}–${result.price_usd_max} USD; ${result.hourly_rate} USD/год.`,
        'Попередня оцінка.', ...result.warnings, 'Не входить у бюджет:', ...result.excluded_work].filter(Boolean).join('\n'),
      date: new Date().toLocaleString('uk-UA'), timestamp: new Date().toISOString(), projectId: project.id, projectRevision: project.revision, projectUrl, project: result, idempotencyKey: key };
    const response = await fetcher(endpoint, { method: 'POST', redirect: 'error', signal: AbortSignal.timeout(15000),
      headers: { 'Content-Type': 'application/json', 'x-webhook-secret': secret, WEBHOOK_SECRET: secret, 'Idempotency-Key': key }, body: JSON.stringify(payload) });
    await response.body?.cancel();
    if (!response.ok) {
      const error = new Error('Шлюз не підтвердив прийняття');
      error.definitiveRejection = response.status >= 400 && response.status < 500;
      throw error;
    }
    // SiteMain uses any HTTP 2xx as gateway acceptance; this does not prove PlanFix task creation.
  };
}

