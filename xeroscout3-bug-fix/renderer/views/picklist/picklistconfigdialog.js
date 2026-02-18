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
export class PickListConfigDialog extends XeroDialog {
    constructor(config, datasets, teamflds, matchflds, formulas, isNew) {
        super('Edit Pick List Configuration');
        this.new_ = true;
        this.datasets_ = [];
        this.teamflds_ = [];
        this.matchflds_ = [];
        this.formulas_ = [];
        // Track the type for each item index to preserve user's selection
        this.itemTypes_ = new Map();
        this.config_ = config;
        this.datasets_ = datasets;
        this.new_ = isNew;
        this.teamflds_ = teamflds;
        this.matchflds_ = matchflds;
        this.formulas_ = formulas;
    }
    get isNew() {
        return this.new_;
    }
    get config() {
        return this.config_;
    }
    populateDialog(pdiv) {
        return __awaiter(this, void 0, void 0, function* () {
            const div = document.createElement('div');
            div.className = 'xero-popup-form-edit-dialog-rowdiv';
            div.style.minWidth = '900px';
            // Configuration Name
            this.config_name_ = document.createElement('input');
            this.config_name_.type = 'text';
            this.config_name_.className = 'xero-popup-form-edit-dialog-input';
            this.config_name_.value = this.config_.name;
            let label = document.createElement('label');
            label.className = 'xero-popup-form-edit-dialog-label';
            label.innerText = 'Configuration Name';
            label.appendChild(this.config_name_);
            div.appendChild(label);
            // Columns Section
            const columnsTitle = document.createElement('h4');
            columnsTitle.innerText = 'Data Columns';
            columnsTitle.style.marginTop = '20px';
            columnsTitle.style.marginBottom = '10px';
            div.appendChild(columnsTitle);
            // Container for column items
            this.items_container_ = document.createElement('div');
            this.items_container_.style.border = '1px solid #ccc';
            this.items_container_.style.padding = '10px';
            this.items_container_.style.marginBottom = '10px';
            this.items_container_.style.minHeight = '450px';
            this.items_container_.style.maxHeight = '900px';
            this.items_container_.style.overflowY = 'auto';
            div.appendChild(this.items_container_);
            // Populate existing items
            this.renderItems();
            // Add Column Button
            const addButton = document.createElement('button');
            addButton.innerText = 'Add Column';
            addButton.className = 'xero-popup-form-edit-dialog-button';
            addButton.style.marginTop = '10px';
            addButton.addEventListener('click', this.addColumn.bind(this));
            div.appendChild(addButton);
            pdiv.appendChild(div);
        });
    }
    renderItems() {
        if (!this.items_container_)
            return;
        this.items_container_.innerHTML = '';
        if (this.config_.columns.length === 0) {
            const emptyMsg = document.createElement('p');
            emptyMsg.innerText = 'No columns yet. Click "Add Column" to add one.';
            emptyMsg.style.color = '#999';
            emptyMsg.style.fontStyle = 'italic';
            this.items_container_.appendChild(emptyMsg);
            return;
        }
        for (let i = 0; i < this.config_.columns.length; i++) {
            const itemDiv = this.createItemRow(this.config_.columns[i], i);
            this.items_container_.appendChild(itemDiv);
        }
    }
    determineItemType(item, index) {
        // First check if we have an explicitly set type for this item
        if (this.itemTypes_.has(index)) {
            return this.itemTypes_.get(index);
        }
        // If not, try to auto-detect based on the item's name
        if (this.teamflds_.includes(item.name)) {
            return 'team-field';
        }
        if (this.matchflds_.includes(item.name)) {
            return 'match-field';
        }
        return 'formula';
    }
    createItemRow(item, index) {
        const row = document.createElement('div');
        row.style.display = 'flex';
        row.style.flexDirection = 'column';
        row.style.gap = '8px';
        row.style.marginBottom = '10px';
        row.style.padding = '10px';
        row.style.backgroundColor = '#f9f9f9';
        row.style.borderRadius = '3px';
        // Determine current type
        const currentType = this.determineItemType(item, index);
        // First row: Type selector and delete button
        const typeRow = document.createElement('div');
        typeRow.style.display = 'flex';
        typeRow.style.gap = '10px';
        typeRow.style.alignItems = 'center';
        // Type selector
        const typeSelect = document.createElement('select');
        typeSelect.style.flex = '1';
        typeSelect.style.padding = '5px';
        let option = document.createElement('option');
        option.value = 'team-field';
        option.innerText = 'Team Field';
        if (currentType === 'team-field')
            option.selected = true;
        typeSelect.appendChild(option);
        option = document.createElement('option');
        option.value = 'match-field';
        option.innerText = 'Match Field';
        if (currentType === 'match-field')
            option.selected = true;
        typeSelect.appendChild(option);
        option = document.createElement('option');
        option.value = 'formula';
        option.innerText = 'Formula';
        if (currentType === 'formula')
            option.selected = true;
        typeSelect.appendChild(option);
        typeSelect.addEventListener('change', () => {
            this.itemTypes_.set(index, typeSelect.value);
            this.config_.columns[index].name = '';
            if (typeSelect.value === 'team-field') {
                this.config_.columns[index].dataset = '';
            }
            this.renderItems();
        });
        // Delete button
        const deleteBtn = document.createElement('span');
        deleteBtn.innerHTML = '🗑️';
        deleteBtn.style.cursor = 'pointer';
        deleteBtn.style.fontSize = '18px';
        deleteBtn.style.padding = '4px';
        deleteBtn.title = 'Delete column';
        deleteBtn.addEventListener('click', () => {
            this.config_.columns.splice(index, 1);
            this.itemTypes_.delete(index);
            const updatedTypes = new Map();
            for (const [key, value] of this.itemTypes_.entries()) {
                if (key > index) {
                    updatedTypes.set(key - 1, value);
                }
                else if (key < index) {
                    updatedTypes.set(key, value);
                }
            }
            this.itemTypes_ = updatedTypes;
            this.renderItems();
        });
        deleteBtn.addEventListener('mouseenter', () => {
            deleteBtn.style.backgroundColor = '#ff4444';
            deleteBtn.style.borderRadius = '3px';
        });
        deleteBtn.addEventListener('mouseleave', () => {
            deleteBtn.style.backgroundColor = '';
        });
        typeRow.appendChild(typeSelect);
        typeRow.appendChild(deleteBtn);
        row.appendChild(typeRow);
        // Second row: Label input
        const labelRow = document.createElement('div');
        labelRow.style.display = 'flex';
        labelRow.style.flexDirection = 'column';
        labelRow.style.gap = '4px';
        const labelLabel = document.createElement('label');
        labelLabel.innerText = 'Column Label:';
        labelLabel.style.fontSize = '12px';
        labelLabel.style.fontWeight = 'bold';
        labelRow.appendChild(labelLabel);
        const labelInput = document.createElement('input');
        labelInput.type = 'text';
        labelInput.value = item.label || '';
        labelInput.placeholder = 'Enter column label';
        labelInput.style.padding = '5px';
        labelInput.addEventListener('input', () => {
            this.config_.columns[index].label = labelInput.value;
        });
        labelRow.appendChild(labelInput);
        row.appendChild(labelRow);
        // Decimal places row
        const decimalsRow = document.createElement('div');
        decimalsRow.style.display = 'flex';
        decimalsRow.style.flexDirection = 'column';
        decimalsRow.style.gap = '4px';
        const decimalsLabel = document.createElement('label');
        decimalsLabel.innerText = 'Decimal Places:';
        decimalsLabel.style.fontSize = '12px';
        decimalsLabel.style.fontWeight = 'bold';
        decimalsRow.appendChild(decimalsLabel);
        const decimalsInput = document.createElement('input');
        decimalsInput.type = 'number';
        decimalsInput.min = '0';
        decimalsInput.max = '10';
        decimalsInput.value = item.decimals !== undefined ? item.decimals.toString() : '2';
        decimalsInput.placeholder = 'Number of decimal places';
        decimalsInput.style.padding = '5px';
        decimalsInput.style.width = '150px';
        decimalsInput.addEventListener('input', () => {
            const val = parseInt(decimalsInput.value);
            if (!isNaN(val)) {
                this.config_.columns[index].decimals = val;
            }
        });
        decimalsRow.appendChild(decimalsInput);
        row.appendChild(decimalsRow);
        // Column width row
        const widthRow = document.createElement('div');
        widthRow.style.display = 'flex';
        widthRow.style.flexDirection = 'column';
        widthRow.style.gap = '4px';
        const widthLabel = document.createElement('label');
        widthLabel.innerText = 'Column Width (pixels):';
        widthLabel.style.fontSize = '12px';
        widthLabel.style.fontWeight = 'bold';
        widthRow.appendChild(widthLabel);
        const widthInput = document.createElement('input');
        widthInput.type = 'number';
        widthInput.min = '50';
        widthInput.max = '1000';
        widthInput.value = item.width !== undefined ? item.width.toString() : '150';
        widthInput.placeholder = 'Column width in pixels';
        widthInput.style.padding = '5px';
        widthInput.style.width = '150px';
        widthInput.addEventListener('input', () => {
            const val = parseInt(widthInput.value);
            if (!isNaN(val)) {
                this.config_.columns[index].width = val;
            }
        });
        widthRow.appendChild(widthInput);
        row.appendChild(widthRow);
        // Third row: Field/Formula selection and dataset
        const fieldRow = document.createElement('div');
        fieldRow.style.display = 'flex';
        fieldRow.style.gap = '10px';
        const fieldSelect = document.createElement('select');
        fieldSelect.style.flex = '1';
        fieldSelect.style.padding = '5px';
        // Populate field options based on type
        let fields = [];
        if (currentType === 'team-field') {
            fields = this.teamflds_;
        }
        else if (currentType === 'match-field') {
            fields = this.matchflds_;
        }
        else {
            fields = this.formulas_;
        }
        const emptyOption = document.createElement('option');
        emptyOption.value = '';
        emptyOption.innerText = `-- Select ${currentType === 'formula' ? 'Formula' : 'Field'} --`;
        fieldSelect.appendChild(emptyOption);
        for (const field of fields) {
            const opt = document.createElement('option');
            opt.value = field;
            opt.innerText = field;
            if (item.name === field)
                opt.selected = true;
            fieldSelect.appendChild(opt);
        }
        fieldSelect.addEventListener('change', () => {
            this.config_.columns[index].name = fieldSelect.value;
        });
        fieldRow.appendChild(fieldSelect);
        // Dataset selector (only for match fields and formulas)
        if (currentType === 'match-field' || currentType === 'formula') {
            const datasetSelect = document.createElement('select');
            datasetSelect.style.flex = '0.6';
            datasetSelect.style.padding = '5px';
            const emptyDataset = document.createElement('option');
            emptyDataset.value = '';
            emptyDataset.innerText = '-- Select Dataset --';
            datasetSelect.appendChild(emptyDataset);
            for (const dataset of this.datasets_) {
                const opt = document.createElement('option');
                opt.value = dataset.name;
                opt.innerText = dataset.name;
                if (item.dataset === dataset.name)
                    opt.selected = true;
                datasetSelect.appendChild(opt);
            }
            datasetSelect.addEventListener('change', () => {
                this.config_.columns[index].dataset = datasetSelect.value;
            });
            fieldRow.appendChild(datasetSelect);
        }
        row.appendChild(fieldRow);
        return row;
    }
    addColumn() {
        const newItem = {
            label: '',
            name: '',
            dataset: '',
            decimals: 2,
            width: 150
        };
        this.config_.columns.push(newItem);
        this.renderItems();
    }
    okButton(event) {
        // Extract data back to the config before closing
        if (this.config_name_) {
            this.config_.name = this.config_name_.value;
        }
        // Validate that all columns have required fields
        let hasErrors = false;
        let errorMessage = '';
        for (let i = 0; i < this.config_.columns.length; i++) {
            const item = this.config_.columns[i];
            if (!item.label) {
                hasErrors = true;
                errorMessage = 'All columns must have a label.';
                break;
            }
            if (!item.name) {
                hasErrors = true;
                errorMessage = 'All columns must have a field or formula selected.';
                break;
            }
            const itemType = this.determineItemType(item, i);
            if ((itemType === 'match-field' || itemType === 'formula') && !item.dataset) {
                hasErrors = true;
                errorMessage = 'Match fields and formulas must have a dataset selected.';
                break;
            }
        }
        if (hasErrors) {
            this.showAlert(errorMessage);
            return;
        }
        super.okButton(event);
    }
}
//# sourceMappingURL=picklistconfigdialog.js.map