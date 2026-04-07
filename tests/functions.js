// Функция подсчёта слов
function countWords(text) {
  return text.trim() ? text.trim().split(/\s+/).length : 0;
}

// Функция подсчёта символов
function countChars(text) {
  return text.length;
}

// Функция форматирования текста
function applyFormatting(text, options) {
  let result = text;
  if (options.bold) {
    result = `<b>${result}</b>`;
  }
  if (options.italic) {
    result = `<i>${result}</i>`;
  }
  if (options.underline) {
    result = `<u>${result}</u>`;
  }
  return result;
}

// Функция перевода 
function translateToEnglish(text) {
  return `Translated: ${text}`;
}

module.exports = { countWords, countChars, applyFormatting, translateToEnglish };
