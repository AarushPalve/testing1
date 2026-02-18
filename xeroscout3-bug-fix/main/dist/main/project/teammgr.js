"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.TeamManager = exports.TeamData = void 0;
const manager_1 = require("./manager");
class TeamData {
    constructor() {
        this.teams_ = []; // The set of teams at the event
    }
}
exports.TeamData = TeamData;
class TeamManager extends manager_1.Manager {
    constructor(logger, writer, info) {
        super(logger, writer);
        this.info_ = info;
    }
    getTeams() {
        return this.info_.teams_;
    }
    getTeamsNickNameAndNumber(rank) {
        let ret = [];
        if (rank) {
            // TODO: If BA Rank is present, sort by that
            if (this.info_.teams_) {
                this.info_.teams_.map((t) => { ret.push({ number: t.team_number, nickname: t.nickname }); });
            }
        }
        else {
            if (this.info_.teams_) {
                this.info_.teams_.map((t) => { ret.push({ number: t.team_number, nickname: t.nickname }); });
            }
        }
        ret.sort((a, b) => (a.number - b.number));
        return ret;
    }
    getSortedTeamNumbers(rank) {
        let ret = [];
        if (rank) {
            // TODO: if BA Rank is present, sort by that
            if (this.info_.teams_) {
                for (let t of this.info_.teams_) {
                    ret.push(t.team_number);
                }
            }
        }
        else {
            if (this.info_.teams_) {
                for (let t of this.info_.teams_) {
                    ret.push(t.team_number);
                }
            }
        }
        ret.sort((a, b) => (a - b));
        return ret;
    }
    hasTeams() {
        return this.info_.teams_ && this.info_.teams_.length > 0;
    }
    findTeamByNumber(number) {
        let ret;
        if (this.info_.teams_) {
            for (let t of this.info_.teams_) {
                if (t.team_number === number) {
                    ret = t;
                    break;
                }
            }
        }
        return ret;
    }
    setBATeamData(data) {
        this.info_.teams_ = data;
        this.write();
    }
    setTeamData(data) {
        let teams = [];
        for (let d of data) {
            let team = {
                key: 'frc' + d.number,
                team_number: d.number,
                nickname: d.nickname,
                name: d.nickname,
                school_name: '',
                city: '',
                state_prov: '',
                country: '',
                address: '',
                postal_code: '',
                gmaps_place_id: '',
                gmaps_url: '',
                lat: 0,
                lng: 0,
                location_name: '',
                website: '',
                rookie_year: 0
            };
            teams.push(team);
        }
        this.setBATeamData(teams);
    }
}
exports.TeamManager = TeamManager;
//# sourceMappingURL=teammgr.js.map