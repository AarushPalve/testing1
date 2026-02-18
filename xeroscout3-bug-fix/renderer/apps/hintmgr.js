import { XeroMainProcessInterface } from "../widgets/xerocbtarget.js";
export class HintManager extends XeroMainProcessInterface {
    constructor() {
        super();
        this.hint_map_ = new Map();
        this.registerCallback('send-hint-db', this.hintDBReceived.bind(this));
        this.request('get-hint-db');
    }
    getHint(hintid) {
        return this.hint_map_.get(hintid);
    }
    setHintClosed(hintid) {
        if (this.hint_map_.has(hintid)) {
            this.hint_map_.get(hintid).hidden = true;
        }
        this.request('set-hint-hidden', hintid);
    }
    hintDBReceived(db) {
        this.hint_map_.clear();
        for (let hint of db) {
            this.hint_map_.set(hint.id, hint);
        }
    }
}
//# sourceMappingURL=hintmgr.js.map