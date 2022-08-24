from woof_database import WoofDatabase
from woof_events import EVENT_STARTED, EVENT_STOPPED, get_current_date_and_time

class Woof:

    def __init__(self):
        self.init_database()

        dt = get_current_date_and_time()
        self.record = {"date" : dt, "event": EVENT_STARTED, "description": ""}

    def record_start(self, description):
        self.record["event"] = EVENT_STARTED
        self.record["description"] = description

        return self.record

    def record_stop(self):
        self.record["event"] = EVENT_STOPPED
        return self.record

    def init_database(self):
        db = WoofDatabase()
        db.connect()
        db.initialise()
        db.close()

    def write_record(self):
        db = WoofDatabase()
        db.connect()
        db.write(self.record)
        db.close()
