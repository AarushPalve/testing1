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
export class EditLabelDialog extends EditFormControlDialog {
    constructor(formctrl) {
        super('Edit Label', formctrl);
    }
    populateDialog(pdiv) {
        return __awaiter(this, void 0, void 0, function* () {
            let item = this.formctrl_.item;
            let label;
            let div = document.createElement('div');
            div.className = 'xero-popup-form-edit-dialog-rowdiv';
            this.text_string_ = document.createElement('input');
            this.text_string_.type = 'text';
            this.text_string_.className = 'xero-popup-form-edit-dialog-input';
            this.text_string_.value = item.text;
            label = document.createElement('label');
            label.className = '.xero-popup-form-edit-dialog-label';
            label.innerText = 'Text';
            label.appendChild(this.text_string_);
            div.appendChild(label);
            this.populateColors(div);
            yield this.populateFontSelector(div);
            pdiv.appendChild(div);
        });
    }
    extractData() {
        let item = this.formctrl_.item;
        item.text = this.text_string_.value;
        item.fontFamily = this.font_name_.value;
        item.fontSize = parseInt(this.font_size_.value);
        item.fontStyle = this.font_style_.value;
        item.fontWeight = this.font_weight_.value;
        item.color = this.text_color_.value;
        item.background = this.background_color_.value;
        item.transparent = this.transparent_.checked;
    }
    setFocus() {
        if (this.text_string_) {
            this.text_string_.focus();
            this.text_string_.select();
        }
    }
    onInit() {
        setTimeout(this.setFocus.bind(this), 100);
    }
}
//# sourceMappingURL=editlabeldialog.js.map