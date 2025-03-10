import eventlet
eventlet.monkey_patch()
from .routes import main_bp, register_socketio_events # Импортируем наш Blueprint и функцию, где регистрируются события
from flask import Flask
from flask_socketio import SocketIO

import os
MAIN_FOLDER = os.path.dirname(os.path.abspath(__file__))

app = Flask(__name__,
            static_folder=os.path.join(MAIN_FOLDER, '..', 'static'),
            template_folder=os.path.join(MAIN_FOLDER, '..', 'templates')) # Создаём Flask-приложение

app.config['SECRET_KEY'] = 'some_secret_key'
socketio = SocketIO(app) # Инициализируем SocketIO
app.register_blueprint(main_bp) # Регистрируем Blueprint
register_socketio_events(socketio) # Регистрируем события для SocketIO (обработчики on('execute'), on('console_input'), и т.д.)

