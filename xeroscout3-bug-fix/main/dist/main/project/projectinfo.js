"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ProjectInfo = void 0;
const datamodel_1 = require("../model/datamodel");
const datamgr_1 = require("./datamgr");
const datasetmgr_1 = require("./datasetmgr");
const formmgr_1 = require("./formmgr");
const formulamgr_1 = require("./formulamgr");
const graphmgr_1 = require("./graphmgr");
const matchmgr_1 = require("./matchmgr");
const picklistmgr_1 = require("./picklistmgr");
const tabletmgr_1 = require("./tabletmgr");
const teammgr_1 = require("./teammgr");
class ProjectInfo {
    constructor() {
        this.hidden_hints_ = []; // The list of hints that are hidden
        this.data_info_ = new datamgr_1.DataInfo(); // The data information for the project
        this.dataset_info_ = new datasetmgr_1.DataSetInfo(); // The data set information for the project
        this.picklist_info_ = new picklistmgr_1.PickListData(); // The picklist information for the project
        this.team_info_ = new teammgr_1.TeamData(); // The team information for the project
        this.formula_info_ = new formulamgr_1.FormulaInfo(); // The formula information for the project
        this.tablet_info_ = new tabletmgr_1.TabletInfo(); // The tablet information for the project
        this.match_info_ = new matchmgr_1.MatchInfo(); // The match information for the project
        this.graph_info_ = new graphmgr_1.GraphInfo(); // The graph information for the project
        this.form_info_ = new formmgr_1.FormInfo(); // The form information for the project
        this.team_db_info_ = new datamodel_1.DataModelInfo(); // The team database information for the project
        this.match_db_info_ = new datamodel_1.DataModelInfo(); // The match database information for the project
        this.playoff_info_ = {
            alliances: [undefined, undefined, undefined, undefined, undefined, undefined, undefined, undefined],
            outcomes: { m1: undefined, m2: undefined, m3: undefined, m4: undefined, m5: undefined, m6: undefined, m7: undefined, m8: undefined, m9: undefined, m10: undefined, m11: undefined, m12: undefined, m13: undefined, m14: undefined, m15: undefined, m16: undefined }
        };
        this.locked_ = false;
    }
    getName() {
        let ret = undefined;
        if (this.frcev_ !== undefined) {
            ret = this.frcev_.name;
        }
        else {
            ret = this.name_;
        }
        return ret;
    }
}
exports.ProjectInfo = ProjectInfo;
//# sourceMappingURL=projectinfo.js.map