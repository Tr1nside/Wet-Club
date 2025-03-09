import eventlet
eventlet.monkey_patch()
import os
from .routes import main_bp, register_socketio_events # Импортируем наш Blueprint и функцию, где регистрируются события
from flask import Flask
from flask_socketio import SocketIO
from config import Config
from flask_sqlalchemy import SQLAlchemy
from flask_login import LoginManager
from models import User

login_manager = LoginManager(app)
login_manager.login_view = 'auth_bp.login'  # маршрут для перенаправления неавторизованных пользователей

@login_manager.user_loader
def load_user(user_id):
    return User.query.get(int(user_id))

MAIN_FOLDER = os.path.dirname(os.path.abspath(__file__))

app = Flask(__name__,
            static_folder=os.path.join(MAIN_FOLDER, '..', 'static'),
            template_folder=os.path.join(MAIN_FOLDER, '..', 'templates')) # Создаём Flask-приложение
db = SQLAlchemy(app)

app.config.from_object(Config)
socketio = SocketIO(app) # Инициализируем SocketIO
app.register_blueprint(main_bp) # Регистрируем Blueprint
register_socketio_events(socketio) # Регистрируем события для SocketIO (обработчики on('execute'), on('console_input'), и т.д.)

