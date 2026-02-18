import { TabulatorFull } from "tabulator-tables";
import { EditFormControlDialog } from "./editformctrldialog.js";
import { XeroTabbedWidget } from "../../../widgets/xerotabbedwidget.js";
export class EditWithItemsDialog extends EditFormControlDialog {
    constructor(name, formctrl) {
        super(name, formctrl);
    }
    createTabs(div) {
        this.tabwidget_ = new XeroTabbedWidget();
        div.appendChild(this.tabwidget_.elem);
        this.tab_page_1 = document.createElement('div');
        this.tab_page_1.className = 'xero-popup-form-edit-dialog-tab-page';
        this.tabwidget_.addPage('Properties', this.tab_page_1);
        this.tab_page_2 = document.createElement('div');
        this.tab_page_2.className = 'xero-popup-form-edit-dialog-tab-page';
        this.tabwidget_.addPage('Choices', this.tab_page_2);
        this.tabwidget_.selectPage(0);
    }
    getColumnData() {
        let data = [];
        for (let row of this.table_.getRows()) {
            let d = row.getData();
            data.push(d.value);
        }
        return data;
    }
    tableReady() {
        this.data_type_display_.innerText = 'Data Type: ' + this.deduceDataType(this.getColumnData());
    }
    extractChoices() {
        let data = [];
        for (let row of this.table_.getRows()) {
            let d = row.getData();
            data.push({
                text: d.text,
                value: d.value,
            });
        }
        return data;
    }
    extractDataType() {
        let data = this.getColumnData();
        return this.deduceDataType(data);
    }
    formatterBiggerFont(cell) {
        let val = cell.getValue();
        let el = cell.getElement();
        el.style.fontSize = '20px';
        return val;
    }
    populateChoices(div, datatype, choices) {
        this.data_type_display_ = datatype;
        let bigdiv = document.createElement('div');
        bigdiv.className = 'xero-popup-form-edit-dialog-bigdiv';
        div.appendChild(bigdiv);
        let tdiv = document.createElement('div');
        tdiv.className = 'xero-popup-form-edit-dialog-table-div';
        bigdiv.appendChild(tdiv);
        let cols = [];
        cols.push({
            field: 'text',
            title: 'Display',
            editor: 'input',
            width: 200,
            formatter: this.formatterBiggerFont.bind(this)
        });
        cols.push({
            field: 'value',
            title: 'Value',
            editor: 'input',
            width: 200,
            formatter: this.formatterBiggerFont.bind(this)
        });
        this.table_ = new TabulatorFull(tdiv, {
            data: choices,
            columns: cols,
            selectableRows: 1,
            layout: 'fitColumns',
        });
        this.table_.on('tableBuilt', this.tableReady.bind(this));
        this.table_.on('cellEdited', this.tableCellChanged.bind(this));
        this.table_.on('cellEditing', this.tableCellChanged.bind(this));
        let btndiv = document.createElement('div');
        btndiv.className = 'xero-popup-form-edit-dialog-choice-button-div';
        bigdiv.appendChild(btndiv);
        let addbtn = document.createElement('button');
        addbtn.className = 'xero-popup-form-edit-dialog-choice-button';
        addbtn.innerHTML = '&#x2795;';
        addbtn.addEventListener('click', this.addChoice.bind(this));
        btndiv.appendChild(addbtn);
        let delbtn = document.createElement('button');
        delbtn.className = 'xero-popup-form-edit-dialog-choice-button';
        delbtn.innerHTML = '&#x2796;';
        delbtn.addEventListener('click', this.deleteChoice.bind(this));
        btndiv.appendChild(delbtn);
    }
    deleteChoice() {
        let rows = this.table_.getSelectedRows();
        if (rows.length !== 1) {
            return;
        }
        let row = rows[0];
        this.table_.deleteRow(row);
        this.data_type_display_.innerText = 'Data Type: ' + this.deduceDataType(this.getColumnData());
    }
    addChoice() {
        this.table_.addRow({
            text: 'New Choice',
            value: 'new_value',
        });
        this.data_type_display_.innerText = 'Data Type: ' + this.deduceDataType(this.getColumnData());
    }
    tableCellChanged(cell) {
        this.data_type_display_.innerText = 'Data Type: ' + this.deduceDataType(this.getColumnData());
    }
}
//# sourceMappingURL=editwithitemsdialog.js.map