import sqlite3

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
        sql = f"insert into diary (dt, event, desc) values ('{record['date']}', '{record['event']}', '{record['description']}')"
        if self.connected:
            return self.execute_sql(sql)

        return False

    def delete(self):
        sql = f"delete from diary where desc ='test'"
        if self.connected:
            return self.execute_sql(sql)

        return False

    def initialise(self):
        sql = "create table if not exists diary ( dt text unique not null, event text not null, desc text default '')"
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
