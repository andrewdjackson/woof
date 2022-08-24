from hamcrest import *
from woof import Woof
from woof_events import EVENT_YAPPING, EVENT_STARTED,EVENT_STOPPED


def test_bark():
    wf = Woof()
    assert_that(wf, not_none())

def test_start_barking():
    wf = Woof()
    dt = wf.record_start(EVENT_YAPPING)
    assert_that(dt["event"], equal_to(EVENT_STARTED))
    is_a_date_time_string(dt["date"])

def test_end_barking():
    wf = Woof()
    dt = wf.record_stop()
    assert_that(dt["event"], equal_to(EVENT_STOPPED))
    is_a_date_time_string(dt["date"])

def is_a_date_time_string(dt):
    assert_that(dt, matches_regexp(r"^[0-9]{2}.[0-9]{2}.[0-9]{4}.[0-9]{2}.[0-9]{2}.[0-9]{2}$"))
