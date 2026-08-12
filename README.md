<!DOCTYPE html>
<html lang="ru">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Сканер ДЗ онлайн</title>
    <style>
        body { font-family: Arial, sans-serif; max-width: 600px; margin: 20px auto; padding: 10px; text-align: center; }
        .box { border: 2px dashed #ccc; padding: 20px; border-radius: 10px; margin-bottom: 20px; background: #f9f9f9; }
        button { background: #007bff; color: white; border: none; padding: 10px 20px; font-size: 16px; border-radius: 5px; cursor: pointer; margin: 5px; }
        button:hover { background: #0056b3; }
        #output { text-align: left; background: #f1f1f1; padding: 15px; border-radius: 5px; white-space: pre-wrap; display: none; }
        input[type="text"] { width: 80%; padding: 10px; margin-bottom: 15px; border: 1px solid #ccc; border-radius: 5px; text-align: center; }
        img { max-width: 100%; max-height: 300px; margin-top: 15px; display: none; border-radius: 5px; }
    </style>
</head>
<body>

    <h1>📝 Сканер Домашнего Задания</h1>
    
    <!-- Поле для ключа (так как на GitHub Pages нельзя безопасно прятать ключи) -->
    <input type="text" id="apiKey" placeholder="Введите ваш Gemini API Key">
    <p><small>Ключ нужен для работы нейросети. Он не сохраняется на сервере.</small></p>

    <div class="box">
        <h3>Загрузите или сделайте фото ДЗ</h3>
        <!-- Кнопка выбора файла или камеры смартфона -->
        <input type="file" id="fileInput" accept="image/*" capture="environment" style="display: none;">
        <button onclick="document.getElementById('fileInput').click()">📸 Сделать фото / Выбрать файл</button>
        <br>
        <img id="preview" alt="Превью ДЗ">
    </div>

    <button id="scanBtn" disabled>🤖 Решить задание</button>

    <h3>Результат решения:</h3>
    <div id="output">Тут появится ответ нейросети...</div>

    <!-- Подключаем официальный SDK Google Gen AI для браузера -->
    <script type="importmap">
      {
        "imports": {
          "@google/genai": "https://esm.run"
        }
      }
    </script>

    <script type="module">
        import { GoogleGenAI } from '@google/genai';

        const fileInput = document.getElementById('fileInput');
        const preview = document.getElementById('preview');
        const scanBtn = document.getElementById('scanBtn');
        const output = document.getElementById('output');
        const apiKeyInput = document.getElementById('apiKey');

        let base64Image = null;
        let mimeType = null;

        // 1. Чтение файла и перевод его в Base64 для нейросети
        fileInput.addEventListener('change', (e) => {
            const file = e.target.files[0];
            if (!file) return;

            mimeType = file.type;
            const reader = new FileReader();
            
            reader.onload = (event) => {
                preview.src = event.target.result;
                preview.style.display = 'inline-block';
                // Отрезаем техническую часть "data:image/jpeg;base64,"
                base64Image = event.target.result.split(',')[1];
                scanBtn.disabled = false;
            };
            
            reader.readAsDataURL(file);
        });

        // 2. Отправка фото в Gemini API
        scanBtn.addEventListener('click', async () => {
            const apiKey = apiKeyInput.value.trim();
            if (!apiKey) {
                alert('Пожалуйста, введите ваш Gemini API Key!');
                return;
            }

            if (!base64Image) return;

            output.style.display = 'block';
            output.innerText = 'Нейросеть думает и решает задание, подождите...';
            scanBtn.disabled = true;

            try {
                // Инициализируем ИИ с ключом, который ввел пользователь
                const ai = new GoogleGenAI({ apiKey: apiKey });

                const response = await ai.models.generateContent({
                    model: 'gemini-2.5-flash',
                    contents: [
                        {
                            inlineData: {
                                mimeType: mimeType,
                                data: base64Image
                            }
                        },
                        "Распознай домашнее задание на этой картинке. Пошагово реши его и подробно объясни ответ на русском языке."
                    ],
                });

                output.innerText = response.text;
            } catch (error) {
                console.error(error);
                output.innerText = 'Произошла ошибка при обращении к ИИ: ' + error.message;
            } finally {
                scanBtn.disabled = false;
            }
        });
    </script>
</body>
</html>

