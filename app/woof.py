from woof_database import WoofDatabase
from woof_events import EVENT_STARTED, EVENT_STOPPED, get_current_date_and_time
from datetime import datetime

class Woof:

    def __init__(self):
        self.initialised = False
        self.written = False

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

    def get_diary(self):
        db = WoofDatabase()
        db.connect()
        records = db.read()
        db.close()

        return self.concatenate_events(records)

    def concatenate_events(self, records):
        concatenated_records = []
        last_event = None

        for record in records:
            if last_event is None:
                # set the first record to be the last event
                last_event = record
            else:
                this_event = record
                # compare the last event with this one, if it's within 5 minutes
                # then make update the end time of the last event to be the end time of this event
                # this means the last event is now concatenated and the next event will be compared
                # to see if the period needs extending again
                if self.is_event_within_time(last_event, this_event):
                    last_event['end_time'] = this_event['end_time']
                else:
                    # save the concatenated record and increment to next event
                    concatenated_records.append(last_event)
                    last_event = this_event

        concatenated_records.append(last_event)
        return concatenated_records

    def is_event_within_time(self, last_event, this_event):
        end_of_last_event = datetime.strptime(last_event['end_time'], '%d/%m/%Y %H:%M:%S')
        start_of_this_time = datetime.strptime(this_event['start_time'], '%d/%m/%Y %H:%M:%S')

        time_delta = start_of_this_time - end_of_last_event

        minutes = time_delta.total_seconds() / 60
        return minutes <= 5

    def init_database(self):
        db = WoofDatabase()
        db.connect()
        self.initialised = db.initialise()
        db.close()

    def write_record(self):
        db = WoofDatabase()
        db.connect()
        self.written = db.write(self.record)
        db.close()
