import { XeroDialog } from "./xerodialog.js";
export class XeroTextDialog extends XeroDialog {
    constructor(title, message, text) {
        super(title, false);
        this.message_ = message;
        this.text_ = text;
    }
    populateDialog(div) {
        if (this.message_) {
            const messageDiv = document.createElement('div');
            messageDiv.className = 'xero-string-dialog-message';
            messageDiv.innerHTML = this.message_;
            div.appendChild(messageDiv);
        }
        this.textarea_ = document.createElement('textarea');
        this.textarea_.className = 'xero-popup-form-edit-dialog-textarea';
        this.textarea_.rows = 16;
        this.textarea_.value = this.text_;
        this.textarea_.readOnly = true;
        div.appendChild(this.textarea_);
    }
    onInit() {
        this.disableEnterKeyProcessing();
        if (this.textarea_) {
            this.textarea_.focus();
            this.textarea_.select();
        }
    }
}
//# sourceMappingURL=xerotextdialog.js.map