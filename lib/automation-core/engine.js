import { byId } from './catalog.js';
import { automationSchema, checkSchema } from './schema-check.js';

const roundMoney = number => Math.round(number * 100) / 100;
const defaultExcludedWork = ['Ліцензії та підписки сторонніх сервісів.', 'Очищення й міграція історичних даних, якщо їх не враховано окремо.'];

export function visibleQuestions(record, answers = {}) {
  const questions = new Map(record.configurator_questions.map(question => [question.id, question]));
  const visibility = new Map();
  const resolving = new Set();
  const isVisible = question => {
    if (visibility.has(question.id)) return visibility.get(question.id);
    if (resolving.has(question.id)) throw new Error(`Цикл умов видимості запитань у ${record.id}`);
    resolving.add(question.id);
    const parent = question.show_if ? questions.get(question.show_if.question_id) : null;
    if (question.show_if && !parent) throw new Error(`Невідоме запитання в умові ${question.id}`);
    const visible = !question.show_if || (isVisible(parent) && answers[parent.id] === question.show_if.equals);
    resolving.delete(question.id);
    visibility.set(question.id, visible);
    return visible;
  };
  return record.configurator_questions.filter(isVisible);
}

export function estimateAutomation(record, { variant_id, answers = {}, modifier_ids = [], hourly_rate = 30 } = {}) {
  if (!(hourly_rate >= 0) || !Number.isFinite(hourly_rate)) throw new Error('Некоректна погодинна ставка');
  const inputErrors = checkSchema({ automation_id: record.id, variant_id, answers, modifier_ids }, automationSchema.$defs.ProjectSelection);
  if (inputErrors.length) throw new Error(`Некоректні параметри оцінки:\n${inputErrors.join('\n')}`);
  const questions = new Map(record.configurator_questions.map(question => [question.id, question]));
  for (const id of Object.keys(answers)) if (!questions.has(id)) throw new Error(`Невідоме запитання ${id} для ${record.id}`);
  const variant = record.variants.find(item => item.id === variant_id);
  if (!variant) throw new Error(`Невідомий варіант ${variant_id} для ${record.id}`);
  let hours_min = variant.hours_min;
  let hours_max = variant.hours_max;
  const assumptions = [`Оцінка для варіанта «${variant.title}» за ставкою ${hourly_rate} USD/год.`];
  const warnings = [];
  const dependencies = record.dependencies.map(item => ({ ...item }));
  const recommendations = [];
  const unresolved_questions = [];
  if (new Set(modifier_ids).size !== modifier_ids.length) throw new Error('Модифікатор не можна застосувати двічі');
  for (const id of modifier_ids) {
    const modifier = variant.pricing_modifiers.find(item => item.id === id);
    if (!modifier) throw new Error(`Невідомий модифікатор ${id} для ${record.id}/${variant.id}`);
    hours_min += modifier.hours_min;
    hours_max += modifier.hours_max;
    assumptions.push(`Модифікатор: ${modifier.label}`);
  }
  for (const question of visibleQuestions(record, answers)) {
    const answer = answers[question.id];
    if (answer === undefined || answer === null || answer === '') {
      if (question.required) {
        warnings.push(`Не відповіли на запитання: ${question.question}`);
        unresolved_questions.push(question.id);
      }
      continue;
    }
    if (question.type === 'single_select' && !question.options.includes(answer)) throw new Error(`Некоректна відповідь на ${question.id}`);
    if (question.type === 'boolean' && typeof answer !== 'boolean') throw new Error(`Некоректна відповідь на ${question.id}`);
    if (question.type === 'number' && (typeof answer !== 'number' || !Number.isFinite(answer))) throw new Error(`Некоректна відповідь на ${question.id}`);
    for (const effect of question.effects) {
      if (answer !== effect.when) continue;
      hours_min += effect.add_hours_min ?? 0;
      hours_max += effect.add_hours_max ?? 0;
      if (effect.add_dependency_id) dependencies.push({ type: 'requires', target_id: effect.add_dependency_id, reason: `Відповідь на «${question.question}»` });
      if (effect.warning) warnings.push(effect.warning);
      if (effect.assumption) assumptions.push(effect.assumption);
      if (effect.recommend_variant_id) recommendations.push(effect.recommend_variant_id);
    }
  }
  const uniqueDependencies = [...new Map(dependencies.map(item => [`${item.type}:${item.target_id}`, item])).values()];
  return {
    automation_id: record.id, variant_id: variant.id,
    answers: structuredClone(answers), modifier_ids: [...modifier_ids], hourly_rate,
    hours_min, hours_max,
    price_usd_min: roundMoney(hours_min * hourly_rate), price_usd_max: roundMoney(hours_max * hourly_rate),
    excluded_work: [...(variant.excluded_work ?? defaultExcludedWork)],
    confidence: record.status === 'draft' || record.sources.every(source => source.type === 'inferred_pattern') ? 'preliminary' : 'reviewed',
    assumptions, warnings, dependencies: uniqueDependencies,
    recommended_variant_ids: [...new Set(recommendations)], unresolved_questions
  };
}

