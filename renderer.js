// Элементы управления
const editor = document.getElementById('editor');
const fontFamily = document.getElementById('fontFamily');
const fontSize = document.getElementById('fontSize');
const boldBtn = document.getElementById('boldBtn');
const italicBtn = document.getElementById('italicBtn');
const underlineBtn = document.getElementById('underlineBtn');
const aiImprove = document.getElementById('aiImprove');
const aiRewrite = document.getElementById('aiRewrite');
const aiFixErrors = document.getElementById('aiFixErrors');
const aiTranslate = document.getElementById('aiTranslate');
const aiResult = document.getElementById('aiResult');
const charCount = document.getElementById('charCount');
const wordCount = document.getElementById('wordCount');

// Форматирование текста
let isBold = false;
let isItalic = false;
let isUnderline = false;

// Изменение шрифта
fontFamily.addEventListener('change', () => {
  editor.style.fontFamily = fontFamily.value;
});

// Изменение размера
fontSize.addEventListener('change', () => {
  editor.style.fontSize = `${fontSize.value}px`;
});

// Жирный
boldBtn.addEventListener('click', () => {
  isBold = !isBold;
  editor.style.fontWeight = isBold ? 'bold' : 'normal';
  boldBtn.style.backgroundColor = isBold ? '#0078d4' : '#3c3c3c';
});

// Курсив
italicBtn.addEventListener('click', () => {
  isItalic = !isItalic;
  editor.style.fontStyle = isItalic ? 'italic' : 'normal';
  italicBtn.style.backgroundColor = isItalic ? '#0078d4' : '#3c3c3c';
});

// Подчеркнутый
underlineBtn.addEventListener('click', () => {
  isUnderline = !isUnderline;
  editor.style.textDecoration = isUnderline ? 'underline' : 'none';
  underlineBtn.style.backgroundColor = isUnderline ? '#0078d4' : '#3c3c3c';
});

// Подсчёт символов и слов
function updateCounts() {
  const text = editor.value;
  charCount.textContent = `Символов: ${text.length}`;
  wordCount.textContent = `Слов: ${text.trim() ? text.trim().split(/\s+/).length : 0}`;
}

editor.addEventListener('input', updateCounts);

// ИИ-функции
async function handleAiAction(action, text) {
  if (!text.trim()) {
    showResult('⚠️ Введите текст для обработки');
    return;
  }

  console.log('🔹 Отправка запроса:', action, 'Текст:', text.substring(0, 50));
  showResult('⏳ Обработка...');

  try {
    let result;
    switch (action) {
      case 'improve':
        console.log('🔹 Вызов improveText...');
        result = await window.electronAPI.improveText(text);
        console.log('🔹 Получен результат:', result);
        break;
      case 'rewrite':
        console.log('🔹 Вызов rewriteText...');
        result = await window.electronAPI.rewriteText(text);
        console.log('🔹 Получен результат:', result);
        break;
      case 'fix':
        console.log('🔹 Вызов fixErrors...');
        result = await window.electronAPI.fixErrors(text);
        console.log('🔹 Получен результат:', result);
        break;
      case 'translate':
        console.log('🔹 Вызов translateText...');
        result = await window.electronAPI.translateText(text);
        console.log('🔹 Получен результат:', result);
        break;
      default:
        result = text;
    }
    showResult(result);
  } catch (error) {
    console.error('❌ Ошибка ИИ:', error);
    showResult(`❌ Ошибка: ${error.message}`);
  }
}

function showResult(text) {
  aiResult.textContent = text;
  aiResult.classList.add('visible');
}

aiImprove.addEventListener('click', () => {
  handleAiAction('improve', editor.value);
});

aiRewrite.addEventListener('click', () => {
  handleAiAction('rewrite', editor.value);
});

aiFixErrors.addEventListener('click', () => {
  handleAiAction('fix', editor.value);
});

aiTranslate.addEventListener('click', () => {
  handleAiAction('translate', editor.value);
});

// Инициализация
updateCounts();
