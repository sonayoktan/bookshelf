const FAMOUS_AUTHORS = [
  { match: /достоевск|dostoev|dostoyev/i, name: 'Fyodor Dostoyevski' },
  { match: /толсто|tolstoy|tolstoi/i, name: 'Lev Tolstoy' },
  { match: /чехов|chekhov|tchekhov/i, name: 'Anton Çehov' },
  { match: /гогол|gogol/i, name: 'Nikolay Gogol' },
  { match: /пушкин|pushkin/i, name: 'Aleksandr Puşkin' },
  { match: /булгаков|bulgakov/i, name: 'Mihail Bulgakov' },
  { match: /тургенев|turgenev/i, name: 'İvan Turgenyev' },
  { match: /горьк|gorky|gorki/i, name: 'Maksim Gorki' },
  { match: /набоков|nabokov/i, name: 'Vladimir Nabokov' },
  { match: /пастернак|pasternak/i, name: 'Boris Pasternak' },
  { match: /солженицын|solzhenitsyn/i, name: 'Aleksandr Soljenitsın' },
  { match: /лермонтов|lermontov/i, name: 'Mihail Lermontov' },
  { match: /маяковск|mayakovsky/i, name: 'Vladimir Mayakovski' },
  { match: /есенин|yesenin|esenin/i, name: 'Sergey Yesenin' },
  { match: /ахматова|akhmatova/i, name: 'Anna Ahmatova' },
  { match: /цветаева|tsvetayeva/i, name: 'Marina Tsvetayeva' },
  { match: /платонов|platonov/i, name: 'Andrey Platonov' }
];

const CYRILLIC_TO_LATIN = {
  'А':'A','а':'a','Б':'B','б':'b','В':'V','в':'v','Г':'G','г':'g',
  'Д':'D','д':'d','Е':'E','е':'e','Ё':'Yo','ё':'yo','Ж':'Zh','ж':'zh',
  'З':'Z','з':'z','И':'I','и':'i','Й':'Y','й':'y','К':'K','к':'k',
  'Л':'L','л':'l','М':'M','м':'m','Н':'N','н':'n','О':'O','о':'o',
  'П':'P','п':'p','Р':'R','р':'r','С':'S','с':'s','Т':'T','т':'t',
  'У':'U','у':'u','Ф':'F','ф':'f','Х':'H','х':'h','Ц':'Ts','ц':'ts',
  'Ч':'Ch','ч':'ch','Ш':'Sh','ш':'sh','Щ':'Shch','щ':'shch',
  'Ъ':'','ъ':'','Ы':'Y','ы':'y','Ь':'','ь':'','Э':'E','э':'e',
  'Ю':'Yu','ю':'yu','Я':'Ya','я':'ya'
};

export function ensureLatinAuthor(str) {
  if (!str) return 'Bilinmeyen Yazar';

  // 1. Ünlü klasik yazarlar sözlüğü kontrolü
  for (const fa of FAMOUS_AUTHORS) {
    if (fa.match.test(str)) {
      return fa.name;
    }
  }

  // 2. Kiril harfleri içeriyorsa Latin harflerine çevir
  if (/[\u0400-\u04FF]/.test(str)) {
    return str
      .split('')
      .map(ch => (CYRILLIC_TO_LATIN[ch] !== undefined ? CYRILLIC_TO_LATIN[ch] : ch))
      .join('')
      .trim();
  }

  return str;
}
