export class StopwatchStatus {
    constructor(name) {
        this.segments_ = [];
        this.name = name;
    }
    get running() {
        let last = this.segments_.length > 0 ? this.segments_[this.segments_.length - 1] : undefined;
        return last !== undefined && last.stop === null;
    }
    get value() {
        var _a;
        let now = Date.now();
        let elapsedms = 0;
        for (let seg of this.segments_) {
            let stop = (_a = seg.stop) !== null && _a !== void 0 ? _a : now;
            elapsedms += Math.max(0, stop - seg.start);
        }
        return elapsedms / 1000.0;
    }
    setCallback(callback) {
        this.callback_ = callback;
        this.ensureTicking();
    }
    start(callback) {
        var _a;
        if (this.running) {
            this.setCallback(callback);
            return;
        }
        this.callback_ = callback;
        this.segments_.push({ start: Date.now(), stop: null });
        this.ensureTicking();
        (_a = this.callback_) === null || _a === void 0 ? void 0 : _a.call(this);
    }
    stop() {
        if (!this.running) {
            return;
        }
        let last = this.segments_[this.segments_.length - 1];
        last.stop = Date.now();
        if (this.timer_) {
            clearInterval(this.timer_);
            this.timer_ = undefined;
        }
        this.callback_ = undefined;
    }
    clear() {
        if (this.timer_) {
            clearInterval(this.timer_);
            this.timer_ = undefined;
        }
        this.callback_ = undefined;
        this.segments_ = [];
    }
    load(data) {
        if (data && typeof data === 'object' && data.version === 1 && Array.isArray(data.segments)) {
            this.segments_ = [];
            for (let one of data.segments) {
                if (!one || typeof one !== 'object') {
                    continue;
                }
                if (typeof one.start !== 'number') {
                    continue;
                }
                let stop = null;
                if (one.stop === null) {
                    stop = null;
                }
                else if (typeof one.stop === 'number') {
                    stop = one.stop;
                }
                else {
                    continue;
                }
                this.segments_.push({ start: one.start, stop: stop });
            }
        }
        this.ensureTicking();
    }
    toJSON() {
        return {
            version: 1,
            segments: this.segments_.map((s) => ({ start: s.start, stop: s.stop })),
        };
    }
    ensureTicking() {
        if (!this.running) {
            if (this.timer_) {
                clearInterval(this.timer_);
                this.timer_ = undefined;
            }
            return;
        }
        if (this.timer_ === undefined) {
            this.timer_ = setInterval(this.tick.bind(this), 100);
        }
    }
    tick() {
        var _a;
        (_a = this.callback_) === null || _a === void 0 ? void 0 : _a.call(this);
    }
}
//# sourceMappingURL=stopwatchstatus.js.map