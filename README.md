<!DOCTYPE html>
<html lang="ru">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Интерактивный Сканер ДЗ в Реальном Времени</title>
    <style>
        :root {
            --primary: #4F46E5;
            --primary-hover: #4338CA;
            --bg-dark: #0F172A;
            --panel-bg: #1E293B;
            --text-light: #F8FAFC;
            --text-muted: #94A3B8;
            --success: #10B981;
            --warning: #F59E0B;
            --danger: #EF4444;
        }

        * {
            box-sizing: border-box;
            margin: 0;
            padding: 0;
            font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
        }

        body {
            background-color: var(--bg-dark);
            color: var(--text-light);
            min-height: 100vh;
            display: flex;
            flex-direction: column;
        }

        header {
            background-color: var(--panel-bg);
            padding: 1rem 2rem;
            border-bottom: 1px solid #334155;
            display: flex;
            justify-content: space-between;
            align-items: center;
        }

        header h1 {
            font-size: 1.5rem;
            color: var(--text-light);
            display: flex;
            align-items: center;
            gap: 10px;
        }

        .badge {
            background-color: var(--primary);
            font-size: 0.75rem;
            padding: 4px 8px;
            border-radius: 12px;
            text-transform: uppercase;
        }

        .main-container {
            display: flex;
            flex: 1;
            padding: 1.5rem;
            gap: 1.5rem;
            height: calc(100vh - 70px);
            overflow: hidden;
        }

        @media (max-width: 1024px) {
            .main-container {
                flex-direction: column;
                height: auto;
                overflow: vertical;
            }
            .scanner-section {
                height: 500px !important;
            }
        }

        /* Левая панель - Камера и управление */
        .scanner-section {
            flex: 1.2;
            display: flex;
            flex-direction: column;
            gap: 1rem;
            height: 100%;
        }

        .video-container {
            flex: 1;
            background-color: #000;
            border-radius: 16px;
            position: relative;
            overflow: hidden;
            border: 2px solid #334155;
            display: flex;
            align-items: center;
            justify-content: center;
        }

        video {
            width: 100%;
            height: 100%;
            object-fit: cover;
            transform: scaleX(1); /* Прямой поток для задней камеры */
        }

        /* Рамка фокуса под лист А4 / тетрадь */
        .homework-overlay {
            position: absolute;
            top: 10%;
            left: 10%;
            right: 10%;
            bottom: 10%;
            border: 3px dashed rgba(255, 255, 255, 0.4);
            border-radius: 12px;
            pointer-events: none;
            box-shadow: 0 0 0 9999px rgba(15, 23, 42, 0.6);
            display: flex;
            align-items: center;
            justify-content: center;
            transition: border-color 0.3s;
        }

        .homework-overlay.scanning {
            border-color: var(--primary);
        }

        /* Лазерная линия сканирования */
        .laser-line {
            display: none;
            position: absolute;
            left: 0;
            width: 100%;
            height: 4px;
            background: linear-gradient(180deg, rgba(79, 70, 229, 0) 0%, rgba(79, 70, 229, 1) 50%, rgba(79, 70, 229, 0) 100%);
            box-shadow: 0 0 12px var(--primary);
            animation: scan 3s infinite ease-in-out;
        }

        @keyframes scan {
            0% { top: 10%; }
            50% { top: 90%; }
            100% { top: 10%; }
        }

        .controls-card {
            background-color: var(--panel-bg);
            padding: 1rem;
            border-radius: 12px;
            display: flex;
            gap: 1rem;
            align-items: center;
            border: 1px solid #334155;
        }

        .btn {
            background-color: var(--primary);
            color: white;
            border: none;
            padding: 0.75rem 1.5rem;
            font-size: 1rem;
            font-weight: 600;
            border-radius: 8px;
            cursor: pointer;
            transition: all 0.2s;
            display: flex;
            align-items: center;
            gap: 8px;
        }

        .btn:hover {
            background-color: var(--primary-hover);
        }

        .btn-stop {
            background-color: var(--danger);
        }
        .btn-stop:hover {
            background-color: #DC2626;
        }

        .status-dot {
            width: 12px;
            height: 12px;
            background-color: var(--text-muted);
            border-radius: 50%;
            display: inline-block;
        }

        .status-dot.active {
            background-color: var(--success);
            animation: pulse 1.5s infinite;
        }

        @keyframes pulse {
            0% { transform: scale(1); opacity: 1; }
            50% { transform: scale(1.2); opacity: 0.5; }
            100% { transform: scale(1); opacity: 1; }
        }

        /* Правая панель - Данные ИИ анализа */
        .results-section {
            flex: 1;
            display: flex;
            flex-direction: column;
            gap: 1rem;
            height: 100%;
            overflow-y: auto;
            padding-right: 5px;
        }

        .results-section::-webkit-scrollbar {
            width: 6px;
        }
        .results-section::-webkit-scrollbar-thumb {
            background-color: #334155;
            border-radius: 3px;
        }

        .card {
            background-color: var(--panel-bg);
            border-radius: 12px;
            padding: 1.25rem;
            border: 1px solid #334155;
        }

        .card-title {
            font-size: 1.1rem;
            font-weight: 600;
            margin-bottom: 0.75rem;
            color: var(--text-muted);
            display: flex;
            justify-content: space-between;
            align-items: center;
        }

        .ocr-box {
            background-color: rgba(15, 23, 42, 0.5);
            border-radius: 8px;
            padding: 1rem;
            font-family: monospace;
            font-size: 0.9rem;
            white-space: pre-wrap;
            border-left: 4px solid var(--primary);
            min-height: 120px;
            max-height: 200px;
            overflow-y: auto;
        }

        .analysis-item {
            margin-bottom: 1rem;
            padding-bottom: 1rem;
            border-bottom: 1px solid #334155;
        }

        .analysis-item:last-child {
            margin-bottom: 0;
            padding-bottom: 0;
            border-bottom: none;
        }

        .grade-badge {
            font-size: 2rem;
            font-weight: 800;
            color: var(--success);
            text-align: center;
            padding: 0.5rem;
            background-color: rgba(16, 185, 129, 0.1);
            border-radius: 8px;
            border: 1px solid rgba(16, 185, 129, 0.2);
        }

        .grade-badge.bad {
            color: var(--danger);
            background-color: rgba(239, 68, 68, 0.1);
            border-radius: 8px;
            border: 1px solid rgba(239, 68, 68, 0.2);
        }

        .error-highlight {
            color: var(--danger);
            background-color: rgba(239, 68, 68, 0.15);
            padding: 2px 6px;
            border-radius: 4px;
            font-weight: bold;
        }

        .tip-box {
            background-color: rgba(245, 158, 11, 0.1);
            border-left: 4px solid var(--warning);
            padding: 0.75rem;
            border-radius: 0 8px 8px 0;
            margin-top: 0.5rem;
            font-size: 0.9rem;
        }

        .placeholder-text {
            color: var(--text-muted);
            font-style: italic;
            text-align: center;
            padding: 2rem 0;
        }
    </style>
