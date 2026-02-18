"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.DataSetManager = exports.DataSetInfo = void 0;
const manager_1 = require("./manager");
//
// DataSetData -
//   This interface describes the data set data that is used to store the data sets that can be used for analysis views.
//   It is used to store the data sets that are defined by the user.  The data sets are stored in the project file.
//
class DataSetInfo {
    constructor() {
        this.datasets_ = []; // The list of data sets that can be used for the multi-team summary
    }
}
exports.DataSetInfo = DataSetInfo;
//
// DataSetManager -
//   This class is used to manage the data sets that are used for analysis views.  It is used to add, remove, and rename data sets.
//
class DataSetManager extends manager_1.Manager {
    constructor(logger, writer, info, teammgr) {
        super(logger, writer);
        this.info_ = info;
        this.team_mgr_ = teammgr;
        if (this.info_.datasets_.findIndex(ds => ds.name === 'All') === -1) {
            this.info_.datasets_.unshift({
                name: 'All',
                matches: { kind: 'all', first: -1, last: -1 },
                formula: ''
            });
        }
    }
    getDataSets() {
        return this.info_.datasets_;
    }
    getDataSetByName(name) {
        let ret = undefined;
        for (let ds of this.info_.datasets_) {
            if (ds.name === name) {
                ret = ds;
                break;
            }
        }
        return ret;
    }
    async getDataSetData(dsname) {
        let ret = new Promise(async (resolve, reject) => {
            let ds = this.findDataSet(dsname);
            if (!ds) {
                reject(new Error("data set '" + dsname + "' not found"));
            }
            else {
                let allteams = [];
                for (let t of this.team_mgr_.getSortedTeamNumbers(false)) {
                    let teamData = {};
                    teamData['team_number'] = t;
                    allteams.push(teamData);
                }
                resolve(allteams);
            }
        });
        return ret;
    }
    renameDataSet(oldName, newName) {
        if (this.findDataSetIndex(newName) === -1) {
            let index = this.findDataSetIndex(oldName);
            if (index !== -1) {
                this.info_.datasets_[index].name = newName;
                this.write();
            }
        }
    }
    updateDataSet(ds) {
        this.info_.datasets_ = ds;
        this.write();
    }
    findDataSet(name) {
        let ret = undefined;
        for (let ds of this.info_.datasets_) {
            if (ds.name === name) {
                ret = ds;
                break;
            }
        }
        return ret;
    }
    findDataSetIndex(name) {
        let ret = -1;
        for (let index = 0; index < this.info_.datasets_.length; index++) {
            if (this.info_.datasets_[index].name === name) {
                ret = index;
                break;
            }
        }
        return ret;
    }
}
exports.DataSetManager = DataSetManager;
//# sourceMappingURL=datasetmgr.js.map