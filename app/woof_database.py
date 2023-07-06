import sqlite3
from typing import List
from woof_events import *

class WoofDatabase():

    def __init__(self, database="woof.db"):
        self.connected = False
        self.database = database

    def connect(self):
        self.connection = sqlite3.connect(self.database)
        self.cursor = self.connection.cursor()
        self.connected = True

    def close(self):
        if self.connected:
            self.cursor.close()
            self.connection.close()
            self.connected = False

    def write(self, woof_event: WoofEvent) -> bool:
        if self.connected:
            if woof_event.event == EVENT_STARTED:
                self.cursor.execute(
                    "INSERT INTO diary (start_time, end_time, description) VALUES (?, ?, ?)",
                    (woof_event.date, woof_event.date, woof_event.description)
                )
                self.connection.commit()
                return True
            else:
                self.cursor.execute(
                    "UPDATE diary SET end_time = ? WHERE id = (SELECT MAX(id) FROM diary)",
                    (woof_event.date,)
                )
                self.connection.commit()
                return True

        return False

    def write_duration(self, duration):
        if self.connected:
            record = self.read_last()
            record.event = EVENT_STOPPED
            record.date = add_duration_to_event_time(record.start_time, duration)
            self.write(record)


    def delete(self):
        if self.connected:
            self.cursor.execute("delete from diary where desc = ?",(EVENT_TEST))
            self.connection.commit()
            return True

        return False

    def read(self) -> List[WoofDatabaseRecord]:
        records = []

        if self.connected:
            rows = self.cursor.execute(
                "select * from diary"
            ).fetchall()

            for row in rows:
                record = WoofDatabaseRecord(id=row[0], start_time=row[1], end_time=row[2], description=row[3])
                records.append(record)

        return records

    def read_last(self):
        records = []

        if self.connected:
            rows = self.cursor.execute(
                "select * from diary order by id desc limit 1"
            ).fetchall()

            for row in rows:
                record = WoofDatabaseRecord(id=row[0], start_time=row[1], end_time=row[2], description=row[3])
                records.append(record)

        return records[-1]

    def initialise(self):
        if self.connected:
            self.cursor.execute(
                "create table if not exists diary ( id INTEGER PRIMARY KEY AUTOINCREMENT, start_time TEXT unique not null, end_time TEXT unique not null, description TEXT default '')"
            )
            self.connection.commit()
            return True

        return False
