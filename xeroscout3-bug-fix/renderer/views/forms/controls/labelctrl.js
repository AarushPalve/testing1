import { EditLabelDialog } from "../dialogs/editlabeldialog.js";
import { FormControl } from "./formctrl.js";
export class LabelControl extends FormControl {
    constructor(view, tag, bounds) {
        super(view, LabelControl.item_desc_);
        this.setTag(tag);
        this.setBounds(bounds);
    }
    copyObject() {
        return new LabelControl(this.view, this.item.tag, this.bounds);
    }
    updateFromItem(editing, scale, xoff, yoff) {
        if (this.ctrl) {
            let item = this.item;
            this.setPosition(scale, xoff, yoff, 950);
            this.ctrl.innerText = item.text;
            this.ctrl.style.fontFamily = item.fontFamily;
            this.ctrl.style.fontSize = item.fontSize + 'px';
            this.ctrl.style.fontWeight = item.fontWeight;
            this.ctrl.style.fontStyle = item.fontStyle;
            this.ctrl.style.color = item.color;
            if (item.transparent) {
                this.ctrl.style.backgroundColor = 'transparent';
            }
            else {
                this.ctrl.style.backgroundColor = item.background;
            }
        }
    }
    createForEdit(parent, xoff, yoff) {
        super.createForEdit(parent, xoff, yoff);
        this.ctrl = document.createElement('span');
        this.setClassList(this.ctrl, 'edit');
        this.updateFromItem(true, 1.0, xoff, yoff);
        parent.appendChild(this.ctrl);
    }
    createForScouting(parent, scale, xoff, yoff) {
        super.createForScouting(parent, scale, xoff, yoff);
        this.ctrl = document.createElement('span');
        this.setClassList(this.ctrl, 'scout');
        this.updateFromItem(false, scale, xoff, yoff);
        parent.appendChild(this.ctrl);
    }
    createEditDialog() {
        return new EditLabelDialog(this);
    }
    getData() {
        return undefined;
    }
    setData(data) {
    }
}
LabelControl.item_desc_ = {
    type: 'label',
    text: 'MyLabel',
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
    transparent: true
};
//# sourceMappingURL=labelctrl.js.map