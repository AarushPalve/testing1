"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.MatchDataModel = void 0;
const datamodel_1 = require("./datamodel");
const datarecord_1 = require("./datarecord");
const datavalue_1 = require("../../shared/datavalue");
class MatchDataModel extends datamodel_1.DataModel {
    constructor(dbname, info, logger) {
        super(dbname, MatchDataModel.TableName, info, logger);
    }
    init() {
        let ret = new Promise((resolve, reject) => {
            super.init()
                .then(() => {
                this.createTableIfNecessary(MatchDataModel.TableName)
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
                name: 'comp_level',
                type: 'string',
                source: 'base',
                editable: false,
            },
            {
                name: 'set_number',
                type: 'integer',
                source: 'base',
                editable: false,
            },
            {
                name: 'match_number',
                type: 'integer',
                source: 'base',
                editable: false,
            },
            {
                name: 'team_key',
                type: 'string',
                source: 'base',
                editable: false,
            }
        ];
    }
    createTableQuery() {
        let ret = 'create table ' + MatchDataModel.TableName + ' (';
        ret += 'key TEXT';
        ret += ', comp_level TEXT NOT NULL';
        ret += ', set_number REAL NOT NULL';
        ret += ', match_number REAL NOT NULL';
        ret += ', team_key TEXT NOT NULL';
        ret += ');';
        return ret;
    }
    getDataValueFromObject(obj) {
        let ret = datavalue_1.DataValue.fromError(new Error('Invalid data type'));
        if (typeof obj === 'string') {
            ret = datavalue_1.DataValue.fromString(obj);
        }
        else if (typeof obj === 'number') {
            if (Number.isInteger(obj)) {
                ret = datavalue_1.DataValue.fromInteger(obj);
            }
            else {
                ret = datavalue_1.DataValue.fromReal(obj);
            }
        }
        else if (typeof obj === 'boolean') {
            ret = datavalue_1.DataValue.fromBoolean(obj);
        }
        return ret;
    }
    moveToRecord(obj, dr) {
        for (let key of Object.keys(obj)) {
            let value = this.getDataValueFromObject(obj[key]);
            if (!datavalue_1.DataValue.isError(value)) {
                dr.addfield('ba_' + key, value);
            }
        }
    }
    getScoreBreakdown(score, dr, alliance) {
        this.moveToRecord(score, dr);
        if (alliance === 'red' && score.red) {
            this.moveToRecord(score.red, dr);
        }
        else if (alliance === 'blue' && score.blue) {
            this.moveToRecord(score.blue, dr);
        }
    }
    convertToRecord(obj, tkey, alliance, results) {
        let dr = new datarecord_1.DataRecord();
        dr.addfield('key', datavalue_1.DataValue.fromString(obj.key));
        dr.addfield('team_key', datavalue_1.DataValue.fromString(tkey));
        dr.addfield('comp_level', datavalue_1.DataValue.fromString(obj.comp_level));
        dr.addfield('set_number', datavalue_1.DataValue.fromInteger(obj.set_number));
        dr.addfield('match_number', datavalue_1.DataValue.fromInteger(obj.match_number));
        dr.addfield('r1', datavalue_1.DataValue.fromString(obj.alliances.red.team_keys[0]));
        dr.addfield('r2', datavalue_1.DataValue.fromString(obj.alliances.red.team_keys[1]));
        dr.addfield('r3', datavalue_1.DataValue.fromString(obj.alliances.red.team_keys[2]));
        dr.addfield('b1', datavalue_1.DataValue.fromString(obj.alliances.blue.team_keys[0]));
        dr.addfield('b2', datavalue_1.DataValue.fromString(obj.alliances.blue.team_keys[1]));
        dr.addfield('b3', datavalue_1.DataValue.fromString(obj.alliances.blue.team_keys[2]));
        dr.addfield('alliance', datavalue_1.DataValue.fromString(alliance));
        if (results) {
            if (obj.alliances.red.score) {
                dr.addfield('ba_redscore', datavalue_1.DataValue.fromInteger(obj.alliances.red.score));
                if (alliance === 'red') {
                    dr.addfield('ba_score', datavalue_1.DataValue.fromInteger(obj.alliances.red.score));
                }
            }
            if (obj.alliances.blue.score) {
                dr.addfield('ba_bluescore', datavalue_1.DataValue.fromInteger(obj.alliances.blue.score));
                if (alliance === 'blue') {
                    dr.addfield('ba_score', datavalue_1.DataValue.fromInteger(obj.alliances.blue.score));
                }
            }
            if (obj.winning_alliance) {
                dr.addfield('ba_winning_alliance', datavalue_1.DataValue.fromString(obj.winning_alliance));
            }
            if (obj.score_breakdown) {
                this.getScoreBreakdown(obj.score_breakdown, dr, alliance);
            }
        }
        return dr;
    }
    processBAData(data, results) {
        let ret = new Promise(async (resolve, reject) => {
            let dr;
            let records = [];
            for (let one of data) {
                //
                // Each match turns into 6 records in the database, one for each team
                // of each of the alliances.
                //
                dr = this.convertToRecord(one, one.alliances.red.team_keys[0], 'red', results);
                records.push(dr);
                dr = this.convertToRecord(one, one.alliances.red.team_keys[1], 'red', results);
                records.push(dr);
                dr = this.convertToRecord(one, one.alliances.red.team_keys[2], 'red', results);
                records.push(dr);
                dr = this.convertToRecord(one, one.alliances.blue.team_keys[0], 'blue', results);
                records.push(dr);
                dr = this.convertToRecord(one, one.alliances.blue.team_keys[1], 'blue', results);
                records.push(dr);
                dr = this.convertToRecord(one, one.alliances.blue.team_keys[2], 'blue', results);
                records.push(dr);
            }
            try {
                await this.addColsAndData(['comp_level', 'set_number', 'match_number', 'team_key'], records, false, 'bluealliance');
                resolve();
            }
            catch (err) {
                reject(err);
            }
        });
        return ret;
    }
    // sm-qm-1-1-8 is sm- TYPE - set_number - match_number
    parseMatchString(str) {
        let ret;
        const regex = /^sm-([a-z]+)-([0-9]+)-([0-9]+)-([a-zA-Z0-9]+)$/;
        let match = regex.exec(str);
        if (match) {
            let team = match[4];
            if (!team.startsWith('frc')) {
                team = 'frc' + team;
            }
            ret = {
                type: match[1],
                set_number: +match[2],
                match: +match[3],
                teamkey: team
            };
        }
        return ret;
    }
    convertScoutDataToRecord(match, data) {
        let dr = new datarecord_1.DataRecord();
        let teamnumber = -1;
        let item = this.parseMatchString(match);
        dr.addfield('comp_level', datavalue_1.DataValue.fromString(item.type));
        dr.addfield('set_number', datavalue_1.DataValue.fromInteger(item.set_number));
        dr.addfield('match_number', datavalue_1.DataValue.fromInteger(item.match));
        dr.addfield('team_key', datavalue_1.DataValue.fromString(item.teamkey));
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
                ret.push(record.item);
                records.push(dr);
            }
            await this.addColsAndData(['comp_level', 'set_number', 'match_number', 'team_key'], records, true, 'form');
            resolve(ret);
        });
        return ret;
    }
}
exports.MatchDataModel = MatchDataModel;
MatchDataModel.TableName = 'matches';
MatchDataModel.BlueAlliancePrefix = 'ba_';
MatchDataModel.fixedcols = ['comp_level', 'match_number', 'set_number'];
//# sourceMappingURL=matchmodel.js.map