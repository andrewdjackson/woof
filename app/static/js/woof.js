import {Endpoints, SendRequest} from "./woof-server.js"
import {addClass, removeClass, formatEventTime, datesAreOnTheSameDay} from "./woof-helpers.js"

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

    stopped(duration) {
        let endpoint = this._getEndpoint(Endpoints.stopped);
        let body = {
            duration: duration,
        }

        console.info(`stopped --> ${endpoint}`)

        return SendRequest('POST', endpoint, body)
            .then(data => this._stoppedStatus(data))
            .then(data => this._flashButton(duration))
            .then(response => { return response; })
            .catch(err => this._restError(err));
    }

    _stopWithDuration(duration) {
        console.info("stopped with duration " + duration);
    }

    _stoppedStatus(data) {
        console.info("stopped status " + JSON.stringify(data));
        this._stopDurationTimer();
        this._updateStatus(data);
        return data;
    }

    _flashButton(duration) {
        const id = document.getElementById(`quiet${duration}`);
        addClass(id, 'flash');
        setTimeout(function () {
            removeClass(id, 'flash');
        }, 200);
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
        this._displayCalendar(data);
        this._createDataTable(data);
        return data;
    }

    _displayCalendar(data) {
        let currentYear = new Date().getFullYear();

        var calendar = new Calendar('#calendar', {
            style: "background",
            enableContextMenu: true,
            enableRangeSelection: false,
            mouseOnDay: this._showEventsForDay,
            mouseOutDay: function(e) {
                if(e.events.length > 0) {
                    $(e.element).popover('hide');
                }
            },
            dayContextMenu: function(e) {
                $(e.element).popover('hide');
            },
            dataSource: this._getCalendarData(data)
        });

        calendar.setMinDate(new Date("08/01/2022"));
        calendar.setMaxDate(new Date());
        calendar.setDataSource = this._getCalendarData(data);
    }

    _showEventsForDay(e) {
        if(e.events.length > 0) {
            var content = '';

            for(var i in e.events) {
                let event = e.events[i];
                let startTime = formatEventTime(event.startDate);
                let endTime = formatEventTime(event.endDate);

                content += '<div class="event-tooltip-content">'
                    + `<div class="event-description" style="color:${event.color}">${startTime} - ${endTime} ${event.description}</div>`
                    + '</div>';
            }

            $(e.element).popover({
                trigger: 'manual',
                container: 'body',
                html:true,
                content: content
            });

            $(e.element).popover('show');
        }
    }

    _getCalendarData(data) {
        let calendarData = []
        let currentDay = undefined;
        let count = 0;

        for (let i= 0; i < data.length; i++) {
            let record = data[i]
            let start_time = this._getDateFromString(record.start_time);
            let end_time = this._getDateFromString(record.end_time);

            if (datesAreOnTheSameDay(start_time, currentDay)) {
                count++;
            } else {
                count = 0;
                currentDay = start_time;
            }

            let color = this._getColor(count);

            calendarData.push({
                id:i,
                color: color,
                count: count,
                description: record.description,
                startDate:start_time,
                endDate:end_time
            });
        }

        return calendarData;
    }

    _getColor(count) {
        if (count <= 1) {
            return "#78bc0a"
        }

        if (count <= 3) {
            return "#e8d559"
        }

        if (count <= 5) {
            return "rgba(248,182,69,0.9)"
        }

        return "#ea4b37"
    }

    _getDateFromString(dateString) {
        let dateDay = dateString.slice(0,2);
        let dateMonth = dateString.slice(3,5);
        let dateYear = dateString.slice(6,10);
        let dateTime = dateString.slice(11);

        let newDateString = `${dateYear}/${dateMonth}/${dateDay} ${dateTime}`;
        return new Date(newDateString);
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
