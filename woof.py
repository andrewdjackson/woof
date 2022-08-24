from datetime import datetime
from woof_database import WoofDatabase

EVENT_STARTED = "started"
EVENT_STOPPED = "stopped"
EVENT_YAPPING = "Yapping"
EVENT_BARKING = "Barking"
EVENT_ENCOURAGED = "Barking encouraged"
EVENT_OTHER = "Other"

class Woof:

    def __init__(self):
        dt = self.get_current_date_and_time()
        self.record = {"date" : dt, "event": EVENT_STARTED, "description": ""}

    def record_start(self, description):
        self.record["event"] = EVENT_STARTED
        self.record["description"] = description

        return self.record

    def record_stop(self):
        self.record["event"] = EVENT_STOPPED
        return self.record

    def get_current_date_and_time(self):
        now = datetime.now()
        return now.strftime("%d/%m/%Y %H:%M:%S")

    def write_record(self):
        db = WoofDatabase()
        db.connect()
        db.write(self.record)
        db.close()
