import { TabulatorFull } from "tabulator-tables";
import { XeroView } from "../xeroview.js";
export class EditTeamsView extends XeroView {
    constructor(app) {
        super(app, 'xero-editteams-view');
        this.table_div_ = null;
        this.table_ = null;
        this.modified_ = false;
        this.registerCallback('send-team-data', this.receiveTeamData.bind(this));
        this.request('get-team-data');
    }
    get isOkToClose() {
        if (this.modified_) {
            alert('You have unsaved changes! Please save or cancel before closing.');
            return false;
        }
        return true;
    }
    receiveTeamData(data) {
        this.reset();
        this.table_div_ = document.createElement('div');
        this.table_div_.className = 'xero-db-view-table-div';
        this.elem.appendChild(this.table_div_);
        let coldefs = [
            {
                title: "Team NickName",
                field: "nickname",
                editor: "input",
                width: 300,
            },
            {
                title: "Number",
                field: "number",
                editor: "number",
                editorParams: {
                    min: 0,
                    max: 19999,
                    step: 1,
                },
                width: 80,
            },
            {
                title: "",
                field: "delete",
                width: 60,
                hozAlign: "center",
                formatter: () => "🗑️",
                cellClick: (e, cell) => {
                    this.deleteRow(cell.getRow());
                }
            }
        ];
        this.table_ = new TabulatorFull(this.table_div_, {
            data: this.convertFromBackend(data),
            columns: coldefs,
            layout: "fitData",
            resizableColumnFit: true,
            movableColumns: true,
            selectableRows: 1,
        });
        this.table_.on('cellEditing', this.cellEditing.bind(this));
        this.table_.on('cellEdited', this.cellEdited.bind(this));
        this.table_.on('tableBuilt', () => {
            // Validate duplicates when table is initially built
            this.validateDuplicateTeamNumbers();
        });
        let hr = document.createElement('hr');
        this.elem.appendChild(hr);
        let add_btn = document.createElement('button');
        add_btn.textContent = 'Add Team';
        add_btn.onclick = this.onAddTeam.bind(this);
        this.elem.appendChild(add_btn);
        let import_btn = document.createElement('button');
        import_btn.textContent = 'Import Teams';
        import_btn.onclick = this.onImportTeams.bind(this);
        this.elem.appendChild(import_btn);
        let save_btn = document.createElement('button');
        save_btn.textContent = 'Save Teams';
        save_btn.onclick = this.onSaveTeams.bind(this);
        this.elem.appendChild(save_btn);
        let cancel_btn = document.createElement('button');
        cancel_btn.textContent = 'Cancel';
        cancel_btn.onclick = this.onCancel.bind(this);
        this.elem.appendChild(cancel_btn);
    }
    onDeleteTeam() {
        if (this.table_) {
            let selectedRows = this.table_.getSelectedRows();
            selectedRows.forEach(row => row.delete());
            // Validate duplicates after deletion
            this.validateDuplicateTeamNumbers();
        }
    }
    deleteRow(row) {
        // Delete the specific row
        row.delete();
        // Validate duplicates after deletion
        this.validateDuplicateTeamNumbers();
        this.modified_ = true;
    }
    onAddTeam() {
        if (this.table_) {
            // Add a new empty team row
            this.table_.addRow({
                nickname: '',
                number: 0
            });
            // Validate duplicates after adding
            this.validateDuplicateTeamNumbers();
            this.modified_ = true;
        }
    }
    onImportTeams() {
        // Make request to backend to import teams
        this.request('execute-command', 'import-teams');
    }
    onSaveTeams() {
        if (this.table_) {
            // Check for validation errors before saving
            if (this.hasValidationErrors()) {
                alert('Data not saved due to errors. Please fix all duplicate team numbers before saving.');
                return;
            }
            let data = this.table_.getData();
            this.modified_ = false;
            this.request('set-team-data', this.convertToBackend(data));
        }
    }
    onCancel() {
        this.modified_ = false;
        this.request('execute-command', 'view-init');
    }
    cellEditing(cell) {
        this.modified_ = true;
    }
    cellEdited(cell) {
        // If a team number was edited, validate for duplicates
        if (cell.getField() === 'number') {
            this.validateDuplicateTeamNumbers();
        }
        this.modified_ = true;
    }
    validateDuplicateTeamNumbers() {
        if (!this.table_)
            return;
        const tableData = this.table_.getData();
        const teamNumbers = new Map(); // team number -> count
        // Count occurrences of each team number (excluding 0)
        tableData.forEach(row => {
            const teamNumber = parseInt(row.number) || 0;
            if (teamNumber !== 0) {
                teamNumbers.set(teamNumber, (teamNumbers.get(teamNumber) || 0) + 1);
            }
        });
        // Find duplicate team numbers
        const duplicateNumbers = new Set();
        teamNumbers.forEach((count, teamNumber) => {
            if (count > 1) {
                duplicateNumbers.add(teamNumber);
            }
        });
        // Apply styling to all cells
        const rows = this.table_.getRows();
        rows.forEach(row => {
            const numberCell = row.getCell('number');
            const teamNumber = parseInt(row.getData().number) || 0;
            if (teamNumber !== 0 && duplicateNumbers.has(teamNumber)) {
                // Apply error styling for duplicates
                numberCell.getElement().style.backgroundColor = '#ffcccc';
                numberCell.getElement().style.border = '2px solid #ff0000';
                numberCell.getElement().title = `Team number ${teamNumber} appears ${teamNumbers.get(teamNumber)} times in the table`;
            }
            else {
                // Remove error styling for non-duplicates
                numberCell.getElement().style.backgroundColor = '';
                numberCell.getElement().style.border = '';
                numberCell.getElement().title = '';
            }
        });
    }
    hasValidationErrors() {
        if (!this.table_)
            return false;
        const tableData = this.table_.getData();
        const teamNumbers = new Map(); // team number -> count
        // Count occurrences of each team number (excluding 0)
        tableData.forEach(row => {
            const teamNumber = parseInt(row.number) || 0;
            if (teamNumber !== 0) {
                teamNumbers.set(teamNumber, (teamNumbers.get(teamNumber) || 0) + 1);
            }
        });
        // Check if any team number appears more than once
        for (const count of teamNumbers.values()) {
            if (count > 1) {
                return true;
            }
        }
        return false;
    }
    convertToBackend(data) {
        let ret = [];
        for (let item of data) {
            ret.push({ nickname: item.nickname, number: item.number });
        }
        return ret;
    }
    convertFromBackend(data) {
        let ret = [];
        for (let item of data) {
            ret.push({ nickname: item.nickname, number: item.team_number });
        }
        return ret;
    }
}
//# sourceMappingURL=editteamsview.js.map