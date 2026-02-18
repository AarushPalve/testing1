"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.PacketObj = void 0;
class PacketObj {
    constructor(type, data) {
        this.type_ = type;
        if (data) {
            this.data_ = data;
        }
        else {
            this.data_ = new Uint8Array(0);
        }
    }
    payloadAsString() {
        const decoder = new TextDecoder();
        const str = decoder.decode(this.data_);
        return str;
    }
}
exports.PacketObj = PacketObj;
//# sourceMappingURL=packetobj.js.map