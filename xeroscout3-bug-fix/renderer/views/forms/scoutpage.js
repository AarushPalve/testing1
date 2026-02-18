import { XeroSize } from "../../shared/xerogeom.js";
import { XeroWidget } from "../../widgets/xerowidget.js";
export class XeroFormScoutSectionPage extends XeroWidget {
    constructor(app, data, formsize, color, reversed, mirrorx, mirrory) {
        super('div', 'xero-form-section-page');
        this.controls_ = [];
        this.scale_ = 1.0;
        this.reversed_ = false;
        this.flip_field_180_ = false;
        this.color_ = 'blue';
        this.app_ = app;
        this.data_ = data;
        this.size_ = formsize;
        this.color_ = color;
        this.reversed_ = reversed;
        this.mirrorx_ = mirrorx;
        this.mirrory_ = mirrory;
        this.formdiv_ = document.createElement('div');
        this.formdiv_.className = 'xero-form-section-scout-page-form';
        this.elem.appendChild(this.formdiv_);
        this.observer_ = new ResizeObserver(this.resized.bind(this));
        this.observer_.observe(this.elem);
    }
    get controls() {
        return this.controls_;
    }
    addControl(control) {
        this.controls_.push(control);
        this.addControlToLayout(control);
    }
    doLayout() {
        this.formdiv_.innerHTML = '';
        let fbounds = this.formdiv_.getBoundingClientRect();
        let xscale = fbounds.width / this.size_.width;
        let yscale = fbounds.height / this.size_.height;
        this.scale_ = Math.min(xscale, yscale);
        for (let control of this.controls_) {
            control.resetHTMLControl();
            this.addControlToLayout(control);
        }
    }
    setFlipField180(flip) {
        if (this.flip_field_180_ !== flip) {
            this.flip_field_180_ = flip;
            this.doLayout();
        }
    }
    getControlByTag(tag) {
        for (let control of this.controls_) {
            if (control.item.tag === tag) {
                return control;
            }
        }
        return undefined;
    }
    getPlaceOffset() {
        let bounds = this.elem.getBoundingClientRect();
        let fbounds = this.formdiv_.getBoundingClientRect();
        return new XeroSize(fbounds.left - bounds.left, fbounds.top);
    }
    isOverField(control) {
        let bounds = control.bounds;
        for (let ctrl of this.controls_) {
            if (ctrl !== control && ctrl.item.type === 'image') {
                let imgctrl = ctrl;
                if (imgctrl.field && imgctrl.bounds.intersects(bounds)) {
                    return imgctrl;
                }
            }
        }
        return undefined;
    }
    addControlToLayout(control) {
        let offset = this.getPlaceOffset();
        let image = this.isOverField(control);
        const baseMirrorControlsX = (this.mirrorx_ !== undefined) ? this.mirrorx_ : (this.color_ !== 'blue' && !this.reversed_);
        const baseMirrorControlsY = (this.mirrory_ !== undefined) ? this.mirrory_ : false;
        const mirrorControlsX = baseMirrorControlsX !== this.flip_field_180_;
        const mirrorControlsY = baseMirrorControlsY !== this.flip_field_180_;
        if (image && mirrorControlsX) {
            let dl = this.scale_ * (control.bounds.left - image.bounds.left);
            let x2 = this.scale_ * image.bounds.right - dl - this.scale_ * control.bounds.width;
            let dx = x2 - this.scale_ * control.bounds.left;
            offset = new XeroSize(offset.width + dx, offset.height);
        }
        if (image && mirrorControlsY) {
            let dt = this.scale_ * (control.bounds.top - image.bounds.top);
            let y2 = this.scale_ * image.bounds.bottom - dt - this.scale_ * control.bounds.height;
            let dy = y2 - this.scale_ * control.bounds.top;
            offset = new XeroSize(offset.width, offset.height + dy);
        }
        control.createForScouting(this.formdiv_, this.scale_, offset.width, offset.height);
        if (control.item.type === 'image') {
            let imgctrl = control;
            if (imgctrl.field) {
                const baseMirrorImageX = (this.mirrorx_ !== undefined) ? this.mirrorx_ : this.reversed_;
                const baseMirrorImageY = (this.mirrory_ !== undefined) ? this.mirrory_ : false;
                const mirrorImageX = baseMirrorImageX !== this.flip_field_180_;
                const mirrorImageY = baseMirrorImageY !== this.flip_field_180_;
                imgctrl.tempMirrorX = mirrorImageX;
                imgctrl.tempMirrorY = mirrorImageY;
            }
        }
        let data = undefined;
        if (control.item.type === 'stopwatch') {
            data = this.data_.get(control.item.tag + '_segments');
        }
        if (!data) {
            data = this.data_.get(control.item.tag);
        }
        if (data) {
            control.setData(data);
        }
    }
    resized(entries) {
        for (let entry of entries) {
            if (entry.target === this.elem) {
                this.doLayout();
            }
        }
        let text = this.app_.statusBar.getLeftStatus().innerText;
        text = text.replace(/\([0-9]+ *x *[0-9]+\)/, '');
        text += `(${this.formdiv_.clientWidth} x ${this.formdiv_.clientHeight})`;
        this.app_.statusBar.setLeftStatus(text);
    }
}
//# sourceMappingURL=scoutpage.js.map