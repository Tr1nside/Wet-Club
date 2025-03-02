import eventlet
eventlet.monkey_patch()

from flask import Flask
from flask_socketio import SocketIO

# Создаём Flask-приложение
app = Flask(__name__, template_folder='templates', static_folder='static')
app.config['SECRET_KEY'] = 'some_secret_key'

# Инициализируем SocketIO
socketio = SocketIO(app)

# Импортируем наш Blueprint и функцию, где регистрируются события
from main import main_bp, register_socketio_events

# Регистрируем Blueprint
app.register_blueprint(main_bp)

# Регистрируем события для SocketIO (обработчики on('execute'), on('console_input'), и т.д.)
register_socketio_events(socketio)

print("Список зарегистрированных маршрутов:", app.url_map)

# Точка входа
if __name__ == '__main__':
    socketio.run(app, debug=True, host='127.0.0.1', port=5000)
