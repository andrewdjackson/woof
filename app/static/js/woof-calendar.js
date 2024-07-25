import {isEventOnTheSameDay, formatEventTime} from "./woof-helpers.js";

const CALENDAR_ELEMENT = '#calendar';

export class WoofCalendar {
    calendar;
    diary;

    constructor(diary) {
        this.diary = diary;
        this._createCalendar()
    }

    _createCalendar() {
        this.calendar = new Calendar(CALENDAR_ELEMENT, {
            style: "background",
            enableContextMenu: true,
            enableRangeSelection: false,
            minDate: new Date("08/01/2022"),
            maxDate: new Date(),
            dataSource: this._getCalendarData(),
            mouseOnDay: this._showEventsForDay,
            mouseOutDay: this._hideDayView,
        });
    }

    _showEventsForDay(calendarDay) {
        if(calendarDay.events.length > 0) {
            const events = calendarDay.events;
            let content = '';

            for(let i in events) {
                let event = events[i];
                let startTime = formatEventTime(event.startDate);
                let endTime = formatEventTime(event.endDate);

                content += '<div class="event-tooltip-content">'
                    + `<div class="event-description"><span class="${event.class}">${startTime} - ${endTime} ${event.description}</span></div>`
                    + '</div>';
            }

            $(calendarDay.element).popover({
                trigger   : 'manual',
                container : 'body',
                html      : true,
                content   : content
            });

            $(calendarDay.element).popover('show');
        }
    }

    _hideDayView(calendarEvent) {
        if(calendarEvent.events.length > 0) {
            $(calendarEvent.element).popover('hide');
        }
    }

    _getCalendarData() {
        let calendarData = []
        let currentDay = undefined;
        let totalScore = 0;
        let totalElapsed = 0;

        for (let i= 0; i < this.diary.events.length; i++) {
            let record = this.diary.events[i];

            if (isEventOnTheSameDay(record.start_time, currentDay)) {
                if (record.elapsed > 0) {
                    // aggregate total score and elapsed time
                    totalElapsed += record.elapsed;
                    totalScore += record.score;
                }
            } else {
                totalScore = record.score;
                totalElapsed = record.elapsed;
                currentDay = record.start_time;
            }

            const calendarColor = this._getColor(totalScore);

            const event = {
                id:i,
                color: calendarColor.color,
                class: this._getUnsocialClass(record),
                description: record.description,
                startDate: record.start_time,
                endDate: record.end_time,
                totalScore: totalScore,
                totalElapsed: totalElapsed
            };

            calendarData.push(event);
        }

        return calendarData;
    }

    _getUnsocialClass(woofEvent) {
        if (!woofEvent.unsocialHours) {
            if (woofEvent.score <= 1) {
                return "acceptable";
            }

            if (woofEvent.score <= 3) {
                return "unacceptable";
            }
        }

        return "unsocial";
    }

    _getColor(count) {
        if (count <= 3) {
            return {class: "quiet", color: "rgba(120,188,10,0.9)"};
            //return "rgba(120,188,10,0.9)"
        }

        if (count <= 4) {
            return {class: "slightly_noisy", color: "rgba(206,232,89,0.8)"};
        }

        if (count <= 5) {
            return {class: "noisy", color: "rgba(248,218,69,0.9)"};
        }

        if (count <= 7) {
            return {class: "very_noisy", color: "rgba(255,174,20,0.9)"};
        }

        return {class: "excessively_noisy", color: "rgba(238,16,16,0.9)"};
    }
}