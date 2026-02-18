"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.PicklistMgr = exports.PickListData = void 0;
const manager_1 = require("./manager");
class PickListData {
    constructor() {
        this.picklist_ = []; // Pick list, a list of team number
        this.coaches_picklist_ = []; // Coach pick list
    }
}
exports.PickListData = PickListData;
class PicklistMgr extends manager_1.Manager {
    constructor(logger, writer, info, teams, dset, data, formula) {
        super(logger, writer);
        this.dset_mgr_ = dset;
        this.team_mgr_ = teams;
        this.info_ = info;
        this.data_mgr_ = data;
        this.formula_mgr_ = formula;
        if (this.info_.picklist_ === undefined) {
            this.info_.picklist_ = [];
        }
        if (this.info_.coaches_picklist_ === undefined) {
            this.info_.coaches_picklist_ = [];
        }
    }
    get centralPicklists() {
        return this.info_.picklist_;
    }
    set centralPicklists(config) {
        this.info_.picklist_ = config;
        this.write();
    }
    get coachesPicklists() {
        return this.info_.coaches_picklist_;
    }
    set coachesPicklists(config) {
        this.info_.coaches_picklist_ = config;
        this.write();
    }
    get allPicklists() {
        return [...this.info_.picklist_, ...this.info_.coaches_picklist_];
    }
    getPicklistData(name) {
        let ret = new Promise(async (resolve, reject) => {
            this.logger_.debug(`[PicklistMgr] Starting load for picklist '${name}'`);
            try {
                const picklist = this.findPicklistByName(name);
                if (!picklist) {
                    const err = new Error(`Picklist '${name}' not found`);
                    this.logger_.error(`[PicklistMgr] ${err.message}`);
                    return reject(err);
                }
                this.logger_.debug(`[PicklistMgr] Picklist found: ${picklist.teams.length} teams, ${picklist.columns.length} columns`);
                const result = {
                    config: picklist,
                    data: []
                };
                for (const team of picklist.teams) {
                    this.logger_.debug(`[PicklistMgr] Loading data for team ${team}`);
                    const tdata = {
                        team: team,
                        values: []
                    };
                    result.data.push(tdata);
                    for (const item of picklist.columns) {
                        this.logger_.debug(`[PicklistMgr]   Column '${item.label}' (dataset='${item.dataset}', field='${item.name}')`);
                        let ds = undefined;
                        if (item.dataset && item.dataset.length > 0) {
                            ds = this.dset_mgr_.getDataSetByName(item.dataset);
                            if (!ds) {
                                const err = new Error(`Dataset '${item.dataset}' not found while loading picklist '${name}'`);
                                this.logger_.error(`[PicklistMgr] ${err.message}`);
                                throw err;
                            }
                        }
                        else {
                            this.logger_.debug(`[PicklistMgr]   No dataset specified, using default data scope`);
                        }
                        const d = await this.data_mgr_.getData(ds, item.name, team);
                        tdata.values.push(d);
                        this.logger_.debug(`[PicklistMgr]   Retrieved data for team ${team}, column '${item.label}'`);
                    }
                }
                this.logger_.debug(`[PicklistMgr] Completed load for picklist '${name}'`);
                resolve(result);
            }
            catch (error) {
                const err = error instanceof Error ? error : new Error(String(error));
                this.logger_.error(`[PicklistMgr] Failed loading picklist '${name}': ${err.message}`);
                reject(err);
            }
        });
        return ret;
    }
    findPicklistByName(name) {
        for (let picklist of this.info_.picklist_) {
            if (picklist.name === name)
                return picklist;
        }
        return undefined;
    }
    setPicklistNotes(data) {
        let picklist = this.findPicklistByName(data.name);
        if (picklist) {
            for (let i = 0; i < data.teams.length; i++) {
                let teamnumber = data.teams[i];
                let picknotes = data.notes[i];
                for (let j = 0; j < picklist.teams.length; j++) {
                    if (picklist.teams[j] === teamnumber) {
                        picklist.notes[j] = picknotes;
                        break;
                    }
                }
            }
        }
        this.write();
    }
    updatePicklistConfig(config) {
        let index = this.info_.picklist_.findIndex((pl) => pl.name === config.name);
        if (index === -1) {
            this.info_.picklist_.push(config);
        }
        else {
            this.info_.picklist_[index] = config;
        }
        this.write();
    }
}
exports.PicklistMgr = PicklistMgr;
//# sourceMappingURL=picklistmgr.js.map