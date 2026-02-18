export class TimerStatus {
    constructor(name) {
        this.running_ = false;
        this.value_ = 0.0;
        this.name = name;
    }
    setCallback(callback) {
        if (this.running_) {
            this.callback_ = callback;
        }
    }
    get running() {
        return this.running_;
    }
    get value() {
        return this.value_;
    }
    set value(value) {
        this.value_ = value;
        if (this.callback_) {
            this.callback_();
        }
    }
    reset() {
        this.value = 0.0;
    }
    start(callback) {
        this.running_ = true;
        this.callback_ = callback;
        this.timer_ = setInterval(this.tick.bind(this), 100);
    }
    stop() {
        if (this.timer_) {
            clearInterval(this.timer_);
            this.timer_ = undefined;
        }
        this.running_ = false;
        this.callback_ = undefined;
    }
    tick() {
        this.value += 0.1;
        if (this.callback_) {
            this.callback_();
        }
    }
}
//# sourceMappingURL=timerstatus.js.map