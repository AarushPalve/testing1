"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.SCCoachCentralBaseApp = void 0;
const electron_1 = require("electron");
const scbase_1 = require("./scbase");
class SCCoachCentralBaseApp extends scbase_1.SCBase {
    constructor(win, type) {
        super(win, type);
        this.project_ = undefined;
        this.color_ = 'blue';
        this.reversed_ = false;
    }
    get project() {
        return this.project_;
    }
    set project(proj) {
        this.project_ = proj;
    }
    get color() {
        return this.color_;
    }
    set color(col) {
        this.color_ = col;
    }
    get reversed() {
        return this.reversed_;
    }
    set reversed(rev) {
        this.reversed_ = rev;
    }
    getTeamList(opt) {
        if (opt.nicknames) {
            let ret = this.project_?.team_mgr_?.getTeamsNickNameAndNumber(opt.rank || false);
            this.sendToRenderer('send-team-list', ret);
        }
        else {
            let ret = this.project_?.team_mgr_?.getSortedTeamNumbers(opt.rank || false);
            this.sendToRenderer('send-team-list', ret);
        }
    }
    getMatchList() {
        let data = [];
        for (let match of this.project_.match_mgr_.getMatches()) {
            let one = {
                comp_level: match.comp_level,
                set_number: match.set_number,
                match_number: match.match_number,
                red: this.getTeamNumbersFromKeys(match.alliances.red.team_keys),
                blue: this.getTeamNumbersFromKeys(match.alliances.blue.team_keys),
            };
            data.push(one);
        }
        data.sort((a, b) => { return this.sortCompFun(a, b); });
        this.sendToRenderer('send-match-list', data);
    }
    sendPicklistConfigs() {
        this.sendToRenderer('send-picklist-configs', this.project_?.picklist_mgr_?.allPicklists);
    }
    savePicklistConfig(config) {
        this.project.picklist_mgr_.coachesPicklists = config.filter(c => c.owner === 'coach');
        this.project.picklist_mgr_.centralPicklists = config.filter(c => c.owner === 'central');
    }
    sendPicklistData(name) {
        this.project_?.picklist_mgr_.getPicklistData(name)
            .then((data) => {
            this.sendToRenderer('send-picklist-data', data);
        })
            .catch((err) => {
            let errobj = err;
            electron_1.dialog.showMessageBox(this.win_, {
                title: "Picklist Data Error",
                message: `Error getting picklist data - ${errobj.message}`
            });
        });
    }
    async getSingleTeamData(ds, team) {
        let retdata = {};
        if (this.project_ && this.project_.isInitialized()) {
            retdata.matches = this.project_.match_mgr_.getMatchResults(+team);
            retdata.teamdata = await this.project_.dataset_mgr_.getDataSetData(ds);
            retdata.videoicon = this.getIconData('video.png');
        }
        this.sendToRenderer('send-single-team-data', retdata);
    }
    async getSingleTeamConfigs() {
        this.sendToRenderer('send-single-team-configs', this.project_?.graph_mgr_?.allConfigs);
    }
    async updateSingleTeamConfigs(configs) {
        if (this.project && this.project.isInitialized()) {
            this.project.graph_mgr_.coachConfigs = configs.filter(c => c.owner === 'coach');
            this.project.graph_mgr_.singleTeamConfigs = configs.filter(c => c.owner === 'central');
        }
    }
    sendPlayoffStatus() {
        if (this.project_ && this.project_.isInitialized()) {
            this.sendToRenderer('send-playoff-status', this.project_.playoff_mgr_.info);
        }
    }
    setAllianceTeams(alliance, teams) {
        if (this.project_ && this.project_.isInitialized()) {
            this.project_.playoff_mgr_.setAllianceTeams(alliance, teams);
            this.sendPlayoffStatus();
        }
    }
    setPlayoffMatchOutcome(match, winner, loser) {
        if (this.project_ && this.project_.isInitialized()) {
            this.project_.playoff_mgr_.setPlayoffMatchOutcome(match, winner, loser);
            this.sendPlayoffStatus();
        }
    }
    sendMatchFormatFormulas() {
        if (this.project_ && this.project_.isInitialized()) {
            this.sendToRenderer('send-match-format-formulas', this.project_.info.data_info_.match_formulas_);
        }
    }
    sendTeamFormatFormulas() {
        if (this.project_ && this.project_.isInitialized()) {
            this.sendToRenderer('send-team-format-formulas', this.project_.info.data_info_.team_formulas_);
        }
    }
    getGraphData(cfg) {
        if (cfg) {
            this.project_?.graph_mgr_?.generateGraphData(cfg)
                .then((data) => {
                this.sendToRenderer('send-chart-data', data);
            });
        }
    }
    renameFormula(oldname, newname) {
        this.project?.formula_mgr_?.renameFormula(oldname, newname);
    }
    updateFormula(name, desc, exprstr) {
        this.project?.formula_mgr_?.addFormula(name, desc, exprstr);
    }
    deleteFormula(name) {
        this.project?.formula_mgr_?.deleteFormula(name);
    }
    async sendMatchStatus() {
        try {
            let ret = [];
            if (this.project_ && this.project_.isInitialized() && this.project_.match_mgr_.hasMatches()) {
                for (let one of this.project_.match_mgr_.getMatches()) {
                    let r1 = one.alliances.red.team_keys[0];
                    let r2 = one.alliances.red.team_keys[1];
                    let r3 = one.alliances.red.team_keys[2];
                    let b1 = one.alliances.blue.team_keys[0];
                    let b2 = one.alliances.blue.team_keys[1];
                    let b3 = one.alliances.blue.team_keys[2];
                    let obj = {
                        comp_level: one.comp_level,
                        set_number: one.set_number,
                        match_number: one.match_number,
                        played: (one.winning_alliance && one.winning_alliance.length > 0) ? true : false,
                        red1: scbase_1.SCBase.keyToTeamNumber(r1),
                        redtab1: this.project_.tablet_mgr_.findTabletForMatch(one.comp_level, one.set_number, one.match_number, scbase_1.SCBase.keyToTeamNumber(r1)),
                        redst1: this.project_.data_mgr_.hasMatchScoutingResult(one.comp_level, one.set_number, one.match_number, scbase_1.SCBase.keyToTeamNumber(r1)),
                        red2: scbase_1.SCBase.keyToTeamNumber(r2),
                        redtab2: this.project_.tablet_mgr_.findTabletForMatch(one.comp_level, one.set_number, one.match_number, scbase_1.SCBase.keyToTeamNumber(r2)),
                        redst2: this.project_.data_mgr_.hasMatchScoutingResult(one.comp_level, one.set_number, one.match_number, scbase_1.SCBase.keyToTeamNumber(r2)),
                        red3: scbase_1.SCBase.keyToTeamNumber(r3),
                        redtab3: this.project_.tablet_mgr_.findTabletForMatch(one.comp_level, one.set_number, one.match_number, scbase_1.SCBase.keyToTeamNumber(r3)),
                        redst3: this.project_.data_mgr_.hasMatchScoutingResult(one.comp_level, one.set_number, one.match_number, scbase_1.SCBase.keyToTeamNumber(r3)),
                        blue1: scbase_1.SCBase.keyToTeamNumber(b1),
                        bluetab1: this.project_.tablet_mgr_.findTabletForMatch(one.comp_level, one.set_number, one.match_number, scbase_1.SCBase.keyToTeamNumber(b1)),
                        bluest1: this.project_.data_mgr_.hasMatchScoutingResult(one.comp_level, one.set_number, one.match_number, scbase_1.SCBase.keyToTeamNumber(b1)),
                        blue2: scbase_1.SCBase.keyToTeamNumber(b2),
                        bluetab2: this.project_.tablet_mgr_.findTabletForMatch(one.comp_level, one.set_number, one.match_number, scbase_1.SCBase.keyToTeamNumber(b2)),
                        bluest2: this.project_.data_mgr_.hasMatchScoutingResult(one.comp_level, one.set_number, one.match_number, scbase_1.SCBase.keyToTeamNumber(b2)),
                        blue3: scbase_1.SCBase.keyToTeamNumber(b3),
                        bluetab3: this.project_.tablet_mgr_.findTabletForMatch(one.comp_level, one.set_number, one.match_number, scbase_1.SCBase.keyToTeamNumber(b3)),
                        bluest3: this.project_.data_mgr_.hasMatchScoutingResult(one.comp_level, one.set_number, one.match_number, scbase_1.SCBase.keyToTeamNumber(b3)),
                    };
                    ret.push(obj);
                }
                this.sendToRenderer('send-match-status', ret);
            }
        }
        catch (err) {
            let errobj = err;
            electron_1.dialog.showErrorBox('Error', 'Error retreiving match data - ' + errobj.message);
        }
    }
    sendTeamStatus() {
        let ret = [];
        if (this.project_ && this.project_.tablet_mgr_.hasTeamAssignments()) {
            for (let t of this.project_.tablet_mgr_.getTeamAssignments()) {
                let status = this.project_.data_mgr_.hasTeamScoutingResults(t.team)
                    ? 'Y'
                    : 'N';
                let team = this.project_.team_mgr_.findTeamByNumber(t.team);
                if (team) {
                    ret.push({
                        number: t.team,
                        status: status,
                        tablet: t.tablet,
                        teamname: team.nickname,
                    });
                }
            }
        }
        this.sendToRenderer('send-team-status', ret);
    }
    sendInfoData() {
        if (this.project_ && this.project_.isInitialized()) {
            let obj = {
                location_: this.project_.location,
                bakey_: this.project_.info.frcev_?.key,
                name_: this.project_.info.frcev_
                    ? this.project_.info.frcev_.name
                    : this.project_.info.name_,
                teamform_: this.project_.form_mgr_?.getTeamFormFullPath(),
                matchform_: this.project_.form_mgr_?.getMatchFormFullPath(),
                tablets_: this.project_.tablet_mgr_?.getTablets(),
                tablets_valid_: this.project_.tablet_mgr_.areTabletsValid(),
                teams_: this.project_.team_mgr_.getTeams(),
                matches_: this.project_.match_mgr_.getMatches(),
                locked_: this.project_.info?.locked_,
                uuid_: this.project_.info?.uuid_,
                importicon: this.getIconData('import.png'),
                createicon: this.getIconData('create.png'),
                editicon: this.getIconData('edit.png')
            };
            this.sendToRenderer('send-info-data', obj);
        }
    }
    sendFormulas() {
        this.sendToRenderer('send-formulas', this.project?.formula_mgr_?.formulas);
    }
    sendTeamFieldList() {
        this.sendToRenderer('send-team-field-list', this.project_.data_mgr_.teamColumnDescriptors);
    }
    sendMatchFieldList() {
        this.sendToRenderer('send-match-field-list', this.project_?.data_mgr_?.matchColumnDescriptors);
    }
    sendDataSets() {
        this.sendToRenderer('send-datasets', this.project_?.dataset_mgr_?.getDataSets());
    }
    setMatchColConfig(data) {
        this.project_?.data_mgr_?.setMatchColConfig(data);
    }
    setTeamColConfig(data) {
        this.project_?.data_mgr_?.setTeamColConfig(data);
    }
    sendMatchDB() {
        if (this.project_ && this.project_.match_mgr_.hasMatches()) {
            let cols = this.project_.data_mgr_?.matchColumnDescriptors;
            this.project_.data_mgr_.getAllMatchData()
                .then((data) => {
                let dataobj = {
                    column_configurations: this.project_.data_mgr_.getMatchColConfig(),
                    column_definitions: cols,
                    keycols: ['comp_level', 'set_number', 'match_number', 'team_key'],
                    data: this.convertDataForDisplay(data),
                };
                this.sendToRenderer('send-match-db', dataobj);
            })
                .catch((err) => {
                this.logger_.error('error getting data from database for send-match-db', err);
            });
        }
    }
    sendMatchData() {
        if (this.project_ && this.project_.isInitialized()) {
            this.sendMatchDataInternal(this.project_.match_mgr_.getMatches());
        }
    }
    sendTeamDB() {
        if (this.project_ && this.project_.team_mgr_.hasTeams()) {
            let cols = this.project_.data_mgr_?.teamColumnDescriptors;
            this.project_?.data_mgr_.getAllTeamData()
                .then((data) => {
                let dataobj = {
                    column_configurations: this.project_.data_mgr_.getTeamColConfig(),
                    column_definitions: cols,
                    keycols: ['team_number'],
                    data: this.convertDataForDisplay(data),
                };
                this.sendToRenderer('send-team-db', dataobj);
            })
                .catch((err) => {
                this.logger_.error('error getting data from database for send-team-db', err);
            });
        }
    }
    sendTeamData() {
        this.sendToRenderer('send-team-data', this.project_?.team_mgr_.getTeams());
    }
    sendForm(arg) {
        let ret = {};
        let filename;
        let title;
        let good = true;
        if (arg === 'team') {
            if (this.project_ && this.project_.isInitialized() && this.project_.form_mgr_.hasForms()) {
                filename = this.project_.form_mgr_.getTeamFormFullPath();
                ret.title = 'Team Form';
            }
            else {
                good = false;
                ret.message = 'No team form has been defined yet.';
            }
        }
        else if (arg === 'match') {
            if (this.project_ && this.project_.isInitialized() && this.project_.form_mgr_.hasForms()) {
                filename = this.project_.form_mgr_.getMatchFormFullPath();
                ret.title = 'Match Form';
            }
            else {
                good = false;
                ret.message = 'No match form has been defined yet.';
            }
        }
        else {
            good = false;
            ret.message = 'Internal request for invalid form type';
        }
        if (good) {
            let jsonobj = this.project.form_mgr_.getForm(arg);
            if (jsonobj instanceof Error) {
                let errobj = jsonobj;
                ret.message = errobj.message;
            }
            else if (!jsonobj) {
                ret.message = `No ${arg} form has been set`;
            }
            else {
                ret.form = jsonobj;
                ret.color = this.color_;
                ret.reversed = this.reversed_;
                this.sendToRenderer('send-form', ret);
            }
        }
        else {
            ret.message = `No ${arg} form has been set`;
        }
    }
    doExportData(table) {
        if (!this.project_ || !this.project_.isInitialized()) {
            electron_1.dialog.showErrorBox('Export Data', 'No event has been loaded - cannot export data');
            return;
        }
        var fpath = electron_1.dialog.showSaveDialog({
            title: 'Select CSV Output File',
            message: 'Select file for CSV output for table "' + table + '"',
            filters: [
                {
                    extensions: ['csv'],
                    name: 'CSV File',
                },
            ],
            properties: ['showOverwriteConfirmation'],
        });
        fpath.then((pathname) => {
            if (!pathname.canceled) {
                this.project_.data_mgr_.exportToCSV(pathname.filePath, table);
            }
        });
    }
    sendMatchDataInternal(matches) {
        let data = [];
        if (matches) {
            for (let t of matches) {
                let d = {
                    comp_level: t.comp_level,
                    set_number: t.set_number,
                    match_number: t.match_number,
                    red1: scbase_1.SCBase.keyToTeamNumber(t.alliances.red.team_keys[0]),
                    red2: scbase_1.SCBase.keyToTeamNumber(t.alliances.red.team_keys[1]),
                    red3: scbase_1.SCBase.keyToTeamNumber(t.alliances.red.team_keys[2]),
                    blue1: scbase_1.SCBase.keyToTeamNumber(t.alliances.blue.team_keys[0]),
                    blue2: scbase_1.SCBase.keyToTeamNumber(t.alliances.blue.team_keys[1]),
                    blue3: scbase_1.SCBase.keyToTeamNumber(t.alliances.blue.team_keys[2]),
                };
                data.push(d);
            }
        }
        this.sendToRenderer('send-match-data', data, this.project_?.team_mgr_.getTeams());
    }
    convertDataForDisplay(data) {
        let ret = [];
        for (let d of data) {
            let obj = {};
            for (let key of d.keys()) {
                let value = d.value(key);
                obj[key] = value;
            }
            ret.push(obj);
        }
        return ret;
    }
    getTeamNumbersFromKeys(keys) {
        let ret = [];
        for (let key of keys) {
            let teamnum = scbase_1.SCBase.keyToTeamNumber(key);
            ret.push(teamnum);
        }
        return ret;
    }
    // Implementation of abstract promptString method - Coach app does not support user prompts
    async promptString(title, message, defaultValue, placeholder) {
        // Coach app does not support user input prompts, always return undefined
        return Promise.resolve(undefined);
    }
}
exports.SCCoachCentralBaseApp = SCCoachCentralBaseApp;
//# sourceMappingURL=sccoachcentralbase.js.map