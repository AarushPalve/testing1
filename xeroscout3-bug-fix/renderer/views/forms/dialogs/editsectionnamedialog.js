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
export class EditSectionNameDialog extends XeroDialog {
    constructor(oldname) {
        super('Edit Section Name');
        this.newname_ = '';
        this.oldname_ = oldname;
    }
    get enteredName() {
        return this.newname_;
    }
    populateDialog(pdiv) {
        return __awaiter(this, void 0, void 0, function* () {
            let div = document.createElement('div');
            div.className = 'xero-popup-form-edit-dialog-rowdiv';
            this.section_name_ = document.createElement('input');
            this.section_name_.type = 'text';
            this.section_name_.className = 'xero-popup-form-edit-dialog-input';
            this.section_name_.value = this.oldname_;
            let label = document.createElement('label');
            label.className = 'xero-popup-form-edit-dialog-label';
            label.innerText = 'Section Name';
            label.appendChild(this.section_name_);
            div.appendChild(label);
            pdiv.appendChild(div);
        });
    }
    onInit() {
        if (this.section_name_) {
            this.section_name_.focus();
            this.section_name_.select();
        }
    }
    okButton(event) {
        this.newname_ = this.section_name_.value;
        super.okButton(event);
    }
}
//# sourceMappingURL=editsectionnamedialog.js.map