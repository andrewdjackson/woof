import {Endpoints, SendRequest} from "./woof-server.js"

export class Woof {
    constructor(uri) {
        this._baseUri = uri;
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
        return data;
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
        return data;
    }

    _getEndpoint(endpoint) {
        return this._baseUri + endpoint;
    }

    _restError(err) {
        throw new Error(`request failed (${err})`);
    }
}
