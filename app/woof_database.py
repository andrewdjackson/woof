import sqlite3
from woof_events import EVENT_STARTED, EVENT_STOPPED, EVENT_TEST

class WoofDatabase():

    def __init__(self):
        self.connected = False

    def connect(self):
        self.connection = sqlite3.connect("woof.db")
        self.cursor = self.connection.cursor()
        self.connected = True

    def close(self):
        if self.connected:
            self.cursor.close()
            self.connection.close()
            self.connected = False

    def write(self, record):
        if record["event"] == EVENT_STARTED:
            sql = f"insert into diary (start_time, end_time, description) values ('{record['date']}', '{record['date']}', '{record['description']}')"
        else:
            sql = f"update diary set end_time = '{record['date']}' WHERE id = (SELECT MAX(id) FROM diary)"

        if self.connected:
            return self.execute_sql(sql)

        return False

    def delete(self):
        sql = f"delete from diary where desc ='{EVENT_TEST}'"
        if self.connected:
            return self.execute_sql(sql)

        return False

    def initialise(self):
        sql = "create table if not exists diary ( id INTEGER PRIMARY KEY AUTOINCREMENT, start_time TEXT unique not null, end_time TEXT unique not null, description TEXT default '')"
        if self.connected:
            return self.execute_sql(sql)

        return False

    def execute_sql(self, sql):
        try:
            self.cursor.execute(sql)
            self.connection.commit()
            return True
        except:
            return False
