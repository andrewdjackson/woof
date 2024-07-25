import {Endpoints, SendRequest} from "./woof-server.js";
import {WoofEvent} from "./woof-event.js";

export class Diary {
    events;
    _baseUri;

    constructor() {
        this._baseUri = window.location.href.split("/").slice(0, 3).join("/");
    }

    async loadEvents() {
        await this._getEvents();
    }

    _getEvents() {
        let endpoint = this._getEndpoint(Endpoints.diary);

        return SendRequest('GET', endpoint)
            .then(data => this._createDiary(data))
            .then(response => { return response; })
            .catch(err => this._restError(err));
    }

    _createDiary(data) {
        this.events = [];

        for (let i = 0; i < data.length; i++ ) {
            const event = new WoofEvent(data[i]);
            this.events.push(event);
        }
    }

    _getEndpoint(endpoint) {
        return this._baseUri + endpoint;
    }

    _restError(err) {
        console.error(`request failed (${err})`);
    }
}