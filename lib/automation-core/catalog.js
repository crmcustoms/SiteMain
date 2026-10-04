export function byId(records) {
  return new Map(records.map(record => [record.id, record]));
}

export function search(records, query, limit = 10) {
  const tokens = query.toLocaleLowerCase().match(/[\p{L}\p{N}]+/gu) ?? [];
  if (!tokens.length) return [];
  const phrase = ` ${tokens.join(' ')} `;
  const hits = records.map(record => {
    const weighted = [
      [record.title, 6], [record.problem, 4], [record.outcome, 3],
      ...record.problems.map(text => [text, 4]),
      ...record.search_queries.map(text => [text, 3]),
      ...record.synonyms.map(text => [text, 2]),
      [record.category, 1], ...record.roles.map(text => [text, 1]),
      ...record.industries.map(text => [text, 1])
    ];
    const score = tokens.reduce((sum, token) => sum + weighted.reduce(
      (part, [value, weight]) => part + (value.toLocaleLowerCase().includes(token) ? weight : 0), 0
    ), 0);
    const exactPhrase = weighted.some(([value]) => {
      const words = value.toLocaleLowerCase().match(/[\p{L}\p{N}]+/gu) ?? [];
      return ` ${words.join(' ')} `.includes(phrase);
    });
    return { id: record.id, title: record.title, score, exactPhrase };
  }).filter(hit => hit.score > 0);
  // A whole phrase outranks scattered common words, including in the web catalog.
  const phraseBonus = Math.max(0, ...hits.map(hit => hit.score)) + 1;
  return hits.map(({ exactPhrase, ...hit }) => ({ ...hit, score: hit.score + (exactPhrase ? phraseBonus : 0) }))
    .sort((a, b) => b.score - a.score || a.id.localeCompare(b.id)).slice(0, limit);
}
