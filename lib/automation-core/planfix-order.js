const escape = value => String(value ?? '').replace(/[&<>"']/g, char => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[char]);
const clean = value => value && value !== 'Не вказано' ? value : '';
const fieldValue = (entry, id) => entry.customFieldData?.find(item => item.field?.id === id)?.value;
const positiveId = value => Number.isSafeInteger(value) && value > 0;
/** @type {(receipt: object) => Promise<void>} */
const ignoreCheckpoint = async receipt => {};

/** @param {{token?: string, notificationUrl?: string, notificationSecret?: string}} config Server-only credentials for crmcustomsua.planfix.ua. */
export function createPlanfixOrderSender({ token, notificationUrl, notificationSecret } = {}, fetcher = fetch) {
  if (!token || !notificationUrl || !notificationSecret) return null;
  const notificationEndpoint = new URL(notificationUrl);
  if (notificationEndpoint.origin !== 'https://n8n.crmcustoms.com' || notificationEndpoint.username || notificationEndpoint.password) throw new Error('Некоректний маршрут повідомлення.');
  return async (project, key, contact, siteUrl, checkpoint = ignoreCheckpoint) => {
    let written = false;
    const receipt = { provider: 'planfix', price_policy: 'lower_bound', currency: 'USD' };
    async function request(path, body, mutation = false) {
      let response;
      try {
        response = await fetcher(`https://crmcustomsua.planfix.ua/rest/${path}`, {
          method: body ? 'POST' : 'GET', redirect: 'error', signal: AbortSignal.timeout(15000),
          headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
          body: body ? JSON.stringify(body) : undefined,
        });
        const data = await response.json();
        if (!response.ok || data.result !== 'success') {
          const error = new Error('PlanFix не підтвердив операцію.');
          error.definitiveRejection = !written && response.status >= 400 && response.status < 500;
          throw error;
        }
        if (mutation) written = true;
        return data;
      } catch (error) {
        // Fetch/parse failures can follow a committed write. Do not expose credentials or retry.
        const safe = new Error('Не вдалося підтвердити операцію PlanFix.');
        safe.definitiveRejection = error.definitiveRejection === true && !written;
        throw safe;
      }
    }
    async function save() { await checkpoint({ ...receipt }); }
    try {
      const products = new Map();
      // Directory references enrich the order; catalog publication never requires them.
      try {
        for (let offset = 0; offset < 10000; offset += 100) {
          const page = (await request('directory/21682/entry/list', { offset, pageSize: 100, fields: 'key,54876' })).directoryEntries;
          if (!Array.isArray(page)) throw new Error('Непридатна відповідь довідника.');
          for (const entry of page) {
            const code = fieldValue(entry, 54876);
            if (typeof code !== 'string' || !positiveId(entry.key) || products.has(code)) throw new Error('Непридатний код товару.');
            products.set(code, entry.key);
          }
          if (page.length < 100) break;
          if (offset === 9900) throw new Error('Довідник перевищує межу читання.');
        }
      } catch {
        products.clear();
      }
      const lines = project.result.items.map(item => {
        const record = project.records.find(record => record.id === item.automation_id);
        const variant = record?.variants.find(variant => variant.id === item.variant_id);
        const product = products.get(`${item.automation_id}:${item.variant_id}`);
        if (!variant || !Number.isFinite(item.price_usd_min) || item.price_usd_min < 0) throw new Error('Непридатна позиція проєкту.');
        const answers = Object.entries(item.answers || {}).map(([id, value]) => {
          const question = record.configurator_questions?.find(question => question.id === id);
          return question ? `${question.question}: ${typeof value === 'boolean' ? value ? 'так' : 'ні' : value}` : '';
        }).filter(Boolean);
        return { item, name: `${record.title} — ${variant.title}`, product, answers };
      });
      if (!lines.length || Math.abs(lines.reduce((sum, line) => sum + line.item.price_usd_min, 0) - project.result.price_usd_min) > 0.01) throw new Error('Сума позицій не збігається з проєктом.');
      const schema = (await request('datatag/12322?fields=id,name,fields')).dataTag;
      if (schema?.fields?.find(field => field.id === 69452)?.directoryId !== 21682
        || schema.fields.find(field => field.id === 59246)?.formula !== '{{Поле аналитики.Количество}}*{{Поле аналитики.Цена}}') throw new Error('Структура аналітики змінилася.');
      const email = clean(contact.email), phone = clean(contact.phone);
      const query = { pageSize: 2, fields: 'id,email,phones', prefixedId: true, filters: [{ type: email ? 4026 : 4003, operator: 'equal', value: email || phone }] };
      const matches = (await request('contact/list', query)).contacts;
      if (!Array.isArray(matches) || matches.length > 1) throw new Error('Контакт потребує уточнення.');
      let contactId = matches[0]?.id;
      if (!contactId) {
        const created = await request('contact/', { name: contact.name, isCompany: false, ...(email ? { email } : {}), ...(phone ? { phones: [{ number: phone, type: 1 }] } : {}) }, true);
        if (!positiveId(created.id)) throw new Error('Номер контакту не підтверджено.');
        contactId = `contact:${created.id}`;
      }
      if (!/^contact:[1-9]\d*$/.test(contactId)) throw new Error('Непридатний номер контакту.');
      const projectUrl = new URL(`/uk/automation-projects/${project.id}`, siteUrl).href;
      const description = `<p>Заявка конструктора CRMCUSTOMS. Попередня сума за нижньою межею: ${escape(project.result.price_usd_min)} USD.</p>`
        + `<p>${escape(contact.name)} · ${escape(email)} · ${escape(phone)}</p><p>${escape(contact.message)}</p>`
        + `<p><a href="${escape(projectUrl)}">Переглянути проєкт</a></p>`
        + lines.map(line => `<p>${escape(line.name)}: ${escape(line.item.price_usd_min)} USD<br>${line.answers.map(escape).join('<br>')}</p>`).join('');
      const task = await request('task/', { name: 'Заявка на впровадження автоматизацій CRMCUSTOMS', description,
        template: { id: 14 }, assignees: { users: [{ id: 'user:1' }] }, counterparty: { id: contactId },
        customFieldData: [{ field: { id: 112396 }, value: ['USD'] }],
      }, true);
      if (!positiveId(task.id)) throw new Error('Номер задачі не підтверджено.');
      receipt.task_id = task.id;
      await save();
      const comment = await request(`task/${task.id}/comments/`, { description: 'Попередня оцінка впровадження, USD. Позиції з конструктора.', isHidden: true, recipients: { users: [], groups: [] } }, true);
      if (!positiveId(comment.id)) throw new Error('Номер коментаря не підтверджено.');
      receipt.comment_id = comment.id;
      await save();
      const added = await request(`task/${task.id}/datatags/${comment.id}`, { dataTag: { id: 12322 }, items: lines.map(line => ({ customFieldData: [
        { field: { id: 59238 }, value: line.name }, { field: { id: 59240 }, value: 1 },
        { field: { id: 59242 }, value: line.item.price_usd_min },
        ...(line.product ? [{ field: { id: 69452 }, value: { id: line.product } }] : []),
      ] })) }, true);
      if (!Array.isArray(added.keys) || added.keys.length !== lines.length || !added.keys.every(positiveId)) throw new Error('Ключі позицій не підтверджено.');
      receipt.entry_keys = added.keys;
      await save();
      const entries = [];
      for (let offset = 0; offset < 10000; offset += 100) {
        const page = (await request('datatag/12322/entry/list', { taskId: task.id, offset, pageSize: 100, fields: 'key,commentId,59238,59240,59242,69452' })).dataTagEntries;
        if (!Array.isArray(page)) throw new Error('Позиції не прочитано.');
        entries.push(...page);
        if (page.length < 100) break;
      }
      const ours = entries.filter(entry => entry.commentId === comment.id);
      const unmatched = [...ours];
      const confirmed = lines.every(line => {
        const index = unmatched.findIndex(entry => added.keys.includes(entry.key)
          && fieldValue(entry, 59238) === line.name && fieldValue(entry, 59240) === 1
          && fieldValue(entry, 59242) === line.item.price_usd_min
          && (!line.product || fieldValue(entry, 69452)?.id === line.product));
        if (index < 0) return false;
        unmatched.splice(index, 1);
        return true;
      });
      if (ours.length !== lines.length || !confirmed || unmatched.length) throw new Error('Позиції не підтверджено.');
      const savedTask = (await request(`task/${task.id}?fields=112394,112396`)).task;
      const total = savedTask?.customFieldData?.find(field => field.field.id === 112394)?.value;
      const currency = savedTask?.customFieldData?.find(field => field.field.id === 112396)?.value;
      if (!Array.isArray(currency) || currency.length !== 1 || currency[0] !== 'USD') throw new Error('Валюту PlanFix не підтверджено.');
      if (Math.abs(total - project.result.price_usd_min) > 0.01 || !Number.isFinite(total)) throw new Error('Підсумок PlanFix не збігається.');
      receipt.total_usd = total;
      receipt.order_verified = true;
      await save();
      receipt.notification_status = 'sending';
      await save();
      const notification = await fetcher(notificationEndpoint.href, {
        method: 'POST', redirect: 'error', signal: AbortSignal.timeout(15000), headers: { 'Content-Type': 'application/json', 'x-webhook-secret': notificationSecret, WEBHOOK_SECRET: notificationSecret },
        body: JSON.stringify({ name: contact.name, email, phone, solutionCount: lines.length, totalUsd: total, planfixTaskId: task.id, projectUrl }),
      });
      receipt.notification_http_status = notification.status;
      receipt.notification_status = 'unconfirmed';
      await save();
      const message = await notification.json();
      if (!notification.ok || !message.ok || !positiveId(message.result?.message_id)) throw new Error('Telegram не підтвердив повідомлення.');
      receipt.telegram_message_id = message.result.message_id;
      receipt.notification_status = 'accepted';
      await save();
      return receipt;
    } catch (error) {
      const safe = new Error('Не вдалося підтвердити передачу заявки.');
      safe.definitiveRejection = !written && error.definitiveRejection === true;
      throw safe;
    }
  };
}
