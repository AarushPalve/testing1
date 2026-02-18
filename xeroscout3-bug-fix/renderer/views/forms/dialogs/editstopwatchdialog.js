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
export class EditStopwatchDialog extends EditFormControlDialog {
    constructor(formctrl) {
        super('Edit Stopwatch', formctrl);
    }
    populateDialog(pdiv) {
        return __awaiter(this, void 0, void 0, function* () {
            var _a;
            let item = this.formctrl_.item;
            let div = document.createElement('div');
            div.className = 'xero-popup-form-edit-dialog-rowdiv';
            this.populateTag(div);
            this.hold_mode_ = document.createElement("input");
            this.hold_mode_.type = "checkbox";
            this.hold_mode_.checked = (_a = item.holdMode) !== null && _a !== void 0 ? _a : true;
            this.hold_mode_.className = "xero-popup-form-edit-dialog-checkbox";
            let mode_label = document.createElement("label");
            mode_label.className = "xero-popup-form-edit-dialog-label";
            mode_label.innerText = "Hold (unchecked = Toggle)";
            mode_label.appendChild(this.hold_mode_);
            div.appendChild(mode_label);
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
        item.holdMode = this.hold_mode_ ? this.hold_mode_.checked : true;
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
//# sourceMappingURL=editstopwatchdialog.js.map