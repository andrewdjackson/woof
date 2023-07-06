from dataclasses import dataclass
from datetime import datetime, timedelta
import pytz

EVENT_STARTED = "started"
EVENT_STOPPED = "stopped"
EVENT_YAPPING = "Yapping"
EVENT_BARKING = "Barking"
EVENT_ENCOURAGED = "Barking encouraged"
EVENT_OTHER = "Other"
EVENT_TEST = "TEST"

@dataclass
class WoofEvent:
    date: str
    event: str
    description: str

@dataclass
class WoofDatabaseRecord:
    id: int
    start_time: str
    end_time: str
    description: str

def is_event_duration_less_than(start_time: datetime, end_time: datetime, duration_in_minutes: int):
    time_delta = start_time - end_time

    minutes = time_delta.total_seconds() / 60
    return minutes <= duration_in_minutes

def get_current_date_and_time():
    tz = pytz.timezone('Europe/London')
    now = datetime.now(tz)
    return now.strftime("%d/%m/%Y %H:%M:%S")


def get_start_and_end_date_for_event(record: WoofDatabaseRecord):
    end_time = datetime.strptime(record.end_time, '%d/%m/%Y %H:%M:%S')
    start_time = datetime.strptime(record.start_time, '%d/%m/%Y %H:%M:%S')
    return end_time, start_time


def add_duration_to_event_time(event_time: str, duration: int):
    dt = datetime.strptime(event_time, '%d/%m/%Y %H:%M:%S')
    time_duration = timedelta(minutes=duration)
    new_event_time = dt + time_duration
    return new_event_time.strftime("%d/%m/%Y %H:%M:%S")
