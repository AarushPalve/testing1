"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.GraphManager = exports.GraphInfo = void 0;
const manager_1 = require("./manager");
class GraphInfo {
    constructor() {
        this.single_team_configs_ = [];
        this.coach_configs_ = [];
    }
}
exports.GraphInfo = GraphInfo;
class GraphManager extends manager_1.Manager {
    constructor(logger, writer, info, data_mgr, dataset_mgr) {
        super(logger, writer);
        this.info_ = info;
        this.data_mgr_ = data_mgr;
        this.dataset_mgr_ = dataset_mgr;
        if (this.info_.single_team_configs_ === undefined) {
            this.info_.single_team_configs_ = [];
        }
        if (this.info_.coach_configs_ === undefined) {
            this.info_.coach_configs_ = [];
        }
    }
    get singleTeamConfigs() {
        return this.info_.single_team_configs_;
    }
    set singleTeamConfigs(configs) {
        this.info_.single_team_configs_ = configs;
        this.write();
    }
    get allConfigs() {
        return [...this.info_.single_team_configs_, ...this.info_.coach_configs_];
    }
    get coachConfigs() {
        return this.info_.coach_configs_;
    }
    set coachConfigs(configs) {
        this.info_.coach_configs_ = configs;
        this.write();
    }
    generateGraphData(config) {
        let ret = new Promise(async (resolve, reject) => {
            let data = {
                config: config.name,
                teams: [],
                items: []
            };
            for (let team of config.teams) {
                data.teams.push(team);
            }
            for (let item of [...config.leftitems, ...config.rightitems]) {
                let one = {
                    name: item.name,
                    values: []
                };
                data.items.push(one);
                for (let team of config.teams) {
                    let ds = this.dataset_mgr_.findDataSet(item.dataset);
                    let idata = await this.data_mgr_.getData(ds, item.name, team);
                    one.values.push(idata);
                }
            }
            resolve(data);
        });
        return ret;
    }
}
exports.GraphManager = GraphManager;
//# sourceMappingURL=graphmgr.js.map