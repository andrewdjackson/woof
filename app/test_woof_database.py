from hamcrest import *
from woof_database import *
from woof_events import EVENT_STARTED, EVENT_STOPPED, EVENT_TEST, get_current_date_and_time

def test_connect():
    wdb = WoofDatabase()
    assert_that(wdb.connected, equal_to(False))

    wdb.connect()
    assert_that(wdb.connection, not_none())
    assert_that(wdb.connected, equal_to(True))

def test_close():
    wdb = WoofDatabase()
    wdb.close()
    assert_that(wdb.connected, equal_to(False))

def test_intialise_database():
    wdb = WoofDatabase()
    wdb.connect()

    assert_that( wdb.initialise(), equal_to(True) )

    wdb.close()

def test_write_barking_started():
    date = get_current_date_and_time()
    record = {"date" : date, "event": EVENT_STARTED, "description": EVENT_TEST}

    wdb = WoofDatabase()
    wdb.connect()
    assert_that( wdb.write(record), equal_to(True) )
    wdb.close()

def test_write_barking_stopped():
    date = get_current_date_and_time()
    record = {"date" : date, "event": EVENT_STOPPED, "description": EVENT_TEST}

    wdb = WoofDatabase()
    wdb.connect()
    assert_that( wdb.write(record), equal_to(True) )
    wdb.close()
