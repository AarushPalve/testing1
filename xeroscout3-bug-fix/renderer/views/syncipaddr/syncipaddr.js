import { XeroView } from "../xeroview.js";
import { SyncSetupDialog } from "./syncdialog.js";
export class XeroSyncIPAddrView extends XeroView {
    constructor(app) {
        super(app, 'xero-sync-ip-addr');
        this.dialog_ = new SyncSetupDialog();
        this.dialog_.on('closed', this.dialogClosed.bind(this));
    }
    onVisible() {
        this.dialog_.showCentered(this.elem);
    }
    dialogClosed(changed) {
        if (changed) {
            this.request('sync-ipaddr', { ipaddr: this.dialog_.ipaddr, port: this.dialog_.port });
        }
        else {
            let newview = {
                view: "text",
                args: ['Sync Cancelled']
            };
            this.app.updateView(newview);
        }
    }
}
//# sourceMappingURL=syncipaddr.js.map