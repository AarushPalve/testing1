import { EditImageDialog } from "../dialogs/editimagectrldialog.js";
import { FormControl } from "./formctrl.js";
export class ImageControl extends FormControl {
    constructor(imsrc, view, tag, bounds) {
        super(view, ImageControl.item_desc_);
        this.tempMirrorX_ = false;
        this.tempMirrorY_ = false;
        this.setTag(tag);
        this.setBounds(bounds);
        this.image_src_ = imsrc;
    }
    get tempMirrorX() {
        return this.tempMirrorX_;
    }
    set tempMirrorX(mirror) {
        if (mirror != this.tempMirrorX_) {
            this.tempMirrorX_ = mirror;
            this.updateImageScale();
        }
    }
    get tempMirrorY() {
        return this.tempMirrorY_;
    }
    set tempMirrorY(mirror) {
        if (mirror != this.tempMirrorY_) {
            this.tempMirrorY_ = mirror;
            this.updateImageScale();
        }
    }
    get field() {
        return this.item.field;
    }
    setImageData(image) {
        if (this.image_) {
            this.image_.src = `data:image/png;base64,${image}`;
        }
    }
    copyObject() {
        let image = new ImageControl(this.image_src_, this.view, this.item.tag, this.bounds);
        return image;
    }
    updateFromItem(editing, scale, xoff, yoff) {
        if (this.ctrl) {
            let item = this.item;
            this.image_src_.getImageData(item.image)
                .then((data) => {
                if (data.data) {
                    if (data.newname) {
                        item.image = data.newname;
                    }
                    this.setImageData(data.data);
                    this.updateImageScale();
                }
            });
            this.setPosition(scale, xoff, yoff, 800);
        }
    }
    createForEdit(parent, xoff, yoff) {
        super.createForEdit(parent, xoff, yoff);
        this.ctrl = document.createElement('div');
        this.setClassList(this.ctrl, 'edit');
        this.image_ = document.createElement('img');
        this.setClassList(this.image_, 'edit', 'image');
        this.updateFromItem(true, 1.0, xoff, yoff);
        this.ctrl.appendChild(this.image_);
        parent.appendChild(this.ctrl);
    }
    createForScouting(parent, scale, xoff, yoff) {
        super.createForScouting(parent, scale, xoff, yoff);
        this.ctrl = document.createElement('div');
        this.setClassList(this.ctrl, 'scout');
        this.image_ = document.createElement('img');
        this.setClassList(this.image_, 'scout', 'image');
        this.updateFromItem(true, scale, xoff, yoff);
        this.ctrl.appendChild(this.image_);
        parent.appendChild(this.ctrl);
    }
    createEditDialog() {
        return new EditImageDialog(this, this.image_src_.getImageNames());
    }
    getData() {
        return undefined;
    }
    setData(data) {
    }
    updateImageScale() {
        let item = this.item;
        const mirrorX = this.effectiveMirrorX();
        const mirrorY = this.effectiveMirrorY();
        if (mirrorX && !mirrorY) {
            this.image_.style.transform = 'scaleX(-1)';
        }
        else if (!mirrorX && mirrorY) {
            this.image_.style.transform = 'scaleY(-1)';
        }
        else if (mirrorX && mirrorY) {
            this.image_.style.transform = 'scaleX(-1) scaleY(-1)';
        }
        else {
            this.image_.style.transform = '';
        }
    }
    effectiveMirrorX() {
        let item = this.item;
        return this.tempMirrorX_ !== item.mirrorx;
    }
    effectiveMirrorY() {
        let item = this.item;
        return this.tempMirrorY_ !== item.mirrory;
    }
}
ImageControl.item_desc_ = {
    type: 'image',
    image: 'missing',
    tag: '',
    x: 0,
    y: 0,
    width: 0,
    height: 0,
    color: 'black',
    background: 'white',
    fontFamily: 'Arial',
    fontSize: 36,
    fontWeight: 'normal',
    fontStyle: 'normal',
    datatype: 'null',
    transparent: true,
    field: false,
    mirrorx: false,
    mirrory: false,
};
//# sourceMappingURL=imagectrl.js.map