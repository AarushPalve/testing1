import { DataValue } from "../../shared/datavalue.js";
import { applyGradientToColumn, applySavedGradients, applyStoredColorsToRow, clearGradientForColumn, showColorPalette, hideColorPalette } from "../../utils/picklist/colorutils.js";
import { ensurePickListConfigDefaults, createPickListColumnFieldKey } from "../../utils/picklist/picklistutils.js";
import { XeroView } from "../xeroview.js";
import { PickListConfigDialog } from "./picklistconfigdialog.js";
import { TabulatorFull as Tabulator } from 'tabulator-tables';
export class PickListView extends XeroView {
    constructor(app) {
        super(app, 'xero-picklist-view');
        this.table_ = null;
        this.configs_ = [];
        this.selected_config_index_ = -1;
        this.teams_ = [];
        this.datasets_ = [];
        this.teamflds_ = [];
        this.matchflds_ = [];
        this.formulas_ = [];
        this.teamfldsReceived_ = false;
        this.matchfldsReceived_ = false;
        this.formulasReceived_ = false;
        this.datasetsReceived_ = false;
        this.teamsReceived_ = false;
        this.configsReceived_ = false;
        this.paletteState_ = { paletteEl: null, documentListener: null, keyListener: null };
        this.colorOptions_ = [
            '#ffffff',
            '#f28b82', '#fbbc04', '#fff475', '#ccff90', '#a7ffeb',
            '#cbf0f8', '#aecbfa', '#d7aefb', '#fdcfe8', '#e6c9a8', '#e8eaed'
        ];
        this.headerMenuEl_ = null;
        this.headerMenuDocumentListener_ = null;
        this.headerMenuKeyListener_ = null;
        // Set the view to fill its parent
        this.elem.style.width = '100%';
        this.elem.style.height = '100%';
        this.elem.style.display = 'flex';
        this.elem.style.flexDirection = 'column';
        // Register callbacks for data from backend
        this.registerCallback('send-picklist-configs', this.receivedConfigs.bind(this));
        this.registerCallback('send-picklist-data', this.receivedPickListData.bind(this));
        this.registerCallback('send-datasets', this.receivedDataSets.bind(this));
        this.registerCallback('send-team-field-list', this.receivedTeamFields.bind(this));
        this.registerCallback('send-match-field-list', this.receivedMatchFields.bind(this));
        this.registerCallback('send-formulas', this.receivedFormulas.bind(this));
        this.registerCallback('send-team-list', this.receivedTeams.bind(this));
        // Request initial data from backend
        this.request('get-picklist-configs');
        this.request('get-datasets');
        this.request('get-team-field-list');
        this.request('get-match-field-list');
        this.request('get-formulas');
        this.request('get-team-list', { nicknames: true, rank: true });
    }
    createUI() {
        // Create main container with left and right panels
        const container = document.createElement('div');
        container.style.display = 'flex';
        container.style.width = '100%';
        container.style.height = '100%';
        container.style.overflow = 'hidden';
        // Left panel for picklist configuration management
        this.left_panel_ = document.createElement('div');
        this.left_panel_.style.width = '300px';
        this.left_panel_.style.height = '100%';
        this.left_panel_.style.borderRight = '1px solid #ccc';
        this.left_panel_.style.padding = '10px';
        this.left_panel_.style.display = 'flex';
        this.left_panel_.style.flexDirection = 'column';
        this.left_panel_.style.overflow = 'hidden';
        // Right panel for table display
        this.right_panel_ = document.createElement('div');
        this.right_panel_.style.flexGrow = '1';
        this.right_panel_.style.minWidth = '0';
        this.right_panel_.style.padding = '10px';
        this.right_panel_.style.display = 'flex';
        this.right_panel_.style.flexDirection = 'column';
        this.right_panel_.style.overflow = 'hidden';
        // Configuration list container
        this.config_list_div_ = document.createElement('div');
        this.config_list_div_.style.flexGrow = '1';
        this.config_list_div_.style.overflowY = 'auto';
        this.left_panel_.appendChild(this.config_list_div_);
        // Table container
        this.table_container_ = document.createElement('div');
        this.table_container_.style.flexGrow = '1';
        this.table_container_.style.minWidth = '0';
        this.table_container_.style.border = '1px solid #dee2e6';
        this.table_container_.style.borderRadius = '4px';
        this.table_container_.style.backgroundColor = '#fff';
        this.table_container_.style.overflowX = 'auto';
        this.table_container_.style.overflowY = 'hidden';
        this.table_container_.style.boxShadow = '0 1px 3px rgba(0,0,0,0.1)';
        this.table_container_.addEventListener('scroll', () => {
            hideColorPalette(this.paletteState_);
            this.hideHeaderMenu();
        });
        this.right_panel_.appendChild(this.table_container_);
        container.appendChild(this.left_panel_);
        container.appendChild(this.right_panel_);
        this.elem.appendChild(container);
    }
    checkAll() {
        if (this.teamfldsReceived_ && this.matchfldsReceived_ && this.formulasReceived_ &&
            this.datasetsReceived_ && this.configsReceived_ && this.teamsReceived_) {
            this.createUI();
            this.displayConfigs();
        }
    }
    receivedTeams(teams) {
        this.teams_ = teams;
        this.teamsReceived_ = true;
        this.checkAll();
    }
    receivedConfigs(configs) {
        this.configs_ = configs || [];
        this.configs_.forEach(config => ensurePickListConfigDefaults(config));
        this.configsReceived_ = true;
        this.checkAll();
    }
    receivedDataSets(datasets) {
        this.datasets_ = datasets;
        this.datasetsReceived_ = true;
        this.checkAll();
    }
    receivedTeamFields(fields) {
        this.teamflds_ = fields.map(f => f.name);
        this.teamfldsReceived_ = true;
        this.checkAll();
    }
    receivedMatchFields(fields) {
        this.matchflds_ = fields.map(f => f.name);
        this.matchfldsReceived_ = true;
        this.checkAll();
    }
    receivedFormulas(formulas) {
        this.formulas_ = formulas.map(f => f.name);
        this.formulasReceived_ = true;
        this.checkAll();
    }
    receivedPickListData(data) {
        var _a, _b, _c, _d, _e, _f;
        console.log('[PickListView] received picklist data', {
            name: (_a = data === null || data === void 0 ? void 0 : data.config) === null || _a === void 0 ? void 0 : _a.name,
            columns: (_c = (_b = data === null || data === void 0 ? void 0 : data.config) === null || _b === void 0 ? void 0 : _b.columns) === null || _c === void 0 ? void 0 : _c.length,
            teams: (_e = (_d = data === null || data === void 0 ? void 0 : data.config) === null || _d === void 0 ? void 0 : _d.teams) === null || _e === void 0 ? void 0 : _e.length,
            dataRows: (_f = data === null || data === void 0 ? void 0 : data.data) === null || _f === void 0 ? void 0 : _f.length
        });
        try {
            ensurePickListConfigDefaults(data.config);
            this.renderTable(data);
        }
        catch (err) {
            console.error('[PickListView] failed to render picklist', err);
            this.table_container_.innerHTML = '';
            const msg = document.createElement('p');
            msg.innerText = 'Error rendering pick list. Check console for details.';
            msg.style.color = '#c00';
            msg.style.textAlign = 'center';
            msg.style.marginTop = '50px';
            this.table_container_.appendChild(msg);
            throw err;
        }
    }
    displayConfigs() {
        this.config_list_div_.innerHTML = '';
        // Header with title and buttons
        const header = document.createElement('div');
        header.style.display = 'flex';
        header.style.justifyContent = 'space-between';
        header.style.alignItems = 'center';
        header.style.marginBottom = '10px';
        const title = document.createElement('h3');
        title.innerText = 'Pick Lists';
        title.style.margin = '0';
        header.appendChild(title);
        // Buttons container - show add button for all users
        const buttonContainer = document.createElement('div');
        buttonContainer.style.display = 'flex';
        buttonContainer.style.gap = '5px';
        // Add button
        const addBtn = document.createElement('button');
        addBtn.innerText = '+';
        addBtn.style.padding = '4px 10px';
        addBtn.style.fontSize = '16px';
        addBtn.style.fontWeight = 'bold';
        addBtn.style.cursor = 'pointer';
        addBtn.title = 'Add new pick list';
        addBtn.addEventListener('click', () => this.addConfig());
        buttonContainer.appendChild(addBtn);
        header.appendChild(buttonContainer);
        this.config_list_div_.appendChild(header);
        // Scrollable container for configs
        const scrollContainer = document.createElement('div');
        scrollContainer.style.overflowY = 'auto';
        scrollContainer.style.flexGrow = '1';
        // Display all configurations
        for (let i = 0; i < this.configs_.length; i++) {
            const config = this.configs_[i];
            const div = document.createElement('div');
            div.style.cursor = 'pointer';
            div.style.padding = '10px';
            div.style.marginBottom = '5px';
            div.style.borderRadius = '3px';
            div.style.display = 'flex';
            div.style.justifyContent = 'space-between';
            div.style.alignItems = 'center';
            // Config name
            const nameSpan = document.createElement('span');
            nameSpan.innerText = config.name;
            div.appendChild(nameSpan);
            // Action buttons container - only show if owner matches current app type
            const canModify = config.owner === this.app.appType;
            if (canModify) {
                const actions = document.createElement('div');
                actions.style.display = 'flex';
                actions.style.gap = '5px';
                // Edit button
                const editBtn = document.createElement('span');
                editBtn.innerHTML = '✏️';
                editBtn.style.cursor = 'pointer';
                editBtn.style.fontSize = '14px';
                editBtn.title = 'Edit configuration';
                editBtn.addEventListener('click', (e) => {
                    e.stopPropagation();
                    this.editConfig(i);
                });
                actions.appendChild(editBtn);
                // Delete button
                const deleteBtn = document.createElement('span');
                deleteBtn.innerHTML = '🗑️';
                deleteBtn.style.cursor = 'pointer';
                deleteBtn.style.fontSize = '14px';
                deleteBtn.title = 'Delete configuration';
                deleteBtn.addEventListener('click', (e) => {
                    e.stopPropagation();
                    this.deleteConfig(i);
                });
                actions.appendChild(deleteBtn);
                div.appendChild(actions);
            }
            // Apply selection styling
            if (i === this.selected_config_index_) {
                div.style.backgroundColor = '#007acc';
                div.style.color = 'white';
            }
            else {
                div.style.backgroundColor = '#f0f0f0';
                div.style.color = '';
            }
            // Add hover effects for non-selected items
            if (i !== this.selected_config_index_) {
                div.addEventListener('mouseenter', () => {
                    if (i !== this.selected_config_index_) {
                        div.style.backgroundColor = '#e0e0e0';
                    }
                });
                div.addEventListener('mouseleave', () => {
                    if (i !== this.selected_config_index_) {
                        div.style.backgroundColor = '#f0f0f0';
                    }
                });
            }
            // Add click handler to select the config
            div.addEventListener('click', () => {
                var _a;
                console.log('[PickListView] selecting config', (_a = this.configs_[i]) === null || _a === void 0 ? void 0 : _a.name);
                this.selectConfig(i);
            });
            scrollContainer.appendChild(div);
        }
        this.config_list_div_.appendChild(scrollContainer);
    }
    selectConfig(index) {
        hideColorPalette(this.paletteState_);
        this.hideHeaderMenu();
        this.selected_config_index_ = index;
        this.displayConfigs();
        // Request picklist data for this configuration
        if (index >= 0 && index < this.configs_.length) {
            this.request('get-picklist-data', this.configs_[index].name);
        }
    }
    addConfig() {
        const newConfig = {
            name: 'New Pick List',
            teams: this.teams_.map(t => t.number),
            columns: [],
            notes: [],
            owner: this.app.appType,
            cellColors: {},
            columnGradients: {}
        };
        this.dialog_ = new PickListConfigDialog(newConfig, this.datasets_, this.teamflds_, this.matchflds_, this.formulas_, true);
        this.dialog_.on('closed', (result) => {
            if (result && this.dialog_) {
                this.configs_.push(this.dialog_.config);
                this.request('save-picklist-config', this.configs_);
                this.displayConfigs();
            }
            this.dialog_ = undefined;
        });
        this.dialog_.showCentered(this.elem);
    }
    editConfig(index) {
        if (index < 0 || index >= this.configs_.length)
            return;
        const config = this.configs_[index];
        this.dialog_ = new PickListConfigDialog(config, this.datasets_, this.teamflds_, this.matchflds_, this.formulas_, false);
        this.dialog_.on('closed', (result) => {
            if (result && this.dialog_) {
                this.request('save-picklist-config', this.configs_);
                this.displayConfigs();
                if (index === this.selected_config_index_) {
                    // Refresh table if edited config is currently selected
                    this.request('get-picklist-data', this.configs_[index].name);
                }
            }
            this.dialog_ = undefined;
        });
        this.dialog_.showCentered(this.elem);
    }
    deleteConfig(index) {
        if (index < 0 || index >= this.configs_.length)
            return;
        const config = this.configs_[index];
        if (confirm(`Are you sure you want to delete the pick list "${config.name}"?`)) {
            this.request('delete-picklist-config', config.name);
            this.configs_.splice(index, 1);
            if (this.selected_config_index_ === index) {
                this.selected_config_index_ = -1;
                this.clearTable();
            }
            else if (this.selected_config_index_ > index) {
                this.selected_config_index_--;
            }
            this.displayConfigs();
        }
    }
    renderTable(data) {
        var _a, _b, _c, _d, _e;
        console.log('[PickListView] rendering table', {
            name: (_a = data === null || data === void 0 ? void 0 : data.config) === null || _a === void 0 ? void 0 : _a.name,
            columns: (_c = (_b = data === null || data === void 0 ? void 0 : data.config) === null || _b === void 0 ? void 0 : _b.columns) === null || _c === void 0 ? void 0 : _c.length,
            teams: (_e = (_d = data === null || data === void 0 ? void 0 : data.config) === null || _d === void 0 ? void 0 : _d.teams) === null || _e === void 0 ? void 0 : _e.length
        });
        this.table_container_.innerHTML = '';
        hideColorPalette(this.paletteState_);
        this.hideHeaderMenu();
        if (!data || !data.config || !data.config.teams || data.config.teams.length === 0) {
            const noData = document.createElement('p');
            noData.innerText = 'No teams in this pick list.';
            noData.style.color = '#666';
            noData.style.textAlign = 'center';
            noData.style.marginTop = '50px';
            this.table_container_.appendChild(noData);
            return;
        }
        // Build column definitions
        const columns = [
            {
                title: 'Position',
                field: 'position',
                width: data.config.positionWidth || 80,
                hozAlign: 'center',
                frozen: true,
                headerSort: true,
                resizable: true,
                cssClass: 'picklist-position-column'
            },
            {
                title: 'Team',
                field: 'teamNumber',
                width: data.config.teamWidth || 100,
                hozAlign: 'center',
                frozen: true,
                headerSort: true,
                resizable: true,
                cssClass: 'picklist-team-column'
            },
            {
                title: 'Nickname',
                field: 'nickname',
                width: data.config.nicknameWidth || 200,
                frozen: true,
                headerSort: true,
                resizable: true,
                cssClass: 'picklist-nickname-column'
            }
        ];
        const dataColumnFieldKeys = [];
        // Add columns from config
        for (let i = 0; i < data.config.columns.length; i++) {
            const col = data.config.columns[i];
            const fieldKey = createPickListColumnFieldKey(col);
            dataColumnFieldKeys.push(fieldKey);
            columns.push({
                title: col.label,
                field: fieldKey,
                width: col.width || 150,
                headerSort: true,
                hozAlign: 'center',
                resizable: true,
                headerMenu: undefined // Allow moving this column
            });
        }
        // Add notes column
        columns.push({
            title: 'Notes',
            field: 'notes',
            width: data.config.notesWidth || 250,
            editor: 'input',
            headerSort: true,
            resizable: true,
            frozen: true, // Keep notes column frozen on the right
            cellEdited: (cell) => {
                this.onNotesEdited(cell);
            }
        });
        // Build table data - iterate through config.teams to maintain order
        const tableData = [];
        for (let i = 0; i < data.config.teams.length; i++) {
            const teamNumber = data.config.teams[i];
            const team = this.teams_.find(t => t.number === teamNumber);
            // Find the data for this team
            const teamData = data.data.find(td => td.team === teamNumber);
            const row = {
                position: i + 1,
                teamNumber: teamNumber,
                nickname: team ? team.nickname : '',
                notes: (data.config.notes && data.config.notes[i]) ? data.config.notes[i] : '',
                _teamIndex: i
            };
            // Add column values if team data exists
            if (teamData) {
                for (let j = 0; j < teamData.values.length && j < data.config.columns.length; j++) {
                    const value = teamData.values[j];
                    const column = data.config.columns[j];
                    let displayValue = '';
                    if (value && value.value !== null && value.value !== undefined) {
                        // Format numbers with specified decimal places
                        if (value.type === 'real') {
                            const decimals = column.decimals !== undefined ? column.decimals : 2;
                            displayValue = DataValue.toReal(value).toFixed(decimals);
                        }
                        else {
                            displayValue = DataValue.toDisplayString(value);
                        }
                    }
                    const fieldKey = dataColumnFieldKeys[j];
                    if (fieldKey) {
                        row[fieldKey] = displayValue;
                    }
                }
            }
            else {
                // No data for this team - fill with empty values
                for (let j = 0; j < data.config.columns.length; j++) {
                    const fieldKey = dataColumnFieldKeys[j];
                    if (fieldKey) {
                        row[fieldKey] = '';
                    }
                }
            }
            tableData.push(row);
        }
        // Create tabulator table
        const tableOptions = {
            data: tableData,
            columns: columns,
            layout: 'fitDataTable',
            height: '100%',
            movableRows: true,
            movableColumns: true, // Enable column reordering
            selectableRows: false, // Disable row selection
            headerSort: true, // Disable column sorting to maintain custom order
            rowFormatter: (row) => {
                const rowElement = row.getElement();
                const data = row.getData();
                const position = data.position;
                // Modern alternating row colors with better contrast
                if (position % 2 === 0) {
                    rowElement.style.backgroundColor = '#f8f9fa';
                }
                else {
                    rowElement.style.backgroundColor = '#ffffff';
                }
                // Add hover effect
                rowElement.style.transition = 'background-color 0.2s ease';
                rowElement.addEventListener('mouseenter', () => {
                    rowElement.style.backgroundColor = '#e3f2fd';
                });
                rowElement.addEventListener('mouseleave', () => {
                    if (position % 2 === 0) {
                        rowElement.style.backgroundColor = '#f8f9fa';
                    }
                    else {
                        rowElement.style.backgroundColor = '#ffffff';
                    }
                });
                applyStoredColorsToRow(this.configs_, this.selected_config_index_, row, PickListView.ROW_COLOR_FIELD);
            }
        };
        this.table_ = new Tabulator(this.table_container_, tableOptions);
        // Handle row reordering
        this.table_.on('rowMoved', () => {
            this.updatePositionsAfterMove();
        });
        // Handle column reordering
        this.table_.on('columnMoved', (column, columns) => {
            this.onColumnMoved(columns);
        });
        // Handle column resizing
        this.table_.on('columnResized', (column) => {
            this.onColumnResized(column);
        });
        this.table_.on('cellContext', (event, cell) => {
            showColorPalette({
                event,
                cell,
                configs: this.configs_,
                selectedIndex: this.selected_config_index_,
                rowColorField: PickListView.ROW_COLOR_FIELD,
                colorOptions: this.colorOptions_,
                paletteState: this.paletteState_,
                saveConfigs: (configs) => this.request('save-picklist-config', configs),
                hideHeaderMenu: () => this.hideHeaderMenu()
            });
        });
        this.table_.on('headerContext', (event, column) => {
            this.showHeaderContextMenu(event, column);
        });
        applySavedGradients(this.configs_, this.selected_config_index_, this.table_, PickListView.ROW_COLOR_FIELD, (configs) => this.request('save-picklist-config', configs));
    }
    ensureHeaderMenuElement() {
        if (!this.headerMenuEl_) {
            this.headerMenuEl_ = document.createElement('div');
            this.headerMenuEl_.style.position = 'fixed';
            this.headerMenuEl_.style.zIndex = '3000';
            this.headerMenuEl_.style.display = 'none';
            this.headerMenuEl_.style.flexDirection = 'column';
            this.headerMenuEl_.style.minWidth = '220px';
            this.headerMenuEl_.style.backgroundColor = '#ffffff';
            this.headerMenuEl_.style.border = '1px solid rgba(0,0,0,0.15)';
            this.headerMenuEl_.style.borderRadius = '6px';
            this.headerMenuEl_.style.boxShadow = '0 8px 20px rgba(0,0,0,0.18)';
            this.headerMenuEl_.style.padding = '6px';
        }
        if (this.headerMenuEl_ && !document.body.contains(this.headerMenuEl_)) {
            document.body.appendChild(this.headerMenuEl_);
        }
        return this.headerMenuEl_;
    }
    showHeaderContextMenu(event, column) {
        const mouseEvent = event;
        mouseEvent.preventDefault();
        mouseEvent.stopPropagation();
        const field = column.getField();
        if (!field) {
            return;
        }
        hideColorPalette(this.paletteState_);
        this.hideHeaderMenu();
        const menu = this.ensureHeaderMenuElement();
        menu.innerHTML = '';
        menu.style.display = 'flex';
        menu.style.visibility = 'hidden';
        menu.style.pointerEvents = 'none';
        const applyButton = document.createElement('button');
        applyButton.type = 'button';
        applyButton.innerText = 'Apply 5-point gradient (min→Q1→median→Q3→max)';
        applyButton.style.padding = '6px 8px';
        applyButton.style.margin = '2px 0';
        applyButton.style.border = '1px solid rgba(0,0,0,0.2)';
        applyButton.style.borderRadius = '4px';
        applyButton.style.cursor = 'pointer';
        applyButton.style.backgroundColor = '#f5f5f5';
        applyButton.addEventListener('click', (e) => {
            e.stopPropagation();
            applyGradientToColumn(this.configs_, this.selected_config_index_, this.table_, field, { save: true, silent: false }, PickListView.ROW_COLOR_FIELD, (configs) => this.request('save-picklist-config', configs));
            this.hideHeaderMenu();
        });
        menu.appendChild(applyButton);
        const clearButton = document.createElement('button');
        clearButton.type = 'button';
        clearButton.innerText = 'Clear conditional formatting';
        clearButton.style.padding = '6px 8px';
        clearButton.style.margin = '4px 0 2px 0';
        clearButton.style.border = '1px solid rgba(0,0,0,0.2)';
        clearButton.style.borderRadius = '4px';
        clearButton.style.cursor = 'pointer';
        clearButton.style.backgroundColor = '#f5f5f5';
        const config = this.selected_config_index_ >= 0 ? this.configs_[this.selected_config_index_] : undefined;
        const hasGradient = !!(config && config.columnGradients && config.columnGradients[field]);
        clearButton.disabled = !hasGradient;
        clearButton.style.opacity = clearButton.disabled ? '0.6' : '1';
        clearButton.addEventListener('click', (e) => {
            e.stopPropagation();
            clearGradientForColumn(this.configs_, this.selected_config_index_, this.table_, field, { save: true }, PickListView.ROW_COLOR_FIELD, (configs) => this.request('save-picklist-config', configs));
            this.hideHeaderMenu();
        });
        menu.appendChild(clearButton);
        const margin = 8;
        const estimatedSize = menu.getBoundingClientRect();
        const estimatedWidth = estimatedSize.width || 220;
        const estimatedHeight = estimatedSize.height || 90;
        let left = mouseEvent.clientX;
        let top = mouseEvent.clientY;
        if (left + estimatedWidth > window.innerWidth - margin) {
            left = window.innerWidth - estimatedWidth - margin;
        }
        if (top + estimatedHeight > window.innerHeight - margin) {
            top = window.innerHeight - estimatedHeight - margin;
        }
        menu.style.left = `${Math.max(margin, left)}px`;
        menu.style.top = `${Math.max(margin, top)}px`;
        menu.style.visibility = 'visible';
        menu.style.pointerEvents = 'auto';
        this.headerMenuDocumentListener_ = (e) => {
            const target = e.target;
            if (this.headerMenuEl_ && target && !this.headerMenuEl_.contains(target)) {
                this.hideHeaderMenu();
            }
        };
        document.addEventListener('mousedown', this.headerMenuDocumentListener_);
        this.headerMenuKeyListener_ = (e) => {
            if (e.key === 'Escape') {
                this.hideHeaderMenu();
            }
        };
        document.addEventListener('keydown', this.headerMenuKeyListener_, true);
    }
    hideHeaderMenu() {
        if (this.headerMenuEl_) {
            this.headerMenuEl_.style.display = 'none';
            this.headerMenuEl_.style.visibility = 'hidden';
            this.headerMenuEl_.style.pointerEvents = 'none';
        }
        if (this.headerMenuDocumentListener_) {
            document.removeEventListener('mousedown', this.headerMenuDocumentListener_);
            this.headerMenuDocumentListener_ = null;
        }
        if (this.headerMenuKeyListener_) {
            document.removeEventListener('keydown', this.headerMenuKeyListener_, true);
            this.headerMenuKeyListener_ = null;
        }
    }
    findDataColumnIndex(field) {
        if (this.selected_config_index_ < 0) {
            return -1;
        }
        const config = this.configs_[this.selected_config_index_];
        for (let i = 0; i < config.columns.length; i++) {
            if (createPickListColumnFieldKey(config.columns[i]) === field) {
                return i;
            }
        }
        return -1;
    }
    onNotesEdited(cell) {
        if (!this.table_ || this.selected_config_index_ < 0)
            return;
        const rowData = cell.getRow().getData();
        const teamIndex = rowData._teamIndex;
        const newNotes = cell.getValue();
        // Update the notes array
        if (!this.configs_[this.selected_config_index_].notes) {
            this.configs_[this.selected_config_index_].notes = [];
        }
        // Ensure notes array is the right length
        while (this.configs_[this.selected_config_index_].notes.length <= teamIndex) {
            this.configs_[this.selected_config_index_].notes.push('');
        }
        this.configs_[this.selected_config_index_].notes[teamIndex] = newNotes;
        // Save to backend
        this.request('save-picklist-config', this.configs_);
    }
    onColumnResized(column) {
        if (this.selected_config_index_ < 0 || !this.configs_[this.selected_config_index_])
            return;
        const field = column.getField();
        const width = column.getWidth();
        // Check for fixed columns
        if (field === 'position') {
            this.configs_[this.selected_config_index_].positionWidth = width;
            this.request('save-picklist-config', this.configs_);
        }
        else if (field === 'teamNumber') {
            this.configs_[this.selected_config_index_].teamWidth = width;
            this.request('save-picklist-config', this.configs_);
        }
        else if (field === 'nickname') {
            this.configs_[this.selected_config_index_].nicknameWidth = width;
            this.request('save-picklist-config', this.configs_);
        }
        else if (field === 'notes') {
            this.configs_[this.selected_config_index_].notesWidth = width;
            this.request('save-picklist-config', this.configs_);
        }
        else {
            const colIndex = this.findDataColumnIndex(field);
            if (colIndex >= 0 && colIndex < this.configs_[this.selected_config_index_].columns.length) {
                this.configs_[this.selected_config_index_].columns[colIndex].width = width;
                this.request('save-picklist-config', this.configs_);
            }
        }
    }
    onColumnMoved(columns) {
        if (this.selected_config_index_ < 0) {
            return;
        }
        const config = this.configs_[this.selected_config_index_];
        if (!config || !config.columns || config.columns.length === 0) {
            return;
        }
        const fieldToColumn = new Map();
        config.columns.forEach(col => fieldToColumn.set(createPickListColumnFieldKey(col), col));
        const newOrder = [];
        const seenFields = new Set();
        columns.forEach(column => {
            const field = column.getField();
            const dataColumn = fieldToColumn.get(field);
            if (dataColumn && !seenFields.has(field)) {
                newOrder.push(dataColumn);
                seenFields.add(field);
            }
        });
        // Preserve any columns Tabulator did not report (e.g., hidden)
        config.columns.forEach(col => {
            const field = createPickListColumnFieldKey(col);
            if (!seenFields.has(field)) {
                newOrder.push(col);
            }
        });
        if (newOrder.length === config.columns.length) {
            config.columns = newOrder;
            this.request('save-picklist-config', this.configs_);
        }
    }
    updatePositionsAfterMove() {
        if (!this.table_)
            return;
        const rows = this.table_.getRows();
        const newTeamOrder = [];
        const newNotes = [];
        // Update positions and collect new team order and notes
        rows.forEach((row, index) => {
            row.update({ position: index + 1, _teamIndex: index });
            const rowData = row.getData();
            const teamNumber = rowData.teamNumber;
            const notes = rowData.notes || '';
            newTeamOrder.push(teamNumber);
            newNotes.push(notes);
        });
        // Update the config with new team order and notes
        if (this.selected_config_index_ >= 0 && this.selected_config_index_ < this.configs_.length) {
            this.configs_[this.selected_config_index_].teams = newTeamOrder;
            this.configs_[this.selected_config_index_].notes = newNotes;
            // Save to backend
            this.request('save-picklist-config', this.configs_);
        }
    }
    clearTable() {
        hideColorPalette(this.paletteState_);
        this.hideHeaderMenu();
        this.table_container_.innerHTML = '';
        const msg = document.createElement('p');
        msg.innerText = 'Select a pick list to view teams.';
        msg.style.color = '#999';
        msg.style.textAlign = 'center';
        msg.style.marginTop = '50px';
        this.table_container_.appendChild(msg);
    }
}
PickListView.ROW_COLOR_FIELD = '__row__';
//# sourceMappingURL=picklistview.js.map