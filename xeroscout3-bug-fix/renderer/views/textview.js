import { XeroView } from "./xeroview.js";
export class XeroTextView extends XeroView {
    constructor(app, arg) {
        super(app, 'xero-text-view');
        this.startupMessage(arg);
    }
    setText(text) {
        this.elem.innerHTML = text;
    }
}
//# sourceMappingURL=textview.js.map