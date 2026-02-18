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
exports.TCPClient = void 0;
const syncclient_1 = require("./syncclient");
const net = __importStar(require("net"));
class TCPClient extends syncclient_1.SyncClient {
    constructor(logger, host, port = TCPClient.portNumberA) {
        super(logger);
        this.port_ = -1;
        this.host_ = host;
        this.socket_ = new net.Socket();
        this.port_ = port;
    }
    name() {
        return "TCPConnector";
    }
    connect() {
        let ret = new Promise((resolve, reject) => {
            this.socket_.on('connect', () => {
                this.emit('connected');
            });
            this.socket_.on('data', (data) => {
                this.logger_.debug('TCPClient received ' + data.length + ' bytes of data');
                this.extractPacket(data);
            });
            this.socket_.on('error', (err) => {
                this.emit('error', err);
            });
            this.socket_.on('close', () => {
                this.emit('close');
            });
            this.socket_.connect(this.port_, this.host_);
            resolve();
        });
        return ret;
    }
    close() {
        this.socket_.destroy();
    }
    send(p) {
        let ret = new Promise((resolve, reject) => {
            this.logger_.debug(`TCPClient sending packet ${p.type_} to ${this.host_}`);
            let buffer = this.convertToBytes(p);
            this.socket_.write(buffer, (err) => {
                if (err) {
                    reject(err);
                }
                else {
                    resolve();
                }
            });
        });
        return ret;
    }
}
exports.TCPClient = TCPClient;
TCPClient.portNumberA = 45455;
//# sourceMappingURL=tcpclient.js.map