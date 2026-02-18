var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
import { XeroDialog } from "../../../widgets/xerodialog.js";
export class ConfirmScoutDialog extends XeroDialog {
    constructor(ev) {
        super('Cofirm Scouting Data - ' + ev);
    }
    populateDialog(pdiv) {
        return __awaiter(this, void 0, void 0, function* () {
            let div = document.createElement('div');
            div.className = 'xero-popup-form-edit-dialog-rowdiv';
            pdiv.appendChild(div);
        });
    }
}
//# sourceMappingURL=confirmscoutdialog.js.map