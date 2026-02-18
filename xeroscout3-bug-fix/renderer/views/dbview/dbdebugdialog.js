var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
import { XeroDialog } from "../../widgets/xerodialog.js";
import { TabulatorFull } from "tabulator-tables";
//still unable to see variable values in debug dialog.
export class DBDebugDialog extends XeroDialog {
    constructor(dbView, type, formulas, allFormulas, columns, matchId) {
        super('Debug Formulas' + (matchId ? ` - Match ${matchId}` : ''), false);
        this.dbView = dbView;
        this.formulas_ = [];
        this.formulaMap_ = new Map();
        this.debugDataMap_ = new Map();
        this.formulas_ = formulas;
        allFormulas.forEach(f => this.formulaMap_.set(f.name, f.formula));
    }
    populateDialog(pdiv) {
        return __awaiter(this, void 0, void 0, function* () {
            const div = document.createElement('div');
            div.style.width = '800px';
            div.style.height = '400px';
            this.table_ = new TabulatorFull(div, {
                data: this.formulas_,
                columns: [
                    { title: 'Type', field: 'type', width: 80 },
                    { title: 'Formula', field: 'formula', width: 150 },
                    {
                        title: 'Debug',
                        field: 'debug',
                        width: 80,
                        formatter: (cell) => {
                            let btn = document.createElement('button');
                            btn.innerText = 'Debug';
                            btn.addEventListener('click', (e) => {
                                e.stopPropagation();
                                const rowData = cell.getRow().getData();
                                let debugData;
                                // Call appropriate debug method based on formula type  
                                if (rowData.type === 'alliance') {
                                    debugData = this.dbView.debugFormulaAlliance(rowData);
                                }
                                else {
                                    debugData = this.dbView.debugFormulaRobot(rowData);
                                }
                                this.showDebugDetails(rowData, debugData);
                            });
                            return btn;
                        }
                    }
                ],
                layout: 'fitColumns'
            });
            pdiv.appendChild(div);
        });
    }
    populateButtons(div) {
        let closebtn = document.createElement('button');
        closebtn.innerText = 'Close';
        closebtn.className = 'xero-popup-form-edit-dialog-button';
        closebtn.addEventListener('click', () => {
            this.close(false);
        });
        div.appendChild(closebtn);
    }
    showDebugDetails(formula, debugData) {
        const expression = this.formulaMap_.get(formula.formula) || formula.formula;
        const debugDiv = document.createElement('div');
        debugDiv.style.cssText = `  
            position: fixed;  
            top: 50%;  
            left: 50%;  
            transform: translate(-50%, -50%);  
            background: white;  
            border: 2px solid black;  
            padding: 20px;  
            z-index: 1200;  
            box-shadow: 0 0 10px rgba(0,0,0,0.5);  
            max-height: 80vh;  
            overflow-y: auto;  
        `;
        // Build variables HTML from array data  
        let variablesHtml = '';
        if (debugData && debugData.length > 0) {
            // Show first set of variables (for alliance) or the row data (for robot)  
            const vars = debugData[0] || [];
            variablesHtml = vars.map(v => `${v.name} = ${v.value}`).join('<br>');
        }
        else {
            variablesHtml = 'No debug data available';
        }
        debugDiv.innerHTML = `  
            <h3>Debug Formula: ${formula.formula}</h3>  
            <p><strong>Expression:</strong> ${expression}</p>  
            <p><strong>Type:</strong> ${formula.type}</p>  
            <p><strong>Variables:</strong></p>  
            ${variablesHtml}  
        `;
        const btn = document.createElement('button');
        btn.className = 'xero-popup-form-edit-dialog-button';
        btn.innerText = 'Close';
        btn.addEventListener('click', () => {
            debugDiv.remove();
        });
        debugDiv.appendChild(btn);
        document.body.appendChild(debugDiv);
    }
    updateDebugData(formula, data) {
        this.debugDataMap_.set(formula.formula, data);
    }
}
//# sourceMappingURL=dbdebugdialog.js.map