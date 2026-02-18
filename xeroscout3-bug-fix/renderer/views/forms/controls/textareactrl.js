import { DataValue } from "../../../shared/datavalue.js";
;
import { EditTextAreaDialog } from "../dialogs/edittextareadialog.js";
import { FormControl } from "./formctrl.js";
export class TextAreaControl extends FormControl {
    constructor(view, tag, bounds) {
        super(view, TextAreaControl.item_desc_);
        this.setTag(tag);
        this.setBounds(bounds);
    }
    copyObject() {
        return new TextAreaControl(this.view, this.item.tag, this.bounds);
    }
    updateFromItem(editing, scale, xoff, yoff) {
        if (this.area_) {
            let item = this.item;
            this.setPosition(scale, xoff, yoff);
            this.area_.rows = item.rows;
            this.area_.cols = item.cols;
            this.area_.style.fontFamily = item.fontFamily;
            this.area_.style.fontSize = item.fontSize + 'px';
            this.area_.style.fontWeight = item.fontWeight;
            this.area_.style.fontStyle = item.fontStyle;
            this.area_.style.color = item.color;
            this.area_.style.backgroundColor = item.background;
        }
    }
    createForEdit(parent, xoff, yoff) {
        super.createForEdit(parent, xoff, yoff);
        let box = document.createElement('div');
        this.setClassList(box, 'edit');
        this.ctrl = box;
        this.area_ = document.createElement('textarea');
        box.appendChild(this.area_);
        this.setClassList(this.area_, 'edit', 'textarea');
        this.area_.disabled = true;
        this.updateFromItem(true, 1.0, xoff, yoff);
        parent.appendChild(box);
    }
    createForScouting(parent, scale, xoff, yoff) {
        super.createForScouting(parent, scale, xoff, yoff);
        let box = document.createElement('div');
        this.setClassList(box, 'scout');
        this.ctrl = box;
        this.area_ = document.createElement('textarea');
        box.appendChild(this.area_);
        this.setClassList(this.area_, 'scout', 'textarea');
        this.updateFromItem(true, scale, xoff, yoff);
        parent.appendChild(box);
    }
    createEditDialog() {
        return new EditTextAreaDialog(this);
    }
    getData() {
        let area = this.area_;
        return DataValue.fromString(area.value);
    }
    setData(data) {
        if (this.area_ && DataValue.isString(data)) {
            this.area_.value = DataValue.toString(data);
        }
    }
}
TextAreaControl.item_desc_ = {
    type: 'textarea',
    tag: '',
    x: 0,
    y: 0,
    width: 0,
    height: 0,
    rows: 4,
    cols: 20,
    color: 'black',
    background: 'white',
    fontFamily: 'Arial',
    fontSize: 36,
    fontWeight: 'normal',
    fontStyle: 'normal',
    datatype: 'string',
    transparent: true,
};
//# sourceMappingURL=textareactrl.js.map