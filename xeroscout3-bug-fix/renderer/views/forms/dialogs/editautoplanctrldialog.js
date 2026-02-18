var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
import { EditFormControlDialog } from "./editformctrldialog.js";
export class EditAutoPlanDialog extends EditFormControlDialog {
    constructor(formctrl, images) {
        super('Edit Auto Planner', formctrl);
        this.images_ = images;
    }
    populateDialog(pdiv) {
        return __awaiter(this, void 0, void 0, function* () {
            const item = this.formctrl_.item;
            let label;
            const div = document.createElement('div');
            div.className = 'xero-popup-form-edit-dialog-rowdiv';
            this.image_name_ = document.createElement('select');
            this.image_name_.className = 'xero-popup-form-edit-dialog-select';
            for (const image of this.images_) {
                const option = document.createElement('option');
                option.value = image;
                option.innerText = image;
                if (image === item.fieldImage) {
                    option.selected = true;
                }
                this.image_name_.appendChild(option);
            }
            label = document.createElement('label');
            label.className = 'xero-popup-form-edit-dialog-label';
            label.innerText = 'Field Image';
            label.appendChild(this.image_name_);
            div.appendChild(label);
            this.actions_ = document.createElement('textarea');
            this.actions_.className = 'xero-popup-form-edit-dialog-textarea';
            this.actions_.rows = 6;
            this.actions_.value = (item.approvedActions || []).join('\n');
            label = document.createElement('label');
            label.className = 'xero-popup-form-edit-dialog-label';
            label.innerText = 'Approved Actions (one per line)';
            label.appendChild(this.actions_);
            div.appendChild(label);
            this.allow_multi_ = document.createElement('input');
            this.allow_multi_.type = 'checkbox';
            this.allow_multi_.className = 'xero-popup-form-edit-dialog-checkbox';
            this.allow_multi_.checked = item.allowMultipleAutos;
            label = document.createElement('label');
            label.className = 'xero-popup-form-edit-dialog-label';
            label.innerText = 'Allow Multiple Autos';
            label.appendChild(this.allow_multi_);
            div.appendChild(label);
            pdiv.appendChild(div);
        });
    }
    extractData() {
        const item = this.formctrl_.item;
        item.fieldImage = this.image_name_.value.replace(/\.png$/i, '');
        const raw = this.actions_.value.split(/\r?\n|,/);
        const actions = raw.map(v => v.trim()).filter(v => v.length > 0);
        const normalized = [];
        for (const action of actions) {
            if (!normalized.includes(action)) {
                normalized.push(action);
            }
        }
        for (const required of ['Start', 'End']) {
            if (!normalized.includes(required)) {
                normalized.unshift(required);
            }
        }
        item.approvedActions = normalized;
        item.allowMultipleAutos = this.allow_multi_.checked;
    }
    setFocus() {
        if (this.image_name_) {
            this.image_name_.focus();
        }
    }
    onInit() {
        setTimeout(this.setFocus.bind(this), 100);
    }
}
//# sourceMappingURL=editautoplanctrldialog.js.map