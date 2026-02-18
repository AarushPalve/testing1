"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.SyncClient = void 0;
const syncbase_1 = require("./syncbase");
class SyncClient extends syncbase_1.SyncBase {
    constructor(logger) {
        super(logger);
    }
}
exports.SyncClient = SyncClient;
//# sourceMappingURL=syncclient.js.map