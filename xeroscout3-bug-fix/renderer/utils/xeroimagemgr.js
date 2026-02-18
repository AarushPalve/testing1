//
// This file is the image manager.  It is a singleton class that manages images for the Xero application.
// It is used to load, store, and retrieve images for the application.  It is also used to clear images from 
// memory when they are no longer needed.
//
export class XeroImageMgr {
    constructor() {
        this.imageMap = new Map();
    }
    static getInstance() {
        if (XeroImageMgr.instance === null) {
            XeroImageMgr.instance = new XeroImageMgr();
        }
        return XeroImageMgr.instance;
    }
    addImage(name, path) {
        this.imageMap.set(name, path);
    }
    getImage(name) {
        return this.imageMap.get(name);
    }
    removeImage(name) {
        this.imageMap.delete(name);
    }
    clearImages() {
        this.imageMap.clear();
    }
    hasImage(name) {
        return this.imageMap.has(name);
    }
}
XeroImageMgr.instance = null;
//# sourceMappingURL=xeroimagemgr.js.map