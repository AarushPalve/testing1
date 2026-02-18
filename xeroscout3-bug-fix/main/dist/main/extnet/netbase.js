"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.NetBase = void 0;
const electron_1 = require("electron");
class NetBase {
    constructor(host, prefix, apikey) {
        this.host_ = host;
        this.prefix_ = prefix;
        this.apikey_ = apikey;
    }
    appendToUint8Array(original, dataToAdd) {
        const result = new Uint8Array(original.length + dataToAdd.length);
        result.set(original);
        result.set(dataToAdd, original.length);
        return result;
    }
    async request(res, apikey) {
        let ret = new Promise((resolve, reject) => {
            let hdrs = {};
            if (this.apikey_) {
                hdrs = { "X-TBA-Auth-Key": this.apikey_ };
            }
            let req = electron_1.net.request({
                method: 'GET',
                protocol: 'https:',
                hostname: this.host_,
                port: 443,
                path: this.prefix_ + res,
                redirect: 'follow',
                headers: hdrs
            });
            req.on('response', (response) => {
                let buffer = new Uint8Array(0);
                response.on('data', (data) => {
                    buffer = this.appendToUint8Array(buffer, data);
                });
                response.on('end', () => {
                    const decoder = new TextDecoder();
                    const string = decoder.decode(buffer);
                    const obj = JSON.parse(string);
                    resolve(obj);
                });
            });
            req.on('abort', () => {
                reject(new Error("request aborted"));
            });
            req.on('close', () => {
            });
            req.on('error', (err) => {
                reject(err);
            });
            req.on('finish', () => {
            });
            req.on('login', (ai, cb) => {
                reject(new Error("login required"));
            });
            req.end();
        });
        return ret;
    }
}
exports.NetBase = NetBase;
//# sourceMappingURL=netbase.js.map