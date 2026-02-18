"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.TeamDataModel = void 0;
const datamodel_1 = require("./datamodel");
const scbase_1 = require("../apps/scbase");
const datarecord_1 = require("./datarecord");
const datavalue_1 = require("../../shared/datavalue");
;
class TeamDataModel extends datamodel_1.DataModel {
    constructor(dbname, info, logger) {
        super(dbname, TeamDataModel.TableName, info, logger);
    }
    init() {
        let ret = new Promise((resolve, reject) => {
            super.init()
                .then(() => {
                this.createTableIfNecessary(TeamDataModel.TableName)
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
    initialTableColumns() {
        //
        // Initial columns for the teams table.  These are the base columns that will be
        // created when the table is created.  This list must match the columns in the
        // createTableQuery() method.
        // 
        return [
            {
                name: 'key',
                type: 'string',
                source: 'base',
                editable: false,
            },
            {
                name: 'team_number',
                type: 'integer',
                source: 'base',
                editable: false,
            }
        ];
    }
    createTableQuery() {
        let ret = 'create table ' + TeamDataModel.TableName + ' (';
        ret += 'key TEXT';
        ret += ', team_number INTEGER NOT NULL';
        ret += ');';
        return ret;
    }
    convertTeamToRecord(team) {
        let dr = new datarecord_1.DataRecord();
        dr.addfield('key', datavalue_1.DataValue.fromString(team.key));
        dr.addfield('team_number', datavalue_1.DataValue.fromInteger(team.team_number));
        dr.addfield('nickname', datavalue_1.DataValue.fromString(team.nickname));
        dr.addfield('name', datavalue_1.DataValue.fromString(team.name));
        dr.addfield('school_name', datavalue_1.DataValue.fromString(team.school_name));
        dr.addfield('city', datavalue_1.DataValue.fromString(team.city));
        dr.addfield('state_prov', datavalue_1.DataValue.fromString(team.state_prov));
        dr.addfield('country', datavalue_1.DataValue.fromString(team.country));
        dr.addfield('address', datavalue_1.DataValue.fromString(team.address));
        dr.addfield('postal_code', datavalue_1.DataValue.fromString(team.postal_code));
        dr.addfield('gmaps_place_id', datavalue_1.DataValue.fromString(team.gmaps_place_id));
        dr.addfield('gmaps_url', datavalue_1.DataValue.fromString(team.gmaps_url));
        dr.addfield('lat', datavalue_1.DataValue.fromReal(team.lat));
        dr.addfield('lng', datavalue_1.DataValue.fromReal(team.lng));
        dr.addfield('location_name', datavalue_1.DataValue.fromString(team.location_name));
        dr.addfield('website', datavalue_1.DataValue.fromString(team.website));
        dr.addfield('rookie_year', datavalue_1.DataValue.fromInteger(team.rookie_year));
        return dr;
    }
    processBAData(data) {
        let ret = new Promise(async (resolve, reject) => {
            let records = [];
            for (let one of data) {
                let dr = this.convertTeamToRecord(one);
                records.push(dr);
            }
            try {
                await this.addColsAndData(['team_number'], records, false, 'bluealliance');
                resolve();
            }
            catch (err) {
                reject(err);
            }
        });
        return ret;
    }
    convertRankingToRecord(ranking) {
        let dr = new datarecord_1.DataRecord();
        dr.addfield('rank', datavalue_1.DataValue.fromInteger(ranking.rank));
        dr.addfield('wins', datavalue_1.DataValue.fromInteger(ranking.record.wins));
        dr.addfield('losses', datavalue_1.DataValue.fromInteger(ranking.record.losses));
        dr.addfield('ties', datavalue_1.DataValue.fromInteger(ranking.record.ties));
        dr.addfield('team_key', datavalue_1.DataValue.fromString(ranking.team_key));
        dr.addfield('team_number', datavalue_1.DataValue.fromInteger(scbase_1.SCBase.keyToTeamNumber(ranking.team_key)));
        return dr;
    }
    convertStatsYearToRecord(t) {
        let dr = new datarecord_1.DataRecord();
        if (t.team) {
            dr.addfield('team_number', datavalue_1.DataValue.fromInteger(t.team));
            if (t.epa) {
                if (t.epa.norm) {
                    dr.addfield('st_year_epanorm', datavalue_1.DataValue.fromReal(t.epa.norm));
                }
                if (t.epa.unitless) {
                    dr.addfield('st_year_epaunitless', datavalue_1.DataValue.fromReal(t.epa.unitless));
                }
                if (t.epa.ranks.district) {
                    dr.addfield('st_year_district_rank', datavalue_1.DataValue.fromInteger(t.epa.ranks.district.rank));
                }
                if (t.epa.ranks.country.rank) {
                    dr.addfield('st_year_country_rank', datavalue_1.DataValue.fromInteger(t.epa.ranks.country.rank));
                }
                if (t.epa.ranks.state.rank) {
                    dr.addfield('st_year_state_rank', datavalue_1.DataValue.fromInteger(t.epa.ranks.state.rank));
                }
                if (t.epa.breakdown) {
                    for (let key of Object.keys(t.epa.breakdown)) {
                        dr.addfield('st_year_' + key, datavalue_1.DataValue.fromReal(t.epa.breakdown[key]));
                    }
                }
            }
        }
        return dr;
    }
    convertStatsEventToRecord(t) {
        let dr = new datarecord_1.DataRecord();
        dr.addfield('team_number', datavalue_1.DataValue.fromInteger(t.team));
        if (t.epa.unitless) {
            dr.addfield('st_event_epaunitless', datavalue_1.DataValue.fromReal(t.epa.unitless));
        }
        if (t.epa.norm) {
            dr.addfield('st_event_epanorm', datavalue_1.DataValue.fromReal(t.epa.norm));
        }
        if (t.epa.total_points) {
            dr.addfield('st_event_totalpoints_mean', datavalue_1.DataValue.fromReal(t.epa.total_points.mean));
            dr.addfield('st_event_totalpoints_stddev', datavalue_1.DataValue.fromReal(t.epa.total_points.sd));
        }
        if (t.epa.breakdown) {
            for (let key of Object.keys(t.epa.breakdown)) {
                dr.addfield('st_event_' + key, datavalue_1.DataValue.fromReal(t.epa.breakdown[key]));
            }
        }
        return dr;
    }
    processStatboticsYearToDateData(stats) {
        let ret = new Promise(async (resolve, reject) => {
            let records = [];
            for (let t of stats) {
                records.push(this.convertStatsYearToRecord(t));
            }
            try {
                await this.addColsAndData(['team_number'], records, false, 'statbotics');
                resolve();
            }
            catch (err) {
                reject(err);
            }
        });
        return ret;
    }
    processStatboticsEventData(stats) {
        let ret = new Promise(async (resolve, reject) => {
            let records = [];
            for (let t of stats) {
                records.push(this.convertStatsEventToRecord(t));
            }
            try {
                await this.addColsAndData(['team_number'], records, false, 'statbotics');
                resolve();
            }
            catch (err) {
                reject(err);
            }
        });
        return ret;
    }
    keyToTeamNumber(key) {
        let ret = -1;
        let m1 = /^frc[0-9]+$/;
        let m2 = /^[0-9]+$/;
        if (m1.test(key)) {
            ret = +key.substring(3);
        }
        else if (m2.test(key)) {
            ret = +key;
        }
        return ret;
    }
    processOPR(opr) {
        let ret = new Promise(async (resolve, reject) => {
            let records = [];
            for (let key of Object.keys(opr.oprs)) {
                let dr = new datarecord_1.DataRecord();
                dr.addfield('team_number', datavalue_1.DataValue.fromInteger(scbase_1.SCBase.keyToTeamNumber(key)));
                dr.addfield('ba_opr', datavalue_1.DataValue.fromReal(opr.oprs[key]));
                dr.addfield('ba_dpr', datavalue_1.DataValue.fromReal(opr.dprs[key]));
                dr.addfield('ba_ccwms', datavalue_1.DataValue.fromReal(opr.ccwms[key]));
                records.push(dr);
            }
            try {
                await this.addColsAndData(['team_number'], records, false, 'bluealliance');
                resolve();
            }
            catch (err) {
                reject(err);
            }
        });
        return ret;
    }
    processRankings(rankings) {
        let ret = new Promise(async (resolve, reject) => {
            let records = [];
            for (let t of rankings) {
                records.push(this.convertRankingToRecord(t));
            }
            try {
                await this.addColsAndData(['team_number'], records, false, 'bluealliance');
                resolve();
            }
            catch (err) {
                reject(err);
            }
        });
        return ret;
    }
    convertScoutDataToRecord(team, data) {
        let dr = new datarecord_1.DataRecord();
        let teamnumber = -1;
        let tstr = team;
        if (tstr.startsWith('st-')) {
            teamnumber = +tstr.substring(3);
        }
        dr.addfield('team_number', { type: 'integer', value: teamnumber });
        for (let field of data) {
            dr.addfield(field.tag, field.value);
        }
        return dr;
    }
    async processScoutingResults(data) {
        let ret = new Promise(async (resolve, reject) => {
            let ret = [];
            let records = [];
            for (let record of data.results) {
                let dr = this.convertScoutDataToRecord(record.item, record.data);
                ret.push(datavalue_1.DataValue.toInteger(dr.value('team_number')));
                records.push(dr);
            }
            try {
                await this.addColsAndData(['team_number'], records, true, 'form');
                resolve(ret);
            }
            catch (err) {
                reject(err);
            }
        });
        return ret;
    }
}
exports.TeamDataModel = TeamDataModel;
TeamDataModel.TableName = 'teams';
//# sourceMappingURL=teammodel.js.map