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
export class EditImageDialog extends EditFormControlDialog {
    constructor(formctrl, images) {
        super('Edit Label', formctrl);
        this.images_ = images;
    }
    populateDialog(pdiv) {
        return __awaiter(this, void 0, void 0, function* () {
            let item = this.formctrl_.item;
            let option;
            let label;
            let div = document.createElement('div');
            div.className = 'xero-popup-form-edit-dialog-rowdiv';
            this.image_name_ = document.createElement('select');
            this.image_name_.className = "xero-popup-form-edit-dialog-select";
            for (let image of this.images_) {
                option = document.createElement("option");
                option.value = image;
                option.innerText = image;
                if (image === item.image) {
                    option.selected = true;
                }
                this.image_name_.appendChild(option);
            }
            label = document.createElement('label');
            label.className = 'xero-popup-form-edit-dialog-label';
            label.innerText = 'Image';
            label.appendChild(this.image_name_);
            div.appendChild(label);
            this.mirror_x_ = document.createElement("input");
            this.mirror_x_.type = "checkbox";
            this.mirror_x_.checked = this.formctrl_.item.transparent;
            this.mirror_x_.className = "xero-popup-form-edit-dialog-checkbox";
            this.mirror_x_.checked = item.mirrorx;
            label = document.createElement("label");
            label.className = "xero-popup-form-edit-dialog-label";
            label.innerText = "Mirror X";
            label.appendChild(this.mirror_x_);
            div.appendChild(label);
            this.mirror_y_ = document.createElement("input");
            this.mirror_y_.type = "checkbox";
            this.mirror_y_.checked = this.formctrl_.item.transparent;
            this.mirror_y_.className = "xero-popup-form-edit-dialog-checkbox";
            this.mirror_y_.checked = item.mirrory;
            label = document.createElement("label");
            label.className = "xero-popup-form-edit-dialog-label";
            label.innerText = "Mirror Y";
            label.appendChild(this.mirror_y_);
            div.appendChild(label);
            this.field_ = document.createElement("input");
            this.field_.type = "checkbox";
            this.field_.checked = this.formctrl_.item.transparent;
            this.field_.className = "xero-popup-form-edit-dialog-checkbox";
            this.field_.checked = item.field;
            label = document.createElement("label");
            label.className = "xero-popup-form-edit-dialog-label";
            label.innerText = "Field";
            label.appendChild(this.field_);
            div.appendChild(label);
            this.populateColors(div);
            yield this.populateFontSelector(div);
            pdiv.appendChild(div);
        });
    }
    extractData() {
        let item = this.formctrl_.item;
        item.image = this.image_name_.value;
        item.fontFamily = this.font_name_.value;
        item.fontSize = parseInt(this.font_size_.value);
        item.fontStyle = this.font_style_.value;
        item.fontWeight = this.font_weight_.value;
        item.color = this.text_color_.value;
        item.background = this.background_color_.value;
        item.transparent = this.transparent_.checked;
        item.mirrorx = this.mirror_x_.checked;
        item.mirrory = this.mirror_y_.checked;
        item.field = this.field_.checked;
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
//# sourceMappingURL=editimagectrldialog.js.map