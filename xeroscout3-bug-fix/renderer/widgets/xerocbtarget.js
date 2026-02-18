import { EventEmitter } from 'events';
import { XeroCBManager } from "./cbmanager.js";
export class XeroMainProcessInterface extends EventEmitter {
    constructor() {
        super();
        this.cbs_registered_ = [];
        this.cbs_registered_ = [];
    }
    close() {
        this.unregisterAllCallbacks();
    }
    registerCallback(name, callback) {
        if (XeroMainProcessInterface.cbmgr_) {
            XeroMainProcessInterface.cbmgr_.registerCallback(name, callback);
            this.cbs_registered_.push([name, callback]);
        }
    }
    unregisterAllCallbacks() {
        for (let cb of this.cbs_registered_) {
            let name = cb[0];
            let callback = cb[1];
            if (XeroMainProcessInterface.cbmgr_) {
                XeroMainProcessInterface.cbmgr_.unregisterCallback(name, callback);
            }
        }
    }
    request(name, arg) {
        window.scoutingAPI.send(name, arg);
    }
}
XeroMainProcessInterface.cbmgr_ = new XeroCBManager();
//# sourceMappingURL=xerocbtarget.js.map