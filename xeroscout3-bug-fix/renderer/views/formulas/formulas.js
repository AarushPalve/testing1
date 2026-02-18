import { TabulatorFull } from "tabulator-tables";
import { XeroView } from "../xeroview.js";
import { NewFormulaDialog } from "./newformula.js";
import { XeroYesNo } from "../../widgets/xeroyesnow.js";
export class XeroFormulasView extends XeroView {
    constructor(app, args) {
        super(app, 'xero-formula-view');
        this.match_fields_ = [];
        this.team_fields_ = [];
        this.formulas_ = [];
        this.seen_formulas_ = false;
        this.seen_match_fields_ = false;
        this.seen_team_fields_ = false;
        this.editing_ = -1;
        this.registerCallback('send-formulas', this.receivedFormulas.bind(this));
        this.registerCallback('send-match-field-list', this.receivedMatchFields.bind(this));
        this.registerCallback('send-team-field-list', this.receivedTeamFields.bind(this));
        this.request('get-match-field-list');
        this.request('get-team-field-list');
        this.request('get-formula-field-list');
        this.request('get-formulas');
    }
    receivedFormulas(data) {
        this.formulas_ = data;
        this.seen_formulas_ = true;
        this.checkReady();
    }
    receivedMatchFields(data) {
        this.match_fields_ = data;
        this.seen_match_fields_ = true;
        this.checkReady();
    }
    receivedTeamFields(data) {
        this.team_fields_ = data;
        this.seen_team_fields_ = true;
        this.checkReady();
    }
    checkReady() {
        if (this.seen_formulas_ && this.seen_match_fields_ && this.seen_team_fields_) {
            if (!this.table_) {
                this.table_ = new TabulatorFull(this.elem, {
                    data: this.formulas_,
                    layout: 'fitColumns',
                    columns: [
                        { title: '', field: 'del', formatter: this.formatDelCell.bind(this), width: 30 },
                        { title: 'Name', field: 'name' },
                        { title: 'Formula', field: 'formula' },
                        { title: 'Description', field: 'desc' },
                    ]
                });
                this.table_.on('tableBuilt', this.addNewFormulaRow.bind(this));
                this.table_.on('cellDblClick', this.onCellDblClick.bind(this));
            }
            else {
                this.table_.setData(this.formulas_);
                this.addNewFormulaRow();
            }
        }
    }
    onCellDblClick(e, cell) {
        let data = cell.getData();
        if (data.name !== undefined) {
            this.editing_ = this.formulas_.findIndex((f) => f.name === data.name);
            if (this.editing_ !== -1) {
                // Only allow editing if the formula is owned by the current app type
                const formula = this.formulas_[this.editing_];
                if (formula.owner !== this.app.appType) {
                    return; // Cannot edit formulas owned by other app types
                }
                this.dialog_ = new NewFormulaDialog(this.formulas_, this.match_fields_, this.team_fields_, formula.name, formula.formula, formula.desc, false);
                this.dialog_.on('closed', this.addNewFormulaClosed.bind(this));
                this.dialog_.showCentered(this.elem);
            }
        }
    }
    formatDelCell(cell, formatterParams, onRendered) {
        let ret;
        if (cell.getRow().getNextRow() === false && cell.getData().name === undefined) {
            ret = document.createElement('button');
            ret.addEventListener('click', this.addNewFormula.bind(this));
            ret.innerHTML = '➕';
            ret.title = 'Add new formula';
            ret.style.cursor = 'pointer';
            ret.style.fontSize = '16px';
        }
        else {
            const data = cell.getData();
            const formula = this.formulas_.find((f) => f.name === data.name);
            // Only show delete button if the formula is owned by the current app type
            if (formula && formula.owner === this.app.appType) {
                ret = document.createElement('button');
                ret.addEventListener('click', this.deleteFormula.bind(this, cell));
                ret.innerHTML = '🗑️';
                ret.title = 'Delete formula';
                ret.style.cursor = 'pointer';
                ret.style.fontSize = '16px';
            }
            else {
                // Show empty cell or disabled indicator for formulas not owned by this app
                ret = document.createElement('span');
                ret.innerHTML = '';
            }
        }
        return ret;
    }
    addNewFormulaRow() {
        this.table_.addRow({
            del: true,
        });
    }
    addNewFormulaClosed(changed) {
        if (changed) {
            let d = this.dialog_;
            let name = d.name;
            let desc = d.desc;
            let expr = d.expr;
            if (this.editing_ !== -1) {
                if (name !== this.formulas_[this.editing_].name) {
                    this.request('rename-formula', [this.formulas_[this.editing_].name, name]);
                    this.formulas_[this.editing_].name = name;
                }
                this.formulas_[this.editing_].desc = desc;
                this.formulas_[this.editing_].formula = expr;
            }
            else {
                this.formulas_.push({
                    name: name,
                    desc: desc,
                    formula: expr,
                    owner: this.app.appType
                });
            }
            this.request('update-formula', [name, desc, expr]);
            this.request('get-formulas');
        }
        this.dialog_ = undefined;
        this.editing_ = -1;
    }
    addNewFormula(e) {
        this.dialog_ = new NewFormulaDialog(this.formulas_, this.match_fields_, this.team_fields_, '', '', '', true);
        this.dialog_.on('closed', this.addNewFormulaClosed.bind(this));
        this.dialog_.showCentered(this.elem);
    }
    deleteFormulaConfirmed(cell, changed) {
        if (changed) {
            let data = cell.getData();
            if (data.name !== undefined) {
                this.request('delete-formula', data.name);
                this.request('get-formulas');
            }
        }
    }
    deleteFormula(cell, e) {
        let data = cell.getData();
        this.dialog_ = new XeroYesNo('Delete Formula', `Are you sure you want to delete the formula '${data.name}?`);
        this.dialog_.on('closed', this.deleteFormulaConfirmed.bind(this, cell));
        this.dialog_.showCentered(this.elem);
    }
}
//# sourceMappingURL=formulas.js.map