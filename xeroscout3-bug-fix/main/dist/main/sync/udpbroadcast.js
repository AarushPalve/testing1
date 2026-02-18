"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
exports.UDPBroadcast = void 0;
const dgram = __importStar(require("node:dgram"));
class UDPBroadcast {
    constructor(logger, ipaddr, teamNumber, interval = 5000) {
        this.message_ = Buffer.from("XeroScout3 UDP Broadcast");
        this.logger_ = logger;
        this.ipaddr_ = ipaddr;
        this.logger_.info("UDPBroadcast created for team", teamNumber);
        this.team_number_ = teamNumber;
        this.interval_ = interval;
        this.message_ = Buffer.from(`xeroscout3:${this.team_number_},${this.ipaddr_}`);
    }
    start() {
        this.socket_ = dgram.createSocket("udp4");
        this.socket_.bind(UDPBroadcast.portNumber);
        this.socket_.on("error", (err) => {
            this.logger_.error("UDP socket error:", err);
        });
        this.socket_.on("listening", this.listening.bind(this));
    }
    listening() {
        this.socket_?.setBroadcast(true);
        // Broadcast every 5 seconds
        setInterval(() => {
            this.socket_?.send(this.message_, 0, this.message_.length, UDPBroadcast.portNumber, '255.255.255.255');
        }, this.interval_);
    }
}
exports.UDPBroadcast = UDPBroadcast;
UDPBroadcast.portNumber = 45456;
//# sourceMappingURL=udpbroadcast.js.map