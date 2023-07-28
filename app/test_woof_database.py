from hamcrest import *
from woof_database import *
from woof_events import EVENT_STARTED, EVENT_STOPPED, EVENT_TEST, get_current_date_and_time, get_start_and_end_date_for_event

TEST_DATABASE = "test_woof.db"

def test_connect():
    wdb = WoofDatabase(database=TEST_DATABASE)
    wdb.connect()
    assert_that(wdb.connection, not_none())
    assert_that(wdb.connected, equal_to(True))

def test_close():
    wdb = WoofDatabase(database=TEST_DATABASE)
    wdb.close()
    assert_that(wdb.connected, equal_to(False))

def test_intialise_database():
    wdb = WoofDatabase(database=TEST_DATABASE)
    wdb.connect()

    assert_that( wdb.initialise(), equal_to(True) )

    wdb.close()

def test_write_barking_started():
    date = get_current_date_and_time()
    record = WoofEvent(date=date, event=EVENT_STARTED, description=EVENT_TEST)

    wdb = WoofDatabase()
    wdb.connect()
    assert_that( wdb.write(record), equal_to(True) )
    wdb.close()

def test_write_barking_stopped():
    date = get_current_date_and_time()
    record = WoofEvent(date=date, event=EVENT_STOPPED, description=EVENT_TEST)

    wdb = WoofDatabase(database=TEST_DATABASE)
    wdb.connect()
    assert_that( wdb.write(record), equal_to(True) )
    wdb.close()

def test_read_diary():
    wdb = WoofDatabase(database=TEST_DATABASE)
    wdb.connect()
    records = wdb.read()
    assert_that( records, not_none() )
    wdb.close()

def test_read_last_entry():
    wdb = WoofDatabase(database=TEST_DATABASE)
    wdb.connect()
    record = wdb.read_last()
    assert_that( record.id, greater_than(279) )
    wdb.close()

def test_write_duration_to_last_entry():
    wdb = WoofDatabase(database=TEST_DATABASE)
    wdb.connect()

    record = wdb.read_last()
    wdb.write_duration(5)
    updated_record = wdb.read_last()

    assert_that(record.end_time, not equal_to(updated_record.end_time))
    wdb.close()
