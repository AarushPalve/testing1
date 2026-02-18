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
exports.ImageManager = void 0;
const electron_1 = require("electron");
const path = __importStar(require("path"));
const fs = __importStar(require("fs"));
class ImageManager {
    constructor(appname, appimagedir) {
        this.imagemap_ = new Map();
        //
        // This is for the central (server).  The application comes installed with the blank image
        // and a set of field images.
        //
        this.appimagedir_ = appimagedir;
        //
        // This is for any user imported images.  This is also used on the scouter side to store all
        // images received during the sync from the central server.
        //
        this.imagedir_ = this.findUserImageDir(appname);
        if (this.imagedir_) {
            this.createImageDir();
        }
        this.rescanImageDirs();
    }
    rescanImageDirs() {
        this.imagemap_.clear();
        if (this.imagedir_) {
            this.scanImageDir(this.imagedir_);
        }
        if (this.appimagedir_) {
            this.scanImageDir(this.appimagedir_);
        }
    }
    getImageNames() {
        return Array.from(this.imagemap_.keys());
    }
    hasImage(name) {
        return this.imagemap_.has(name);
    }
    getImage(name) {
        // Get the image path for the given name
        if (this.imagemap_.has(name)) {
            return this.imagemap_.get(name);
        }
        return undefined;
    }
    addImage(imagePath) {
        // Add an image to the image directory
        if (this.imagedir_) {
            let name = path.basename(imagePath);
            let mname = path.parse(name).name;
            const destPath = path.join(this.imagedir_, name);
            fs.copyFileSync(imagePath, destPath);
            this.imagemap_.set(mname, destPath);
            return mname;
        }
        return false;
    }
    addImageWithData(name, data) {
        if (this.imagedir_) {
            const destPath = path.join(this.imagedir_, name) + '.png';
            let buf = Buffer.from(data, 'base64');
            fs.writeFileSync(destPath, buf);
            this.imagemap_.set(name, destPath);
        }
    }
    findUserImageDir(appname) {
        //
        // Use Electron's per-user app data directory (cross-platform) instead of
        // relying on environment variables like HOMEDIR (which is not set on macOS).
        //
        try {
            return path.join(electron_1.app.getPath('userData'), 'images', appname);
        }
        catch {
            return undefined;
        }
    }
    createImageDir() {
        // Create the image directory if it doesn't exist
        if (this.imagedir_ && !fs.existsSync(this.imagedir_)) {
            fs.mkdirSync(this.imagedir_, { recursive: true });
            if (!fs.existsSync(this.imagedir_)) {
                this.imagedir_ = undefined;
            }
        }
    }
    scanImageDir(dir) {
        // Scan the image directory for images
        if (dir && fs.existsSync(dir) && fs.statSync(dir).isDirectory()) {
            const files = fs.readdirSync(dir);
            for (const file of files) {
                const filePath = path.join(dir, file);
                if (fs.statSync(filePath).isFile() && file.endsWith('.png')) {
                    this.imagemap_.set(path.parse(file).name, filePath);
                }
            }
        }
    }
    removeAllImages() {
        if (this.imagedir_ && fs.existsSync(this.imagedir_) && fs.statSync(this.imagedir_).isDirectory()) {
            for (let file of fs.readdirSync(this.imagedir_)) {
                const filePath = path.join(this.imagedir_, file);
                fs.unlinkSync(filePath);
            }
        }
        this.rescanImageDirs();
    }
}
exports.ImageManager = ImageManager;
//# sourceMappingURL=imagemgr.js.map