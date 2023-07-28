from woof_database import *
from woof_events import *
from datetime import datetime, timedelta
from typing import List

MINIMUM_MINUTES_BETWEEN_EVENTS = 5
MAXIMUM_EVENT_DURATION = 30


class Woof:

    def __init__(self, db=None):
        self.initialised = False
        self.written = False
        self.db = db

        if self.db is not None:
            self.init_database()

        dt = get_current_date_and_time()
        self.record = WoofEvent(date=dt, event=EVENT_STARTED, description="")

    def record_start(self, description: str) -> WoofEvent:
        self.record.event = EVENT_STARTED
        self.record.description = description

        return self.record

    def record_stop(self) -> WoofEvent:
        self.record.event = EVENT_STOPPED
        return self.record

    def get_diary(self) -> List[WoofDatabaseRecord]:
        self.db.connect()
        records = self.db.read()
        self.db.close()

        records = self.clean_invalid_durations(records)
        return self.concatenate_events(records)

    def concatenate_events(self, records: List[WoofDatabaseRecord]) -> List[WoofDatabaseRecord]:
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
                if self.is_part_of_previous_event(last_event, this_event):
                    last_event.end_time = this_event.end_time
                else:
                    # save the concatenated record and increment to next event
                    concatenated_records.append(last_event)
                    last_event = this_event

        concatenated_records.append(last_event)
        return concatenated_records

    def clean_invalid_durations(self, records: List[WoofDatabaseRecord]) -> List[WoofDatabaseRecord]:
        clean_records = []

        for record in records:
            end_time, start_time = get_start_and_end_date_for_event(record)

            if start_time > end_time:
                record.start_time = record.end_time

            clean_records.append(record)

        return clean_records

    def is_part_of_previous_event(self, last_event: WoofDatabaseRecord, this_event: WoofDatabaseRecord) -> bool:
        end_time = datetime.strptime(last_event.end_time, '%d/%m/%Y %H:%M:%S')
        start_time = datetime.strptime(this_event.start_time, '%d/%m/%Y %H:%M:%S')

        return is_event_duration_less_than(start_time, end_time, MINIMUM_MINUTES_BETWEEN_EVENTS)

    def init_database(self):
        self.db.connect()
        self.initialised = self.db.initialise()
        self.db.close()

    def write_record(self, duration=0):
        self.db.connect()
        if duration is 0:
            self.written = self.db.write(self.record)
        else:
            self.written = self.db.write_duration(duration)
        self. db.close()
