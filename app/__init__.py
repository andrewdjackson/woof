import os
import sys

#
# add the app folder to the system path so the application classes and modules can be found
#
basedir = os.path.abspath(os.path.dirname(__file__))
sys.path.append(basedir)
sys.path.append(basedir + "/app")

from flask import Flask, render_template, request, redirect, url_for, send_from_directory, session, flash, make_response
from flask_wtf.csrf import CSRFProtect, CSRFError
from woof import Woof
from woof_database import WoofDatabase

app = Flask(__name__)
app.secret_key = b'Woof2-0-2-2'
#csrf = CSRFProtect(app)

@app.errorhandler(CSRFError)
def csrf_error(e):
    return e.description, 400

@app.route('/', methods=['GET'])
def render_index():
    return render_template('index.html')

@app.route('/started', methods=['POST'])
def started():
    data = request.json
    woof = Woof()
    woof.record_start(data["description"])
    woof.write_record()
    return {"status":200}

@app.route('/stopped', methods=['POST'])
def stopped():
    woof = Woof()
    woof.record_stop()
    woof.write_record()
    return {"status":200}

if __name__ == '__main__':
    app.run(debug=True)
