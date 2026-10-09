import { records as legacyRecords, taxonomy, labels } from './data.js';
import { records as phase4Records0 } from './data-phase4-0436-0460.js';
export const records = [...legacyRecords, ...phase4Records0];
export { taxonomy, labels };
export { byId, search } from './catalog.js';
export { composeProject, estimateAutomation, visibleQuestions } from './engine.js';
export { validateCatalog } from './validate.js';

