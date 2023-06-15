from woof_database import WoofDatabase
from woof_events import EVENT_STARTED, EVENT_STOPPED, get_current_date_and_time
from datetime import datetime, timedelta

MINIMUM_MINUTES_BETWEEN_EVENTS = 5
MAXIMUM_EVENT_DURATION = 40

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

        records = self.clean_invalid_durations(records)
        records = self.truncate_extra_long_events(records, MAXIMUM_EVENT_DURATION)
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
                if self.is_part_of_previous_event(last_event, this_event):
                    last_event['end_time'] = this_event['end_time']
                else:
                    # save the concatenated record and increment to next event
                    concatenated_records.append(last_event)
                    last_event = this_event

        concatenated_records.append(last_event)
        return concatenated_records

    def clean_invalid_durations(self, records):
        for record in records:
            end_time = datetime.strptime(record['end_time'], '%d/%m/%Y %H:%M:%S')
            start_time = datetime.strptime(record['start_time'], '%d/%m/%Y %H:%M:%S')

            if start_time > end_time:
                record['start_time'] = record['end_time']

        return records

    def truncate_extra_long_events(self, records, max_duration):
        for record in records:
            if self.is_event_too_long(record, max_duration):
                record = self.get_event_shorten_by_duration(record, max_duration)

        return records

    def get_event_shorten_by_duration(self, this_event, duration_in_minutes):
        start_time = datetime.strptime(this_event['start_time'], '%d/%m/%Y %H:%M:%S')
        end_time = start_time + timedelta(minutes=duration_in_minutes)

        this_event['end_time'] = end_time.strftime('%d/%m/%Y %H:%M:%S')
        return this_event

    def is_event_too_long(self, this_event, max_duration):
        start_time = datetime.strptime(this_event['start_time'], '%d/%m/%Y %H:%M:%S')
        end_time = datetime.strptime(this_event['end_time'], '%d/%m/%Y %H:%M:%S')

        return not self.is_event_duration_less_than(start_time, end_time, max_duration)

    def is_part_of_previous_event(self, last_event, this_event):
        end_time = datetime.strptime(last_event['end_time'], '%d/%m/%Y %H:%M:%S')
        start_time = datetime.strptime(this_event['start_time'], '%d/%m/%Y %H:%M:%S')

        return self.is_event_duration_less_than(start_time, end_time, MINIMUM_MINUTES_BETWEEN_EVENTS)

    def is_event_duration_less_than(self, start_time, end_time, duration_in_minutes):
        time_delta = start_time - end_time

        minutes = time_delta.total_seconds() / 60
        return minutes <= duration_in_minutes

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
