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
export class EditBooleanDialog extends EditFormControlDialog {
    constructor(formctrl) {
        super('Edit Boolean', formctrl);
    }
    populateDialog(pdiv) {
        return __awaiter(this, void 0, void 0, function* () {
            let label;
            let div = document.createElement('div');
            div.className = 'xero-popup-form-edit-dialog-rowdiv';
            this.populateTag(div);
            this.populateColors(div);
            this.accent_color_ = document.createElement('input');
            this.accent_color_.className = 'xero-popup-form-edit-dialog-color';
            this.accent_color_.type = 'color';
            this.accent_color_.value = EditFormControlDialog.colorNameToHex(this.formctrl_.item.color);
            label = document.createElement('label');
            label.className = 'xero-popup-form-edit-dialog-label';
            label.innerText = 'Accent Color';
            label.appendChild(this.accent_color_);
            div.appendChild(label);
            pdiv.appendChild(div);
        });
    }
    extractData() {
        var _a, _b, _c, _d;
        let item = this.formctrl_.item;
        this.formctrl_.item.tag = ((_a = this.tag_) === null || _a === void 0 ? void 0 : _a.value) || '';
        this.formctrl_.item.color = ((_b = this.text_color_) === null || _b === void 0 ? void 0 : _b.value) || 'black';
        this.formctrl_.item.background = ((_c = this.background_color_) === null || _c === void 0 ? void 0 : _c.value) || 'white';
        item.accent = ((_d = this.accent_color_) === null || _d === void 0 ? void 0 : _d.value) || 'lightgreen';
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
//# sourceMappingURL=editbooleandialog.js.map