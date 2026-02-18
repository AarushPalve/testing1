"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Manager = void 0;
class Manager {
    constructor(logger, writer) {
        this.logger_ = logger;
        this.writer_ = writer;
    }
    write() {
        this.writer_();
    }
}
exports.Manager = Manager;
//# sourceMappingURL=manager.js.map