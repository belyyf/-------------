const { countWords, countChars, applyFormatting, translateToEnglish } = require('./functions');

describe('Функция countWords', () => {
  test('подсчёт слов в обычном тексте', () => {
    expect(countWords('Hello world test')).toBe(3);
  });

  test('подсчёт слов с лишними пробелами', () => {
    expect(countWords('  Hello   world  ')).toBe(2);
  });

  test('пустой текст', () => {
    expect(countWords('')).toBe(0);
  });

  test('одно слово', () => {
    expect(countWords('word')).toBe(1);
  });
});

describe('Функция countChars', () => {
  test('подсчёт символов', () => {
    expect(countChars('Hello')).toBe(5);
  });

  test('пустой текст', () => {
    expect(countChars('')).toBe(0);
  });

  test('символы с пробелами', () => {
    expect(countChars('Hello World')).toBe(11);
  });
});

describe('Функция applyFormatting', () => {
  test('жирный текст', () => {
    expect(applyFormatting('text', { bold: true, italic: false, underline: false })).toBe('<b>text</b>');
  });

  test('курсив', () => {
    expect(applyFormatting('text', { bold: false, italic: true, underline: false })).toBe('<i>text</i>');
  });

  test('подчеркнутый', () => {
    expect(applyFormatting('text', { bold: false, italic: false, underline: true })).toBe('<u>text</u>');
  });

  test('все форматирования', () => {
    expect(applyFormatting('text', { bold: true, italic: true, underline: true })).toBe('<u><i><b>text</b></i></u>');
  });

  test('без форматирования', () => {
    expect(applyFormatting('text', { bold: false, italic: false, underline: false })).toBe('text');
  });
});

describe('Функция translateToEnglish', () => {
  test('перевод текста', () => {
    expect(translateToEnglish('Привет')).toBe('Translated: Привет');
  });

  test('перевод пустого текста', () => {
    expect(translateToEnglish('')).toBe('Translated: ');
  });
});
