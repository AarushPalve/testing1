"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Logger = exports.LoggerSink = exports.LoggerMessage = void 0;
class LoggerMessage {
}
exports.LoggerMessage = LoggerMessage;
class LoggerSink {
}
exports.LoggerSink = LoggerSink;
class Logger {
    constructor() {
        this.sinks_ = [];
    }
    addSink(sink) {
        this.sinks_.push(sink);
    }
}
exports.Logger = Logger;
//# sourceMappingURL=logger.js.map