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

// Функция для обновления номеров строк
function updateLineNumbers(cm, lineNumbers) {
    const numberOfLines = cm.lineCount();
    let numbers = "";
    for (let i = 1; i <= numberOfLines; i++) {
        numbers += i + "<br>";
    }
    lineNumbers.innerHTML = numbers;
}

// Функция для создания новой вкладки и редактора
function createNewTab() {
    tabCounter++;
    const newTabId = `tab${tabCounter}`;

    // Создаем новую вкладку
    const newTab = document.createElement('div');
    newTab.classList.add('tab');
    newTab.dataset.tab = newTabId;
    newTab.innerHTML = `<span>file${tabCounter - 1}.py</span><span class="close-tab">×</span>
                            <input type="text" class="tab-input" value="file${tabCounter - 1}.py">`;
    tabs.insertBefore(newTab, document.querySelector('.tab[data-tab="tab2"]'));

    // Создаем контейнер для CodeMirror
    const codeArea = document.createElement('div');
    codeArea.classList.add('code-area');
    codeArea.dataset.tabContent = newTabId;
    document.querySelector('.container').insertBefore(codeArea, document.querySelector('.toolbar'));

    // Инициализируем CodeMirror
    const cm = CodeMirror(codeArea, {
        mode: "python",
        theme: body.classList.contains('dark-mode') ? "dracula" : "default",
        lineNumbers: true,
        gutters: ["CodeMirror-linenumbers"]
    });

    codeMirrorInstances[newTabId] = cm;

    // Активируем новую вкладку
    activateTab(newTab);

    // Добавляем обработчик двойного клика
    newTab.addEventListener('dblclick', function () {
        startEditingTab(this);
    });

    // Добавляем обработчик для потери фокуса с input
    const inputElement = newTab.querySelector('.tab-input');
    inputElement.addEventListener('blur', function () {
        finishEditingTab(newTab);
    });
    // Добавляем обработчик нажатия Enter
    inputElement.addEventListener('keydown', function (event) {
        if (event.key === 'Enter') {
            finishEditingTab(newTab);
        }
    });
}

// Функция для активации вкладки
function activateTab(tab) {
    const tabId = tab.dataset.tab;

    // Сначала деактивируем все вкладки и контент
    document.querySelectorAll('.tab').forEach(tab => tab.classList.remove('active'));
    document.querySelectorAll('.code-area[data-tab-content]').forEach(content => {
        content.style.display = 'none';
    });

    // Активируем выбранную вкладку и контент
    tab.classList.add('active');
    const codeArea = document.querySelector(`.code-area[data-tab-content="${tabId}"]`);
    codeArea.style.display = 'block';

    // Обновляем размеры CodeMirror
    if (codeMirrorInstances[tabId]) {
        codeMirrorInstances[tabId].refresh();
    }
}

// Функция для закрытия вкладки
function closeTab(tab) {
    const tabId = tab.dataset.tab;

    // Получаем элементы вкладки и контента
    const tabElement = document.querySelector(`.tab[data-tab="${tabId}"]`);
    const codeAreaElement = document.querySelector(`.code-area[data-tab-content="${tabId}"]`);

    // Удаляем вкладку и контент
    tabElement.remove();
    codeAreaElement.remove();

    // Удаляем экземпляр CodeMirror, если он есть
    if (codeMirrorInstances[tabId]) {
        //codeMirrorInstances[tabId].toTextArea(); // Не нужно, т.к. нет textarea
        delete codeMirrorInstances[tabId];
    }

    // Если закрыли активную вкладку, активируем первую вкладку (если она существует)
    if (tab.classList.contains('active')) {
        const firstTab = document.querySelector('.tab:not([data-tab="tab2"])');
        if (firstTab) {
            activateTab(firstTab);
        }
    }
}

// Функция для начала редактирования вкладки
function startEditingTab(tab) {
    tab.classList.add('editing');
    const inputElement = tab.querySelector('.tab-input');
    inputElement.style.display = 'block';
    inputElement.focus();
}

// Функция для завершения редактирования вкладки
function finishEditingTab(tab) {
    tab.classList.remove('editing');
    const inputElement = tab.querySelector('.tab-input');
    const spanElement = tab.querySelector('span');
    spanElement.textContent = inputElement.value;
    inputElement.style.display = 'none';
}

