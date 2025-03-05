# import eventlet
# eventlet.monkey_patch()  # Должно быть первым!
from app.__init__ import socketio, app


if __name__ == '__main__':
    socketio.run(app, debug=True, host='127.0.0.1', port=5000)


# all for run server