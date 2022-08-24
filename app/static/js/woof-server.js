export class APIError extends Error {
    constructor(message, response) {
        super(message);
        this.name = "APIError";
        this.response = response;
    }
}

export const SendRequest = async function (method, endpoint, body) {
    let init = {
        method: method,
        headers: {
            'Accept': 'application/json',
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(body)
    }

    const response = await fetch(endpoint, init);

    if (!response.ok) {
        let message = `${endpoint} failed with status ${response.status}`;
        console.error(message);
        throw new APIError(message, response);
    }

    let data = {}

    try {
        data = await response.json();
    } catch (e) {
        throw new APIError(`SendRequest no data received from ${endpoint} ${response.status}`, response);
    }

    return data;
}

export const Endpoints = {
    started: "/started",
    stopped: "/stopped",
}
