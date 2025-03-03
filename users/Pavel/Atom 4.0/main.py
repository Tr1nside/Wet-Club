from flask import Blueprint, render_template, request  # Импортируем необходимые модули из Flask
from flask_socketio import emit  # Импортируем emit для отправки сообщений через SocketIO
import eventlet  # Импортируем eventlet для работы с асинхронными событиями
import builtins  # Импортируем встроенные функции Python
import contextlib  # Импортируем contextlib для управления контекстами
import io  # Импортируем io для работы с потоками ввода-вывода

# Создаём Blueprint для организации маршрутов
main_bp = Blueprint('main_bp', __name__)

# Определяем маршрут для главной страницы, доступной по адресу http://127.0.0.1:5000/
@main_bp.route('/')
def index():
    return render_template('index.html')  # Возвращаем HTML-шаблон index.html

# Общий словарь для хранения событий ожидания ввода
pending_inputs = {}

def register_socketio_events(socketio):
    """
    Функция, которая регистрирует все события SocketIO.
    Вызывается из server.py, чтобы избежать циклического импорта.
    """

    @socketio.on('execute')  # Обработчик события 'execute'
    def execute_code(code):
        sid = request.sid  # Получаем идентификатор сессии клиента

        def custom_input(prompt=""):  # Определяем функцию для обработки ввода
            socketio.emit("console_output", prompt, room=sid)  # Отправляем запрос на ввод в консоль
            ev = eventlet.Event()  # Создаём событие для ожидания ввода
            pending_inputs[sid] = ev  # Сохраняем событие в словаре ожидания
            return ev.wait()  # Ожидаем ввода от клиента

        local_env = {}  # Локальная среда для выполнения кода
        exec_globals = {"__builtins__": builtins.__dict__.copy()}  # Глобальная среда с копией встроенных функций
        exec_globals["input"] = custom_input  # Заменяем стандартную функцию input на custom_input

        output_buffer = io.StringIO()  # Создаём буфер для захвата вывода
        try:
            with contextlib.redirect_stdout(output_buffer):  # Перенаправляем стандартный вывод в буфер
                exec(code, exec_globals, local_env)  # Выполняем код в заданной среде
            result = output_buffer.getvalue().strip()  # Получаем вывод из буфера и убираем лишние пробелы
            if not result:  # Если вывод пустой
                result = "Код выполнен, но вывода не было."  # Указываем, что вывод отсутствует
        except Exception as e:  # Обрабатываем исключения
            result = f"Ошибка: {e}"  # Сохраняем сообщение об ошибке

        socketio.emit('console_output', result, room=sid)  # Отправляем результат выполнения кода обратно клиенту

    @socketio.on('console_input')  # Обработчик события 'console_input'
    def handle_console_input(data):
        sid = request.sid  # Получаем идентификатор сессии клиента
        if sid in pending_inputs:  # Проверяем, есть ли ожидающий ввод для этой сессии
            pending_inputs[sid].send(data)  # Отправляем введённые данные в ожидающее событие
            del pending_inputs[sid]  # Удаляем событие из словаря
        else:  # Если нет ожидающего ввода
            socketio.emit('console_output', f"\n(Ввод вне запроса: {data})\n", room=sid)  # Уведомляем клиента о вводе вне запроса

print("Импорт main.py завершён")  # Сообщение о завершении импорта модуля
