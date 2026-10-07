import { search, searchWords } from './catalog.js';
export const pageSize = 12;
export const budgetOptions = { '300': 'До 300 USD', '600': 'До 600 USD', '1500': 'До 1 500 USD' };
export const sortOptions = { relevance: 'За відповідністю', title: 'За назвою', price: 'За бюджетом' };

export function queryCatalog(catalog, params) {
  const { records, labels, estimates } = catalog;
  const filters = { q: (params.get('q') ?? '').trim().slice(0, 200) };
  for (const [name, options] of Object.entries({ category: labels.categories, role: labels.roles, industry: labels.industries, complexity: labels.complexity, budget: budgetOptions, sort: sortOptions })) {
    const value = params.get(name) ?? '';
    filters[name] = Object.hasOwn(options, value) ? value : name === 'sort' ? 'relevance' : '';
  }
  const scores = new Map(search(records, filters.q, records.length).map(hit => [hit.id, hit.score]));
  // Ukrainian taxonomy labels participate in search without changing stable IDs.
  const tokens = searchWords(filters.q);
  for (const record of records) {
    const words = [labels.categories[record.category], ...record.roles.map(id => labels.roles[id]), ...record.industries.map(id => labels.industries[id])].join(' ').toLocaleLowerCase('uk');
    const bonus = tokens.reduce((sum, token) => sum + (words.includes(token) ? 1 : 0), 0);
    if (bonus && (scores.has(record.id) || tokens.every(token => words.includes(token)))) scores.set(record.id, (scores.get(record.id) ?? 0) + bonus);
  }
  const categoryCounts = Object.fromEntries(Object.keys(labels.categories).map(id => [id, 0]));
  const matches = records.flatMap(record => {
    if (tokens.length && !scores.has(record.id)) return [];
    if (filters.role && !record.roles.includes(filters.role)) return [];
    if (filters.industry && !record.industries.includes(filters.industry) && !record.industries.includes('cross-industry')) return [];
    const variants = record.variants.filter(variant =>
      (!filters.complexity || variant.complexity === filters.complexity) &&
      (!filters.budget || estimates.get(`${record.id}/${variant.id}`).price_usd_max <= Number(filters.budget))
    );
    if (!variants.length) return [];
    categoryCounts[record.category]++;
    if (filters.category && record.category !== filters.category) return [];
    const cheapest = [...variants].sort((a, b) => estimates.get(`${record.id}/${a.id}`).price_usd_max - estimates.get(`${record.id}/${b.id}`).price_usd_max || a.id.localeCompare(b.id))[0];
    return [{ record, variant: cheapest, estimate: estimates.get(`${record.id}/${cheapest.id}`), score: scores.get(record.id) ?? 0 }];
  });
  matches.sort((a, b) => {
    if (filters.sort === 'price') return a.estimate.price_usd_max - b.estimate.price_usd_max || a.record.id.localeCompare(b.record.id);
    if (filters.sort === 'title') return a.record.title.localeCompare(b.record.title, 'uk');
    return b.score - a.score || a.record.id.localeCompare(b.record.id);
  });
  const pages = Math.max(1, Math.ceil(matches.length / pageSize));
  const rawPage = params.get('page') ?? '1';
  const page = Math.min(pages, /^\d{1,6}$/.test(rawPage) ? Math.max(1, Number(rawPage)) : 1);
  return { filters, page, pages, total: matches.length, categoryCounts, items: matches.slice((page - 1) * pageSize, page * pageSize) };
}

export function catalogUrl(filters = {}, changes = {}) {
  const params = new URLSearchParams();
  for (const [key, value] of Object.entries({ ...filters, ...changes })) {
    if (value && !(key === 'sort' && value === 'relevance') && !(key === 'page' && Number(value) === 1)) params.set(key, value);
  }
  return `/${params.size ? `?${params}` : ''}`;
}

export function relatedRecords(catalog, record) {
  const explicit = record.dependencies.map(dependency => ({ ...dependency, record: catalog.byId.get(dependency.target_id) })).filter(item => item.record);
  const ids = new Set([record.id, ...explicit.map(item => item.target_id)]);
  const suggestions = catalog.records.filter(item => !ids.has(item.id) && item.category === record.category).slice(0, 3);
  return { explicit, suggestions };
}
