const body = document.body;
const nightModeButton = document.querySelector('.night-mode');
const tabs = document.querySelector('.tabs');
let tabCounter = 2; // Счетчик для новых вкладок
const consoleOutput = document.querySelector('.console-output');
const consoleInput = document.querySelector('.console-input');
let codeMirrorInstances = {};
const socket = io();


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
let darkMode = false;

if (!localStorage.getItem("darkMod")) {
    localStorage.setItem("darkMod", false);
    darkMode = false;
} else {
    darkMode = localStorage.getItem("darkMod");
    if (darkMode) {
        body.classList.toggle('dark-mode');
        // Изменение значка луны на солнце и обратно
        nightModeButton.textContent = body.classList.contains('dark-mode') ? '☀️' : '🌙';

        // Обновление темы CodeMirror при смене режима
        for (const tabId in codeMirrorInstances) {
            const cm = codeMirrorInstances[tabId];
            cm.setOption("theme", body.classList.contains('dark-mode') ? "dracula" : "default");
        }
    }
}

// При загрузке страницы проверяем, сохранена ли тема в localStorage
const storedTheme = localStorage.getItem('theme');
if (storedTheme === 'dark') {
    body.classList.add('dark-mode');
    nightModeButton.textContent = '☀️';
    for (const tabId in codeMirrorInstances) {
        const cm = codeMirrorInstances[tabId];
        cm.setOption("theme", "dracula");
    }
} else {
    body.classList.remove('dark-mode');
    nightModeButton.textContent = '🌙';
    for (const tabId in codeMirrorInstances) {
        const cm = codeMirrorInstances[tabId];
        cm.setOption("theme", "default");
    }
}

nightModeButton.addEventListener('click', () => {
    body.classList.toggle('dark-mode');
    const isDark = body.classList.contains('dark-mode');
    
    // Изменение значка луны на солнце и обратно
    nightModeButton.textContent = isDark ? '☀️' : '🌙';

    // Сохранение выбранной темы в localStorage
    localStorage.setItem('theme', isDark ? 'dark' : 'light');

    // Обновление темы CodeMirror при смене режима
    for (const tabId in codeMirrorInstances) {
        const cm = codeMirrorInstances[tabId];
        cm.setOption("theme", isDark ? "dracula" : "default");
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
    const tab = event.target.closest('.tab');
    if (!tab) return;
    
    if (event.target.classList.contains('close-tab')) {
        closeTab(tab);
        return;
    }

    if (tab.dataset.tab === 'tab2') { // Если кликнули на "+", создаем новую вкладку
        createNewTab();
    } else {
        activateTab(tab);
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


// Функция для сохранения данных во вкладках в localStorage
function saveTabsToLocalStorage() {
    const tabsData = [];
    document.querySelectorAll('.tab:not([data-tab="tab2"])').forEach(tab => {
        const tabId = tab.dataset.tab;
        const fileName = tab.querySelector('span').textContent;
        const content = codeMirrorInstances[tabId] ? codeMirrorInstances[tabId].getValue() : "";
        tabsData.push({ id: tabId, name: fileName, content: content });
    });
    localStorage.setItem('savedTabs', JSON.stringify(tabsData));
}

// Функция для загрузки вкладок из localStorage
function loadTabsFromLocalStorage() {
    const savedTabs = JSON.parse(localStorage.getItem('savedTabs')) || [];
    if (savedTabs.length === 0) return;

    document.querySelectorAll('.tab:not([data-tab="tab2"])').forEach(tab => tab.remove());
    document.querySelectorAll('.code-area[data-tab-content]').forEach(area => area.remove());
    codeMirrorInstances = {};

    savedTabs.forEach((tabData, index) => {
        const newTab = document.createElement('div');
        newTab.classList.add('tab');
        newTab.dataset.tab = tabData.id;
        newTab.innerHTML = `<span>${tabData.name}</span><span class="close-tab">×</span>
                            <input type="text" class="tab-input" value="${tabData.name}">`;
        tabs.insertBefore(newTab, document.querySelector('.tab[data-tab="tab2"]'));

        const codeArea = document.createElement('div');
        codeArea.classList.add('code-area');
        codeArea.dataset.tabContent = tabData.id;
        document.querySelector('.container').insertBefore(codeArea, document.querySelector('.toolbar'));

        const cm = CodeMirror(codeArea, {
            mode: "python",
            theme: body.classList.contains('dark-mode') ? "dracula" : "default",
            lineNumbers: true,
            gutters: ["CodeMirror-linenumbers"]
        });
        cm.setValue(tabData.content);
        codeMirrorInstances[tabData.id] = cm;

        newTab.addEventListener('dblclick', function () { startEditingTab(this); });
        const inputElement = newTab.querySelector('.tab-input');
        inputElement.addEventListener('blur', function () { finishEditingTab(newTab); });
        inputElement.addEventListener('keydown', function (event) {
            if (event.key === 'Enter') finishEditingTab(newTab);
        });
    });

    activateTab(document.querySelector('.tab:not([data-tab="tab2"])'));
}

// Вызываем загрузку при запуске
window.addEventListener('load', loadTabsFromLocalStorage);

// Подключаем сохранение на изменения
window.addEventListener('beforeunload', saveTabsToLocalStorage);
document.addEventListener('input', saveTabsToLocalStorage);
document.addEventListener('click', saveTabsToLocalStorage);

// Отчистка консоли
function clearConsole() {
    localStorage.setItem("console", '')
    consoleOutput.value = "";
    consoleInput.classList.remove('console-input-active');
}

// Отправка кода на сервер
function executeCode() {
    clearConsole();  // Очищаем консоль перед новым выводом

    // Находим активную вкладку
    const activeTab = document.querySelector('.tab.active');
    if (!activeTab) {
        consoleOutput.value += "\nОшибка: активная вкладка не найдена.";
        return;
    }

    // Получаем идентификатор активной вкладки и соответствующий экземпляр CodeMirror
    const tabId = activeTab.dataset.tab;
    const activeEditor = codeMirrorInstances[tabId];

    if (!activeEditor) {
        consoleOutput.value += "\nОшибка: не найден редактор для активной вкладки.";
        return;
    }

    // Получаем код из активного редактора
    const code = activeEditor.getValue();
    socket.emit('execute', code);  // Отправляем код на сервер через WebSocket
}

function appendToConsole(text) {
    consoleOutput.innerText += text;  // Добавляем текст в консоль
    consoleOutput.scrollTop = consoleDiv.scrollHeight;  // Прокручиваем консоль вниз
    }
