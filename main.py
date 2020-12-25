from typing import Optional

import random
from threading import Lock
from flask import Flask, render_template
from flask_socketio import SocketIO, emit
from flask_cors import CORS
from loguru import logger


async_mode = None
app = Flask(__name__)

CORS(app, supports_credentials=True)
app.config['SECRET_KEY'] = 'secret!'
socketio = SocketIO(app, cors_allowed_origins="*")
close = False
thread = None
thread_lock = Lock()
logger.add('flask.log')

@app.route('/')
def index():
    return render_template('index.html')


def ack(info: str):
    logger.info('{} is successful'.format(info))  # 服务端回调函数的参数证明连接成功


@socketio.on('request_for_response', namespace='/XXXprojext')
def test_connect(data: dict):
    """
    监听服务端发来的消息，判断是否能收到，然后在发送数据给服务端，如果回调成功说明连接没问题
    :param data:
    :return:
    """

    logger.info('The client has received the message {}'.format(data))
    emit('response', {'code': 200, 'from_client': 'Success!'}, callback=ack)


@socketio.on('stop_send_data', namespace="/XXXprojext")
def stop_out():
    global thread, close
    close = True
    thread = None


@socketio.on('do_somrthing', namespace='/XXXprojext')
def handle_my_custom_event():
    global thread, close
    with thread_lock:
        if thread is None:
            close = False
            thread = socketio.start_background_task(target=background_thread_task)
        else:
            socketio.emit('tail_response', {'msg': 'Resources occupied......'}, namespace='/XXXprojext')


def background_thread_task():
    while not close:
        i = random.randint(0,100)
        socketio.sleep(0.1)
        socketio.emit('do_somrthing', {"num": i}, namespace='/XXXprojext')
    socketio.stop()
    return {"over"}


if __name__ == '__main__':
    socketio.run(app, host='0.0.0.0', debug=True)





