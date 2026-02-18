var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
import { EditWithItemsDialog } from "./editwithitemsdialog.js";
export class EditSelectDialog extends EditWithItemsDialog {
    constructor(formctrl) {
        super('Edit Boolean', formctrl);
    }
    populateDialog(pdiv) {
        return __awaiter(this, void 0, void 0, function* () {
            let item = this.formctrl_.item;
            let label;
            let option;
            this.createTabs(pdiv);
            this.populateTag(this.tab_page_1);
            this.data_type_ = document.createElement('span');
            this.data_type_.className = 'xero-popup-form-edit-dialog-label';
            this.data_type_.innerText = 'Data Type: ' + item.datatype;
            this.tab_page_2.appendChild(this.data_type_);
            this.populateColors(this.tab_page_1);
            yield this.populateFontSelector(this.tab_page_1);
            this.populateChoices(this.tab_page_2, this.data_type_, item.choices);
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
        item.datatype = this.extractDataType();
        item.choices = this.extractChoices();
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
//# sourceMappingURL=editselectdialog.js.map