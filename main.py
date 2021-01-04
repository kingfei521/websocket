import csv
import random
import threading
from threading import Lock, Thread, Event
from flask import Flask, render_template, request
from flask_socketio import SocketIO, emit
from flask_cors import CORS
from loguru import logger
import eventlet

from model import Rfid

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

@app.route('/search')
def search():
    return render_template('search.html')


@app.route('/db', methods=['POST'])
def find_db():
    """
    数据库页面获取展示
    :return:
    """
    date_time = request.get_json()
    Query_conditions = str(date_time['data_time']).replace('-', '/')
    name = str(date_time['db_name'])
    if date_time:
        result = Rfid.find_data_from_db(db_name=name, condition=Query_conditions)
        return {'code': 200, "msg": result}
    else:
        return {'code':404}


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
    logger.debug(thread_stop_event.isSet())

@socketio.on('do_somrthing', namespace='/XXXprojext')
def handle_my_custom_event():
    global thread, thread_stop_event
    thread_stop_event.clear()
    if not thread.is_alive():  # thread.is_alive() 如果线程已经启动，并且当前没有任何异常的话，则返回true；
        thread = socketio.start_background_task(target=background_thread_task)
    else:
        socketio.emit('tail_response', {'msg': 'Resources occupied......'}, namespace='/XXXprojext')


def background_thread_task():
    while 1:
        # logger.debug('jinlail')
        with open('data.csv') as f:
            csva = csv.reader(f)
            # headers = next(csva)
            for row in csva:
                if thread_stop_event.isSet():
                   exit()
                json_data = {
                   "Time": row[1],
                   'Epc': row[2],
                   'Tid': row[3],
                   'Status': row[4],
                   'Rssi': row[5],
                   'Distance': row[6],
                   'dB': row[7],
                }
                socketio.sleep(0.1)
                socketio.emit('do_somrthing', {"data": json_data}, namespace='/XXXprojext')


if __name__ == '__main__':
    socketio.run(app, host='0.0.0.0')





