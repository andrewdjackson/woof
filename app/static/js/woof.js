import {Endpoints, SendRequest} from "./woof-server.js"
import {addClass, removeClass} from "./woof-helpers.js"
import {Table} from "./table.js";
import {WoofCalendar} from "./woof-calendar.js";
import {Diary} from "./diary.js";

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
    woofCalendar;
    woofTable;
    _baseUri;
    elapsedTime;
    durationInterval;

    constructor() {
        this._baseUri = window.location.href.split("/").slice(0, 3).join("/");
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
    }

    stopped(event) {
        console.log(event);

        let endpoint = this._getEndpoint(Endpoints.stopped);
        let body = {
            action: event.dataset.action,
            duration: event.dataset.duration,
        }

        console.info(`stopped --> ${endpoint}`)

        return SendRequest('POST', endpoint, body)
            .then(response => this._stoppedStatus(response))
            .then(response => this._flashButton(response))
            .then(response => { return response; })
            .catch(err => this._restError(err));
    }

    _stoppedStatus(response) {
        console.info("stopped status " + JSON.stringify(response));
        this._stopDurationTimer();
        this._updateStatus(response);
        return response;
    }

    _flashButton(response) {
        const id = document.getElementById(`${response.action}`);
        addClass(id, 'flash');
        setTimeout(function () {
            removeClass(id, 'flash');
        }, 300);
    }

    async getDiary() {
        const diary = new Diary();
        await diary.loadEvents();

        this.woofCalendar = new WoofCalendar(diary);

        this.woofTable = new Table(diary);
        this.woofTable.updateDisplay();
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
