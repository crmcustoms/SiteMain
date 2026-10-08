export function byId(records) {
  return new Map(records.map(record => [record.id, record]));
}

// Search uses meaningful Ukrainian words rather than substring matches on prepositions.
export function searchWords(value) {
  const stop = new Set(['як','що','щоб','хто','чому','коли','де','чи','і','й','та','або','з','із','зі','у','в','до','для','на','по','про','за','між','від','не','без','це','є','мені','нас','наш','наші']);
  const aliases = { дебіторка: 'прострочена оплата', онбординг: 'адаптація' };
  return [...new Set((String(value).toLocaleLowerCase('uk').match(/[\p{L}\p{N}]+/gu) ?? []).flatMap(word => (aliases[word] ?? word).split(' ')).filter(word => !stop.has(word)))];
}
function wordMatches(query, word) {
  if (query === word) return true;
  const stem = value => value.length < 5 ? value : value.replace(/(?:ами|ями|ого|ому|ові|еві|ання|ення|ість|ії|ія|ники|ника|ків|ок|ий|ій|ої|ою|ом|ах|ях|ів|ам|ям|ти|а|я|у|ю|и|і|е|о)$/u, '');
  const a = stem(query), b = stem(word);
  return a.length >= 4 && b.length >= 4 && (a === b || a.startsWith(b) || b.startsWith(a));
}
export function search(records, query, limit = 10) {
  records = records.filter(record => record.status !== 'retired');
  const popularQueries = {
    'заявки губляться': 'як розподіляти нові заявки між менеджерами',
    'рахунки вручну': 'як створити рахунок із позицій підтвердженого замовлення',
    'дебіторка': 'як нагадати клієнту про прострочений рахунок',
    'залишки на складі': 'як повідомити про розбіжність фактичного і системного залишку',
    'договори на підпис': 'як контролювати хто затримує підписання договору',
    'онбординг працівника': 'як підготувати доступи і план адаптації нового співробітника',
    'звіт для власника': 'як отримувати щоденний звіт показників із кількох систем'
  };
  const normalized = String(query).toLocaleLowerCase('uk').trim().replace(/\s+/g, ' ');
  const tokens = searchWords(popularQueries[normalized] ?? query);
  if (!tokens.length) return [];
  const phrase = ' ' + tokens.join(' ') + ' ';
  const hits = records.map(record => {
    const weighted = [[record.title,6],[record.problem,4],[record.outcome,3],...record.problems.map(text=>[text,4]),...record.search_queries.map(text=>[text,3]),...record.synonyms.map(text=>[text,2]),[record.category,1],...record.roles.map(text=>[text,1]),...record.industries.map(text=>[text,1])].map(([value,weight])=>[searchWords(value),weight]);
    const matched = tokens.filter(token=>weighted.some(([words])=>words.some(word=>wordMatches(token,word))));
    const score = tokens.reduce((sum,token)=>sum+weighted.reduce((part,[words,weight])=>part+(words.some(word=>wordMatches(token,word))?weight:0),0),0);
    const exactPhrase = weighted.some(([words])=>(' '+words.join(' ')+' ').includes(phrase));
    return {id:record.id,title:record.title,score,exactPhrase,coverage:matched.length/tokens.length};
  }).filter(hit=>hit.score>0 && hit.coverage>=0.5);
  // A complete phrase ranks above partial matches; common words never qualify alone.
  const selected = hits;
  return selected.map(({exactPhrase,coverage,...hit})=>({...hit,score:hit.score+Math.round(coverage*100)+(exactPhrase ? Math.max(0,...hits.map(hit=>hit.score))+101 : 0)})).sort((a,b)=>b.score-a.score||a.id.localeCompare(b.id)).slice(0,limit);
}
