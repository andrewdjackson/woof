import {Endpoints, SendRequest} from "./woof-server.js"
import {addClass, removeClass, formatEventTime, datesAreOnTheSameDay} from "./woof-helpers.js"
import {Table} from "./table.js";

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
        }, 300);
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
        let totalElapsed = 0;

        for (let i= 0; i < data.length; i++) {
            let record = data[i]
            const start_time = this._getDateFromString(record.start_time);
            const end_time = this._getDateFromString(record.end_time);
            const elapsed = Math.abs(Math.ceil((end_time.getTime() - start_time.getTime()) / 60000));

            if (datesAreOnTheSameDay(start_time, currentDay)) {
                if (elapsed > 0) {
                    // increment for every 2 minutes of barking
                    count += Math.ceil(elapsed / 2);
                    totalElapsed += elapsed;
                    // add a weighting to the count for early or late events
                    count += this._getTimeWeighting(start_time);
                }
            } else {
                count = Math.ceil(elapsed / 2);
                totalElapsed = elapsed;
                currentDay = start_time;
            }

            const color = this._getColor(count);

            calendarData.push({
                id:i,
                color: color,
                count: count,
                description: record.description,
                startDate:start_time,
                endDate:end_time,
                totalElapsed: totalElapsed
            });
        }

        return calendarData;
    }

    _getTimeWeighting(start_time) {
        let early = start_time;
        early.setHours(8);
        early.setMinutes(0);
        early.setMilliseconds(0);

        let late = start_time;
        late.setHours(21);
        late.setMinutes(0);
        late.setMilliseconds(0);

        if ((start_time <= early)||(start_time >= late)) {
            return 2;
        }

        return 0;
    }

    _getColor(count) {
        if (count <= 3) {
            return "rgba(120,188,10,0.9)"
        }

        if (count <= 4) {
            return "rgba(206,232,89,0.8)"
        }

        if (count <= 5) {
            return "rgba(248,218,69,0.9)"
        }

        if (count <= 7) {
            return "rgba(255,174,20,0.9)"
        }

        return "rgba(238,16,16,0.9)"
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
        const dataTable = new Table(data);

        let table = "<table class='table table-responsive-md table-striped table-bordered border-secondary'>" + dataTable.header + dataTable.body + "</table>"
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
