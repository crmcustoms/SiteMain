import { checkSchema } from './schema-check.js';

export function validateCatalog(records, taxonomy) {
  if (!Array.isArray(records) || !records.length) return ['каталог: потрібна щонайменше одна картка'];
  const errors = [];
  const add = (where, message) => errors.push(`${where}: ${message}`);
  const seenIds = new Set();
  const seenSlugs = new Set();
  const knownIds = new Set(records.map(record => record?.id));
  for (const [index, record] of records.entries()) {
    const at = record?.id || `record[${index}]`;
    const structuralErrors = checkSchema(record);
    if (structuralErrors.length) {
      errors.push(...structuralErrors.map(message => `${at}: ${message}`));
      continue; // Semantic checks require a structurally valid card.
    }
    if (seenIds.has(record.id)) add(at, 'повторний ID');
    seenIds.add(record.id);
    if (seenSlugs.has(record.slug)) add(at, 'повторний slug');
    seenSlugs.add(record.slug);
    if (record.status === 'retired') {
      const replacement = records.find(item => item?.id === record.superseded_by);
      if (!replacement || replacement.id === record.id || replacement.status === 'retired') add(at, 'вилучена картка потребує чинної заміни');
    } else if (record.superseded_by) add(at, 'заміна дозволена лише для вилученої картки');
    if (!taxonomy.categories[record.category]?.includes(record.subcategory)) add(at, 'некоректна category/subcategory');
    for (const field of ['roles', 'industries']) {
      if (record[field].some(value => !taxonomy[field].includes(value))) add(at, `невідоме значення ${field}`);
    }
    for (const field of ['title', 'summary', 'problem', 'outcome', 'category', 'subcategory']) {
      if (!record[field].trim()) add(at, `порожнє поле ${field}`);
    }
    const variantIds = new Set();
    for (const variant of record.variants) {
      const place = `${at}.variants.${variant.id}`;
      if (variantIds.has(variant.id)) add(place, 'повторний ID варіанта');
      variantIds.add(variant.id);
      checkRange(variant.hours_min, variant.hours_max, place, add);
      const modifierIds = new Set();
      for (const modifier of variant.pricing_modifiers) {
        if (modifierIds.has(modifier.id)) add(place, 'повторний ID модифікатора');
        modifierIds.add(modifier.id);
        checkRange(modifier.hours_min, modifier.hours_max, `${place}.${modifier.id}`, add);
      }
      if (variant.editorial_price_hint) checkRange(variant.editorial_price_hint.min, variant.editorial_price_hint.max, `${place}.editorial_price_hint`, add, 'min', 'max');
    }
    for (const dependency of record.dependencies) {
      const place = `${at}.dependencies.${dependency.target_id}`;
      if (!knownIds.has(dependency.target_id)) add(place, 'зламане посилання залежності');
      if (dependency.target_id === record.id) add(place, 'залежність на саму себе');
    }
    const questionIds = new Set();
    const questions = new Map(record.configurator_questions.map(question => [question.id, question]));
    for (const question of record.configurator_questions) {
      const place = `${at}.configurator_questions.${question.id}`;
      if (questionIds.has(question.id)) add(place, 'повторний ID запитання');
      questionIds.add(question.id);
      if (question.type === 'single_select' && !question.options.length) add(place, 'потрібні варіанти відповіді');
      if (new Set(question.options).size !== question.options.length) add(place, 'повторні варіанти відповіді');
      if (question.show_if) {
        const parent = questions.get(question.show_if.question_id);
        if (!parent || parent.id === question.id || !validAnswer(parent, question.show_if.equals)) add(place, 'некоректна умова show_if');
      }
      for (const [index, effect] of question.effects.entries()) {
        const ep = `${place}.effects[${index}]`;
        if (!validAnswer(question, effect.when)) add(ep, 'умова when не відповідає типу або варіантам запитання');
        if (effect.add_dependency_id && !knownIds.has(effect.add_dependency_id)) add(ep, 'зламане посилання ефекту');
        if (effect.add_dependency_id === record.id) add(ep, 'залежність на саму себе');
        if (effect.recommend_variant_id && !variantIds.has(effect.recommend_variant_id)) add(ep, 'невідомий рекомендований варіант');
        if (effect.add_hours_min !== undefined || effect.add_hours_max !== undefined) {
          if (effect.add_hours_min === undefined || effect.add_hours_max === undefined) add(ep, 'потрібні обидві межі додаткових годин');
          else checkRange(effect.add_hours_min, effect.add_hours_max, ep, add, 'add_hours_min', 'add_hours_max');
        }
      }
    }
    for (const question of questions.values()) {
      const visited = new Set();
      let current = question;
      while (current?.show_if) {
        if (visited.has(current.id)) { add(at, `цикл умов show_if для ${question.id}`); break; }
        visited.add(current.id);
        current = questions.get(current.show_if.question_id);
      }
    }
  }
  return errors;
}

function validAnswer(question, value) {
  if (question.type === 'single_select') return question.options.includes(value);
  if (question.type === 'boolean') return typeof value === 'boolean';
  return typeof value === 'number' && Number.isFinite(value);
}

function checkRange(min, max, place, add, minKey = 'hours_min', maxKey = 'hours_max') {
  if (min > max) add(place, `${minKey} більше за ${maxKey}`);
}
