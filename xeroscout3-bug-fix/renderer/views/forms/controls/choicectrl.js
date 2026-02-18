import { DataValue } from "../../../shared/datavalue.js";
;
import { EditChoiceDialog } from "../dialogs/editchoicedialog.js";
import { FormControl } from "./formctrl.js";
export class MultipleChoiceControl extends FormControl {
    constructor(view, tag, bounds) {
        super(view, MultipleChoiceControl.item_desc_);
        this.choice_ctrls_ = [];
        this.choice_ctrl_to_value_ = new Map();
        this.setTag(tag);
        this.setBounds(bounds);
    }
    copyObject() {
        return new MultipleChoiceControl(this.view, this.item.tag, this.bounds);
    }
    updateFromItem(editing, scale, xoff, yoff) {
        if (this.ctrl) {
            let item = this.item;
            let ctrl = this.ctrl;
            this.setPosition(scale, xoff, yoff);
            this.updateChoices(editing);
        }
    }
    createVerticalChoices(item, editing) {
        let oper = editing ? 'edit' : 'view';
        this.choice_ctrl_to_value_.clear();
        let first = true;
        for (let choice of item.choices) {
            let tabrow = document.createElement('tr');
            this.setClassList(tabrow, oper, 'vertrow');
            let label = document.createElement('td');
            this.setClassList(label, oper, 'label');
            label.innerHTML = choice.text;
            label.style.fontFamily = item.fontFamily;
            label.style.fontSize = item.fontSize + 'px';
            label.style.fontWeight = item.fontWeight;
            label.style.fontStyle = item.fontStyle;
            label.style.backgroundColor = item.background;
            label.style.color = item.color;
            tabrow.appendChild(label);
            let iwrap = document.createElement('td');
            this.setClassList(iwrap, oper, 'wrapper');
            tabrow.appendChild(iwrap);
            let input = document.createElement('input');
            this.setClassList(input, oper, 'radio');
            this.choice_ctrl_to_value_.set(input, choice.value);
            input.type = item.multiselect ? 'checkbox' : 'radio';
            input.disabled = editing;
            input.checked = item.multiselect ? false : first;
            input.name = item.tag;
            input.id = item.tag + '_' + choice.value;
            input.style.fontFamily = item.fontFamily;
            input.style.fontSize = item.fontSize + 'px';
            input.style.color = item.color;
            label.style.backgroundColor = item.background;
            input.style.width = item.radiosize + 'px';
            input.style.height = item.radiosize + 'px';
            this.choice_ctrls_.push(input);
            iwrap.appendChild(input);
            this.choice_table_.appendChild(tabrow);
            first = false;
        }
    }
    createHorizontalChoices(item, editing) {
        let oper = editing ? 'edit' : 'view';
        this.choice_ctrl_to_value_.clear();
        let tabrow = document.createElement('tr');
        this.setClassList(tabrow, oper, 'horizrow');
        tabrow.style.width = '100%';
        this.choice_table_.appendChild(tabrow);
        let first = true;
        for (let choice of item.choices) {
            if (!first) {
                let sep = document.createElement('td');
                this.setClassList(sep, oper, 'separator');
                sep.innerHTML = '&nbsp;&nbsp;&nbsp;&nbsp;';
                tabrow.appendChild(sep);
            }
            let label = document.createElement('td');
            this.setClassList(label, oper, 'label');
            label.innerHTML = choice.text;
            label.style.fontFamily = item.fontFamily;
            label.style.fontSize = item.fontSize + 'px';
            label.style.fontWeight = item.fontWeight;
            label.style.fontStyle = item.fontStyle;
            label.style.backgroundColor = item.background;
            label.style.color = item.color;
            tabrow.appendChild(label);
            let iwrap = document.createElement('td');
            this.setClassList(iwrap, oper, 'wrapper');
            tabrow.appendChild(iwrap);
            let input = document.createElement('input');
            this.setClassList(input, oper, 'radio');
            this.choice_ctrl_to_value_.set(input, choice.value);
            input.type = item.multiselect ? 'checkbox' : 'radio';
            input.style.accentColor = item.color;
            input.disabled = editing;
            input.checked = item.multiselect ? false : first;
            input.name = item.tag;
            input.id = item.tag + '_' + choice.value;
            input.style.fontFamily = item.fontFamily;
            input.style.fontSize = item.fontSize + 'px';
            input.style.color = item.color;
            input.style.width = item.radiosize + 'px';
            input.style.height = item.radiosize + 'px';
            this.choice_ctrls_.push(input);
            iwrap.appendChild(input);
            first = false;
        }
    }
    updateChoices(editing) {
        let item = this.item;
        this.choice_table_.innerHTML = '';
        if (item.orientation === 'vertical') {
            this.createVerticalChoices(item, editing);
        }
        else {
            this.createHorizontalChoices(item, editing);
        }
    }
    createForEdit(parent, xoff, yoff) {
        super.createForEdit(parent, xoff, yoff);
        let item = this.item;
        this.choice_ctrls_ = [];
        this.ctrl = document.createElement('div');
        this.setClassList(this.ctrl, 'edit');
        this.choice_table_ = document.createElement('table');
        this.setClassList(this.choice_table_, 'edit', item.orientation + '-table');
        this.ctrl.appendChild(this.choice_table_);
        this.updateFromItem(true, 1.0, xoff, yoff);
        parent.appendChild(this.ctrl);
    }
    createForScouting(parent, scale, xoff, yoff) {
        let item = this.item;
        this.choice_ctrls_ = [];
        this.ctrl = document.createElement('div');
        this.setClassList(this.ctrl, 'scout');
        this.choice_table_ = document.createElement('table');
        this.setClassList(this.choice_table_, 'scout', item.orientation + '-table');
        this.ctrl.appendChild(this.choice_table_);
        this.updateFromItem(false, scale, xoff, yoff);
        if (item.multiselect) {
            this.setData(DataValue.fromString('[]'));
        }
        else if (item.choices.length > 0) {
            this.setData(DataValue.fromString(item.choices[0].value.toString()));
        }
        parent.appendChild(this.ctrl);
    }
    createEditDialog() {
        return new EditChoiceDialog(this);
    }
    getData() {
        let item = this.item;
        if (item.multiselect) {
            let selected = [];
            for (let ctrl of this.choice_ctrls_) {
                if (ctrl.checked) {
                    selected.push(this.choice_ctrl_to_value_.get(ctrl));
                }
            }
            return DataValue.fromString(JSON.stringify(selected));
        }
        let ret = undefined;
        for (let ctrl of this.choice_ctrls_) {
            if (ctrl.checked) {
                if (this.item.datatype !== 'string') {
                    ret = DataValue.fromReal(this.choice_ctrl_to_value_.get(ctrl));
                }
                else {
                    ret = DataValue.fromString(this.choice_ctrl_to_value_.get(ctrl));
                }
            }
        }
        return ret;
    }
    setData(data) {
        let item = this.item;
        if (item.multiselect) {
            let selected = [];
            if (DataValue.isString(data)) {
                try {
                    const parsed = JSON.parse(DataValue.toString(data));
                    if (Array.isArray(parsed)) {
                        selected = parsed;
                    }
                    else {
                        selected = [parsed];
                    }
                }
                catch (_a) {
                    selected = [DataValue.toString(data)];
                }
            }
            else if (DataValue.isNumber(data)) {
                selected = [DataValue.toReal(data)];
            }
            for (let ctrl of this.choice_ctrls_) {
                const v = this.choice_ctrl_to_value_.get(ctrl);
                ctrl.checked = selected.some((sv) => sv === v);
            }
            return;
        }
        if (this.choice_ctrls_ && DataValue.isString(data)) {
            let str = DataValue.toString(data);
            for (let ctrl of this.choice_ctrls_) {
                if (this.choice_ctrl_to_value_.get(ctrl) === str) {
                    ctrl.checked = true;
                }
                else {
                    ctrl.checked = false;
                }
            }
        }
        else if (this.choice_ctrls_ && DataValue.isNumber(data)) {
            let num = DataValue.toReal(data);
            for (let ctrl of this.choice_ctrls_) {
                if (this.choice_ctrl_to_value_.get(ctrl) === num) {
                    ctrl.checked = true;
                }
                else {
                    ctrl.checked = false;
                }
            }
        }
    }
}
MultipleChoiceControl.item_desc_ = {
    type: 'choice',
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
    radiosize: 20,
    orientation: 'vertical',
    multiselect: false,
    choices: [
        { text: 'Choice 1', value: 'choice1' },
        { text: 'Choice 2', value: 'choice2' },
        { text: 'Choice 3', value: 'choice3' },
    ],
};
//# sourceMappingURL=choicectrl.js.map