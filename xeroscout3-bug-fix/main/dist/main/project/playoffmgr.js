"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.PlayoffManager = void 0;
const scbase_1 = require("../apps/scbase");
const manager_1 = require("./manager");
class PlayoffManager extends manager_1.Manager {
    constructor(logger, writer, playoffData, matchmgr) {
        super(logger, writer);
        this.playoffData_ = playoffData;
        this.matchManager_ = matchmgr;
    }
    get info() {
        return this.playoffData_;
    }
    hasPlayoffStatus() {
        return this.areAlliancesSet();
    }
    processAllianceData(alliances) {
        if (!alliances || !Array.isArray(alliances) || alliances.length !== 8) {
            return;
        }
        let index = 0;
        for (let alliance of alliances) {
            let t1 = scbase_1.SCBase.keyToTeamNumber(alliance.picks[0]);
            let t2 = scbase_1.SCBase.keyToTeamNumber(alliance.picks[1]);
            let t3 = scbase_1.SCBase.keyToTeamNumber(alliance.picks[2]);
            this.playoffData_.alliances[index] = { teams: [t1, t2, t3] };
            index++;
        }
        this.extractMatchResults();
        this.write();
    }
    setAllianceTeams(alliance, teams) {
        if (alliance < 1 || alliance > 8 || !Array.isArray(teams) || teams.length !== 3) {
            return;
        }
        let t = [teams[0], teams[1], teams[2]];
        this.playoffData_.alliances[alliance - 1] = { teams: t };
        this.write();
    }
    setPlayoffMatchOutcome(match, winner, loser) {
        this.playoffData_.outcomes[`m${match}`] = {
            winner: winner,
            loser: loser,
        };
        this.write();
    }
    areAlliancesSet() {
        if (!this.info.alliances.length) {
            return false;
        }
        if (!this.info.alliances) {
            return false;
        }
        if (!Array.isArray(this.info.alliances) || this.info.alliances.length !== 8) {
            return false;
        }
        for (let a of this.info.alliances) {
            if (!a || !Array.isArray(a.teams) || a.teams.length !== 3) {
                return false;
            }
            if (!a.teams[0] || !a.teams[1] || !a.teams[2]) {
                return false;
            }
        }
        return true;
    }
    findAllianceByTeam(team) {
        for (let i = 0; i < this.playoffData_.alliances.length; i++) {
            let alliance = this.playoffData_.alliances[i];
            if (alliance.teams.includes(team)) {
                return i + 1;
            }
        }
        return -1;
    }
    extractMatchResults() {
        // sf, set_number #, match_number 1
        // f, set_number 1, match_number #
        for (let sf = 1; sf <= 13; sf++) {
            let m = this.matchManager_.findMatchByInfo("sf", sf, 1);
            if (m) {
                let wteam = scbase_1.SCBase.keyToTeamNumber(m.alliances.red.team_keys[0]);
                let lteam = scbase_1.SCBase.keyToTeamNumber(m.alliances.blue.team_keys[0]);
                if (m.winning_alliance === 'blue') {
                    wteam = scbase_1.SCBase.keyToTeamNumber(m.alliances.blue.team_keys[0]);
                    lteam = scbase_1.SCBase.keyToTeamNumber(m.alliances.red.team_keys[0]);
                }
                let wa = this.findAllianceByTeam(wteam);
                let la = this.findAllianceByTeam(lteam);
                if (wa !== -1 && la !== -1) {
                    this.playoffData_.outcomes[`m${sf}`] = {
                        winner: wa,
                        loser: la,
                    };
                }
            }
        }
        for (let f = 1; f <= 3; f++) {
            let m = this.matchManager_.findMatchByInfo("f", 1, f);
            if (m) {
                let wteam = scbase_1.SCBase.keyToTeamNumber(m.alliances.red.team_keys[0]);
                let lteam = scbase_1.SCBase.keyToTeamNumber(m.alliances.blue.team_keys[0]);
                if (m.winning_alliance === 'blue') {
                    wteam = scbase_1.SCBase.keyToTeamNumber(m.alliances.blue.team_keys[0]);
                    lteam = scbase_1.SCBase.keyToTeamNumber(m.alliances.red.team_keys[0]);
                }
                let wa = this.findAllianceByTeam(wteam);
                let la = this.findAllianceByTeam(lteam);
                if (wa !== -1 && la !== -1) {
                    this.playoffData_.outcomes[`m${f + 13}`] = {
                        winner: wa,
                        loser: la,
                    };
                    this.playoffData_.outcomes[`m${f + 13}`] = undefined;
                }
            }
            else {
                this.playoffData_.outcomes[`m${f + 13}`] = undefined;
            }
        }
    }
}
exports.PlayoffManager = PlayoffManager;
//# sourceMappingURL=playoffmgr.js.map