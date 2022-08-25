import {Endpoints, SendRequest} from "./woof-server.js"
import {addClass, removeClass} from "./woof-helpers.js"

export const buttons = {
    yapping : "yapping",
    barking : "barking",
    encouraged : "encouraged",
    quiet: "quiet",
};

export const events = {
    started : "started",
    stopped : "stopped",
};

export class Woof {
    constructor(uri) {
        this._baseUri = uri;
        this.durationInterval;
        this.elapasedTime = 0;
    }

    started(description) {
        let endpoint = this._getEndpoint(Endpoints.started);
        let body = {
            description: description,
        }

        console.info(`started ${description} --> ${endpoint}`)

        return SendRequest('POST', endpoint, body)
            .then(data => this._startedStatus(data))
            .then(response => { return response; })
            .catch(err => this._restError(err));
    }

    _startedStatus(data) {
        console.info("started status " + JSON.stringify(data));
        this._startDurationTimer();
        this._updateStatus(data);
        return status;
    }

    stopped() {
        let endpoint = this._getEndpoint(Endpoints.stopped);

        console.info(`stopped --> ${endpoint}`)

        return SendRequest('POST', endpoint)
            .then(data => this._stoppedStatus(data))
            .then(response => { return response; })
            .catch(err => this._restError(err));
    }

    _stoppedStatus(data) {
        console.info("stopped status " + JSON.stringify(data));
        this._stopDurationTimer();
        this._updateStatus(data);
        return data;
    }

    getDiary() {
        let endpoint = this._getEndpoint(Endpoints.diary);

        console.info(`diary --> ${endpoint}`)

        return SendRequest('GET', endpoint)
            .then(data => this._diaryStatus(data))
            .then(response => { return response; })
            .catch(err => this._restError(err));
    }

    _diaryStatus(data) {
        console.info("diary status " + JSON.stringify(data));
        this._createDataTable(data)
        return data;
    }

    _createDataTable(data) {
        let titles = ["Start Time", "End Time", "Description"];

        const tableHeader = "<thead class='table-dark'><tr>" +
            " <th scope='col'>Start Time</th>" +
            " <th scope='col'>End Time</th>" +
            " <th scope='col'>Description</th>" +
            "</tr></thead>"

        let tableBody = "<tbody>";

        for (let i =0; i < data.length; i++) {
            let record = data[i]
            tableBody += `<tr><td>${record.start_time}</td><td>${record.end_time}</td><td>${record.description}</td></tr>`
        }

        tableBody += "</tbody>"

        let table = "<table class='table table-responsive-md table-striped table-bordered border-secondary'>" + tableHeader + tableBody + "</table>"

        const id = document.getElementById("diaryTable");
        id.innerHTML = `${table}`;
    }

    _getEndpoint(endpoint) {
        return this._baseUri + endpoint;
    }

    _restError(err) {
       console.error(`request failed (${err})`);
    }

    _updateStatus(status) {
        const id = document.getElementById("status");
        if (status.status === 200) {
            id.innerHTML = `${status.description} ${status.event} at ${status.date}`;
        }

        this._disableButtons(status);
    }

    _startDurationTimer() {
        this._stopDurationTimer();

        this.elapasedTime = 0;
        this.durationInterval = setInterval(function() {this._updateDuration()}.bind(this), 1000);
    }

    _stopDurationTimer() {
        clearInterval(this.durationInterval);
    }

    _updateDuration() {
        this.elapasedTime++;
        const id = document.getElementById("duration");
        id.innerHTML = `${this.elapasedTime} seconds elapsed`;
    }

    _disableButtons(status) {
        if (status.event === events.started ) {
            this._setButtonState(buttons.yapping, false);
            this._setButtonState(buttons.barking, false);
            this._setButtonState(buttons.encouraged, false);
            this._setButtonState(buttons.quiet, true);
        } else {
            this._setButtonState(buttons.yapping, true);
            this._setButtonState(buttons.barking, true);
            this._setButtonState(buttons.encouraged, true);
            this._setButtonState(buttons.quiet, false);
        }
    }

    _setButtonState(button, enabled) {
        const id = document.getElementById(button);
        if (enabled) {
            removeClass(id, "disabled");
            id.disabled = ""
        } else {
            addClass(id, "disabled");
            id.disabled = "true"
        }
    }
}
