import { DataValue } from "../../../shared/datavalue.js";
;
import { EditSelectDialog } from "../dialogs/editselectdialog.js";
import { FormControl } from "./formctrl.js";
export class SelectControl extends FormControl {
    constructor(view, tag, bounds) {
        super(view, SelectControl.item_desc_);
        this.setTag(tag);
        this.setBounds(bounds);
    }
    copyObject() {
        return new SelectControl(this.view, this.item.tag, this.bounds);
    }
    updateFromItem(editing, scale, xoff, yoff) {
        if (this.ctrl) {
            let item = this.item;
            let ctrl = this.ctrl;
            this.setPosition(scale, xoff, yoff);
            ctrl.style.color = item.color;
            ctrl.style.backgroundColor = item.background;
            ctrl.style.fontFamily = item.fontFamily;
            ctrl.style.fontSize = item.fontSize + 'px';
            ctrl.style.fontWeight = item.fontWeight;
            ctrl.style.fontStyle = item.fontStyle;
            this.updateChoices(editing);
        }
    }
    updateChoices(editing) {
        let item = this.item;
        let ctrl = this.ctrl;
        ctrl.innerHTML = '';
        for (const choice of item.choices) {
            let opt = document.createElement('option');
            opt.value = choice.value.toString();
            opt.textContent = choice.text;
            ctrl.appendChild(opt);
        }
    }
    createForEdit(parent, xoff, yoff) {
        super.createForEdit(parent, xoff, yoff);
        let item = this.item;
        let sel = document.createElement('select');
        this.setClassList(sel, 'edit');
        sel.disabled = true;
        this.ctrl = sel;
        this.setClassList(this.ctrl, 'edit');
        this.updateFromItem(true, 1.0, xoff, yoff);
        parent.appendChild(this.ctrl);
    }
    createForScouting(parent, scale, xoff, yoff) {
        let item = this.item;
        this.ctrl = document.createElement('select');
        this.setClassList(this.ctrl, 'scout');
        this.updateFromItem(true, scale, xoff, yoff);
        parent.appendChild(this.ctrl);
    }
    createEditDialog() {
        return new EditSelectDialog(this);
    }
    getData() {
        let ret = undefined;
        let ctrl = this.ctrl;
        if (this.item.datatype === 'integer') {
            ret = DataValue.fromInteger(parseInt(ctrl.value));
        }
        else if (this.item.datatype === 'real') {
            ret = DataValue.fromReal(parseFloat(ctrl.value));
        }
        else if (this.item.datatype === 'string') {
            ret = DataValue.fromString(ctrl.value);
        }
        return ret;
    }
    setData(data) {
        let ctrl = this.ctrl;
        if (ctrl && DataValue.isString(data)) {
            ctrl.value = DataValue.toString(data);
        }
    }
}
SelectControl.item_desc_ = {
    type: 'select',
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
    choices: [
        { text: 'Choice 1', value: 'choice1' },
        { text: 'Choice 2', value: 'choice2' },
        { text: 'Choice 3', value: 'choice3' },
    ],
};
//# sourceMappingURL=selectctrl.js.map