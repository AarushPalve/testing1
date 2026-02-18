"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.SyncServer = void 0;
const syncbase_1 = require("./syncbase");
class SyncServer extends syncbase_1.SyncBase {
    constructor(logger) {
        super(logger);
    }
}
exports.SyncServer = SyncServer;
//# sourceMappingURL=syncserver.js.map