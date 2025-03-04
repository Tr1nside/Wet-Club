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

editor.on('change', function() {
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
