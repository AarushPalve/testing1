var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
import { TabulatorFull } from "tabulator-tables";
import { XeroDialog } from "../../widgets/xerodialog.js";
export class DBViewFormulaDialog extends XeroDialog {
    constructor(type, forms, formulas, columns) {
        super('Edit Database Check Formulas');
        this.formulas_ = [];
        this.columns_ = [];
        this.types_ = ['alliance', 'robot'];
        this.format_entries_ = forms;
        this.formulas_ = formulas;
        this.columns_ = columns;
        this.disableEnterKeyProcessing();
        let lastrow = {
            lastrow: true,
        };
        this.format_entries_.push(lastrow);
        if (type === 'team') {
            this.types_ = ['robot'];
        }
    }
    get formatFormulas() {
        return this.format_entries_;
    }
    getFontFamilies() {
        return new Promise((resolve, reject) => {
            window.queryLocalFonts()
                .then((fonts) => {
                let set = new Set(fonts.map((font) => font.family));
                resolve([...set]);
            })
                .catch((error) => {
                resolve([]); // Return an empty array on error
            });
        });
    }
    populateDialog(pdiv) {
        return __awaiter(this, void 0, void 0, function* () {
            let div = document.createElement('div');
            div.className = 'xero-db-';
            this.table_ = new TabulatorFull(div, {
                editTriggerEvent: 'dblclick',
                data: this.format_entries_,
                movableRows: true,
                rowHeader: {
                    headerSort: false,
                    resizable: false,
                    minWidth: 30,
                    width: 30,
                    rowHandle: true,
                    formatter: 'handle'
                },
                columns: [
                    { title: '', field: 'del', formatter: this.formatDelCell.bind(this), width: 25 },
                    { title: 'Type', field: 'type', width: 80, editable: this.canEditCell.bind(this), editor: 'list',
                        editorParams: {
                            values: this.types_
                        }
                    },
                    { title: 'Column', field: 'columns', width: 80, editable: this.canEditCell.bind(this), editor: 'list',
                        editorParams: {
                            values: this.columns_.map((c) => c.name),
                            multiselect: true
                        }
                    },
                    { title: 'Formula', field: 'formula', width: 100, editable: this.canEditCell.bind(this), editor: 'list',
                        editorParams: {
                            values: this.formulas_.map((f) => f.name),
                        }
                    },
                    { title: 'Message', field: 'message', width: 100, editable: this.canEditCell.bind(this), editor: 'input' },
                    { title: 'Background', field: 'background', width: 80, editable: this.canEditCell.bind(this), editor: 'input' },
                    { title: 'Color', field: 'color', width: 80, editable: this.canEditCell.bind(this), editor: 'input' },
                    { title: 'Font Family', field: 'fontFamily', width: 110, editable: this.canEditCell.bind(this), editor: 'list',
                        editorParams: {
                            values: yield this.getFontFamilies(),
                        }
                    },
                    { title: 'Font Size', field: 'fontSize', width: 110, editable: this.canEditCell.bind(this), editor: 'number' },
                    { title: 'Font Style', field: 'fontStyle', width: 110, editable: this.canEditCell.bind(this), editor: 'list',
                        editorParams: {
                            values: ['normal', 'italic', 'oblique'],
                        }
                    },
                    { title: 'Font Weight', field: 'fontWeight', width: 110, editable: this.canEditCell.bind(this), editor: 'list',
                        editorParams: {
                            values: ['normal', 'bold', 'bolder', 'lighter', '100', '200', '300', '400', '500', '600', '700', '800', '900'],
                        }
                    },
                    { title: 'Formatting', field: 'formatting', formatter: this.formatFormattingCell.bind(this), editable: false },
                ],
                layout: 'fitColumns',
            });
            this.table_.on('tableBuilt', this.tableBuilt.bind(this));
            this.table_.on('cellEdited', this.cellEdited.bind(this));
            this.table_.on('rowMoved', this.rowMoved.bind(this));
            pdiv.appendChild(div);
            let span = document.createElement('span');
            span.className = 'xero-dialog-note';
            span.innerHTML = 'Double-click on a cell to edit it. Click on the + button to add a new database check formula.';
            pdiv.appendChild(span);
        });
    }
    fixLastRow() {
        let rows = this.table_.getRows();
        let index = rows.length - 1;
        for (let i = 0; i < rows.length; i++) {
            if (rows[i].getData().lastrow === true) {
                console.log('Fixing last row');
                console.log('  deleting row', i);
                this.table_.deleteRow(rows[i]);
                this.table_.addRow({ lastrow: true }, false);
                break;
            }
        }
    }
    rowMoved(row) {
        // If the last row  is not really the last row, move it to the end
        let rows = this.table_.getRows();
        let index = rows.length - 1;
        let last = rows[index];
        if (last.getData().lastrow !== true) {
            this.fixLastRow();
        }
    }
    canEditCell(cell) {
        // Allow editing only if the cell is not in the last row
        return !this.isLastRow(cell);
    }
    cellEdited(cell) {
        let data = cell.getData();
        if (!this.isLastRow(cell)) {
            let fmtcell = cell.getRow().getCell('formatting');
            fmtcell.setValue('Formatting');
        }
    }
    isLastRow(obj) {
        let row = obj.getRow();
        if (row.getNextRow() === false) {
            return true;
        }
        return false;
    }
    formatDelCell(cell, formatterParams, onRendered) {
        let ret;
        if (this.isLastRow(cell)) {
            ret = document.createElement('button');
            ret.addEventListener('click', this.addFormat.bind(this));
            ret.innerHTML = '<b>+</b>';
        }
        else {
            ret = document.createElement('button');
            ret.addEventListener('click', this.delFormat.bind(this, cell));
            ret.innerHTML = '<b>-</b>';
        }
        return ret;
    }
    addFormat(e) {
        let entry = {
            formula: this.formulas_[0].name,
            type: this.types_[0],
            message: 'New Database Check Formula',
            background: '#000000',
            color: '#ffffff',
            fontFamily: 'Arial',
            fontSize: 12,
            fontStyle: 'normal',
            fontWeight: 'normal',
            columns: [],
        };
        let row = this.findLastRow();
        if (row) {
            this.table_.addRow(entry, true, row);
        }
        else {
            this.table_.addRow(entry, true);
        }
    }
    findLastRow() {
        for (let row of this.table_.getRows()) {
            if (row.getNextRow() === false) {
                return row;
            }
        }
        return null;
    }
    delFormat(cell, e) {
        var _a;
        (_a = this.table_) === null || _a === void 0 ? void 0 : _a.deleteRow(cell.getRow());
    }
    tableBuilt() {
    }
    formatFormattingCell(cell, formatterParams, onRendered) {
        let last = this.isLastRow(cell);
        let data = cell.getData();
        let elem = document.createElement('span');
        elem.innerHTML = last ? '' : 'Formatting';
        elem.style.backgroundColor = data.background;
        elem.style.color = data.color;
        elem.style.fontFamily = data.fontFamily;
        elem.style.fontSize = data.fontSize + 'px';
        elem.style.fontStyle = data.fontStyle;
        elem.style.fontWeight = data.fontWeight;
        return elem;
    }
    extractFormulas() {
        let formulas = [];
        for (let row of this.table_.getRows()) {
            if (row.getNextRow() === false) {
                break;
            }
            let d = row.getData();
            let data = d;
            if (!d.lastrow || d.lastrow === false) {
                let formula = {
                    formula: data.formula,
                    type: data.type,
                    message: data.message,
                    background: data.background || '#000000',
                    color: data.color || '#ffffff',
                    columns: data.columns || [],
                    fontFamily: data.fontFamily || 'Arial',
                    fontSize: data.fontSize || 12,
                    fontStyle: data.fontStyle || 'normal',
                    fontWeight: data.fontWeight || 'normal',
                };
                formulas.push(formula);
            }
        }
        this.format_entries_ = formulas;
    }
    okButton(ev) {
        this.extractFormulas();
        super.okButton(ev);
    }
}
//# sourceMappingURL=dbformdialog.js.map