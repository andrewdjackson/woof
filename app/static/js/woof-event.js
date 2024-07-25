const UNSOCIAL_EARLY_HOUR = 8;
const UNSOCIAL_LATE_HOUR = 21;

const UNSOCIAL_HOURS_WEIGHTING = 2;
const NO_WEIGHTING = 0;
const ELAPSED_MINUTES_PER_WEIGHT = 2;

const ONE_MINUTE_IN_MS = 60000;

export class WoofEvent {
    id;
    start_time;
    end_time;
    description;
    score;
    unsocialScore;
    durationScore;
    unsocialHours;

    constructor(event) {
        this.id = event.id;
        this.unsocialHours = false;
        this.start_time = this._getDateFromString(event.start_time);
        this.end_time = this._getDateFromString(event.end_time);
        this.elapsed = this._getElapsedTime();
        this.description = event.description;
        this.score = this._getScore();
    }

    _getScore() {
        this.unsocialScore = this._getUnsocialScore();
        this.durationScore = this._getDurationScore();

        return (this.unsocialScore + this.durationScore);
    }

    _getUnsocialScore() {
        const early = this._getUnsocialHour(UNSOCIAL_EARLY_HOUR);
        const late = this._getUnsocialHour(UNSOCIAL_LATE_HOUR);

        if ((this.start_time <= early)||(this.start_time >= late)) {
            this.unsocialHours = true;
            return UNSOCIAL_HOURS_WEIGHTING;
        }

        return NO_WEIGHTING;
    }

    _getDurationScore() {
        // add 1 for every n minutes of barking
        return Math.ceil(this.elapsed / ELAPSED_MINUTES_PER_WEIGHT);
    }

    _getUnsocialHour(hour) {
        let unsocialTime = new Date(this.start_time);
        unsocialTime.setHours(hour);
        unsocialTime.setMinutes(0);
        unsocialTime.setMilliseconds(0);

        return unsocialTime;
    }

    _getElapsedTime() {
        return Math.abs(Math.ceil((this.end_time.getTime() - this.start_time.getTime()) / ONE_MINUTE_IN_MS));
    }

    _getDateFromString(dateString) {
        let dateDay = dateString.slice(0,2);
        let dateMonth = dateString.slice(3,5);
        let dateYear = dateString.slice(6,10);
        let dateTime = dateString.slice(11);

        let newDateString = `${dateYear}/${dateMonth}/${dateDay} ${dateTime}`;
        return new Date(newDateString);
    }
}