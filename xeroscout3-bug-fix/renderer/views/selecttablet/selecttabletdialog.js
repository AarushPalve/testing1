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
export class SelectTabletDialog extends XeroDialog {
    constructor(tablets) {
        super('Select Tablet');
        this.tablets_ = tablets;
    }
    get selectedTablet() {
        return this.selected_tablet_;
    }
    populateDialog(pdiv) {
        return __awaiter(this, void 0, void 0, function* () {
            let div = document.createElement('div');
            div.className = 'xero-db-dialog-hide-show';
            this.table_ = new TabulatorFull(div, {
                data: this.tablets_,
                selectableRows: 1,
                columns: [
                    { title: 'Tablet Name', field: 'name', width: 200 },
                    { title: 'Tablet Type', field: 'purpose', width: 200 },
                ],
                layout: 'fitColumns',
            });
            pdiv.appendChild(div);
        });
    }
    isOKToClose(ok) {
        var _a;
        let ret = true;
        let rows = (_a = this.table_) === null || _a === void 0 ? void 0 : _a.getSelectedRows();
        if (rows && rows.length === 1) {
            let data = rows[0].getData();
            this.selected_tablet_ = {
                name: data.name,
                purpose: data.purpose
            };
        }
        else {
            alert('You must select a tablet before closing this dialog.');
            ret = false;
        }
        return ret;
    }
}
//# sourceMappingURL=selecttabletdialog.js.map