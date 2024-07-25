export class Table {
    data;

    constructor(data) {
        this.data = data;
        this.header = this._header();
        this.body = this._body();
    }

    _header() {
        const tableHeader = "<thead class='table-dark'><tr>" +
            " <th scope='col'>Start Time</th>" +
            " <th scope='col'>End Time</th>" +
            " <th scope='col'>Description</th>" +
            "</tr></thead>"

        return tableHeader;
    }

    _body() {
        let tableBody = "<tbody>";

        for (let i =0; i < this.data.length; i++) {
            let record = this.data[i]
            tableBody += `<tr><td>${record.start_time}</td><td>${record.end_time}</td><td>${record.description}</td></tr>`
        }

        tableBody += "</tbody>"
    }

    _addRow() {

    }
}