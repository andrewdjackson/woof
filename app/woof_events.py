from datetime import datetime

EVENT_STARTED = "started"
EVENT_STOPPED = "stopped"
EVENT_YAPPING = "Yapping"
EVENT_BARKING = "Barking"
EVENT_ENCOURAGED = "Barking encouraged"
EVENT_OTHER = "Other"
EVENT_TEST = "TEST"

def get_current_date_and_time():
    now = datetime.now()
    return now.strftime("%d/%m/%Y %H:%M:%S")
