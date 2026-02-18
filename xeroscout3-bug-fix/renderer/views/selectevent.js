import { TabulatorFull } from "tabulator-tables";
import { XeroView } from "./xeroview.js";
export class XeroSelectEvent extends XeroView {
    constructor(app) {
        super(app, 'xero-select-event');
        this.loading_ = false;
        this.registerCallback('send-event-data', this.receivedEventData.bind(this));
        this.request('get-event-data');
    }
    receivedEventData(args) {
        this.search_div_ = document.createElement('div');
        this.search_div_.className = 'xero-select-event-search';
        this.elem.appendChild(this.search_div_);
        this.search_input_ = document.createElement('input');
        this.search_input_.className = 'xero-select-event-search-box';
        this.search_input_.type = 'text';
        this.search_input_.placeholder = 'Enter text to search';
        this.search_input_.addEventListener('input', (ev) => {
            let filter = this.search_input_.value;
            if (filter.length > 0) {
                this.table_.setFilter((data) => {
                    return data.name.toLowerCase().includes(filter.toLowerCase());
                });
            }
            else {
                this.table_.setFilter((data) => {
                    return true;
                });
            }
        });
        this.search_div_.append(this.search_input_);
        this.table_div_ = document.createElement('div');
        this.elem.appendChild(this.table_div_);
        let cols = [];
        cols.push({
            field: 'key',
            title: 'Event Key',
            sorter: 'string'
        });
        cols.push({
            field: 'name',
            title: 'Name',
            sorter: 'string'
        });
        cols.push({
            field: 'district.display_name',
            title: 'District',
            sorter: 'string'
        });
        cols.push({
            field: 'start_date',
            title: 'Date',
            sorter: 'date'
        });
        this.table_ = new TabulatorFull(this.table_div_, {
            data: args,
            layout: "fitColumns",
            resizableColumnFit: true,
            columns: cols,
            clipboard: false,
        });
        this.table_.on('tableBuilt', this.tableLoaded.bind(this));
        this.table_.on('cellDblClick', this.loadBAEvent.bind(this));
    }
    tableLoaded() {
        for (let row of this.table_.getRows()) {
            for (let cell of row.getCells()) {
                cell.getElement().style.cursor = 'pointer';
                cell.getElement().style.userSelect = 'none';
            }
        }
    }
    loadBAEvent(e, cell) {
        let data = cell.getData();
        this.request('load-ba-event-data', data.key);
    }
}
//# sourceMappingURL=selectevent.js.map