export function composeProject(records, selections, { hourly_rate = 30 } = {}) {
  const inputErrors = checkSchema({ schema_version: 1, selections, hourly_rate }, automationSchema.$defs.Project);
  if (inputErrors.length) throw new Error(`Некоректні параметри проєкту:\n${inputErrors.join('\n')}`);
  const catalog = byId(records);
  const selected = new Map();
  for (const selection of selections) {
    if (selected.has(selection.automation_id)) throw new Error(`Повторна автоматизація в проєкті: ${selection.automation_id}`);
    selected.set(selection.automation_id, { ...structuredClone(selection), source: 'selected' });
  }
  const estimates = new Map();
  const visiting = new Set();
  const visit = id => {
    if (estimates.has(id)) return;
    // A↔B means both automations are needed; the ancestor is already queued.
    if (visiting.has(id)) return;
    const record = catalog.get(id);
    if (!record) throw new Error(`Невідома автоматизація ${id}`);
    visiting.add(id);
    const choice = selected.get(id) ?? { automation_id: id, variant_id: record.variants[0].id, source: 'required_dependency' };
    selected.set(id, choice);
    const estimate = estimateAutomation(record, { ...choice, hourly_rate });
    for (const dependency of estimate.dependencies.filter(item => item.type === 'requires')) visit(dependency.target_id);
    estimates.set(id, estimate);
    visiting.delete(id);
  };
  for (const id of selected.keys()) visit(id);
  const items = [...estimates].sort(([a], [b]) => a.localeCompare(b)).map(([id, estimate]) => ({
    ...estimate, source: selected.get(id).source
  }));
  const incompatible = items.flatMap(item => item.dependencies.filter(dep => dep.type === 'incompatible' && selected.has(dep.target_id)).map(dep =>
    `${item.automation_id} несумісна з ${dep.target_id}: ${dep.reason}`));
  return {
    schema_version: 1,
    selections: structuredClone(selections), hourly_rate,
    items,
    hours_min: items.reduce((sum, item) => sum + item.hours_min, 0),
    hours_max: items.reduce((sum, item) => sum + item.hours_max, 0),
    price_usd_min: roundMoney(items.reduce((sum, item) => sum + item.price_usd_min, 0)),
    price_usd_max: roundMoney(items.reduce((sum, item) => sum + item.price_usd_max, 0)),
    assumptions: [...new Set(items.flatMap(item => item.assumptions))],
    warnings: [...new Set([...items.flatMap(item => item.warnings), ...incompatible])],
    excluded_work: [...new Set(items.flatMap(item => item.excluded_work))],
    confidence: items.some(item => item.confidence === 'preliminary') ? 'preliminary' : 'reviewed',
    unresolved_questions: items.flatMap(item => item.unresolved_questions.map(question_id => ({ automation_id: item.automation_id, question_id })))
  };
}
