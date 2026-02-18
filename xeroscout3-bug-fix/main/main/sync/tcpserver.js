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
exports.TCPSyncServer = void 0;
const net = __importStar(require("net"));
const syncserver_1 = require("./syncserver");
class TCPSyncServer extends syncserver_1.SyncServer {
    constructor(logger, port = TCPSyncServer.portNumber) {
        super(logger);
        this.port_ = -1;
        this.port_ = port;
    }
    get port() {
        return this.port_;
    }
    shutdownClient() {
        this.socket_?.destroy();
        this.socket_ = undefined;
        this.resetBuffers();
    }
    async send(p) {
        let ret = new Promise((resolve, reject) => {
            let buffer = this.convertToBytes(p);
            this.logger_.debug('TCPServer sending ' + buffer.length + ' bytes of data');
            this.socket_.write(buffer, (err) => {
                if (err) {
                    reject(err);
                }
                else {
                    resolve();
                }
            });
        });
    }
    async init() {
        let ret = new Promise((resolve, reject) => {
            this.server_ = new net.Server((socket) => { this.connected(socket); });
            this.server_.listen(this.port_, '0.0.0.0', 2, () => {
                this.logger_.info('TCPSyncServer: listening for connections on port ' + this.port_);
                resolve();
            });
        });
        return ret;
    }
    name() {
        return "TCPSyncServer";
    }
    connected(socket) {
        if (this.socket_) {
            this.logger_.info('TCPSyncServer: client connected, but already have a client connected - disallowing new connection');
            socket.destroy();
        }
        this.socket_ = socket;
        this.logger_.info('TCPSyncServer: client connected', {
            address: socket.address,
            family: socket.remoteFamily
        });
        socket.on('close', () => {
            this.socket_ = undefined;
            this.logger_.info('remote connect closed');
        });
        socket.on('error', (err) => {
            this.socket_ = undefined;
            this.logger_.info('error in socket communications', err);
        });
        socket.on('data', (data) => {
            this.extractPacket(data);
        });
    }
}
exports.TCPSyncServer = TCPSyncServer;
TCPSyncServer.portNumber = 45455;
//# sourceMappingURL=tcpserver.js.map