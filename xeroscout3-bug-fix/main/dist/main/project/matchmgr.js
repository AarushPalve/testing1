"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.MatchManager = exports.MatchInfo = void 0;
const scbase_1 = require("../apps/scbase");
const manager_1 = require("./manager");
class MatchInfo {
    constructor() {
        this.matches_ = []; // The set of matches for the event
    }
}
exports.MatchInfo = MatchInfo;
class MatchManager extends manager_1.Manager {
    constructor(logger, writer, info) {
        super(logger, writer);
        this.info_ = info;
    }
    hasMatches() {
        return this.info_.matches_ && this.info_.matches_.length > 0;
    }
    getMatches() {
        return this.info_.matches_;
    }
    clearMatches() {
        this.info_.matches_ = [];
    }
    findMatchByInfo(comp_level, set_number, match_number) {
        let ret;
        if (this.info_.matches_) {
            for (let one of this.info_.matches_) {
                if (one.comp_level === comp_level && one.set_number === set_number && one.match_number === match_number) {
                    ret = one;
                    break;
                }
            }
        }
        return ret;
    }
    findMatchByKey(key) {
        let ret;
        if (this.info_.matches_) {
            for (let one of this.info_.matches_) {
                if (one.key === key) {
                    ret = one;
                    break;
                }
            }
        }
        return ret;
    }
    setBAMatchData(data) {
        this.info_.matches_ = data;
        this.write();
    }
    async setMatchData(data) {
        let bamatches = [];
        for (let d of data) {
            let match = {
                key: d.comp_level + '-' + d.set_number + '-' + d.match_number,
                comp_level: d.comp_level,
                set_number: d.set_number,
                match_number: d.match_number,
                alliances: {
                    red: {
                        score: 0,
                        team_keys: ['frc' + d.red[0], 'frc' + d.red[1], 'frc' + d.red[2]],
                        surrogate_team_keys: [],
                        dq_team_keys: []
                    },
                    blue: {
                        score: 0,
                        team_keys: ['frc' + d.blue[0], 'frc' + d.blue[1], 'frc' + d.blue[2]],
                        surrogate_team_keys: [],
                        dq_team_keys: []
                    }
                },
                winning_alliance: '',
                event_key: '',
                time: 0,
                actual_time: 0,
                predicted_time: 0,
                post_result_time: 0,
                score_breakdown: {
                    blue: undefined,
                    red: undefined,
                },
                videos: []
            };
            bamatches.push(match);
        }
        this.setBAMatchData(bamatches);
    }
    getMatchResults(teamnumber) {
        let ret = [];
        if (this.info_.matches_) {
            for (let m of this.info_.matches_) {
                if (this.doesMatchContainTeam(m, teamnumber)) {
                    ret.push(m);
                }
            }
        }
        return ret;
    }
    doesMatchContainTeam(match, team) {
        for (let i = 0; i < 3; i++) {
            let num;
            num = scbase_1.SCBase.keyToTeamNumber(match.alliances.red.team_keys[i]);
            if (num === team) {
                return true;
            }
            num = scbase_1.SCBase.keyToTeamNumber(match.alliances.blue.team_keys[i]);
            if (num === team) {
                return true;
            }
        }
        return false;
    }
}
exports.MatchManager = MatchManager;
//# sourceMappingURL=matchmgr.js.map