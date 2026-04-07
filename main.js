const { app, BrowserWindow, ipcMain } = require('electron');
const path = require('path');
const dotenv = require('dotenv');
const https = require('https');

// Загрузка переменных окружения
dotenv.config({ path: path.join(__dirname, '.env') });

let mainWindow;

// Проверка ключей API
const openRouterKey = process.env.OPENROUTER_API_KEY || '';

if (!openRouterKey) {
  console.error('❌ Нет API ключа! Добавь OPENROUTER_API_KEY в .env');
}

// OpenRouter API
const OPENROUTER_API_URL = 'https://openrouter.ai/api/v1/chat/completions';

// Промпты для разных задач
const SYSTEM_PROMPTS = {
  improve: 'Ты помощник по улучшению текста. Улучши этот текст, сделай его более читаемым и грамотным, сохранив смысл. Верни только улучшенный текст.',
  rewrite: 'Ты помощник по перефразированию. Перефразируй этот текст другими словами, сохранив смысл. Верни только перефразированный текст.',
  fix: 'Ты редактор. Исправь все ошибки (орфографические, пунктуационные, грамматические) в этом тексте. Верни только исправленный текст без объяснений.',
  translate: 'Ты переводчик. Переведи этот текст на английский язык. Верни только перевод.'
};

// Функция для запроса к OpenRouter API
function callOpenRouter(systemPrompt, userText) {
  return new Promise((resolve, reject) => {
    const payload = {
      model: 'meta-llama/llama-3.1-8b-instruct',
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: userText }
      ],
      max_tokens: 512,
      temperature: 0.7
    };

    const data = JSON.stringify(payload);

    const options = {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${openRouterKey}`,
        'HTTP-Referer': 'https://github.com',
        'X-Title': 'Code Editor AI',
        'Content-Length': Buffer.byteLength(data)
      }
    };

    const req = https.request(OPENROUTER_API_URL, options, (res) => {
      let responseData = '';

      res.on('data', (chunk) => {
        responseData += chunk;
      });

      res.on('end', () => {
        if (res.statusCode === 200) {
          try {
            const response = JSON.parse(responseData);
            const text = response.choices?.[0]?.message?.content || 'Нет ответа';
            resolve(text.trim());
          } catch (e) {
            reject(new Error('Ошибка парсинга ответа: ' + e.message));
          }
        } else {
          reject(new Error(`HTTP ${res.statusCode}: ${responseData}`));
        }
      });
    });

    req.on('error', (error) => {
      reject(new Error('Ошибка запроса: ' + error.message));
    });

    req.write(data);
    req.end();
  });
}

function createWindow() {
  mainWindow = new BrowserWindow({
    width: 1200,
    height: 800,
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
      nodeIntegration: false,
      contextIsolation: true,
    },
  });

  mainWindow.loadFile('index.html');

  mainWindow.on('closed', () => {
    mainWindow = null;
  });
}

app.whenReady().then(() => {
  createWindow();

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) {
      createWindow();
    }
  });
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

// Обработчики IPC для ИИ-функций с OpenRouter API
ipcMain.handle('ai-improve-text', async (event, text) => {
  console.log('📦 Получен запрос на улучшение текста');
  console.log('🔑 OpenRouter API ключ:', openRouterKey ? '✓' : '✗');
  try {
    const response = await callOpenRouter(SYSTEM_PROMPTS.improve, text);
    console.log('✅ Ответ от OpenRouter:', response.substring(0, 100));
    return response;
  } catch (error) {
    console.error('❌ Ошибка OpenRouter:', error);
    throw new Error(`OpenRouter API ошибка: ${error.message}`);
  }
});

ipcMain.handle('ai-rewrite-text', async (event, text) => {
  console.log('📦 Получен запрос на перефразирование');
  try {
    const response = await callOpenRouter(SYSTEM_PROMPTS.rewrite, text);
    console.log('✅ Ответ от OpenRouter:', response.substring(0, 100));
    return response;
  } catch (error) {
    console.error('❌ Ошибка OpenRouter:', error);
    throw new Error(`OpenRouter API ошибка: ${error.message}`);
  }
});

ipcMain.handle('ai-fix-errors', async (event, text) => {
  console.log('📦 Получен запрос на исправление ошибок');
  try {
    const response = await callOpenRouter(SYSTEM_PROMPTS.fix, text);
    console.log('✅ Ответ от OpenRouter:', response.substring(0, 100));
    return response;
  } catch (error) {
    console.error('❌ Ошибка OpenRouter:', error);
    throw new Error(`OpenRouter API ошибка: ${error.message}`);
  }
});

ipcMain.handle('ai-translate-text', async (event, text) => {
  console.log('📦 Получен запрос на перевод');
  try {
    const response = await callOpenRouter(SYSTEM_PROMPTS.translate, text);
    console.log('✅ Ответ от OpenRouter:', response.substring(0, 100));
    return response;
  } catch (error) {
    console.error('❌ Ошибка OpenRouter:', error);
    throw new Error(`OpenRouter API ошибка: ${error.message}`);
  }
});
