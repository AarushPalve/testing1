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
export class EditUpDownControlDialog extends EditFormControlDialog {
    constructor(formctrl) {
        super('Edit UpDown', formctrl);
    }
    populateDialog(pdiv) {
        return __awaiter(this, void 0, void 0, function* () {
            let item = this.formctrl_.item;
            let label;
            let option;
            let div = document.createElement('div');
            div.className = 'xero-popup-form-edit-dialog-rowdiv';
            this.populateTag(div);
            this.populateOrientation(div, item.orientation);
            this.min_value_ = document.createElement("input");
            this.min_value_.type = "number";
            this.min_value_.className = "xero-popup-form-edit-dialog-input";
            this.min_value_.value = item.minvalue.toString();
            label = document.createElement("label");
            label.className = "xero-popup-form-edit-dialog-label";
            label.innerText = "Minimum Value";
            label.appendChild(this.min_value_);
            div.appendChild(label);
            this.max_value_ = document.createElement("input");
            this.max_value_.type = "number";
            this.max_value_.className = "xero-popup-form-edit-dialog-input";
            this.max_value_.value = item.maxvalue.toString();
            label = document.createElement("label");
            label.className = "xero-popup-form-edit-dialog-label";
            label.innerText = "Maximum Value";
            label.appendChild(this.max_value_);
            div.appendChild(label);
            this.populateColors(div);
            yield this.populateFontSelector(div);
            pdiv.appendChild(div);
        });
    }
    extractData() {
        let item = this.formctrl_.item;
        item.tag = this.tag_.value;
        item.color = this.text_color_.value;
        item.background = this.background_color_.value;
        item.fontFamily = this.font_name_.value;
        item.fontSize = parseInt(this.font_size_.value);
        item.fontWeight = this.font_weight_.value;
        item.fontStyle = this.font_style_.value;
        item.transparent = this.transparent_.checked;
        item.orientation = this.orientation_.value;
        item.minvalue = parseFloat(this.min_value_.value);
        item.maxvalue = parseFloat(this.max_value_.value);
    }
    setFocus() {
        if (this.tag_) {
            this.tag_.focus();
            this.tag_.select();
        }
    }
    onInit() {
        setTimeout(this.setFocus.bind(this), 100);
    }
}
//# sourceMappingURL=editupdowndialog.js.map