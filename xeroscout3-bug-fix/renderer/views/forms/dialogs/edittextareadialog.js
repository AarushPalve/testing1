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
export class EditTextAreaDialog extends EditFormControlDialog {
    constructor(formctrl) {
        super('Edit Text', formctrl);
    }
    populateDialog(pdiv) {
        return __awaiter(this, void 0, void 0, function* () {
            let item = this.formctrl_.item;
            let label;
            let option;
            let div = document.createElement('div');
            div.className = 'xero-popup-form-edit-dialog-rowdiv';
            this.populateTag(div);
            this.data_type_ = document.createElement('select');
            this.data_type_.className = 'xero-popup-form-edit-dialog-select';
            option = document.createElement('option');
            option.value = 'string';
            option.innerText = 'String';
            this.data_type_.appendChild(option);
            option = document.createElement('option');
            option.value = 'integer';
            option.innerText = 'Integer';
            this.data_type_.appendChild(option);
            option = document.createElement('option');
            option.value = 'real';
            option.innerText = 'Float';
            this.data_type_.appendChild(option);
            this.data_type_.value = this.formctrl_.item.datatype;
            label = document.createElement('label');
            label.className = 'xero-popup-form-edit-dialog-label';
            label.innerText = 'Data Type';
            label.appendChild(this.data_type_);
            div.appendChild(label);
            this.rows_ = document.createElement('input');
            this.rows_.type = 'text';
            this.rows_.className = 'xero-popup-form-edit-dialog-input';
            this.rows_.value = item.rows.toString();
            label = document.createElement('label');
            label.className = 'xero-popup-form-edit-dialog-label';
            label.innerText = 'Rows';
            label.appendChild(this.rows_);
            div.appendChild(label);
            this.cols_ = document.createElement('input');
            this.cols_.type = 'text';
            this.cols_.className = 'xero-popup-form-edit-dialog-input';
            this.cols_.value = item.cols.toString();
            label = document.createElement('label');
            label.className = 'xero-popup-form-edit-dialog-label';
            label.innerText = 'Cols';
            label.appendChild(this.cols_);
            div.appendChild(label);
            this.populateColors(div);
            yield this.populateFontSelector(div);
            pdiv.appendChild(div);
        });
    }
    extractData() {
        if (this.tag_ && this.data_type_ && this.rows_ && this.cols_ && this.font_name_ && this.font_size_ && this.text_color_) {
            let item = this.formctrl_.item;
            item.tag = this.tag_.value;
            item.datatype = this.data_type_.value;
            item.rows = parseInt(this.rows_.value);
            item.cols = parseInt(this.cols_.value);
            item.fontFamily = this.font_name_.value;
            item.fontSize = parseInt(this.font_size_.value);
            item.fontStyle = this.font_style_.value;
            item.fontWeight = this.font_weight_.value;
            item.color = this.text_color_.value;
            item.background = this.background_color_.value;
            item.transparent = this.transparent_.checked;
        }
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
//# sourceMappingURL=edittextareadialog.js.map