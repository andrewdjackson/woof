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
        if self.connected:
            if record["event"] == EVENT_STARTED:
                self.cursor.execute(
                    "INSERT INTO diary (start_time, end_time, description) VALUES (?, ?, ?)",
                    (record['date'], record['date'], record['description'])
                )
                self.connection.commit()
                return True
            else:
                self.cursor.execute(
                    "UPDATE diary SET end_time = ? WHERE id = (SELECT MAX(id) FROM diary)",
                    (record['date'], )
                )
                self.connection.commit()
                return True

        return False

    def delete(self):
        if self.connected:
            self.cursor.execute(
                "delete from diary where desc = ?",
                ( EVENT_TEST )
            )
            self.connection.commit()
            return True

        return False

    def read(self):
        records = []

        if self.connected:
            rows = self.cursor.execute(
                "select * from diary"
            ).fetchall()

            for row in rows:
                record = { 'start_time': row[1], 'end_time': row[2], 'description':row[3] }
                records.append(record)

        return records

    def initialise(self):
        if self.connected:
            self.cursor.execute(
                "create table if not exists diary ( id INTEGER PRIMARY KEY AUTOINCREMENT, start_time TEXT unique not null, end_time TEXT unique not null, description TEXT default '')"
            )
            self.connection.commit()
            return True

        return False
