import { TabulatorFull } from "tabulator-tables";
import { XeroView } from "./xeroview.js";
export class XeroTeamStatus extends XeroView {
    constructor(app, args) {
        super(app, 'xero-team-status');
        this.registerCallback('send-team-status', this.receivedTeamStatus.bind(this));
        this.request('get-team-status', args);
    }
    receivedTeamStatus(args) {
        this.main_div_ = document.createElement('div');
        this.main_div_.classList.add('xero-teamstatus-view');
        this.elem.appendChild(this.main_div_);
        this.table_ = new TabulatorFull(this.main_div_, {
            data: args,
            columns: [
                { title: 'Number', field: 'number' },
                { title: 'Name', field: 'teamname' },
                { title: 'Tablet', field: 'tablet' },
                { title: 'Status', field: 'status', formatter: this.cellFormatter.bind(this) },
            ],
        });
    }
    cellFormatter(cell, params, onRendered) {
        let val = cell.getValue();
        let el = cell.getElement();
        if (val == 'Y') {
            el.style.fontSize = '16px';
            el.style.textAlign = 'center';
            el.style.backgroundColor = 'green';
            el.style.color = 'white';
            val = 'Scouted';
        }
        else {
            val = '';
        }
        return val;
    }
}
//# sourceMappingURL=teamstatus.js.map