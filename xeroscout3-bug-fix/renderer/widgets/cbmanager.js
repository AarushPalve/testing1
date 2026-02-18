import { EventEmitter } from 'events';
import { XeroLogger } from '../utils/xerologger.js';
export class XeroCBManager extends EventEmitter {
    constructor() {
        super();
        this.cbmap_ = new Map();
        this.dispatch_cbs_ = new Map();
    }
    registerCallback(name, callback) {
        if (XeroCBManager.verbose_) {
            let logger = XeroLogger.getInstance();
            logger.debug(`XeroCBTarget.registerCallback: name=${name}`);
        }
        if (!this.cbmap_.has(name)) {
            this.cbmap_.set(name, [callback]);
            let cb = this.dispatchCallback.bind(this, name);
            this.dispatch_cbs_.set(name, cb);
            window.scoutingAPI.receive(name, cb);
        }
        else {
            let callbacks = this.cbmap_.get(name);
            callbacks.push(callback);
        }
    }
    unregisterCallback(name, callback) {
        if (XeroCBManager.verbose_) {
            let logger = XeroLogger.getInstance();
            logger.debug(`XeroCBTarget.unregisterCallback: name=${name}`);
        }
        if (!this.cbmap_.has(name)) {
            return;
        }
        let callbacks = this.cbmap_.get(name);
        if (callbacks) {
            let index = callbacks.indexOf(callback);
            if (index >= 0) {
                callbacks.splice(index, 1);
                this.cbmap_.set(name, callbacks);
            }
        }
    }
    dispatchCallback(name, arg) {
        if (XeroCBManager.verbose_) {
            let logger = XeroLogger.getInstance();
            let argstr;
            if (arg === null) {
                argstr = 'null';
            }
            else if (arg === undefined) {
                argstr = 'undefined';
            }
            else {
                argstr = JSON.stringify(arg);
            }
            if (argstr.length > 80) {
                argstr = argstr.substring(0, 80) + '...';
            }
            logger.debug(`XeroCBTarget.dispatchCallback: name='${name}', arg='${argstr}'`);
        }
        const callbacks = this.cbmap_.get(name);
        if (callbacks) {
            for (const callback of callbacks) {
                callback(arg);
            }
        }
    }
}
XeroCBManager.verbose_ = true;
//# sourceMappingURL=cbmanager.js.map