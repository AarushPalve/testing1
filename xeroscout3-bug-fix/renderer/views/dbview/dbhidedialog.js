var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
import { TabulatorFull } from "tabulator-tables";
import { XeroDialog } from "../../widgets/xerodialog.js";
export class ShowHideColumnsDialog extends XeroDialog {
    constructor(colcfg) {
        super('Show/Hide/Freeze Columns');
        this.colcfgs_ = colcfg;
    }
    populateDialog(pdiv) {
        return __awaiter(this, void 0, void 0, function* () {
            let div = document.createElement('div');
            div.className = 'xero-db-dialog-hide-show';
            this.table_ = new TabulatorFull(div, {
                data: this.generateData(),
                columns: [
                    { title: 'Column Name', field: 'name', width: 200 },
                    { title: 'Visible', field: 'visible', formatter: 'tickCross', width: 100 },
                    { title: 'Frozen', field: 'frozen', formatter: 'tickCross', width: 100 },
                ],
                layout: 'fitColumns',
            });
            this.table_.on('cellClick', this.cellClick.bind(this));
            pdiv.appendChild(div);
        });
    }
    cellClick(e, cell) {
        if (cell.getField() === 'visible') {
            let data = cell.getData();
            data.visible = !data.visible;
            cell.setValue(data.visible);
        }
        else if (cell.getField() === 'frozen') {
            let pos = cell.getRow().getPosition();
            if (typeof pos !== 'number') {
                return;
            }
            if (pos === 1) {
                let data = cell.getData();
                if (data.frozen) {
                    for (let row of this.table_.getRows()) {
                        let rcell = row.getCell('frozen');
                        let rdata = rcell.getData();
                        rdata.frozen = false;
                        rcell.setValue(rdata.frozen);
                    }
                }
                else {
                    data.frozen = true;
                    cell.setValue(data.frozen);
                }
            }
            else {
                for (let row of this.table_.getRows()) {
                    let rcell = row.getCell('frozen');
                    let rdata = rcell.getData();
                    rdata.frozen = (row.getPosition() <= pos),
                        rcell.setValue(rdata.frozen);
                }
            }
        }
    }
    generateData() {
        let data = [];
        for (let i = 0; i < this.colcfgs_.columns.length; i++) {
            let colcfg = this.colcfgs_.columns[i];
            data.push({
                name: colcfg.name,
                visible: !colcfg.hidden,
                frozen: (i < this.colcfgs_.frozenColumnCount) ? true : undefined,
            });
        }
        return data;
    }
    okButton(event) {
        let index = 0;
        this.colcfgs_.frozenColumnCount = 0;
        for (let row of this.table_.getRows()) {
            let data = row.getData();
            let colcfg = this.colcfgs_.columns[index];
            colcfg.hidden = !data.visible;
            if (data.frozen) {
                this.colcfgs_.frozenColumnCount = index + 1;
            }
            index++;
        }
        super.okButton(event);
    }
}
//# sourceMappingURL=dbhidedialog.js.map