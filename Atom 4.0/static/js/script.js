alertitem = document.getElementById("alert-item");
alertitem.hidden = true;
file2 = document.getElementById("file2");
file3 = document.getElementById("file3");
delfile2 = document.getElementById("delfile2");
addfile2 = document.getElementById("addfile2");
delfile3 = document.getElementById("delfile3");
addfile3 = document.getElementById("addfile3");
filer1 = document.getElementById("fileredact1");
filer2 = document.getElementById("fileredact2");
filer3 = document.getElementById("fileredact3");
file2.hidden = true;
file3.hidden = true;
let count = 1
addfile2.onclick = function() {
    file2.hidden = false;
    count += 1;
    addfile2.hidden = true;
}

delfile2.onclick = function() {
<<<<<<< HEAD
    file2.hidden = false;
=======
    file2.hidden = 1;
>>>>>>> 08502b23572e08c9bffb91064b0374363831e27d
    count -= 1
    if (count == 1){
        addfile2.hidden = false;
    }
}

addfile3.onclick = function() {
    file3.hidden = false;
    addfile3.hidden = true;
    count += 1;
}

delfile3.onclick = function() {
    file3.hidden = true;
    addfile3.hidden = false;
    count -= 1;
    if (count == 1){
        addfile2.hidden = false;
    }
}

const socket = io();

let editor = CodeMirror.fromTextArea(document.getElementById('codeInput'), {
lineNumbers: true,
mode: "python",  // Устанавливаем Python как язык для подсветки
theme: "default" // Устанавливаем стандартную тему
});
editor.setSize(1320,370);


editor.on('change', function() {
    const code = editor.getValue();
    localStorage.setItem("code", code); // Сохраняем текущее значение в localStorage
});


document.getElementById('changed2').hidden = true;
document.getElementById('changed1').onclick = function() {
    document.getElementById('changed2').hidden = false;
    document.getElementById('changed1').hidden = true;
}
document.getElementById('changed2').onclick = function() {
    document.getElementById('changed1').hidden = false;
    document.getElementById('changed2').hidden = true;
}
console_out = document.getElementById("console_out");
concleartr = document.getElementById("consoletr");
concleartr.onclick = function() {
    cleartext.value = "";
}

document.querySelector('.image-copy').addEventListener('click', () => {
    navigator.clipboard.writeText(document.getElementById('console_out').value);
    alertitem.hidden = false;

    setTimeout(() => alertitem.hidden = true, 5000);
})

const storedCode = localStorage.getItem("code");
if (storedCode) {
    document.getElementById("codeInput").value = storedCode; // Устанавливаем значение в поле ввода

}
const storedCons = localStorage.getItem("console-output");
if (storedCode) {
    document.getElementById("console-output").value = storedCons; // Устанавливаем значение в поле вывода

}

// Функция для переключения темы
function toggleTheme() {
    console.log("PIZDA BOBRA")
    const body = document.body;
    body.classList.toggle('dark'); // Переключаем класс 'dark'

    // Сохраняем текущую тему в localStorage
    if (body.classList.contains('dark')) {
        localStorage.setItem('theme', 'dark');
    } else {
        localStorage.setItem('theme', 'light');
    }
}

// Проверка сохраненной темы при загрузке страницы
window.onload = function() {
    const savedTheme = localStorage.getItem('theme');
    if (savedTheme === 'dark') {
        document.body.classList.add('dark'); // Устанавливаем темную тему
    }
};


// Отправка кода на сервер для выполнения
function executeCode() {
    console.log('start')
    clearConsole();  // Очищаем консоль перед новым выводом
    const code = editor.getValue();  // Получаем текст из редактора
    socket.emit('execute', code);  // Отправляем код на сервер через WebSocket
}

// Очистка консоли вывода
function clearConsole() {
    localStorage.setItem("console-output", '')
    document.getElementById("console-output").value = "";
    // document.getElementById("consoleInput").style.display = "none";  // Скрываем поле для ввода
}

// Функция для добавления текста в консоль
function appendToConsole(text) {
    const consoleDiv = document.getElementById("console-output");
    consoleDiv.value += text;  // Добавляем текст в консоль
    consoleDiv.scrollTop = consoleDiv.scrollHeight;  // Прокручиваем консоль вниз
    localStorage.setItem("console-output", document.getElementById("console-output").value)
}

// Обработчик события для вывода данных от сервера в консоль
socket.on('console_output', (data) => {
    appendToConsole(data + "\n");  // Добавляем вывод в консоль
    // // Если сервер запросил ввод, показываем поле ввода
    // document.getElementById("consoleInput").style.display = "block";
    // document.getElementById("consoleInput").focus();
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
    const consoleContent = document.getElementById("codeInput").value;  // Получаем текст консоли
    const blob = new Blob([consoleContent], { type: "text/plain;charset=utf-8" });  // Создаём Blob объект

    // Создаём ссылку для скачивания
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);  // Преобразуем Blob в URL

    // Указываем имя файла для скачивания
    link.download = "code.py";

    // Симулируем клик по ссылке для начала скачивания
    link.click();

    // Обратите внимание: это вызовет диалоговое окно для сохранения файла в выбранной папке
    // в зависимости от настроек браузера
}

function saveConsoleToFile() {
    const consoleContent = document.getElementById("console-output").value;  // Получаем текст консоли
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
    document.getElementById("console-output").value = "";  // Очищаем консоль
    // document.getElementById("consoleInput").style.display = "none";  // Скрываем поле ввода
}
// Функция для показа уведомлений
function showNotification(message) {
    const notification = document.createElement("div");
    notification.className = "notification";  // Устанавливаем стиль уведомления
    notification.value = message;  // Устанавливаем текст уведомления

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
    const consoleContent = document.getElementById("console-output").value;  // Получаем текст консоли
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
