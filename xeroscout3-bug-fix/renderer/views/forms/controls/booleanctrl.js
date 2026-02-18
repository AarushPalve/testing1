import { DataValue } from "../../../shared/datavalue.js";
import { EditBooleanDialog } from "../dialogs/editbooleandialog.js";
import { FormControl } from "./formctrl.js";
export class BooleanControl extends FormControl {
    constructor(view, tag, bounds) {
        super(view, BooleanControl.item_desc_);
        this.setTag(tag);
        this.setBounds(bounds);
    }
    copyObject() {
        return new BooleanControl(this.view, this.item.tag, this.bounds);
    }
    updateFromItem(editing, scale, xoff, yoff) {
        if (this.ctrl) {
            let item = this.item;
            let ctrl = this.ctrl;
            this.setPosition(scale, xoff, yoff);
            ctrl.style.fontFamily = item.fontFamily;
            ctrl.style.fontSize = item.fontSize + 'px';
            ctrl.style.fontWeight = item.fontWeight;
            ctrl.style.fontStyle = item.fontStyle;
            ctrl.style.color = item.color;
            ctrl.style.accentColor = item.accent;
            ctrl.style.backgroundColor = item.background;
        }
    }
    createForEdit(parent, xoff, yoff) {
        super.createForEdit(parent, xoff, yoff);
        this.ctrl = document.createElement('div');
        this.setClassList(this.ctrl, 'edit');
        this.input_ = document.createElement('input');
        this.setClassList(this.input_, 'edit', 'checkbox');
        this.input_.type = 'checkbox';
        this.input_.disabled = true;
        this.updateFromItem(true, 1.0, xoff, yoff);
        this.ctrl.appendChild(this.input_);
        parent.appendChild(this.ctrl);
    }
    createForScouting(parent, scale, xoff, yoff) {
        this.ctrl = document.createElement('div');
        this.setClassList(this.ctrl, 'scout');
        this.input_ = document.createElement('input');
        this.setClassList(this.input_, 'scout', 'checkbox');
        this.input_.type = 'checkbox';
        this.updateFromItem(false, scale, xoff, yoff);
        this.ctrl.appendChild(this.input_);
        parent.appendChild(this.ctrl);
    }
    createEditDialog() {
        return new EditBooleanDialog(this);
    }
    getData() {
        return DataValue.fromBoolean(this.input_.checked);
    }
    setData(data) {
        if (this.input_) {
            if (DataValue.isBoolean(data)) {
                this.input_.checked = DataValue.toBoolean(data);
            }
        }
    }
}
BooleanControl.item_desc_ = {
    type: 'boolean',
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
    datatype: 'boolean',
    transparent: true,
    accent: 'lightgreen',
};
//# sourceMappingURL=booleanctrl.js.map