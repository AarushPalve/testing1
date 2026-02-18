import { XeroPopup } from "../widgets/xeropopup.js";
import { XeroWidget } from "../widgets/xerowidget.js";
export class XeroView extends XeroWidget {
    constructor(app, cname) {
        super('div', cname);
        this.app_ = app;
        this.hint_popup_ = new XeroPopup();
        this.hint_cb_ = this.hintClosed.bind(this);
        this.hint_popup_.on('popup-closed', this.hint_cb_);
    }
    get isOkToClose() {
        return true;
    }
    get app() {
        return this.app_;
    }
    close() {
        super.close();
        if (this.hint_popup_) {
            this.hint_popup_.off('popup-closed', this.hint_cb_);
            this.hint_popup_.closePopup();
        }
    }
    onVisible() {
        // This method can be overridden by subclasses to perform actions when the view becomes visible
    }
    reset() {
        this.elem.innerHTML = "";
    }
    resetElem(elem) {
        elem.innerHTML = "";
    }
    startupMessage(msg) {
        this.reset();
        this.empty_div_ = document.createElement("div");
        this.empty_div_.className = "xero-text-div";
        this.span_ = document.createElement("span");
        this.span_.className = "xero-text-span";
        this.span_.innerHTML = "<b>" + msg + "</b>";
        this.empty_div_.append(this.span_);
        this.elem.append(this.empty_div_);
    }
    hintClosed(hidden) {
        if (hidden) {
            this.app_.hintDB.setHintClosed(this.hintid_);
        }
    }
    displayHint(id, pt) {
        this.hintid_ = id;
        let hint = this.app_.hintDB.getHint(id);
        if (hint && !hint.hidden) {
            this.hint_popup_.showPopup(this.elem, 'Hint', hint.text, 'Hide this hint', pt);
        }
    }
}
//# sourceMappingURL=xeroview.js.map