// Обработчик клика на вкладки
tabs.addEventListener('click', (event) => {
    if (event.target.classList.contains('tab')) {
        const tab = event.target;
        if (tab.dataset.tab === 'tab2') { // Если кликнули на "+", создаем новую вкладку
            createNewTab();
        } else {
            activateTab(tab);
        }
    } else if (event.target.classList.contains('close-tab')) {
        const tab = event.target.parentNode;
        closeTab(tab);
    }
});

// Инициализация редактирования вкладки по двойному клику
tabs.addEventListener('dblclick', (event) => {
    if (event.target.classList.contains('tab') && event.target.dataset.tab !== 'tab2') {
        startEditingTab(event.target);
    }
});

// Инициализация начальной вкладки и CodeMirror
const initialTab = document.querySelector('.tab[data-tab="tab1"]');
const initialCodeArea = document.querySelector('.code-area[data-tab-content="tab1"]');

// Инициализируем CodeMirror
const cm = CodeMirror(initialCodeArea, {
    mode: "python",
    theme: body.classList.contains('dark-mode') ? "dracula" : "default",
    lineNumbers: true,
    gutters: ["CodeMirror-linenumbers"]
});

codeMirrorInstances['tab1'] = cm;
activateTab(initialTab);

// Добавляем обработчик двойного клика
initialTab.addEventListener('dblclick', function () {
    startEditingTab(this);
});

// Добавляем обработчик для потери фокуса с input
const initialInputElement = initialTab.querySelector('.tab-input');
initialInputElement.addEventListener('blur', function () {
    finishEditingTab(initialTab);
});

// Добавляем обработчик нажатия Enter
initialInputElement.addEventListener('keydown', function (event) {
    if (event.key === 'Enter') {
        finishEditingTab(initialTab);
    }
});


// ------------------------------------------------------------


const storedCode = localStorage.getItem("code");
if (storedCode) {
    document.getElementById("codeInput").value = storedCode; // Устанавливаем значение в поле ввода
}

const storedCons = localStorage.getItem("console");
if (storedCode) {
    document.getElementById("console").innerText = storedCons; // Устанавливаем значение в поле вывода
}

const socket = io();

// Инициализация редактора CodeMirror с настройками
let editor = CodeMirror.fromTextArea(document.getElementById('codeInput'), {
    lineNumbers: true,
    mode: "python",  // Устанавливаем Python как язык для подсветки
    theme: "default" // Устанавливаем стандартную тему
});

editor.on('change', function () {
    const code = editor.getValue();
    localStorage.setItem("code", code); // Сохраняем текущее значение в localStorage
});

// Переключение между светлой и тёмной темой
let darkMode = false;

if (!localStorage.getItem("darkMod")) {
    localStorage.setItem("darkMod", false);
    darkMode = false;
} else {
    darkMode = localStorage.getItem("darkMod");
    if (darkMode) {
        document.body.classList.toggle("dark", darkMode);  // Меняем класс для темы
        editor.setOption("theme", darkMode ? "dracula" : "default"); // Меняем тему CodeMirror
    }
}

function toggleTheme() {
    darkMode = !darkMode;
    localStorage.setItem("darkMod", darkMode);
    document.body.classList.toggle("dark", darkMode);  // Меняем класс для темы
    editor.setOption("theme", darkMode ? "dracula" : "default"); // Меняем тему CodeMirror
}

// Отправка кода на сервер для выполнения
function executeCode() {
    clearConsole();  // Очищаем консоль перед новым выводом
    const code = editor.getValue();  // Получаем текст из редактора
    socket.emit('execute', code);  // Отправляем код на сервер через WebSocket
}

// Очистка консоли вывода
function clearConsole() {
    localStorage.setItem("console", '')
    document.getElementById("console").innerText = "";
    document.getElementById("consoleInput").style.display = "none";  // Скрываем поле для ввода
}

// Функция для добавления текста в консоль
function appendToConsole(text) {
    const consoleDiv = document.getElementById("console");
    consoleDiv.innerText += text;  // Добавляем текст в консоль
    consoleDiv.scrollTop = consoleDiv.scrollHeight;  // Прокручиваем консоль вниз
    localStorage.setItem("console", document.getElementById("console").innerText)
}

