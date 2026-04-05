const { app, BrowserWindow, ipcMain } = require('electron');
const path = require('path');
const dotenv = require('dotenv');
const https = require('https');

// Загрузка переменных окружения
dotenv.config({ path: path.join(__dirname, '.env') });

let mainWindow;

// Проверка ключей API
const hfApiKey = process.env.HF_API_KEY || '';
const groqApiKey = process.env.GROQ_API_KEY || '';

if (!hfApiKey && !groqApiKey) {
  console.error('❌ Нет API ключа! Добавь HF_API_KEY или GROQ_API_KEY в .env');
}

// Hugging Face Inference API
const HF_API_URL = 'https://api-inference.huggingface.co/models/meta-llama/Llama-3.1-8B-Instruct';

// Промпты для разных задач
const SYSTEM_PROMPTS = {
  improve: '<|begin_of_text|><|start_header_id|>system<|end_header_id|>Ты помощник по улучшению текста. Улучши этот текст, сделай его более читаемым и грамотным, сохранив смысл. Верни только улучшенный текст.<|eot_id|><|start_header_id|>user<|end_header_id|>',
  rewrite: '<|begin_of_text|><|start_header_id|>system<|end_header_id|>Ты помощник по перефразированию. Перефразируй этот текст другими словами, сохранив смысл. Верни только перефразированный текст.<|eot_id|><|start_header_id|>user<|end_header_id|>',
  fix: '<|begin_of_text|><|start_header_id|>system<|end_header_id|>Ты редактор. Исправь все ошибки (орфографические, пунктуационные, грамматические) в этом тексте. Верни только исправленный текст без объяснений.<|eot_id|><|start_header_id|>user<|end_header_id|>',
  translate: '<|begin_of_text|><|start_header_id|>system<|end_header_id|>Ты переводчик. Переведи этот текст на английский язык. Верни только перевод.<|eot_id|><|start_header_id|>user<|end_header_id|>'
};

// Функция для запроса к Hugging Face API
function callHuggingFace(prompt, userText) {
  return new Promise((resolve, reject) => {
    const fullPrompt = `${prompt}${userText}<|eot_id|><|start_header_id|>assistant<|end_header_id|>`;
    
    const payload = {
      inputs: fullPrompt,
      parameters: {
        max_new_tokens: 512,
        temperature: 0.7,
        top_p: 0.95,
        return_full_text: false
      }
    };
    
    const data = JSON.stringify(payload);

    const options = {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${hfApiKey}`,
        'Content-Length': Buffer.byteLength(data)
      }
    };

    const req = https.request(HF_API_URL, options, (res) => {
      let responseData = '';
      
      res.on('data', (chunk) => {
        responseData += chunk;
      });
      
      res.on('end', () => {
        if (res.statusCode === 200) {
          try {
            const response = JSON.parse(responseData);
            const text = response[0]?.generated_text || 'Нет ответа';
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

// Промпты для разных задач
const PROMPTS = {
  improve: 'Улучши этот текст, сделай его более читаемым и грамотным, сохранив смысл:\n',
  rewrite: 'Перефразируй этот текст другими словами, сохранив смысл:\n',
  fix: 'Исправь все ошибки (орфографические, пунктуационные, грамматические) в этом тексте. Верни только исправленный текст без объяснений:\n',
  translate: 'Переведи этот текст на английский язык:\n'
};

// Обработчики IPC для ИИ-функций с Hugging Face API
ipcMain.handle('ai-improve-text', async (event, text) => {
  console.log('📦 Получен запрос на улучшение текста');
  console.log('🔑 HF API ключ:', hfApiKey ? '✓' : '✗');
  try {
    const response = await callHuggingFace(SYSTEM_PROMPTS.improve, text);
    console.log('✅ Ответ от HF (Llama):', response.substring(0, 100));
    return response;
  } catch (error) {
    console.error('❌ Ошибка HF:', error);
    throw new Error(`Hugging Face API ошибка: ${error.message}`);
  }
});

ipcMain.handle('ai-rewrite-text', async (event, text) => {
  console.log('📦 Получен запрос на перефразирование');
  try {
    const response = await callHuggingFace(SYSTEM_PROMPTS.rewrite, text);
    console.log('✅ Ответ от HF (Llama):', response.substring(0, 100));
    return response;
  } catch (error) {
    console.error('❌ Ошибка HF:', error);
    throw new Error(`Hugging Face API ошибка: ${error.message}`);
  }
});

ipcMain.handle('ai-fix-errors', async (event, text) => {
  console.log('📦 Получен запрос на исправление ошибок');
  try {
    const response = await callHuggingFace(SYSTEM_PROMPTS.fix, text);
    console.log('✅ Ответ от HF (Llama):', response.substring(0, 100));
    return response;
  } catch (error) {
    console.error('❌ Ошибка HF:', error);
    throw new Error(`Hugging Face API ошибка: ${error.message}`);
  }
});

ipcMain.handle('ai-translate-text', async (event, text) => {
  console.log('📦 Получен запрос на перевод');
  try {
    const response = await callHuggingFace(SYSTEM_PROMPTS.translate, text);
    console.log('✅ Ответ от HF (Llama):', response.substring(0, 100));
    return response;
  } catch (error) {
    console.error('❌ Ошибка HF:', error);
    throw new Error(`Hugging Face API ошибка: ${error.message}`);
  }
});
