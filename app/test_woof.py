from hamcrest import *
from woof import Woof, is_event_duration_less_than
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

def test_diary():
    wf = Woof()
    dt = wf.get_diary()
    assert_that(dt, has_length(greater_than(1)))

def test_event_is_longer_than_max_duration():
    wf = Woof()
    records = []
    records.append({ 'start_time': '01/01/2000 10:00:00', 'end_time': '01/01/2000 10:50:00', 'description':EVENT_YAPPING })
    is_longer_than_max_duration = is_event_duration_less_than(records[0]['start_time'], records[0]['end_time'], 45)

    assert_that(is_longer_than_max_duration, equal_to(False))

    records = wf.truncate_extra_long_events(records, 45)

    assert_that(records[0]['end_time'], equal_to('01/01/2000 10:45:00'))

def test_event_duration_is_valid():
    wf = Woof()
    records = []
    records.append({ 'start_time': '01/01/2000 11:00:00', 'end_time': '01/01/2000 10:00:00', 'description':EVENT_YAPPING })
    records.append({ 'start_time': '01/01/2000 10:05:00', 'end_time': '01/01/2000 11:05:00', 'description':EVENT_YAPPING })

    records = wf.clean_invalid_durations(records)
    assert_that(records[0]['start_time'], equal_to(records[0]['end_time']))
    assert_that(records[1]['start_time'], is_not(equal_to(records[1]['end_time'])))

def test_event_is_within_5_minutes():
    wf = Woof()
    records = []
    records.append({ 'start_time': '01/01/2000 10:00:00', 'end_time': '01/01/2000 10:00:00', 'description':EVENT_YAPPING })
    records.append({ 'start_time': '01/01/2000 10:05:00', 'end_time': '01/01/2000 10:05:00', 'description':EVENT_YAPPING })

    is_within_5_minutes = wf.is_part_of_previous_event(records[0], records[1])
    assert_that(is_within_5_minutes, equal_to(True))

def test_event_is_not_within_5_minutes():
    wf = Woof()
    records = []
    records.append({ 'start_time': '01/01/2000 10:00:00', 'end_time': '01/01/2000 10:00:00', 'description':EVENT_YAPPING })
    records.append({ 'start_time': '01/01/2000 10:06:00', 'end_time': '01/01/2000 10:06:00', 'description':EVENT_YAPPING })

    is_within_5_minutes = wf.is_part_of_previous_event(records[0], records[1])
    assert_that(is_within_5_minutes, equal_to(False))

def test_event_is_not_within_5_minutes_if_different_days():
    wf = Woof()
    records = []
    records.append({ 'start_time': '01/01/2000 10:00:00', 'end_time': '01/01/2000 10:00:00', 'description':EVENT_YAPPING })
    records.append({ 'start_time': '01/02/2000 10:05:00', 'end_time': '01/02/2000 10:05:00', 'description':EVENT_YAPPING })

    is_within_5_minutes = wf.is_part_of_previous_event(records[0], records[1])
    assert_that(is_within_5_minutes, equal_to(False))

def test_diary_events_are_consolidated_if_events_are_within_5_minutes():
    wf = Woof()
    records = []
    records.append({ 'start_time': '01/01/2000 10:00:00', 'end_time': '01/01/2000 10:00:00', 'description':EVENT_YAPPING })
    records.append({ 'start_time': '01/01/2000 10:05:00', 'end_time': '01/01/2000 10:05:00', 'description':EVENT_YAPPING })

    records.append({ 'start_time': '01/01/2000 10:15:00', 'end_time': '01/01/2000 10:15:00', 'description':EVENT_YAPPING })

    records.append({ 'start_time': '01/01/2000 10:25:00', 'end_time': '01/01/2000 10:25:00', 'description':EVENT_YAPPING })

    records.append({ 'start_time': '01/01/2000 11:00:00', 'end_time': '01/01/2000 11:00:00', 'description':EVENT_YAPPING })
    records.append({ 'start_time': '01/01/2000 11:05:00', 'end_time': '01/01/2000 11:05:00', 'description':EVENT_YAPPING })
    records.append({ 'start_time': '01/01/2000 11:10:00', 'end_time': '01/01/2000 11:10:00', 'description':EVENT_YAPPING })

    records.append({ 'start_time': '01/01/2000 12:00:00', 'end_time': '01/01/2000 12:10:00', 'description':EVENT_YAPPING })

    diary = wf.concatenate_events(records)
    assert_that(diary, has_length(equal_to(5)))


def is_a_date_time_string(dt):
    assert_that(dt, matches_regexp(r"^[0-9]{2}.[0-9]{2}.[0-9]{4}.[0-9]{2}.[0-9]{2}.[0-9]{2}$"))


