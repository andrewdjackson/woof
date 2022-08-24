from hamcrest import *
from woof_database import *

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

def test_write():
    record = {"date" : "01/01/2022 00:00:00", "event": "started", "description":"test"}

    wdb = WoofDatabase()
    wdb.connect()
    assert_that( wdb.write(record), equal_to(True) )
    wdb.close()

def test_delete():
    wdb = WoofDatabase()
    wdb.connect()
    assert_that( wdb.delete(), equal_to(True) )
    wdb.close()
