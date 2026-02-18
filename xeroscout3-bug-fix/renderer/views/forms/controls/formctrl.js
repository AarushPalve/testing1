import { XeroPoint, XeroRect, XeroSize } from "../../../shared/xerogeom.js";
export class FormControl {
    constructor(view, item) {
        this.style_ = 'none';
        this.errors_ = [];
        this.blink_state_ = false;
        this.instance_ = FormControl.instance_count_++;
        this.item_ = JSON.parse(JSON.stringify(item));
        this.view_ = view;
    }
    get type() {
        return this.item_.type;
    }
    clearErrors() {
        this.errors_ = [];
    }
    get errors() {
        return this.errors_;
    }
    get instance() {
        return this.instance_;
    }
    setErrors(errors) {
        console.log(`Setting errors for control ${this.instance_} (${this.item_.tag}) to ${errors}`);
        this.errors_ = [...errors];
        if (this.ctrl_ && this.style_ === 'none') {
            if (this.errors_.length > 0) {
                this.ctrl_.style.borderStyle = 'solid';
                this.ctrl_.style.borderWidth = '4px';
                this.ctrl_.style.borderColor = 'red';
                this.ctrl_.style.margin = '0px';
                if (this.blink_timer_ === undefined) {
                    this.blink_state_ = true;
                    this.blink_timer_ = setInterval(this.blink.bind(this), 1000);
                }
            }
            else {
                if (this.blink_timer_) {
                    clearInterval(this.blink_timer_);
                    this.blink_timer_ = undefined;
                    this.blink_state_ = false;
                }
                this.ctrl_.style.border = 'none';
                this.ctrl_.style.margin = '4px';
            }
        }
    }
    get locked() {
        if (!this.item.locked) {
            return false;
        }
        return this.item.locked;
    }
    set locked(locked) {
        this.item.locked = locked;
    }
    get view() {
        return this.view_;
    }
    get bounds() {
        return new XeroRect(this.item.x, this.item.y, this.item.width, this.item.height);
    }
    get fuzzyBounds() {
        return new XeroRect(this.item.x - FormControl.fuzzyEdgeSpacing, this.item.y - FormControl.fuzzyEdgeSpacing, this.item.width + (2 * FormControl.fuzzyEdgeSpacing), this.item.height + (2 * FormControl.fuzzyEdgeSpacing));
    }
    get originalBounds() {
        if (this.origional_bounds_ === undefined) {
            return this.bounds;
        }
        return this.origional_bounds_;
    }
    get size() {
        return new XeroSize(this.item.width, this.item.height);
    }
    get position() {
        return new XeroPoint(this.item.x, this.item.y);
    }
    get displayStyle() {
        return this.style_;
    }
    set displayStyle(style) {
        this.style_ = style;
        if (this.ctrl_) {
            switch (style) {
                case 'none':
                    if (this.errors_.length > 0) {
                        this.ctrl_.style.borderStyle = 'solid';
                        this.ctrl_.style.borderWidth = '4px';
                        this.ctrl_.style.borderColor = 'red';
                        this.ctrl_.style.margin = '0px';
                        if (this.blink_timer_ === undefined) {
                            this.blink_state_ = true;
                            this.blink_timer_ = setInterval(this.blink.bind(this), 1000);
                        }
                    }
                    else {
                        if (this.blink_timer_) {
                            clearInterval(this.blink_timer_);
                            this.blink_timer_ = undefined;
                            this.blink_state_ = false;
                        }
                        this.ctrl_.style.border = 'none';
                        this.ctrl_.style.margin = '4px';
                    }
                    break;
                case 'selected':
                    this.ctrl_.style.borderStyle = 'solid';
                    this.ctrl_.style.borderWidth = '4px';
                    this.ctrl_.style.borderColor = 'green';
                    this.ctrl_.style.margin = '0px';
                    break;
                case 'multiplesel':
                    this.ctrl_.style.borderStyle = 'dashed';
                    this.ctrl_.style.borderWidth = '4px';
                    this.ctrl_.style.borderColor = 'green';
                    this.ctrl_.style.margin = '0px';
                    break;
                case 'highlighted':
                    this.ctrl_.style.borderStyle = 'dashed';
                    this.ctrl_.style.borderWidth = '4px';
                    this.ctrl_.style.borderColor = 'red';
                    this.ctrl_.style.margin = '0px';
                    break;
            }
        }
    }
    blink() {
        if (this.ctrl_ && this.style_ === 'none' && this.errors_.length > 0) {
            if (this.blink_state_) {
                this.ctrl_.style.border = 'none';
                this.ctrl_.style.margin = '4px';
            }
            else {
                this.ctrl_.style.borderStyle = 'solid';
                this.ctrl_.style.borderWidth = '4px';
                this.ctrl_.style.borderColor = 'red';
            }
            this.blink_state_ = !this.blink_state_;
        }
    }
    positionUpdated() {
        if (this.ctrl_) {
            this.item.x = Math.round(this.item.x);
            this.item.y = Math.round(this.item.y);
            this.item.width = Math.round(this.item.width);
            this.item.height = Math.round(this.item.height);
            this.ctrl_.style.left = (this.item.x + this.offset.x) + 'px';
            this.ctrl_.style.top = (this.item.y + this.offset.y) + 'px';
            this.ctrl_.style.width = this.item.width + 'px';
            this.ctrl_.style.height = this.item.height + 'px';
        }
    }
    isNear(pt, edge) {
        let ret = false;
        let upper = edge + FormControl.fuzzyEdgeSpacing;
        let lower = edge - FormControl.fuzzyEdgeSpacing;
        if (pt >= lower && pt <= upper) {
            ret = true;
        }
        return ret;
    }
    isWithin(pt, minv, maxv) {
        return pt > minv - FormControl.fuzzyEdgeSpacing && pt < maxv + FormControl.fuzzyEdgeSpacing;
    }
    isRightEdge(pt) {
        if (this.ctrl_ === undefined) {
            return false;
        }
        if (this.isNear(pt.x, this.bounds.right) && this.isWithin(pt.y, this.bounds.top, this.bounds.bottom)) {
            return true;
        }
        return false;
    }
    isLeftEdge(pt) {
        if (this.ctrl_ === undefined) {
            return false;
        }
        if (this.isNear(pt.x, this.bounds.left) && this.isWithin(pt.y, this.bounds.top, this.bounds.bottom)) {
            return true;
        }
        return false;
    }
    isTopEdge(pt) {
        if (this.ctrl_ === undefined) {
            return false;
        }
        if (this.isNear(pt.y, this.bounds.top) && this.isWithin(pt.x, this.bounds.left, this.bounds.right)) {
            return true;
        }
        return false;
    }
    isBottomEdge(pt) {
        if (this.ctrl_ === undefined) {
            return false;
        }
        if (this.isNear(pt.y, this.bounds.bottom) && this.isWithin(pt.x, this.bounds.left, this.bounds.right)) {
            return true;
        }
        return false;
    }
    getEdgeFlags(pt) {
        let left = this.isLeftEdge(pt);
        let right = this.isRightEdge(pt);
        let top = this.isTopEdge(pt);
        let bottom = this.isBottomEdge(pt);
        return [top, left, bottom, right];
    }
    get item() {
        return this.item_;
    }
    get ctrl() {
        return this.ctrl_;
    }
    resetHTMLControl() {
        if (this.ctrl_ && this.ctrl_.parentElement) {
            this.ctrl_.parentElement.removeChild(this.ctrl_);
        }
        this.ctrl_ = undefined;
    }
    set ctrl(ctrl) {
        this.ctrl_ = ctrl;
    }
    clone(tag) {
        let t = typeof this;
        let ret = this.copyObject();
        ret.item_ = JSON.parse(JSON.stringify(this.item_));
        ret.item_.tag = tag;
        return ret;
    }
    get offset() {
        if (this.offset_ === undefined) {
            return new XeroPoint(0, 0);
        }
        return this.offset_;
    }
    setOriginalBounds() {
        this.origional_bounds_ = new XeroRect(this.bounds.x, this.bounds.y, this.bounds.width, this.bounds.height);
    }
    update(item) {
        this.item_ = item;
    }
    createForEdit(parent, xoff, yoff) {
        if (this.ctrl_ !== undefined) {
            throw new Error('Control already created');
        }
        this.offset_ = new XeroPoint(xoff, yoff);
    }
    createForScouting(parent, scale, xoff, yoff) {
        if (this.ctrl_ !== undefined) {
            throw new Error('Control already created');
        }
        this.offset_ = new XeroPoint(xoff, yoff);
    }
    setTag(tag) {
        this.item_.tag = tag;
    }
    setPosition(scale, xoff, yoff, zpos) {
        if (xoff !== undefined && yoff !== undefined && this.ctrl) {
            this.ctrl.style.left = (this.item.x * scale + xoff) + 'px';
            this.ctrl.style.top = (this.item.y * scale + yoff) + 'px';
            this.ctrl.style.width = this.item.width * scale + 'px';
            this.ctrl.style.height = this.item.height * scale + 'px';
            this.ctrl.style.position = 'absolute';
            this.ctrl.style.margin = '4px';
            this.ctrl.style.zIndex = zpos ? zpos.toString() : '1000';
        }
    }
    setBounds(bounds) {
        this.item_.x = bounds.x;
        this.item_.y = bounds.y;
        this.item_.width = bounds.width;
        this.item_.height = bounds.height;
    }
    setClassList(ctrl, oper, child) {
        let name;
        name = 'xero-form-' + this.item.type + (child ? '-' + child : '');
        ctrl.classList.add(name);
        name = 'xero-form-' + oper + '-' + this.item.type + (child ? '-' + child : '');
        ctrl.classList.add(name);
        name = 'xero-form-' + oper + '-item';
        ctrl.classList.add(name);
    }
}
FormControl.fuzzyEdgeSpacing = 10;
FormControl.kMinimumWidth = 20;
FormControl.kMinimumHeight = 20;
FormControl.instance_count_ = 0;
//# sourceMappingURL=formctrl.js.map