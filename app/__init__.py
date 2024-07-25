import os
import sys

#
# add the app folder to the system path so the application classes and modules can be found
#
basedir = os.path.abspath(os.path.dirname(__file__))
sys.path.append(basedir)
sys.path.append(basedir + "/app")

from flask import Flask, render_template, request, jsonify
from woof import Woof
from woof_database import WoofDatabase

app = Flask(__name__)
app.secret_key = b'Woof2-0-2-2'

@app.route('/', methods=['GET'])
def render_index():
    return render_template('index.html')

@app.route('/started', methods=['POST'])
def started():
    data = request.json
    db = WoofDatabase()

    woof = Woof(db)
    woof.record_start(data["description"])
    woof.write_record()
    db.close()

    status = {"date": woof.record.date, "event": woof.record.event, "description": woof.record.description, "status": 200}

    if not woof.written:
        status["status"] = 500

    return status

@app.route('/stopped', methods=['POST'])
def stopped():
    duration = 0
    action = ""

    if request.json is not None:
        data = request.json
        action = data["action"]
        duration = int(data["duration"])

    db = WoofDatabase()
    woof = Woof(db)
    woof.record_stop()
    woof.write_record(duration=duration)
    db.close()

    status = {"date": woof.record.date, "event": woof.record.event, "description": woof.record.description, "status": 200, "action": action}

    if not woof.written:
        status["status"] = 500

    return status

@app.route('/diary', methods=['GET'])
def diary():
    db = WoofDatabase()
    woof = Woof(db)
    diary = woof.get_diary()
    db.close()
    return jsonify(diary)


if __name__ == '__main__':
    app.run(debug=True)
