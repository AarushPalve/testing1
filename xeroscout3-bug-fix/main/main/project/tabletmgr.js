"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.TabletManager = exports.TabletInfo = exports.MatchTablet = exports.TeamTablet = exports.Tablet = void 0;
const manager_1 = require("./manager");
const scbase_1 = require("../apps/scbase");
class Tablet {
    constructor(name) {
        this.name = name;
    }
}
exports.Tablet = Tablet;
class TeamTablet {
    constructor(team, tablet, name) {
        this.team = team;
        this.tablet = tablet;
        this.name = name;
    }
}
exports.TeamTablet = TeamTablet;
class MatchTablet {
    constructor(type, number, set, alliance, teamnum, name, tablet) {
        this.comp_level = type;
        this.match_number = number;
        this.set_number = set;
        this.alliance = alliance;
        this.teamnumber = teamnum;
        this.teamname = name;
        this.tablet = tablet;
    }
}
exports.MatchTablet = MatchTablet;
class TabletInfo {
    constructor() {
        this.tablets_ = []; // The set of tablets to be used for scouting
        this.teamassignments_ = []; // The tablets assignments to teams for team scouting
        this.matchassignements_ = []; // The tablets assignments to matches for match scouting
        this.playoffassignments_ = [];
    }
}
exports.TabletInfo = TabletInfo;
class TabletManager extends manager_1.Manager {
    constructor(logger, writer, info, team_mgr, match_mgr) {
        super(logger, writer);
        this.info_ = info;
        this.team_mgr_ = team_mgr;
        this.match_mgr_ = match_mgr;
    }
    getTablets() {
        return this.info_.tablets_;
    }
    isTabletTeam(tablet) {
        for (let assign of this.info_.teamassignments_) {
            if (assign.tablet === tablet) {
                return true;
            }
        }
        return false;
    }
    areTabletsValid() {
        let matchcnt = 0;
        let teamcnt = 0;
        if (this.info_.tablets_) {
            for (let tablet of this.info_.tablets_) {
                if (tablet && tablet.purpose && tablet.purpose === TabletManager.tabletTeam) {
                    teamcnt++;
                }
                if (tablet && tablet.purpose && tablet.purpose === TabletManager.tabletMatch) {
                    matchcnt++;
                }
            }
        }
        return teamcnt >= 1 && matchcnt >= 6;
    }
    hasPlayoffAssignments() {
        return this.info_.playoffassignments_ && this.info_.playoffassignments_.length > 0;
    }
    hasTeamAssignments() {
        return this.info_.teamassignments_ && this.info_.teamassignments_.length > 0;
    }
    hasMatchAssignments() {
        return this.info_.matchassignements_ && this.info_.matchassignements_.length > 0;
    }
    getPlayoffAssignments() {
        return this.info_.playoffassignments_;
    }
    getTeamAssignments() {
        return this.info_.teamassignments_;
    }
    getMatchAssignments() {
        return this.info_.matchassignements_;
    }
    generateTabletSchedule() {
        if (!this.generateTeamTabletSchedule()) {
            return false;
        }
        if (this.match_mgr_.hasMatches()) {
            if (!this.generateMatchTabletSchedule()) {
                return false;
            }
            if (!this.generatePlayoffSchedule()) {
                return false;
            }
        }
        return true;
    }
    clearScoutingSchedules() {
        this.info_.teamassignments_ = [];
        this.info_.matchassignements_ = [];
    }
    setTabletData(data) {
        this.info_.tablets_ = [];
        for (let tab of data) {
            let t = new Tablet(tab.name);
            if (tab.purpose) {
                t.purpose = tab.purpose;
            }
            this.info_.tablets_.push(t);
        }
        this.write();
    }
    getTabletsForPurpose(purpose) {
        let ret = [];
        if (this.info_.tablets_) {
            for (let t of this.info_.tablets_) {
                if (t.purpose && t.purpose === purpose) {
                    ret.push(t);
                }
            }
        }
        return ret;
    }
    incrementallyGenerateMatchSchedule() {
        // TODO: write this when incrementally new matches are provided (e.g. elims)
        return false;
    }
    findTabletForMatch(complevel, setno, matchno, teamnum) {
        let ret = '';
        for (let ma of this.info_.matchassignements_) {
            if (ma.comp_level === complevel && ma.set_number === setno && ma.match_number === matchno && ma.teamnumber === teamnum) {
                ret = ma.tablet;
                break;
            }
        }
        return ret;
    }
    generateTeamTabletSchedule() {
        let teamtab = this.getTabletsForPurpose(TabletManager.tabletTeam);
        if (teamtab.length < 1 || !this.team_mgr_.hasTeams()) {
            return false;
        }
        let index = 0;
        this.info_.teamassignments_ = [];
        for (let t of this.team_mgr_.getTeams()) {
            let assignment = new TeamTablet(t.team_number, teamtab[index].name, t.nickname);
            this.info_.teamassignments_.push(assignment);
            index++;
            if (index >= teamtab.length) {
                index = 0;
            }
        }
        return true;
    }
    generateMatchTabletSchedule() {
        let matchtab = this.getTabletsForPurpose(TabletManager.tabletMatch);
        if (!this.match_mgr_.hasMatches() || matchtab.length < 6) {
            return false;
        }
        let team;
        let tnumber;
        let ma;
        let index = 0;
        this.info_.matchassignements_ = [];
        for (let m of this.match_mgr_.getMatches()) {
            tnumber = scbase_1.SCBase.keyToTeamNumber(m.alliances.red.team_keys[0]);
            team = this.team_mgr_.findTeamByNumber(tnumber);
            ma = new MatchTablet(m.comp_level, m.match_number, m.set_number, 'red', tnumber, team ? team.nickname : '', matchtab[index].name);
            index++;
            if (index >= matchtab.length) {
                index = 0;
            }
            this.info_.matchassignements_.push(ma);
            tnumber = scbase_1.SCBase.keyToTeamNumber(m.alliances.red.team_keys[1]);
            team = this.team_mgr_.findTeamByNumber(tnumber);
            ma = new MatchTablet(m.comp_level, m.match_number, m.set_number, 'red', tnumber, team ? team.nickname : '', matchtab[index].name);
            index++;
            if (index >= matchtab.length) {
                index = 0;
            }
            this.info_.matchassignements_.push(ma);
            tnumber = scbase_1.SCBase.keyToTeamNumber(m.alliances.red.team_keys[2]);
            team = this.team_mgr_.findTeamByNumber(tnumber);
            ma = new MatchTablet(m.comp_level, m.match_number, m.set_number, 'red', tnumber, team ? team.nickname : '', matchtab[index].name);
            index++;
            if (index >= matchtab.length) {
                index = 0;
            }
            this.info_.matchassignements_.push(ma);
            tnumber = scbase_1.SCBase.keyToTeamNumber(m.alliances.blue.team_keys[0]);
            team = this.team_mgr_.findTeamByNumber(tnumber);
            ma = new MatchTablet(m.comp_level, m.match_number, m.set_number, 'blue', tnumber, team ? team.nickname : '', matchtab[index].name);
            index++;
            if (index >= matchtab.length) {
                index = 0;
            }
            this.info_.matchassignements_.push(ma);
            tnumber = scbase_1.SCBase.keyToTeamNumber(m.alliances.blue.team_keys[1]);
            team = this.team_mgr_.findTeamByNumber(tnumber);
            ma = new MatchTablet(m.comp_level, m.match_number, m.set_number, 'blue', tnumber, team ? team.nickname : '', matchtab[index].name);
            index++;
            if (index >= matchtab.length) {
                index = 0;
            }
            this.info_.matchassignements_.push(ma);
            tnumber = scbase_1.SCBase.keyToTeamNumber(m.alliances.blue.team_keys[2]);
            team = this.team_mgr_.findTeamByNumber(tnumber);
            ma = new MatchTablet(m.comp_level, m.match_number, m.set_number, 'blue', tnumber, team ? team.nickname : '', matchtab[index].name);
            index++;
            if (index >= matchtab.length) {
                index = 0;
            }
            this.info_.matchassignements_.push(ma);
        }
        return true;
    }
    generatePlayoffSchedule() {
        let matchtab = this.getTabletsForPurpose(TabletManager.tabletMatch);
        if (!this.match_mgr_.hasMatches() || matchtab.length < 6) {
            return false;
        }
        let index = 0;
        this.info_.playoffassignments_ = [];
        for (let match = 1; match <= 16; match++) {
            for (let slot = 0; slot < 6; slot++) {
                let ma = {
                    match: match,
                    alliance: (slot < 3) ? 'red' : 'blue',
                    tablet: matchtab[index].name,
                    which: (slot % 3),
                };
                this.info_.playoffassignments_.push(ma);
                index++;
                if (index >= matchtab.length) {
                    index = 0;
                }
            }
        }
        return true;
    }
}
exports.TabletManager = TabletManager;
TabletManager.tabletTeam = "team";
TabletManager.tabletMatch = "match";
//# sourceMappingURL=tabletmgr.js.map