</head>
<body>

    <header>
        <h1>📝 ДЗ-Сканер <span class="badge">Live Vision AI</span></h1>
        <div>Режим: Проверка математики и рукописного текста</div>
    </header>

    <div class="main-container">
        
        <!-- Левая часть: Камера -->
        <div class="scanner-section">
            <div class="video-container">
                <video id="webcam" autoplay playsinline muted></video>
                <div class="homework-overlay" id="overlay">
                    <div class="laser-line" id="laser"></div>
                </div>
                <div id="camera-fallback" style="position: absolute; color: var(--text-muted); text-align: center; display: none; padding: 20px;">
                    📷 Камера не активна. Нажмите кнопку ниже для запуска стрима.
                </div>
            </div>

            <div class="controls-card">
                <button id="btn-toggle" class="btn">🚀 Начать стрим-анализ</button>
                <div>
                    <span id="status-indicator" class="status-dot"></span>
                    <span id="status-text" style="margin-left: 8px; font-size: 0.9rem; color: var(--text-muted);">Камера отключена</span>
                </div>
            </div>
        </div>

        <!-- Правая часть: Аналитика нейросети -->
        <div class="results-section">
            
            <!-- Модуль 1: Распознанный текст (OCR) -->
            <div class="card">
                <div class="card-title">
                    <span>Распознанный текст с листа (OCR)</span>
                    <span style="font-size: 0.8rem; color: var(--primary);">Обновление в реальном времени</span>
                </div>
                <div id="ocr-output" class="ocr-box">Наведите камеру на тетрадь и запустите сканирование. Текст появится здесь автоматически...</div>
            </div>

            <!-- Модуль 2: Разбор ошибок и Инсайт -->
            <div class="card">
                <div class="card-title">Анализ хода решения нейросетью</div>
                <div id="analysis-output">
                    <div class="placeholder-text">Ожидание первого кадра для детального разбора...</div>
                </div>
            </div>

            <!-- Модуль 3: Оценка -->
            <div class="card">
                <div class="card-title">Итоговый вердикт ИИ</div>
                <div id="grade-output">
                    <div class="placeholder-text">—</div>
                </div>
            </div>

        </div>
    </div>

    <script>
        const video = document.getElementById('webcam');
        const btnToggle = document.getElementById('btn-toggle');
        const statusIndicator = document.getElementById('status-indicator');
        const statusText = document.getElementById('status-text');
        const overlay = document.getElementById('overlay');
        const laser = document.getElementById('laser');
        const cameraFallback = document.getElementById('camera-fallback');

        // Элементы вывода данных
        const ocrOutput = document.getElementById('ocr-output');
        const analysisOutput = document.getElementById('analysis-output');
        const gradeOutput = document.getElementById('grade-output');

        let streamActive = false;
        let localStream = null;
        let analysisInterval = null;
        let stepCounter = 0;

        // Имитация базы данных проверок для демонстрации реального времени (без штрихкодов!)
        const mockAIAnswers = [
            {
                ocr: "Домашняя работа\nЗадача 1.\nСкорость поезда 60 км/ч. Время 3 часа.\nНайти расстояние.\nРешение:\nS = v * t = 60 * 3 = 180 (км)\nОтвет: 180 км.",
                analysis: `
                    <div class="analysis-item">
                        <strong>Тема задания:</strong> Движение и формулы расстояния (4 класс).
                    </div>
                    <div class="analysis-item">
                        <strong>Проверка логики:</strong> Формула выбрана верно. Подстановка чисел правильная. Вычисления выполнены без ошибок.
                    </div>
                    <div class="analysis-item">
                        <strong>Оформление:</strong> Наименования (км) указаны, ответ записан полностью. Рукописный почерк распознан на 98%.
                    </div>
                `,
                grade: `<div class="grade-badge">Оценка: 5 / Отлично!</div>`
            },
            {
                ocr: "Примеры:\n2 + 2 * 2 = 8\n(15 - 5) : 2 = 5\n120 - 20 * 3 = 300",
                analysis: `
                    <div class="analysis-item">
                        <strong>Теma задания:</strong> Порядок арифметических действий.
                    </div>
                    <div class="analysis-item">
                        <strong>Найденные ошибки:</strong> 
                        <br>1) В первом примере <span class="error-highlight">2 + 2 * 2 = 8</span> нарушен приоритет умножения. Сначала выполняется умножение, затем сложение. Правильно: 6.
                        <br>2) В третьем примере <span class="error-highlight">120 - 20 * 3 = 300</span> ученик сначала вычел, а потом умножил. Правильно: 120 - 60 = 60.
                    </div>
                    <div class="analysis-item">
                        <strong>Рекомендация для ученика:</strong>
                        <div class="tip-box">
                            💡 <strong>Подсказка ИИ:</strong> Вспомни правило! Умножение и деление всегда выполняются в первую очередь, если нет скобок. Перепроверь примеры 1 и 3.
                        </div>
                    </div>
                `,
                grade: `<div class="grade-badge bad">Оценка: 3 / Требует исправления</div>`
            }
        ];

        // Включение / Выключение камеры
        async function toggleScanner() {
            if (!streamActive) {
                try {
                    // Запрашиваем только видеопоток, отдавая приоритет задней камере на телефонах
                    localStream = await navigator.mediaDevices.getUserMedia({
                        video: {
                            facingMode: 'environment',
                            width: { ideal: 1280 },
                            height: { ideal: 720 }
                        },
                        audio: false
                    });
                    
                    video.srcObject = localStream;
                    video.style.display = 'block';
                    cameraFallback.style.display = 'none';
                    
                    // Обновление интерфейса
                    streamActive = true;
                    btnToggle.textContent = "🛑 Остановить сканер";
                    btnToggle.classList.add('btn-stop');
                    statusIndicator.classList.add('active');
                    statusText.textContent = "Сканирование видеопотока (Live)...";
                    laser.style.display = 'block';
                    overlay.classList.add('scanning');

                    // Запуск симуляции непрерывного ИИ-анализа каждые 5 секунд
                    runLiveAIAnalysis();
                    analysisInterval = setInterval(runLiveAIAnalysis, 5000);

                } catch (err) {
                    console.error("Ошибка доступа к камере: ", err);
                    alert("Не удалось запустить камеру. Проверьте разрешения или запустите на HTTPS/локальном сервере. Переключаюсь в режим демо-симулятора.");
                    
                    // Демо-режим если физической камеры нет
                    video.style.display = 'none';
                    cameraFallback.style.display = 'block';
                    streamActive = true;
                    btnToggle.textContent = "🛑 Остановить симуляцию";
                    btnToggle.classList.add('btn-stop');
                    statusIndicator.classList.add('active');
                    statusText.textContent = "Демонстрационный стрим-анализ...";
                    laser.style.display = 'block';
                    
                    runLiveAIAnalysis();
                    analysisInterval = setInterval(runLiveAIAnalysis, 5000);
                }
            } else {
                // Выключение
                stopScanner();
            }
        }

        function stopScanner() {
            if (localStream) {
                localStream.getTracks().forEach(track => track.stop());
            }
            video.srcObject = null;
            streamActive = false;
            
            btnToggle.textContent = "🚀 Начать стрим-анализ";
            btnToggle.classList.remove('btn-stop');
            statusIndicator.classList.remove('active');
            statusText.textContent = "Камера отключена";
            laser.style.display = 'none';
            overlay.classList.remove('scanning');
            
            clearInterval(analysisInterval);
        }

        // Функция имитации стриминг-анализа тетрадного листа
        function runLiveAIAnalysis() {
            // Переключаемся между двумя разными тетрадными листами для демонстрации динамики
            const currentMockData = mockAIAnswers[stepCounter % mockAIAnswers.length];
            
            // Плавное обновление данных на экране, как будто ИИ обработал кадр
            ocrOutput.style.opacity = 0.5;
            analysisOutput.style.opacity = 0.5;
            
            setTimeout(() => {
                ocrOutput.textContent = currentMockData.ocr;
                analysisOutput.innerHTML = currentMockData.analysis;
                gradeOutput.innerHTML = currentMockData.grade;
                
                ocrOutput.style.opacity = 1;
                analysisOutput.style.opacity = 1;
                
                stepCounter++;
            }, 400);
        }

        btnToggle.addEventListener('click', toggleScanner);
    </script>
</body>
</html>

