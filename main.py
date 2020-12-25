import random
import threading
from threading import Lock, Thread, Event
from flask import Flask, render_template
from flask_socketio import SocketIO, emit
from flask_cors import CORS
from loguru import logger
import eventlet


async_mode = None
app = Flask(__name__)


eventlet.monkey_patch()

CORS(app, supports_credentials=True)
app.config['SECRET_KEY'] = 'secret!'
app.config['DEBUG'] = True
socketio = SocketIO(app, cors_allowed_origins="*")

thread = Thread()
thread_stop_event = Event()
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
    global thread_stop_event
    thread_stop_event.set()


@socketio.on('do_somrthing', namespace='/XXXprojext')
def handle_my_custom_event():
    global thread, thread_stop_event
    thread_stop_event.clear()
    if not thread.is_alive():  # thread.is_alive() 如果线程已经启动，并且当前没有任何异常的话，则返回true；
        thread = socketio.start_background_task(target=background_thread_task)
    else:
        socketio.emit('tail_response', {'msg': 'Resources occupied......'}, namespace='/XXXprojext')


def background_thread_task():
    while not thread_stop_event.isSet():
        i = random.randint(0,100)
        socketio.sleep(0.1)
        socketio.emit('do_somrthing', {"num": i}, namespace='/XXXprojext')


if __name__ == '__main__':
    socketio.run(app, host='0.0.0.0')





