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
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.SCBase = void 0;
const electron_1 = require("electron");
const path = __importStar(require("path"));
const os = __importStar(require("os"));
const fs = __importStar(require("fs"));
const winston = __importStar(require("winston"));
const crypto = __importStar(require("crypto"));
const electron_settings_1 = __importDefault(require("electron-settings"));
const imagemgr_1 = require("../imagemgr");
class SCBase {
    constructor(win, type) {
        this.typestr_ = type;
        this.win_ = win;
        this.appdir_ = path.join(os.homedir(), SCBase.appdirName);
        this.content_dir_ = path.join(process.cwd(), 'content');
        this.image_mgr_ = new imagemgr_1.ImageManager(type, type === 'central' ? path.join(this.content_dir_, 'images') : undefined);
        if (!fs.existsSync(this.appdir_)) {
            fs.mkdirSync(this.appdir_);
        }
        let logdir = path.join(this.appdir_, "logs");
        if (!fs.existsSync(logdir)) {
            fs.mkdirSync(logdir);
        }
        let logfileName;
        if (this.isDevelop) {
            logfileName = "xeroscout-" + this.typestr_;
        }
        else {
            logfileName = this.createUniqueFilename(logdir, "xeroscout-" + this.typestr_);
        }
        logfileName += ".txt";
        if (fs.existsSync(logfileName)) {
            fs.rmSync(logfileName);
        }
        this.logger_ = winston.createLogger({
            level: this.isDevelop ? "silly" : "info",
            format: winston.format.combine(winston.format.timestamp({ format: "YYYY-MM-DDTHH:mm:ss" }), winston.format.printf((info) => `${JSON.stringify({
                timestamp: info.timestamp,
                level: info.level,
                message: info.message,
                args: info.args,
            })}`)),
            transports: [new winston.transports.File({ filename: logfileName })],
        });
        this.logger_.info({
            message: "XeroScout program started",
            args: {
                electronVersion: this.getVersion("electron"),
                application: this.getVersion("application"),
                nodejs: this.getVersion("nodejs"),
            },
        });
    }
    // process.vesions.node
    // process.version
    getVersion(type) {
        let str = "0.0.0";
        let ret = {
            major: -1,
            minor: -1,
            patch: -1,
        };
        if (type === "electron") {
            str = process.version.substring(1);
        }
        else if (type === "node") {
            str = process.versions.node;
        }
        else if (type === "application") {
            str = electron_1.app.getVersion();
        }
        if (str) {
            let comps = str.split(".");
            if (comps.length === 3) {
                ret.major = +comps[0];
                ret.minor = +comps[1];
                ret.patch = +comps[2];
            }
        }
        return ret;
    }
    sendImages() {
        this.sendToRenderer('send-images', this.image_mgr_.getImageNames());
    }
    sendImageData(image) {
        let ret = {
            newname: undefined,
            name: image,
            data: this.getImageData(image)
        };
        if (!ret.data) {
            ret.newname = 'missing';
            ret.data = this.getImageData('missing');
        }
        this.sendToRenderer('send-image-data', ret);
    }
    versionToString(v) {
        return v.major + "." + v.minor + "." + v.patch;
    }
    showAbout() {
        let msg = "";
        msg +=
            "Welcome to XeroScout Generation 2, an electron based scouting system.\n\n";
        msg += "Versions:\n";
        msg +=
            "     XeroScout 2: " +
                this.versionToString(this.getVersion("application")) +
                "\n";
        msg +=
            "     Electron: " +
                this.versionToString(this.getVersion("electron")) +
                "\n";
        msg += "     Node: " + this.versionToString(this.getVersion("node")) + "\n";
        msg += "\n\n" + SCBase.attribution;
        let options = {
            // type: 'info',
            title: "XeroScout 2",
            message: msg,
        };
        electron_1.dialog.showMessageBoxSync(this.win_, options);
    }
    setSetting(name, value) {
        electron_settings_1.default.setSync(name, value);
    }
    getSetting(name) {
        return electron_settings_1.default.getSync(name);
    }
    hasSetting(name) {
        return electron_settings_1.default.hasSync(name);
    }
    unsetSettings(name) {
        electron_settings_1.default.unset(name);
    }
    static stripKeyString(key) {
        let ret;
        if (typeof key === 'number') {
            ret = key.toString();
        }
        else {
            ret = key;
            if (key.startsWith('frc')) {
                ret = key.substring(3);
            }
        }
        return ret;
    }
    static keyToTeamNumber(key) {
        let ret = -1;
        let m1 = /^frc[0-9]+$/;
        let m2 = /^[0-9]+$/;
        let m3 = /^frc-[0-9]+$/;
        if (m1.test(key)) {
            ret = +key.substring(3);
        }
        else if (m2.test(key)) {
            ret = +key;
        }
        else if (m3.test(key)) {
            ret = +key.substring(4);
        }
        return ret;
    }
    logClientMessage(obj) {
        let msg = 'renderer: ' + obj.message;
        if (obj.args) {
            msg += ', args=\'' + obj.args.toString() + '\'';
        }
        if (obj.type === 'silly') {
            this.logger_.silly(msg);
        }
        if (obj.type === 'info') {
            this.logger_.info(msg);
        }
        else if (obj.type === 'debug') {
            this.logger_.debug(msg);
        }
        if (obj.type === 'warn') {
            this.logger_.warn(msg);
        }
        if (obj.type === 'error') {
            this.logger_.error(msg);
        }
    }
    get isDevelop() {
        //
        // So, if the path to the executable contains both cygwin64 and my home directory, then
        // we are developing the application.  This puts the program in development mode which
        // primarily puts the log files in the home directory of the source instead of buried down
        // in the users home directory
        //
        if (process.env.XERODEVELOP) {
            return true;
        }
        return (process.argv[0].indexOf("cygwin64") != -1 &&
            process.argv[0].indexOf("butch") != -1);
    }
    get applicationType() {
        throw new Error("Method not implemented - must be overridden in subclass.");
    }
    mainWindowLoaded() {
    }
    sendToRenderer(ev, ...args) {
        let argval = args;
        let argstr = JSON.stringify(argval);
        this.logger_.silly({
            message: "main -> renderer",
            args: {
                event: ev,
                eventArgs: argstr.substring(0, 128)
            },
        });
        this.win_.webContents.send(ev, args);
    }
    setView(view, ...args) {
        this.lastview_ = view;
        args.unshift(view);
        let obj = {
            view: view,
            args: args[1],
        };
        this.sendToRenderer("update-main-window-view", obj);
    }
    createUniqueFilename(directory, prefix = "file") {
        const timestamp = Date.now();
        const randomString = crypto.randomBytes(8).toString("hex");
        const filename = `${prefix}-${timestamp}-${randomString}.txt`;
        const fullPath = path.join(directory, filename);
        // Check if the file already exists
        if (fs.existsSync(fullPath)) {
            // If it does, try again recursively
            return this.createUniqueFilename(directory, prefix);
        }
        else {
            return fullPath;
        }
    }
    mapMatchType(mtype) {
        let ret = -1;
        if (mtype === "f") {
            ret = 3;
        }
        else if (mtype === "sf") {
            ret = 2;
        }
        else {
            ret = 1;
        }
        return ret;
    }
    sortCompFun(a, b) {
        let ret = 0;
        let compareField = (aval, bval) => {
            let an = Number(aval);
            let bn = Number(bval);
            if (!Number.isNaN(an) && !Number.isNaN(bn)) {
                if (an < bn) {
                    return -1;
                }
                if (an > bn) {
                    return 1;
                }
                return 0;
            }
            let as = `${aval ?? ''}`;
            let bs = `${bval ?? ''}`;
            return as.localeCompare(bs);
        };
        let atype = this.mapMatchType(a.comp_level);
        let btype = this.mapMatchType(b.comp_level);
        if (atype < btype) {
            ret = -1;
        }
        else if (atype > btype) {
            ret = 1;
        }
        else {
            ret = compareField(a.match_number, b.match_number);
            if (ret === 0) {
                ret = compareField(a.set_number, b.set_number);
            }
        }
        return ret;
    }
    searchForImage(jsonname) {
        let trypath = path.join(this.content_dir_, 'fields', jsonname) + '.json';
        if (fs.existsSync(trypath)) {
            return trypath;
        }
        return undefined;
    }
    getImageData(name) {
        let datafile = this.image_mgr_.getImage(name);
        if (!datafile) {
            return '';
        }
        let data = fs.readFileSync(datafile).toString('base64');
        return data;
    }
    splitterChanged(value) {
        let name = this.typestr_ + '_splitter';
        this.setSetting(name, value);
    }
    appInit() {
        let value = 20.0;
        let name = this.typestr_ + '_splitter';
        if (this.hasSetting(name)) {
            value = this.getSetting(name);
        }
        else {
            this.setSetting(name, value);
        }
        let initData = {
            type: this.typestr_,
            splitter: value,
        };
        this.sendToRenderer('xero-app-init', initData);
    }
    getIconData(iconname) {
        let datafile = path.join(this.content_dir_, 'images', 'icons', iconname);
        let data = fs.readFileSync(datafile).toString('base64');
        return data;
    }
}
exports.SCBase = SCBase;
SCBase.appdirName = ".xeroscout";
SCBase.attribution = "Icons from Flaticon.com (https://www.flaticon.com/)\n" +
    "Images from Freepik.com (https://www.freepik.com/)";
//# sourceMappingURL=scbase.js.map