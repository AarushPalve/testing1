export class XeroLogger {
    constructor() {
        this.debug_out_ = false;
        this.error_out_ = true;
        this.warn_out_ = true;
        this.info_out_ = true;
    }
    static getInstance() {
        if (this.instance === null) {
            this.instance = new XeroLogger();
        }
        return this.instance;
    }
    debug(message) {
        if (!this.debug_out_) {
            return;
        }
        console.log(message);
    }
    error(message) {
        if (!this.error_out_) {
            return;
        }
        console.log(message);
    }
    warn(message) {
        if (!this.warn_out_) {
            return;
        }
        console.log(message);
    }
    info(message) {
        if (!this.info_out_) {
            return;
        }
        console.log(message);
    }
}
XeroLogger.instance = null;
//# sourceMappingURL=xerologger.js.map