from hamcrest import *
from woof_events import get_current_date_and_time, add_duration_to_event_time

def test_current_datetime_as_string():
    date = get_current_date_and_time()
    assert_that(date, matches_regexp("^\d{2}\/\d{2}\/\d{4}\s*(?:\d{2}:\d{2}(?::\d{2})?)?$"))

def test_add_duration_to_datetime():
    new_date = add_duration_to_event_time("01/01/2023 10:00:00", 5)
    assert_that(new_date, equal_to("01/01/2023 10:05:00"))
