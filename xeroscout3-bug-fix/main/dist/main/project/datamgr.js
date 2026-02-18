"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
exports.DataManager = exports.DataInfo = void 0;
const matchmodel_1 = require("../model/matchmodel");
const teammodel_1 = require("../model/teammodel");
const path = __importStar(require("path"));
const manager_1 = require("./manager");
const datavalue_1 = require("../../shared/datavalue");
class DataInfo {
    constructor() {
        this.scouted_team_ = []; // The list of teams that have scouting data
        this.scouted_match_ = []; // The list of matches that have scouring data
        this.match_results_ = []; // The list of match results that have been processed
        this.team_results_ = []; // The list of team results that have been processed
        this.match_formulas_ = [];
        this.team_formulas_ = [];
    }
}
exports.DataInfo = DataInfo;
;
class DataManager extends manager_1.Manager {
    constructor(logger, writer, dir, info, teaminfo, matchinfo, formula_mgr) {
        super(logger, writer);
        this.info_ = info;
        this.formula_mgr_ = formula_mgr;
        let filename;
        filename = path.join(dir, 'team.db');
        this.teamdb_ = new teammodel_1.TeamDataModel(filename, teaminfo, logger);
        this.teamdb_.on('column-added', this.teamColumnAdded.bind(this));
        this.teamdb_.on('column-removed', this.teamColumnRemoved.bind(this));
        filename = path.join(dir, 'match.db');
        this.matchdb_ = new matchmodel_1.MatchDataModel(filename, matchinfo, logger);
        this.matchdb_.on('column-added', this.matchColumnAdded.bind(this));
        this.matchdb_.on('column-removed', this.matchColumnRemoved.bind(this));
        if (!this.info_.match_results_) {
            this.info_.match_results_ = [];
        }
        if (!this.info_.team_results_) {
            this.info_.team_results_ = [];
        }
    }
    init() {
        let ret = new Promise((resolve, reject) => {
            this.teamdb_.init()
                .then(() => {
                this.matchdb_.init()
                    .then(() => {
                    resolve();
                })
                    .catch((err) => {
                    reject(err);
                });
            })
                .catch((err) => {
                reject(err);
            });
        });
        return ret;
    }
    close() {
        let ret = true;
        if (this.teamdb_) {
            if (!this.teamdb_.close()) {
                ret = false;
            }
        }
        if (this.matchdb_) {
            if (!this.matchdb_.close()) {
                ret = false;
            }
        }
        return ret;
    }
    getTeamDBEncoded() {
        return this.teamdb_.getEncoded();
    }
    getMatchDBEncoded() {
        return this.matchdb_.getEncoded();
    }
    removeDatabases() {
        this.teamdb_.remove();
        this.matchdb_.remove();
    }
    createFormColumns(teamfields, matchfields) {
        let ret = new Promise(async (resolve, reject) => {
            try {
                await this.teamdb_.addNecessaryCols(teamfields);
            }
            catch (err) {
                reject(err);
            }
            try {
                await this.matchdb_.addNecessaryCols(matchfields);
            }
            catch (err) {
                reject(err);
            }
            resolve();
        });
        return ret;
    }
    //
    // For a given field, either team or match, and a given team, get the
    // value of the field.  For team fields, it is the data stored for that
    // field.  For match fields, the data is processes over all matches to get
    // an average.
    //   
    getData(ds, field, team) {
        let ret = new Promise(async (resolve, reject) => {
            let found = false;
            let tcols = await this.teamdb_.getColumnNames();
            if (tcols.includes(field)) {
                let v = await this.getTeamData(field, team);
                found = true;
                resolve(v);
                return;
            }
            let mcols = await this.matchdb_.getColumnNames();
            if (mcols.includes(field)) {
                let v = await this.getMatchData(ds, field, team);
                found = true;
                resolve(v);
                return;
            }
            if (this.formula_mgr_.hasFormula(field)) {
                let v = await this.evalFormula(ds, field, team);
                found = true;
                resolve(v);
                return;
            }
            if (!found) {
                let v = {
                    type: 'error',
                    value: 'Field ' + field + ' is not a valid team, match, or formula field'
                };
                resolve(v);
                return;
            }
        });
        return ret;
    }
    async processResults(obj) {
        let ret = new Promise(async (resolve, reject) => {
            if (!this.info_) {
                this.logger_.error('project is not initialized, cannot process results');
                reject(new Error('project is not initialized'));
            }
            else {
                let num = 0;
                if (obj.purpose) {
                    if (obj.purpose === 'match') {
                        this.info_.match_results_ = [];
                        for (let res of obj.results) {
                            if (res.item) {
                                this.info_.match_results_.push(res);
                            }
                        }
                        try {
                            let status = await this.matchdb_.processScoutingResults(obj);
                            num = status.length;
                            for (let st of status) {
                                if (!this.info_.scouted_match_.includes(st)) {
                                    this.info_.scouted_match_.push(st);
                                }
                            }
                        }
                        catch (err) {
                            this.logger_.error('error processing match scouting results: ' + err);
                            reject(err);
                            return;
                        }
                    }
                    else {
                        this.info_.team_results_ = [];
                        for (let res of obj.results) {
                            if (res.item) {
                                this.info_.team_results_.push(res);
                            }
                        }
                        try {
                            let teams = await this.teamdb_.processScoutingResults(obj);
                            num = teams.length;
                            for (let st of teams) {
                                if (!this.info_.scouted_team_.includes(st)) {
                                    this.info_.scouted_team_.push(st);
                                }
                            }
                        }
                        catch (err) {
                            this.logger_.error('error processing team scouting results: ' + err);
                            reject(err);
                            return;
                        }
                    }
                    resolve(num);
                }
                this.write();
            }
        });
        return ret;
    }
    async removeFormColumns() {
        let ret = new Promise(async (resolve, reject) => {
            let p1 = this.teamdb_.removeColumns((one) => { return one.source === 'form'; });
            let p2 = this.matchdb_.removeColumns((one) => { return one.source === 'form'; });
            Promise.all([p1, p2])
                .then(() => {
                resolve();
            })
                .catch((err) => {
                reject(err);
            });
        });
        return ret;
    }
    // #region match related methods
    setMatchColConfig(data) {
        this.info_.matchdb_col_config_ = data;
        this.write();
    }
    getMatchColConfig() {
        return this.info_.matchdb_col_config_;
    }
    async processMatchBAData(matches, results) {
        return this.matchdb_.processBAData(matches, results);
    }
    hasMatchScoutingResult(type, set, match, team) {
        let str = 'sm-' + type + '-' + set + '-' + match + '-' + team;
        return this.info_.scouted_match_.includes(str) ? 'Y' : 'N';
    }
    get matchColumnDescriptors() {
        return this.matchdb_.colummnDescriptors;
    }
    get matchColumnNames() {
        return this.matchdb_.columnNames;
    }
    getAllMatchData() {
        return this.matchdb_.getAllData();
    }
    updateMatchDB(changes) {
        this.matchdb_.update(changes);
    }
    // #endregion
    // #region team related methods
    setTeamColConfig(data) {
        this.info_.teamdb_col_config_ = data;
        this.write();
    }
    getTeamColConfig() {
        return this.info_.teamdb_col_config_;
    }
    async processTeamBAData(teams) {
        return this.teamdb_.processBAData(teams);
    }
    hasTeamScoutingResults(team) {
        return this.info_.scouted_team_.includes(team);
    }
    get teamColumnDescriptors() {
        return this.teamdb_.colummnDescriptors;
    }
    get teamColumnNames() {
        return this.teamdb_.columnNames;
    }
    getAllTeamData() {
        return this.teamdb_.getAllData();
    }
    updateTeamDB(changes) {
        this.teamdb_.update(changes);
    }
    // #endregion
    // #region external site data methods
    async processStatboticsEventData(data) {
        return this.teamdb_.processStatboticsEventData(data);
    }
    async processStatboticsYearToDateData(data) {
        return this.teamdb_.processStatboticsYearToDateData(data);
    }
    async processOPRData(data) {
        return this.teamdb_.processOPR(data);
    }
    async processRankings(data) {
        return this.teamdb_.processRankings(data);
    }
    // #endregion
    // region misc methods
    exportToCSV(filename, table) {
        let ret;
        if (table === this.teamdb_.tableName) {
            ret = this.teamdb_.exportToCSV(filename, table);
        }
        else {
            ret = this.matchdb_.exportToCSV(filename, table);
        }
        return ret;
    }
    getMatchResult(match) {
        for (let res of this.info_.match_results_) {
            if (res.item === match) {
                return res;
            }
        }
        return undefined;
    }
    getTeamResult(team) {
        for (let res of this.info_.team_results_) {
            if (res.item === team) {
                return res;
            }
        }
        return undefined;
    }
    // #endregion
    computeOneConditional(data, formula, teamnum) {
        let ds = {
            name: '',
            formula: '',
            matches: {
                kind: 'specific',
                comp_level: datavalue_1.DataValue.toString(data.value('comp_level')),
                set_number: datavalue_1.DataValue.toInteger(data.value('set_number')),
                match_number: datavalue_1.DataValue.toInteger(data.value('match_number'))
            }
        };
        return this.getData(ds, formula, teamnum);
    }
    async computeConditionalsPerMatch(data, formula, team) {
        let ret = new Promise(async (resolve, reject) => {
            let dret = [];
            for (let record of data) {
                try {
                    let d = await this.computeOneConditional(record, formula, team);
                    if (d.type !== 'boolean') {
                        throw new Error('conditional formula did not evaluate to boolean');
                    }
                    dret.push(datavalue_1.DataValue.toBoolean(d));
                }
                catch (err) {
                    reject(err);
                }
            }
            resolve(dret);
        });
        return ret;
    }
    getMatchData(ds, field, team) {
        let ret = new Promise(async (resolve, reject) => {
            if (ds && ds.matches.kind === 'specific') {
                //
                // We just need one specific value from the match database
                //
                if (ds.formula && ds.formula.length > 0) {
                    throw new Error('cannot use formula with specific match data retrieval');
                }
                let fields = field + ', comp_level, set_number, match_number';
                let teamkey = 'frc' + team;
                let query = 'select ' + fields + ' from ' + this.matchdb_.tableName + ' where team_key = "' + teamkey + '" and comp_level = "' + ds.matches.comp_level + '" and set_number = ' + ds.matches.set_number + ' and match_number = ' + ds.matches.match_number + ' ;';
                this.matchdb_.all(query, undefined)
                    .then((data) => {
                    if (data.length !== 1) {
                        resolve({
                            type: 'error',
                            value: 'no data found for field ' + field
                        });
                        return;
                    }
                    resolve(data[0].value(field));
                })
                    .catch((err) => {
                    resolve({
                        type: 'error',
                        value: err
                    });
                });
            }
            else {
                //
                // We need to get all values for the team from the match database and filter them appropriately
                //
                let fields = field + ', comp_level, set_number, match_number';
                let teamkey = 'frc' + team;
                let query = 'select ' + fields + ' from ' + this.matchdb_.tableName + ' where team_key = "' + teamkey + '" ;';
                this.matchdb_.all(query, undefined)
                    .then(async (data) => {
                    let condvals = [];
                    if (data.length !== 0) {
                        let sorted = this.sortData(data);
                        if (ds && ds.formula && ds.formula.length > 0) {
                            try {
                                condvals = await this.computeConditionalsPerMatch(data, ds.formula, team);
                            }
                            catch (err) {
                                reject(err);
                            }
                        }
                        let filtered;
                        if (ds) {
                            filtered = this.filterMatchData(ds, condvals, sorted);
                        }
                        else {
                            filtered = sorted;
                        }
                        let value = [];
                        for (let row of filtered) {
                            if (row.has(field)) {
                                value.push(row.value(field));
                            }
                        }
                        resolve({
                            type: 'array',
                            value: value
                        });
                    }
                    else {
                        resolve({
                            type: 'error',
                            value: 'no data found for field ' + field
                        });
                    }
                })
                    .catch((err) => {
                    resolve({
                        type: 'error',
                        value: err
                    });
                });
            }
        });
        return ret;
    }
    getTeamData(field, team) {
        let ret = new Promise(async (resolve, reject) => {
            let query = 'select ' + field + ' from ' + this.teamdb_.tableName + ' where team_number = ' + team + ' ;';
            this.teamdb_.all(query, undefined)
                .then((data) => {
                let rec = data[0];
                let v = rec.value(field);
                resolve(v);
            })
                .catch((err) => {
                resolve({
                    type: 'error',
                    value: err
                });
            });
        });
        return ret;
    }
    teamColumnAdded(coldesc) {
        this.logger_.silly('added new column \'' + coldesc.name + '\' to team database');
        if (!this.info_.teamdb_col_config_) {
            this.info_.teamdb_col_config_ = {
                frozenColumnCount: 0,
                columns: []
            };
        }
        let colcfg = {
            name: coldesc.name,
            width: -1,
            hidden: coldesc.name.endsWith('_segments')
        };
        this.info_.teamdb_col_config_?.columns.push(colcfg);
    }
    teamColumnRemoved(coldesc) {
        this.logger_.silly('removed column \'' + coldesc.name + '\' from the team database');
        let i = this.info_.teamdb_col_config_?.columns.findIndex((one) => one.name === coldesc.name);
        if (i !== undefined && i >= 0) {
            this.info_.teamdb_col_config_?.columns.splice(i, 1);
        }
    }
    matchColumnAdded(coldesc) {
        this.logger_.silly('added new ColumnDesc \'' + coldesc.name + '\' to match database');
        if (!this.info_.matchdb_col_config_) {
            this.info_.matchdb_col_config_ = {
                frozenColumnCount: 0,
                columns: []
            };
        }
        let colcfg = {
            name: coldesc.name,
            width: -1,
            hidden: coldesc.name.endsWith('_segments')
        };
        this.info_.matchdb_col_config_?.columns.push(colcfg);
    }
    matchColumnRemoved(coldesc) {
        this.logger_.silly('removed column \'' + coldesc.name + '\' from the match database');
        let i = this.info_.matchdb_col_config_?.columns.findIndex((one) => one.name === coldesc.name);
        if (i !== undefined && i >= 0) {
            this.info_.matchdb_col_config_?.columns.splice(i, 1);
        }
    }
    evalFormula(ds, name, team) {
        let ret = new Promise(async (resolve, reject) => {
            let formula = this.formula_mgr_.findFormula(name);
            if (!formula) {
                resolve({
                    type: 'error',
                    value: 'formula ' + name + ' not found'
                });
                return;
            }
            else if (formula.hasError()) {
                // The formula has an error, return it
                resolve({
                    type: 'error',
                    value: formula.getError()
                });
                return;
            }
            else {
                let vars = formula.variables();
                let varvalues = new Map();
                for (let varname of vars) {
                    let v = await this.getData(ds, varname, team);
                    if (v.type === 'error') {
                        resolve(v);
                        return;
                    }
                    varvalues.set(varname, v);
                }
                let result = formula.evaluate(varvalues);
                resolve(result);
            }
        });
        return ret;
    }
    filterMatchData(ds, condvals, data) {
        let conddata = [];
        let newdata = [];
        if (ds.formula && ds.formula.length > 0) {
            if (condvals.length !== data.length) {
                throw new Error('assert: invalid call to filterMatchData - condvals array must be same size as data array');
            }
            for (let i = 0; i < condvals.length; i++) {
                if (condvals[i]) {
                    conddata.push(data[i]);
                }
            }
        }
        else {
            conddata = data;
        }
        let start = 0;
        let end = conddata.length - 1;
        if (ds.matches.kind == 'first') {
            // 
            // We want the first N entries
            //
            start = 0;
            if (ds.matches.last - 1 < end) {
                end = ds.matches.last - 1;
            }
        }
        else if (ds.matches.kind == 'last') {
            //
            // We want the last N entries
            //
            end = conddata.length - 1;
            start = conddata.length - ds.matches.first;
            if (start < 0) {
                start = 0;
            }
        }
        else if (ds.matches.kind == 'all') {
            start = 0;
            end = conddata.length - 1;
        }
        else if (ds.matches.kind == 'range') {
            //
            // We want the entries between the two values
            //
            start = ds.matches.first;
            end = ds.matches.last;
            if (start < 0) {
                start = 0;
            }
            if (end > conddata.length - 1) {
                end = conddata.length - 1;
            }
        }
        for (let i = start; i <= end; i++) {
            newdata.push(conddata[i]);
        }
        return newdata;
    }
    sortData(data) {
        data = data.sort((a, b) => {
            let am = DataManager.matchLevels.indexOf(a.comp_level);
            let bm = DataManager.matchLevels.indexOf(b.comp_level);
            if (am < bm) {
                return -1;
            }
            else if (am > bm) {
                return 1;
            }
            else {
                if (a.set_number < b.set_number) {
                    return -1;
                }
                else if (a.set_number > b.set_number) {
                    return 1;
                }
                else {
                    if (a.match_number < b.match_number) {
                        return -1;
                    }
                    else if (a.match_number > b.match_number) {
                        return 1;
                    }
                    else {
                        return 0;
                    }
                }
            }
        });
        return data;
    }
    setTeamFormatFormulas(f) {
        this.info_.team_formulas_ = f;
        this.write();
    }
    setMatchFormatFormulas(f) {
        this.info_.match_formulas_ = f;
        this.write();
    }
}
exports.DataManager = DataManager;
DataManager.matchLevels = ['qm', 'sf', 'f'];
//# sourceMappingURL=datamgr.js.map