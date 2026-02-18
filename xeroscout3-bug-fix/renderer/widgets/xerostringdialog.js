import { XeroDialog } from "./xerodialog.js";
export class XeroStringDialog extends XeroDialog {
    constructor(title, message, defaultValue, placeholder) {
        super(title, false); // false means OK/Cancel buttons, not Yes/No
        this.message_ = message;
        this.defaultValue_ = defaultValue;
        this.placeholder_ = placeholder;
    }
    populateDialog(div) {
        // Create message label
        if (this.message_) {
            const messageDiv = document.createElement('div');
            messageDiv.className = 'xero-string-dialog-message';
            messageDiv.innerHTML = this.message_;
            div.appendChild(messageDiv);
        }
        // Create input field
        this.inputElement_ = document.createElement('input');
        this.inputElement_.type = 'text';
        this.inputElement_.className = 'xero-string-dialog-input';
        if (this.defaultValue_) {
            this.inputElement_.value = this.defaultValue_;
        }
        if (this.placeholder_) {
            this.inputElement_.placeholder = this.placeholder_;
        }
        div.appendChild(this.inputElement_);
    }
    onInit() {
        // Set focus to the input field and select the text if there's a default value
        if (this.inputElement_) {
            this.inputElement_.focus();
            if (this.defaultValue_) {
                this.inputElement_.select();
            }
        }
    }
    isOKToClose(ok) {
        if (ok && this.inputElement_) {
            // Store the result when OK is pressed
            this.resultValue_ = this.inputElement_.value;
        }
        else {
            // Clear result when Cancel is pressed
            this.resultValue_ = undefined;
        }
        return true;
    }
    getResult() {
        return this.resultValue_;
    }
    // Expose inherited methods for use in the application
    showCentered(win) {
        super.showCentered(win);
    }
    showRelative(win, x, y) {
        super.showRelative(win, x, y);
    }
    // Expose EventEmitter methods
    on(event, listener) {
        return super.on(event, listener);
    }
    once(event, listener) {
        return super.once(event, listener);
    }
}
//# sourceMappingURL=xerostringdialog.js.map