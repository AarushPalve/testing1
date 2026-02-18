import { XeroView } from "../xeroview.js";
import { SelectTabletDialog } from "./selecttabletdialog.js";
export class XeroSelectTablet extends XeroView {
    constructor(app) {
        super(app, 'xero-select-tablet-view');
        this.tablets_ = [];
        this.registerCallback('send-tablet-data', this.formCallback.bind(this));
        this.request('get-tablet-data');
    }
    formCallback(data) {
        this.dialog_ = new SelectTabletDialog(data);
        this.dialog_.on('closed', this.dialogClosed.bind(this));
        this.dialog_.showRelative(this.elem, 100, 100);
    }
    dialogClosed() {
        if (this.dialog_) {
            if (this.dialog_.selectedTablet) {
                this.request('set-tablet-name-purpose', this.dialog_.selectedTablet);
                this.dialog_ = undefined;
            }
            else {
                alert('No tablet selected');
                this.dialog_ = new SelectTabletDialog(this.tablets_);
                this.dialog_.on('closed', this.dialogClosed.bind(this));
            }
        }
    }
}
//# sourceMappingURL=selecttablet.js.map