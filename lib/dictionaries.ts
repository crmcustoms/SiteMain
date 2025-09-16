// Кеш для словарей
const dictionaryCache: Record<string, any> = {}

const dictionaries = {
  uk: () => import("./dictionaries/uk.json").then((module) => module.default),
}

export const getDictionary = async (locale: string) => {
  // Проверяем наличие словаря в кеше
  if (dictionaryCache[locale]) {
    return dictionaryCache[locale]
  }

  // Загружаем словарь, если его нет в кеше
  const dict = await (dictionaries[locale as keyof typeof dictionaries]?.() ?? dictionaries.uk())
  
  // Сохраняем в кеше для будущих запросов
  dictionaryCache[locale] = dict
  
  return dict
}
