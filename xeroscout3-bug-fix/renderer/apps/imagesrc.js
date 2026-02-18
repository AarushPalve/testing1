import { XeroMainProcessInterface } from "../widgets/xerocbtarget.js";
export class ImageDataSource extends XeroMainProcessInterface {
    constructor() {
        super();
        this.image_names = []; // List of image names
        this.nameToImageMap_ = new Map(); // Map of image name to base64 data
        this.waiters = []; // List of promises waiting on images data
        this.registerCallback('send-images', this.receivedImageNames.bind(this));
        this.registerCallback('send-image-data', this.receivedImageData.bind(this));
        this.request('get-image-names'); // Request the list of image names
        this.request('get-image-data', ImageDataSource.kBlankImageName); // Request the blank image data
        this.request('get-image-data', ImageDataSource.kMissingImageName); // Request the missing image data
    }
    getImageNames() {
        return this.image_names;
    }
    getImageData(name) {
        let ret = new Promise((resolve, reject) => {
            if (this.nameToImageMap_.has(name)) {
                let resp = {
                    name: name,
                    data: this.nameToImageMap_.get(name),
                    newname: undefined
                };
                resolve(resp);
            }
            else {
                this.request('get-image-data', name);
                let waiter = {
                    resolve: resolve,
                    reject: reject,
                    name: name
                };
                this.waiters.push(waiter);
            }
        });
        return ret;
    }
    get blank() {
        return this.getImageData(ImageDataSource.kBlankImageName);
    }
    get missing() {
        return this.getImageData(ImageDataSource.kMissingImageName);
    }
    receivedImageNames(args) {
        this.image_names = args;
        this.emit('image-names-updated', this.image_names);
    }
    receivedImageData(args) {
        if (args.newname) {
            this.nameToImageMap_.set(args.newname, args.data);
        }
        else {
            this.nameToImageMap_.set(args.name, args.data);
        }
        let processed = true;
        while (processed) {
            processed = false;
            let index = this.waiters.findIndex(waiter => waiter.name === args.name);
            if (index >= 0) {
                let waiter = this.waiters[index];
                this.waiters.splice(index, 1);
                waiter.resolve(args);
                processed = true;
            }
        }
    }
}
ImageDataSource.kBlankImageName = 'blank';
ImageDataSource.kMissingImageName = 'missing';
//# sourceMappingURL=imagesrc.js.map