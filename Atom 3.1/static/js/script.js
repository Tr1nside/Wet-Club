const body = document.body;
const nightModeButton = document.querySelector('.night-mode');
const tabs = document.querySelector('.tabs');
let tabCounter = 2; // Счетчик для новых вкладок
const consoleOutput = document.querySelector('.console-output');
const consoleInput = document.querySelector('.console-input');
let codeMirrorInstances = {};

consoleInput.addEventListener('focus', () => {
    if (consoleInput.readOnly) {
        consoleInput.blur(); // Убираем фокус, если поле readonly
    }
});

// Изначально поле ввода заблокировано
consoleInput.readOnly = true;

// Функция для обновления классов consoleInput
function updateConsoleInputClass() {
    if (consoleInput.readOnly) {
        consoleInput.classList.remove('console-input-active');
    } else {
        consoleInput.classList.add('console-input-active');
    }
}

// Вызываем функцию для инициализации класса
updateConsoleInputClass();

// Пример функции для эмуляции запроса от сервера
function simulateServerRequest() {
    consoleOutput.value += "\nСервер: Требуется дополнительный параметр. Введите команду:";
    consoleInput.readOnly = false;
    updateConsoleInputClass();
}

// Добавляем кнопку или условие для эмуляции запроса
document.addEventListener('keydown', (event) => {
    if (event.key === 'Enter') {
        simulateServerRequest();
    }
});

// Переключение между режимами
nightModeButton.addEventListener('click', () => {
    body.classList.toggle('dark-mode');
    // Изменение значка луны на солнце и обратно
    nightModeButton.textContent = body.classList.contains('dark-mode') ? '☀️' : '🌙';

    // Обновление темы CodeMirror при смене режима
    for (const tabId in codeMirrorInstances) {
        const cm = codeMirrorInstances[tabId];
        cm.setOption("theme", body.classList.contains('dark-mode') ? "dracula" : "default");
    }
});
