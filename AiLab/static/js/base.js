body = document.body;
const nightModeButton = document.querySelector('.night-mode');

// Переключение между режимами
let darkMode = false;
if (!localStorage.getItem("darkMod")) {
    localStorage.setItem("darkMod", false);
    darkMode = false;
} else {
    darkMode = localStorage.getItem("darkMod");
    if (darkMode) {
        body.classList.toggle('dark-mode');
        nightModeButton.textContent = body.classList.contains('dark-mode') ? '☀️' : '🌙';
    }
}

const storedTheme = localStorage.getItem('theme');
if (storedTheme === 'dark') {
    body.classList.add('dark-mode');
    nightModeButton.textContent = '☀️';
} else {
    body.classList.remove('dark-mode');
    nightModeButton.textContent = '🌙';
}

nightModeButton.addEventListener('click', () => {
    body.classList.toggle('dark-mode');
    const isDark = body.classList.contains('dark-mode');
    nightModeButton.textContent = isDark ? '☀️' : '🌙';
    localStorage.setItem('theme', isDark ? 'dark' : 'light');
});
