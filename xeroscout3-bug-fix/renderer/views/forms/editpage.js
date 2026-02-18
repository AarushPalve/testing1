import { XeroRect, XeroSize } from "../../shared/xerogeom.js";
import { XeroWidget } from "../../widgets/xerowidget.js";
export class XeroFormEditSectionPage extends XeroWidget {
    constructor(name, sz) {
        super('div', 'xero-form-section-page');
        this.controls_ = [];
        this.holder_ = document.createElement('div');
        this.holder_.className = 'xero-form-section-page-holder';
        this.holder_.addEventListener('scroll', this.holderScrolled.bind(this));
        this.elem.appendChild(this.holder_);
        this.formdiv_ = document.createElement('div');
        this.formdiv_.className = 'xero-form-section-page-form';
        this.formdiv_.style.width = `${sz.width}px`;
        this.formdiv_.style.height = `${sz.height}px`;
        this.holder_.appendChild(this.formdiv_);
    }
    setPageSize(sz) {
        this.formdiv_.style.width = `${sz.width}px`;
        this.formdiv_.style.height = `${sz.height}px`;
    }
    get form() {
        return this.formdiv_;
    }
    resetHTML() {
        this.formdiv_.innerHTML = '';
    }
    doLayout() {
        for (let control of this.controls_) {
            control.resetHTMLControl();
            this.addControlToLayout(control);
        }
    }
    get controls() {
        return this.controls_;
    }
    unlockAllControls() {
        for (let control of this.controls_) {
            control.locked = false;
        }
    }
    //
    // Find a control by its form position
    //
    findControlsByPosition(pt, locked = false) {
        let ret = [];
        for (let entry of this.controls_) {
            if (entry.ctrl === undefined || entry.locked !== locked) {
                continue;
            }
            if (entry.fuzzyBounds.contains(pt)) {
                ret.push(entry);
            }
        }
        ret.sort((a, b) => {
            if (a.bounds.width * a.bounds.height > b.bounds.width * b.bounds.height) {
                return -1;
            }
            else if (a.bounds.width * a.bounds.height < b.bounds.width * b.bounds.height) {
                return 1;
            }
            if (a.bounds.left < b.bounds.left) {
                return -1;
            }
            if (a.bounds.left > b.bounds.left) {
                return 1;
            }
            if (a.bounds.top < b.bounds.top) {
                return -1;
            }
            if (a.bounds.top > b.bounds.top) {
                return 1;
            }
            return 0;
        });
        return ret;
    }
    findInterectingControls(ctrl, filter) {
        let ret = [];
        for (let entry of this.controls_) {
            if (entry === ctrl || entry.ctrl === undefined || entry.locked) {
                continue;
            }
            if (filter && !filter(entry)) {
                continue;
            }
            if (entry.bounds.intersects(ctrl.bounds)) {
                ret.push(entry);
            }
        }
        return ret;
    }
    addControl(control) {
        this.controls_.push(control);
        this.addControlToLayout(control);
    }
    removeControl(control) {
        let index = this.controls_.indexOf(control);
        if (index >= 0) {
            control.resetHTMLControl();
            this.controls_.splice(index, 1);
        }
    }
    removeAllControls() {
        this.formdiv_.innerHTML = '';
        this.controls_ = [];
    }
    getPlaceOffset() {
        return XeroSize.zero;
    }
    holderScrolled(ev) {
        this.resetHTML();
        this.doLayout();
    }
    getClipRect(ctrl) {
        let cbounds = XeroRect.fromDOMRect(ctrl.ctrl.getBoundingClientRect());
        let fbounds = XeroRect.fromDOMRect(this.holder_.getBoundingClientRect());
        let left = -4;
        let right = -8;
        let top = -4;
        let bottom = -8;
        let vsbar = 0;
        let hsbar = 0;
        if (this.holder_.clientWidth !== this.holder_.scrollWidth) {
            vsbar = this.holder_.offsetWidth - this.holder_.clientWidth;
        }
        if (this.holder_.clientHeight !== this.holder_.scrollHeight) {
            hsbar = this.holder_.offsetHeight - this.holder_.clientHeight;
        }
        if (cbounds.left < fbounds.left) {
            left = fbounds.left - cbounds.left;
        }
        if (cbounds.right > fbounds.right) {
            right = cbounds.right - fbounds.right + vsbar;
        }
        if (cbounds.top < fbounds.top) {
            top = fbounds.top - cbounds.top;
        }
        if (cbounds.bottom > fbounds.bottom) {
            bottom = cbounds.bottom - fbounds.bottom + hsbar;
        }
        console.log(`Clip rect: ${left}, ${right}, ${top}, ${bottom}`);
        console.log(`  Control bounds: ${cbounds}`);
        console.log(`  Form bounds: ${fbounds}`);
        console.log('\n\n');
        let clip = `inset(${top}px ${right}px ${bottom}px ${left}px)`;
        return clip;
    }
    clipControl(control) {
        if (control.ctrl === undefined) {
            return;
        }
        let clip = this.getClipRect(control);
        if (clip !== undefined) {
            control.ctrl.style.clipPath = clip;
        }
        else {
            control.ctrl.style.clipPath = '';
        }
    }
    addControlToLayout(control) {
        let sz = this.getPlaceOffset();
        control.createForEdit(this.formdiv_, sz.width, sz.height);
        let clip = this.getClipRect(control);
        if (clip !== undefined) {
            control.ctrl.style.clipPath = clip;
        }
    }
}
XeroFormEditSectionPage.fuzzyEdgeSpacing = 10;
//# sourceMappingURL=editpage.js.map