import { DataValue } from "../../../shared/datavalue.js";
;
import { EditTextDialog } from "../dialogs/edittextdialog.js";
import { FormControl } from "./formctrl.js";
export class TextControl extends FormControl {
    constructor(view, tag, bounds) {
        super(view, TextControl.item_desc_);
        this.setTag(tag);
        this.setBounds(bounds);
    }
    copyObject() {
        return new TextControl(this.view, this.item.tag, this.bounds);
    }
    updateFromItem(editing, scale, xoff, yoff) {
        if (this.ctrl) {
            let item = this.item;
            let ctrl = this.ctrl;
            this.setPosition(scale, xoff, yoff);
            if (editing) {
                ctrl.value = item.placeholder;
            }
            else {
                ctrl.placeholder = item.placeholder;
            }
            ctrl.style.fontFamily = item.fontFamily;
            ctrl.style.fontSize = item.fontSize + 'px';
            ctrl.style.fontWeight = item.fontWeight;
            ctrl.style.fontStyle = item.fontStyle;
            ctrl.style.color = item.color;
            ctrl.style.backgroundColor = item.background;
        }
    }
    createForEdit(parent, xoff, yoff) {
        super.createForEdit(parent, xoff, yoff);
        let input = document.createElement('input');
        this.setClassList(input, 'edit');
        input.disabled = true;
        this.ctrl = input;
        this.updateFromItem(true, 1.0, xoff, yoff);
        parent.appendChild(this.ctrl);
    }
    createForScouting(parent, scale, xoff, yoff) {
        console.log(`Creating TextControl for scouting with scale ${scale}, xoff ${xoff}, yoff ${yoff}`);
        let input = document.createElement('input');
        this.setClassList(input, 'scout');
        this.ctrl = input;
        if (this.item.datatype === 'integer') {
            input.type = 'number';
            input.step = '1';
        }
        else if (this.item.datatype === 'real') {
            input.type = 'number';
            input.step = 'any';
        }
        else if (this.item.datatype === 'string') {
            input.type = 'text';
        }
        this.updateFromItem(false, scale, xoff, yoff);
        parent.appendChild(this.ctrl);
    }
    createEditDialog() {
        return new EditTextDialog(this);
    }
    getData() {
        let input = this.ctrl;
        return DataValue.fromString(input.value);
    }
    setData(data) {
        if (this.ctrl) {
            let str = '';
            if (this.item.datatype === 'integer' && DataValue.isInteger(data)) {
                str = DataValue.toDisplayString(data);
            }
            else if (this.item.datatype === 'real' && DataValue.isNumber(data)) {
                str = DataValue.toDisplayString(data);
            }
            else if (this.item.datatype === 'string' && DataValue.isString(data)) {
                str = DataValue.toDisplayString(data);
            }
            let ctrl = this.ctrl;
            ctrl.value = str;
            console.log(`Setting text control data (type = '${this.item.datatype}' to '${str}'`);
            console.log(`    Input Type ${ctrl.type}`);
            console.log(`    After Delay - Value ${ctrl.value}`);
        }
    }
}
TextControl.item_desc_ = {
    type: 'text',
    placeholder: 'Enter Text Here',
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
    datatype: 'string',
    transparent: true,
};
//# sourceMappingURL=textctrl.js.map