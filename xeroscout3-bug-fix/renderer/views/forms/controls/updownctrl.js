import { DataValue } from "../../../shared/datavalue.js";
;
import { EditUpDownControlDialog } from "../dialogs/editupdowndialog.js";
import { FormControl } from "./formctrl.js";
export class UpDownControl extends FormControl {
    constructor(view, tag, bounds) {
        super(view, UpDownControl.item_desc_);
        this.count_value_ = 0;
        this.setTag(tag);
        this.setBounds(bounds);
    }
    copyObject() {
        return new UpDownControl(this.view, this.item.tag, this.bounds);
    }
    updateFromItem(editing, scale, xoff, yoff) {
        if (this.ctrl) {
            let item = this.item;
            this.setPosition(scale, xoff, yoff);
            if (item.orientation === 'horizontal') {
                this.ctrl.style.display = 'flex';
                this.ctrl.style.flexDirection = 'row';
            }
            else {
                this.ctrl.style.display = 'flex';
                this.ctrl.style.flexDirection = 'column';
            }
            this.upbutton_.style.fontFamily = this.item.fontFamily;
            this.upbutton_.style.fontSize = this.item.fontSize + 'px';
            this.upbutton_.style.fontStyle = this.item.fontStyle;
            this.upbutton_.style.fontWeight = this.item.fontWeight;
            this.upbutton_.style.color = this.item.color;
            this.upbutton_.style.flexGrow = '1';
            if (this.item.transparent) {
                this.upbutton_.style.backgroundColor = 'transparent';
            }
            else {
                this.upbutton_.style.backgroundColor = this.item.background;
            }
            this.downbutton_.style.fontFamily = this.item.fontFamily;
            this.downbutton_.style.fontSize = this.item.fontSize + 'px';
            this.downbutton_.style.fontStyle = this.item.fontStyle;
            this.downbutton_.style.fontWeight = this.item.fontWeight;
            this.downbutton_.style.color = this.item.color;
            this.downbutton_.style.flexGrow = '1';
            if (this.item.transparent) {
                this.downbutton_.style.backgroundColor = 'transparent';
            }
            else {
                this.downbutton_.style.backgroundColor = this.item.background;
            }
            this.count_.style.fontFamily = this.item.fontFamily;
            this.count_.style.fontSize = this.item.fontSize + 'px';
            this.count_.style.fontStyle = this.item.fontStyle;
            this.count_.style.fontWeight = this.item.fontWeight;
            this.count_.style.color = this.item.color;
            this.count_.style.flexGrow = '0';
            if (this.item.transparent) {
                this.count_.style.backgroundColor = 'transparent';
            }
            else {
                this.count_.style.backgroundColor = this.item.background;
            }
        }
    }
    countUp() {
        let item = this.item;
        if (this.count_value_ < item.maxvalue) {
            this.count_value_++;
            this.displayCount();
        }
    }
    countDown() {
        let item = this.item;
        if (this.count_value_ > item.minvalue) {
            this.count_value_--;
            this.displayCount();
        }
    }
    displayCount() {
        if (this.count_) {
            this.count_.innerText = this.count_value_.toString();
        }
    }
    createForEdit(parent, xoff, yoff) {
        super.createForEdit(parent, xoff, yoff);
        let item = this.item;
        this.ctrl = document.createElement('div');
        this.setClassList(this.ctrl, 'edit');
        this.upbutton_ = document.createElement('button');
        this.setClassList(this.upbutton_, 'edit', 'button');
        this.upbutton_.innerHTML = '&#x25B2;';
        this.upbutton_.disabled = true;
        this.count_ = document.createElement('span');
        this.setClassList(this.count_, 'edit', 'count');
        this.count_.innerText = '0';
        this.downbutton_ = document.createElement('button');
        this.setClassList(this.upbutton_, 'edit', 'button');
        this.downbutton_.innerHTML = '&#x25BC;';
        this.downbutton_.disabled = true;
        if (item.orientation === 'horizontal') {
            this.ctrl.appendChild(this.downbutton_);
            this.ctrl.appendChild(this.count_);
            this.ctrl.appendChild(this.upbutton_);
        }
        else {
            this.ctrl.appendChild(this.upbutton_);
            this.ctrl.appendChild(this.count_);
            this.ctrl.appendChild(this.downbutton_);
        }
        this.updateFromItem(true, 1.0, xoff, yoff);
        parent.appendChild(this.ctrl);
    }
    createForScouting(parent, scale, xoff, yoff) {
        let item = this.item;
        this.ctrl = document.createElement('div');
        this.setClassList(this.ctrl, 'scout');
        this.upbutton_ = document.createElement('button');
        this.setClassList(this.upbutton_, 'scout', 'button');
        this.upbutton_.innerHTML = '&#x25B2;';
        this.upbutton_.addEventListener('click', this.countUp.bind(this));
        this.count_ = document.createElement('span');
        this.setClassList(this.count_, 'scout', 'count');
        this.count_.innerText = '0';
        this.downbutton_ = document.createElement('button');
        this.setClassList(this.downbutton_, 'scout', 'button');
        this.downbutton_.innerHTML = '&#x25BC;';
        this.downbutton_.addEventListener('click', this.countDown.bind(this));
        if (item.orientation === 'horizontal') {
            this.ctrl.appendChild(this.downbutton_);
            this.ctrl.appendChild(this.count_);
            this.ctrl.appendChild(this.upbutton_);
        }
        else {
            this.ctrl.appendChild(this.upbutton_);
            this.ctrl.appendChild(this.count_);
            this.ctrl.appendChild(this.downbutton_);
        }
        this.updateFromItem(false, scale, xoff, yoff);
        this.setData(DataValue.fromInteger(item.minvalue));
        parent.appendChild(this.ctrl);
    }
    createEditDialog() {
        return new EditUpDownControlDialog(this);
    }
    getData() {
        return DataValue.fromInteger(this.count_value_);
    }
    setData(data) {
        if (this.count_ && DataValue.isInteger(data)) {
            this.count_value_ = DataValue.toInteger(data);
            this.displayCount();
        }
    }
}
UpDownControl.item_desc_ = {
    type: 'updown',
    orientation: 'vertical',
    tag: '',
    x: 0,
    y: 0,
    width: 40,
    height: 200,
    color: 'black',
    background: 'white',
    fontFamily: 'Arial',
    fontSize: 36,
    fontWeight: 'normal',
    fontStyle: 'normal',
    datatype: 'integer',
    transparent: true,
    minvalue: 0,
    maxvalue: 20,
};
//# sourceMappingURL=updownctrl.js.map