// Обработчик события для вывода данных от сервера в консоль
socket.on('console_output', (data) => {
    appendToConsole(data + "\n");  // Добавляем вывод в консоль
    // Если сервер запросил ввод, показываем поле ввода
    document.getElementById("consoleInput").style.display = "block";
    document.getElementById("consoleInput").focus();
});

// Обработчик нажатия клавиши Enter в поле ввода консоли
function handleConsoleKeyPress(event) {
    if (event.key === "Enter") {
        const inputField = event.target;
        const value = inputField.value;  // Получаем введённое значение
        socket.emit('console_input', value);  // Отправляем на сервер
        appendToConsole(value + "\n");  // Добавляем в консоль
        inputField.value = "";  // Очищаем поле ввода
        inputField.style.display = "none";  // Скрываем поле ввода
        event.preventDefault();  // Отменяем стандартное поведение клавиши
    }
}

// Функция для сохранения содержимого консоли в текстовый файл
function saveCodeToFile() {
    const consoleContent = document.getElementById("codeInput").innerText;  // Получаем текст консоли
    const blob = new Blob([consoleContent], { type: "text/plain;charset=utf-8" });  // Создаём Blob объект

    // Создаём ссылку для скачивания
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);  // Преобразуем Blob в URL

    // Указываем имя файла для скачивания
    link.download = "code.txt";

    // Симулируем клик по ссылке для начала скачивания
    link.click();

    // Обратите внимание: это вызовет диалоговое окно для сохранения файла в выбранной папке
    // в зависимости от настроек браузера
}

function saveConsoleToFile() {
    const consoleContent = document.getElementById("console").innerText;  // Получаем текст консоли
    const blob = new Blob([consoleContent], { type: "text/plain;charset=utf-8" });  // Создаём Blob объект

    // Создаём ссылку для скачивания
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);  // Преобразуем Blob в URL

    // Указываем имя файла для скачивания
    link.download = "console_output.txt";

    // Симулируем клик по ссылке для начала скачивания
    link.click();

    // Обратите внимание: это вызовет диалоговое окно для сохранения файла в выбранной папке
    // в зависимости от настроек браузера
}

// Очистка консоли вывода
function clearConsole() {
    document.getElementById("console").innerText = "";  // Очищаем консоль
    document.getElementById("consoleInput").style.display = "none";  // Скрываем поле ввода
}

// Функция для показа уведомлений
function showNotification(message) {
    const notification = document.createElement("div");
    notification.className = "notification";  // Устанавливаем стиль уведомления
    notification.innerText = message;  // Устанавливаем текст уведомления

    // Добавляем уведомление в DOM
    document.body.appendChild(notification);

    // Показываем уведомление
    setTimeout(() => {
        notification.style.display = "block";  // Показываем уведомление
        notification.style.opacity = 1;  // Устанавливаем полную видимость
    }, 10);

    // Через 3 секунды скрываем уведомление
    setTimeout(() => {
        notification.style.opacity = 0;  // Уменьшаем прозрачность до 0
        setTimeout(() => {
            notification.remove();  // Удаляем уведомление из DOM
        }, 500);
    }, 1000);
}

// Функция для копирования содержимого консоли в буфер обмена
function copyToClipboard() {
    const consoleContent = document.getElementById("console").innerText;  // Получаем текст консоли
    navigator.clipboard.writeText(consoleContent)  // Копируем текст в буфер обмена
        .then(() => {
            showNotification("Текст скопирован в буфер обмена!");  // Показываем уведомление
        })
        .catch(err => {
            console.error("Ошибка при копировании: ", err);  // Логируем ошибку, если что-то пошло не так
        });
}
// Функция для загрузки файла и вставки его содержимого в редактор
function loadFile() {
    const fileInput = document.getElementById("fileInput"); // Получаем input-файл
    fileInput.click(); // Открываем диалог выбора файла

    fileInput.onchange = function () {
        const file = fileInput.files[0]; // Получаем выбранный файл
        if (!file) return;

        const reader = new FileReader();
        reader.onload = function (event) {
            editor.setValue(event.target.result); // Устанавливаем содержимое в редактор
        };
        reader.readAsText(file);
    };
}