import os
import sqlite3  # 导入sqlite3包

ROOT_PATH = os.path.abspath(os.path.dirname(__file__))
gx = os.path.join(os.path.join(ROOT_PATH, 'DB'), 'gx.db')
ldbr = os.path.join(os.path.join(ROOT_PATH, 'DB'), 'ldbr.db')


def get_conn(reader_name):
    # 定义该函数用来连接数据库
    if reader_name == "gx":
        return sqlite3.connect(gx)  # 连接数据库1
    else:
        return sqlite3.connect(ldbr)  # 连接数据库2


class Rfid(object):
    def __init__(self, time, epc,
                 tid, status, rssi,
                 distance=None, angle=None, dB=30):

        self.time = time
        self.epc = epc
        self.tid = tid
        self.status = status
        self.rssi = rssi
        self.distance = distance
        self.angle = angle
        self.dB = dB


    def save_data_to_rfid_db(self, db_name):
        sql = "insert into RFID(TIME, EPC, TID, STATUS, RSSI, distance, angle, dB) VALUES (?,?,?,?,?,?,?,?)"#sql语句
        conn = get_conn(db_name)  # 连接数据库
        cursor = conn.cursor()  # 定义一个游标
        cursor.execute(sql,(self.time, self.epc, self.tid, self.status, self.rssi,
                            self.distance, self.angle, self.dB))  # 执行sql语句
        conn.commit()  #  提交数据库改动
        cursor.close()  # 关闭游标
        conn.close()  # 关闭数据库连接


    '''
    staticmethod相当于一个定义在类里面的函数，所以如果一个方法既不跟实例
    相关也不跟特定的类相关，推荐将其定义为一个staticmethod，这样不仅使代
    码一目了然，而且利于维护代码。
    '''
    @staticmethod
    def delete_all_rfid_data_from_db(db_name):
        sql = "delete from RFID "
        conn = get_conn(db_name)
        cursor = conn.cursor()
        cursor.execute(sql)

        conn.commit()
        cursor.close()
        conn.close()

    @staticmethod
    def find_data_from_db(db_name=None, condition=None):
        sql = "select TIME, EPC, TID, STATUS, RSSI, distance, angle, dB from RFID  WHERE TIME like '%{}%'".format(condition)
        conn = get_conn(db_name)
        cursor = conn.cursor()
        cursor.execute(sql)
        data = cursor.fetchall()
        conn.commit()
        cursor.close()
        conn.close()
        return data

    def __str__(self):
        return 'epc:{}'.format(self.epc)#注此处的是点不是逗号


if __name__ == '__main__':
    # da = Rfid.find_data_from_db('ldbr', '2020/12/23')
    # print(da)
    pass
