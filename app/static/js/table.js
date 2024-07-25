export class Table {
    diary;

    constructor(diary) {
        this.diary = diary;
        this.header = this._header();
        this.body = this._body();


    }

    _header() {
        return "<thead class='table-dark'><tr>" +
            " <th scope='col'>Start Time</th>" +
            " <th scope='col'>End Time</th>" +
            " <th scope='col'>Description</th>" +
            "</tr></thead>"
    }

    _body() {
        let tableBody = "<tbody>";

        for (let i = 0; i < this.diary.events.length; i++) {
            let event = this.diary.events[i]
            tableBody += `<tr><td>${event.start_time}</td><td>${event.end_time}</td><td>${event.description}</td></tr>`
        }

        tableBody += "</tbody>"

        return tableBody;
    }

    updateDisplay() {
        let table = "<table class='table table-responsive-md table-striped table-bordered border-secondary'>" + this.header + this.body + "</table>"
        const id = document.getElementById("diaryTable");
        id.innerHTML = `${table}`;
    }
}