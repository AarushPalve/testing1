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
exports.SCScout = exports.SCScoutInfo = void 0;
const path = __importStar(require("path"));
const fs = __importStar(require("fs"));
const electron_1 = require("electron");
const scbase_1 = require("./scbase");
const tcpclient_1 = require("../sync/tcpclient");
const packetobj_1 = require("../sync/packetobj");
const packettypes_1 = require("../sync/packettypes");
const tabletmgr_1 = require("../project/tabletmgr");
const playoffs_1 = require("../../shared/playoffs");
class SCScoutInfo {
    constructor() {
        this.results_ = [];
    }
}
exports.SCScoutInfo = SCScoutInfo;
class SCScout extends scbase_1.SCBase {
    constructor(win, args) {
        super(win, 'scout');
        this.info_ = new SCScoutInfo();
        this.reversed_ = false;
        this.show_teams_ = false;
        this.show_full_team_names_ = false;
        this.ipaddr_ = '';
        this.port_ = 0;
        this.team_number_ = 1425;
        this.match_results_received_ = false;
        this.team_results_received_ = false;
        this.playoff_assignment_received_ = false;
        this.playoff_status_received_ = false;
        this.checkLastEvent();
        if (this.hasSetting(SCScout.showTeams)) {
            this.show_teams_ = this.getSetting(SCScout.showTeams);
        }
        if (this.hasSetting(SCScout.showFullTeamNames)) {
            this.show_full_team_names_ = this.getSetting(SCScout.showFullTeamNames);
        }
    }
    get applicationType() {
        return 'scout';
    }
    basePage() {
        return "content/main.html";
    }
    canQuit() {
        return true;
    }
    close() {
    }
    sendNavData() {
        let treedata = [];
        if (this.info_.purpose_) {
            let navstuff;
            if (this.info_.purpose_ === 'team' && this.info_.teamlist_) {
                navstuff = this.populateNavTeams();
            }
            else {
                navstuff = this.populateNavMatches();
            }
            treedata = [...treedata, ...navstuff];
        }
        this.sendToRenderer('send-nav-data', treedata);
    }
    ready() {
        this.setViewString();
    }
    windowCreated() {
        this.win_.on('ready-to-show', this.ready.bind(this));
    }
    populateNavTeams() {
        let ret = [];
        for (let t of this.info_.teamlist_) {
            if (t.tablet === this.info_.tablet_) {
                let title = "Team: " + t.team;
                if (this.show_teams_) {
                    title += ' (' + t.name + ')';
                }
                let teamName = undefined;
                if (this.show_full_team_names_) {
                    teamName = t.name.length > 64 ? t.name.substring(0, 61) + "..." : t.name;
                }
                ret.push({ type: 'item', command: 'st-' + t.team, title: title, number: t.team, teamName: teamName });
            }
        }
        ret.sort((a, b) => {
            if (a.number < b.number) {
                return -1;
            }
            else if (a.number > b.number) {
                return 1;
            }
            return 0;
        });
        return ret;
    }
    areAlliancesValid() {
        if (!this.info_.playoff_status_ || !this.info_.playoff_status_.alliances) {
            return false;
        }
        let alliances = this.info_.playoff_status_.alliances;
        if (!Array.isArray(alliances) || alliances.length !== 8) {
            return false;
        }
        for (let all of alliances) {
            if (!all || !all.teams || !Array.isArray(all.teams) || all.teams.length !== 3) {
                return false;
            }
            if (!all.teams[0] || !all.teams[1] || !all.teams[2]) {
                return false;
            }
        }
        return true;
    }
    populateNavMatches() {
        let ret = [];
        let ofinterest = [];
        for (let t of this.info_.matchlist_) {
            if (t.tablet === this.info_.tablet_) {
                ofinterest.push(t);
            }
        }
        ofinterest.sort((a, b) => { return this.sortCompFun(a, b); });
        if (this.areAlliancesValid()) {
            ret.push({
                type: 'item',
                command: SCScout.viewPlayoffs,
                title: 'View Playoffs'
            });
        }
        for (let t of ofinterest) {
            let mtype = t.comp_level;
            let cmd = 'sm-' + t.comp_level + '-' + t.set_number + '-' + t.match_number + '-' + t.teamnumber;
            let title;
            title = mtype.toUpperCase() + '-' + t.match_number + ' - ' + t.set_number + '-' + t.teamnumber;
            if (this.show_teams_) {
                title += ' (' + t.teamname + ')';
            }
            let teamName = undefined;
            if (this.show_full_team_names_) {
                teamName = t.teamname.length > 64 ? t.teamname.substring(0, 61) + "..." : t.teamname;
            }
            ret.push({ type: 'item', command: cmd, title: title, teamName: teamName });
        }
        return ret;
    }
    syncError(err) {
        electron_1.dialog.showMessageBoxSync(this.win_, {
            title: 'Synchronization Error',
            message: 'Error synchronizing - ' + err.message,
        });
        this.sync_client_ = undefined;
    }
    syncDone() {
        this.sync_client_ = undefined;
    }
    optionallyGetResults() {
        if (this.current_scout_) {
            return this.getCurrentResults();
        }
        else {
            return Promise.resolve();
        }
    }
    executeCommand(cmd) {
        this.optionallyGetResults()
            .then(() => {
            this.executeCommandInternal(cmd);
        })
            .catch((err) => {
            this.logger_.error('cannot get results before command', err);
        });
    }
    executeCommandInternal(cmd) {
        if (cmd === SCScout.syncEventLocal) {
            this.setViewString();
            this.current_scout_ = undefined;
            this.sync_client_ = new tcpclient_1.TCPClient(this.logger_, '127.0.0.1');
            this.sync_client_.on('close', this.syncDone.bind(this));
            this.sync_client_.on('error', this.syncError.bind(this));
            this.match_results_received_ = false;
            this.team_results_received_ = false;
            this.syncClient(this.sync_client_);
        }
        else if (cmd === SCScout.syncEventRemote) {
            this.setViewString();
            this.current_scout_ = undefined;
            this.sync_client_ = new tcpclient_1.TCPClient(this.logger_, '192.168.1.1');
            this.sync_client_.on('close', this.syncDone.bind(this));
            this.sync_client_.on('error', this.syncError.bind(this));
            this.match_results_received_ = false;
            this.team_results_received_ = false;
            this.syncClient(this.sync_client_);
        }
        else if (cmd === SCScout.syncEventWiFi) {
            this.setViewString();
            this.current_scout_ = undefined;
            this.sync_client_ = new tcpclient_1.TCPClient(this.logger_, this.ipaddr_, this.port_);
            this.sync_client_.on('close', this.syncDone.bind(this));
            this.sync_client_.on('error', this.syncError.bind(this));
            this.match_results_received_ = false;
            this.team_results_received_ = false;
            this.syncClient(this.sync_client_);
        }
        else if (cmd === SCScout.syncEventIPAddr) {
            this.setView('sync-ipaddr');
        }
        else if (cmd === SCScout.resetTablet) {
            this.resetTabletCmd();
        }
        else if (cmd === SCScout.resizeWindow) {
            this.sendToRenderer('resize-window');
        }
        else if (cmd === SCScout.showTeams) {
            this.show_teams_ = !this.show_teams_;
            if (this.show_teams_item_) {
                this.show_teams_item_.checked = this.show_teams_;
            }
            this.setSetting(SCScout.showTeams, this.show_teams_);
            this.sendNavData();
        }
        else if (cmd === SCScout.showFullTeamNames) {
            this.show_full_team_names_ = !this.show_full_team_names_;
            if (this.show_full_team_names_item_) {
                this.show_full_team_names_item_.checked = this.show_full_team_names_;
            }
            this.setSetting(SCScout.showFullTeamNames, this.show_full_team_names_);
            this.sendNavData();
        }
        else if (cmd === SCScout.reverseImage) {
            this.reverseImage();
        }
        else if (cmd === SCScout.viewPlayoffs) {
            this.setView('playoffs', this.info_.playoff_status_);
        }
        else if (cmd.startsWith('st-')) {
            this.scoutTeam(cmd);
        }
        else if (cmd.startsWith('sm-')) {
            this.scoutMatch(cmd);
        }
    }
    syncIPAddrWithAddr(ipaddr, port) {
        this.setViewString();
        this.current_scout_ = undefined;
        this.sync_client_ = new tcpclient_1.TCPClient(this.logger_, ipaddr, port);
        this.sync_client_.on('close', this.syncDone.bind(this));
        this.sync_client_.on('error', this.syncError.bind(this));
        this.match_results_received_ = false;
        this.team_results_received_ = false;
        this.syncClient(this.sync_client_);
    }
    resetTabletCmd() {
        let ans = electron_1.dialog.showMessageBoxSync({
            title: 'Reset Tablet',
            type: 'question',
            buttons: ['Yes', 'No'],
            message: `This operation will reset the tablet and all data will be lost unless you have sync'ed with the central server.\nDo you want to continue?`,
        });
        if (ans === 1) {
            return;
        }
        this.unsetSettings(SCScout.last_event_setting);
        this.info_.purpose_ = undefined;
        this.info_.tablet_ = undefined;
        this.info_.results_ = [];
        this.info_.uuid_ = undefined;
        this.info_.evname_ = undefined;
        this.info_.teamform_ = undefined;
        this.info_.matchform_ = undefined;
        this.info_.teamlist_ = undefined;
        this.info_.matchlist_ = undefined;
        this.info_.playoff_assignments_ = undefined;
        this.info_.playoff_status_ = undefined;
        this.sendToRenderer('tablet-title', 'NOT ASSIGNED');
        this.sendNavData();
        this.setView('empty');
        this.image_mgr_.removeAllImages();
    }
    scoutTeam(team, force = false) {
        this.optionallyGetResults()
            .then(() => {
            //
            // About to scout a new team, be sure that is what we want to do.
            //
            let data = this.getOneScoutResults(team);
            if (!data) {
                let ans = electron_1.dialog.showMessageBoxSync({
                    title: 'Scout New Team?',
                    type: 'warning',
                    buttons: ['Yes', 'No'],
                    message: 'You are about to scout a new team.  Do you want to continue?',
                });
                if (ans === 1) {
                    this.sendToRenderer('send-nav-highlight', undefined);
                    this.setViewString();
                    return;
                }
            }
            this.sendToRenderer('send-nav-highlight', team);
            this.current_scout_ = team;
            this.setView('form-scout', 'team');
        })
            .catch((err) => {
            this.logger_.error('cannot get results before scouting team', err);
        });
    }
    scoutMatch(match, force = false) {
        this.optionallyGetResults()
            .then(() => {
            this.alliance_ = this.getAllianceFromMatch(match);
            if (!this.alliance_) {
                electron_1.dialog.showMessageBox(this.win_, {
                    title: 'Internal Error',
                    message: 'Internal Error - no alliance from match'
                });
            }
            else {
                //
                // About to scout a new match, be sure that is what we want to do.
                //
                let data = this.getOneScoutResults(match);
                if (!data) {
                    let ans = electron_1.dialog.showMessageBoxSync({
                        title: 'Scout New Team?',
                        type: 'warning',
                        buttons: ['Yes', 'No'],
                        message: 'You are about to scout a new team.  Do you want to continue?',
                    });
                    if (ans === 1) {
                        this.sendToRenderer('send-nav-highlight', undefined);
                        this.setViewString();
                        return;
                    }
                }
                this.sendToRenderer('send-nav-highlight', match);
                this.current_scout_ = match;
                this.setView('form-scout', 'match');
            }
        })
            .catch((err) => {
            this.logger_.error('cannot get results before scouting match', err);
        });
    }
    getAllianceFromMatch(match) {
        let ret;
        for (let m of this.info_.matchlist_) {
            let cmd = 'sm-' + m.comp_level + '-' + m.set_number + '-' + m.match_number + '-' + m.teamnumber;
            if (cmd === match) {
                ret = m.alliance;
                break;
            }
        }
        return ret;
    }
    filterResults(res) {
        let ret = [];
        for (let r of res) {
            if (r.value !== undefined) {
                ret.push(r);
            }
        }
        return ret;
    }
    provideResults(res) {
        this.addResults(this.current_scout_, this.filterResults(res));
        this.writeEventFile();
        this.logger_.silly('provideResults:' + this.current_scout_, res);
        if (this.resultPromiseResolve_) {
            // If there is a promise waiting for results, resolve it now.
            this.resultPromiseResolve_();
            this.resultPromiseResolve_ = undefined;
        }
    }
    sendForm(type) {
        if (this.current_scout_ === undefined) {
            throw new Error('No current scout set - cannot send form');
        }
        let good = true;
        let ret = {
            message: undefined,
            reversed: this.reversed_,
            color: this.alliance_,
            title: this.current_scout_,
        };
        if (type === 'team') {
            ret.form = this.info_.teamform_;
        }
        else if (type === 'match') {
            ret.form = this.info_.matchform_;
        }
        else {
            ret.message = 'Invalid form type requested';
            good = false;
        }
        if (good) {
            this.sendToRenderer('send-form', ret);
            let data = this.getOneScoutResults(this.current_scout_);
            if (data) {
                console.log('send-initial-values: ' + JSON.stringify(data.data));
                this.sendToRenderer('send-initial-values', data.data);
            }
        }
    }
    sendImageData(image) {
        this.sendToRenderer('send-image-data', { name: image, data: this.getImageData(image) });
    }
    sendMatchForm() {
        let ret = {
            formjson: null,
            title: "",
            errormsg: "",
        };
        if (this.info_.matchform_) {
            ret.formjson = this.info_.matchform_;
            if (this.current_scout_) {
                ret.title = this.current_scout_;
            }
            else {
                ret.title = 'UNKNOWN';
            }
            this.sendToRenderer('send-match-form', ret);
        }
        let data = this.getOneScoutResults(this.current_scout_);
        this.logger_.silly('sendTeamForm/send-result-values: ' + this.current_scout_, data);
        if (data) {
            this.sendToRenderer('send-result-values', data);
        }
    }
    getOneScoutResults(scout) {
        for (let result of this.info_.results_) {
            if (result.item === scout) {
                return result;
            }
        }
        return undefined;
    }
    deleteResults(scout) {
        for (let i = 0; i < this.info_.results_.length; i++) {
            if (this.info_.results_[i].item && this.info_.results_[i].item === scout) {
                this.info_.results_.splice(i, 1);
                break;
            }
        }
    }
    addResults(scout, result) {
        let resobj = {
            item: scout,
            data: result
        };
        //
        // Optionally delete result if it already exists, we are providing new data.
        //
        this.deleteResults(scout);
        this.info_.results_.push(resobj);
    }
    getCurrentResults() {
        let ret = new Promise((resolve, reject) => {
            this.resultPromiseResolve_ = resolve;
            this.sendToRenderer('request-results');
        });
        return ret;
    }
    syncClient(conn) {
        this.optionallyGetResults()
            .then(() => {
            this.match_results_received_ = false;
            this.team_results_received_ = false;
            this.playoff_assignment_received_ = false;
            this.playoff_status_received_ = false;
            this.conn_ = conn;
            conn.connect()
                .then(async () => {
                this.logger_.info(`ScouterSync: connected to server ' ${conn.name()}'`);
                let data = new Uint8Array(0);
                if (this.info_.tablet_ && this.info_.purpose_) {
                    let obj = {
                        name: this.info_.tablet_,
                        purpose: this.info_.purpose_
                    };
                    data = Buffer.from(JSON.stringify(obj));
                }
                this.conn_.on('close', () => {
                    this.conn_ = undefined;
                });
                let p = new packetobj_1.PacketObj(packettypes_1.PacketType.HelloFromScouter, data);
                this.conn_.on('error', (err) => {
                    let msg = "";
                    let a = err;
                    if (a.errors) {
                        for (let cerror of a.errors) {
                            this.logger_.info('ScouterSync: error from connection \'' + conn.name() + '\' - ' + cerror.message);
                            msg += cerror.message + '\n';
                        }
                    }
                    else {
                        this.logger_.info('ScouterSync: error from connection \'' + conn.name() + '\' - ' + err.message);
                        msg = err.message;
                    }
                    this.sendToRenderer('set-status-title', 'Error Connecting To XeroScout Central');
                    this.sendToRenderer('set-status-visible', true);
                    this.sendToRenderer('set-status-text', msg);
                    this.sendToRenderer('set-status-close-button-visible', true);
                });
                this.conn_.on('packet', (p) => {
                    this.syncTablet(p);
                });
                await this.conn_.send(p);
            })
                .catch((err) => {
                this.logger_.error('cannot connect to central', err);
            });
        })
            .catch((err) => {
            this.logger_.error('cannot get results before sync', err);
        });
    }
    uuidToFileName(uuid) {
        return uuid;
    }
    syncTablet(p) {
        let ret = true;
        if (p.type_ === packettypes_1.PacketType.HelloFromScouter) {
            let obj;
            try {
                obj = JSON.parse(p.payloadAsString());
                if (this.info_.uuid_ && obj.uuid !== this.info_.uuid_) {
                    //
                    // We have an event loaded and it does not match
                    //
                    this.sendToRenderer('set-status-title', 'Error Connecting To XeroScout Central');
                    this.sendToRenderer('set-status-visible', true);
                    this.sendToRenderer('set-status-text', 'The loaded event does not match event being synced - reset the tablet to sync to this new event.');
                    this.sendToRenderer('set-status-close-button-visible', true);
                    this.conn_.close();
                    return;
                }
                if (this.info_.tablet_) {
                    //
                    // The current tablet already has an identity.  See if we are missing things ...
                    //
                    this.getMissingData();
                    if (!this.info_.evname_) {
                        this.info_.evname_ = obj.name;
                    }
                }
                else {
                    this.info_.uuid_ = obj.uuid;
                    this.info_.evname_ = obj.name;
                    let p = new packetobj_1.PacketObj(packettypes_1.PacketType.RequestTablets);
                    this.conn_.send(p);
                }
            }
            catch (err) {
            }
        }
        else if (p.type_ === packettypes_1.PacketType.ProvideTablets) {
            this.tablets_ = JSON.parse(p.data_.toString());
            this.setView('select-tablet');
        }
        else if (p.type_ === packettypes_1.PacketType.ProvideTeamForm) {
            this.info_.teamform_ = JSON.parse(p.payloadAsString());
            this.writeEventFile();
            ret = this.getMissingData();
        }
        else if (p.type_ === packettypes_1.PacketType.ProvideMatchForm) {
            this.info_.matchform_ = JSON.parse(p.payloadAsString());
            this.writeEventFile();
            ret = this.getMissingData();
        }
        else if (p.type_ === packettypes_1.PacketType.ProvideTeamList) {
            this.info_.teamlist_ = JSON.parse(p.payloadAsString());
            this.writeEventFile();
            ret = this.getMissingData();
        }
        else if (p.type_ === packettypes_1.PacketType.ProvidePlayoffAssignments) {
            let obj = JSON.parse(p.payloadAsString());
            if (obj !== null) {
                this.info_.playoff_assignments_ = obj;
                this.writeEventFile();
                this.checkPlayoffMatchGeneration();
            }
            this.playoff_assignment_received_ = true;
            this.getMissingData();
        }
        else if (p.type_ === packettypes_1.PacketType.ProvidePlayoffStatus) {
            let obj = JSON.parse(p.payloadAsString());
            if (obj !== null) {
                this.info_.playoff_status_ = obj;
                this.writeEventFile();
                this.checkPlayoffMatchGeneration();
            }
            this.playoff_status_received_ = true;
            this.getMissingData();
        }
        else if (p.type_ === packettypes_1.PacketType.ProvideMatchList) {
            this.info_.matchlist_ = JSON.parse(p.payloadAsString());
            this.writeEventFile();
            ret = this.getMissingData();
        }
        else if (p.type_ === packettypes_1.PacketType.ProvideImages) {
            let obj = JSON.parse(p.payloadAsString());
            for (let imname of Object.keys(obj)) {
                let imdata = obj[imname];
                this.image_mgr_.addImageWithData(imname, imdata);
            }
            ret = this.getMissingData();
        }
        else if (p.type_ === packettypes_1.PacketType.ProvideMatchResults) {
            if (this.info_.purpose_ === 'match') {
                let obj = JSON.parse(p.payloadAsString());
                for (let res of obj) {
                    if (!this.getOneScoutResults(res.item)) {
                        this.addResults(res.item, res.data);
                    }
                }
            }
            this.match_results_received_ = true;
            this.writeEventFile();
            ret = this.getMissingData();
        }
        else if (p.type_ === packettypes_1.PacketType.ProvideTeamResults) {
            if (this.info_.purpose_ === 'team') {
                let obj = JSON.parse(p.payloadAsString());
                for (let res of obj) {
                    if (!this.getOneScoutResults(res.item)) {
                        this.addResults(res.item, res.data);
                    }
                }
            }
            this.team_results_received_ = true;
            this.writeEventFile();
            ret = this.getMissingData();
        }
        else if (p.type_ === packettypes_1.PacketType.GoodbyeFromScouter) {
            this.conn_?.close();
        }
        else if (p.type_ === packettypes_1.PacketType.ReceivedResults) {
            this.conn_?.send(new packetobj_1.PacketObj(packettypes_1.PacketType.GoodbyeFromScouter, Buffer.from(this.info_.tablet_)));
            this.conn_?.close();
        }
        else if (p.type_ === packettypes_1.PacketType.Error) {
            this.sendToRenderer('set-status-title', 'Error Syncing With XeroScout Central');
            this.sendToRenderer('set-status-visible', true);
            this.sendToRenderer('set-status-text', p.payloadAsString());
            this.sendToRenderer('set-status-close-button-visible', true);
        }
    }
    sendScoutingData() {
        let obj = {
            tablet: this.info_.tablet_,
            purpose: this.info_.purpose_,
            results: this.info_.results_
        };
        let jsonstr = JSON.stringify(obj);
        let buffer = Buffer.from(jsonstr);
        let jsonstr2 = buffer.toString();
        this.conn_?.send(new packetobj_1.PacketObj(packettypes_1.PacketType.ProvideResults, Buffer.from(jsonstr)));
    }
    needMatchResults() {
        let ret = [];
        for (let m of this.info_.matchlist_) {
            let cmd = 'sm-' + m.comp_level + '-' + m.set_number + '-' + m.match_number + '-' + m.teamnumber;
            if (this.info_.results_) {
                let res = this.getOneScoutResults(cmd);
                if (!res) {
                    ret.push(cmd);
                }
            }
        }
        return ret;
    }
    needTeamResults() {
        let ret = [];
        for (let t of this.info_.teamlist_) {
            let cmd = 'st-' + t.team;
            if (this.info_.results_) {
                let res = this.getOneScoutResults(cmd);
                if (!res) {
                    ret.push(cmd);
                }
            }
        }
        return ret;
    }
    getRequiredImagesFromSection(section) {
        let ret = [];
        for (let item of section.items) {
            if (item.type === 'image') {
                let imitem = item;
                ret.push(imitem.image);
            }
        }
        return [...new Set(ret)];
    }
    getRequiredImagesFromForm(form) {
        let ret = [];
        for (let section of form.sections) {
            ret = [...ret, ...this.getRequiredImagesFromSection(section)];
        }
        return ret;
    }
    needImages() {
        let images = [
            ...this.getRequiredImagesFromForm(this.info_.teamform_),
            ...this.getRequiredImagesFromForm(this.info_.matchform_)
        ];
        let imlist = [...new Set(images)];
        let ret = [];
        for (let im of imlist) {
            if (!this.image_mgr_.hasImage(im)) {
                ret.push(im);
            }
        }
        return ret;
    }
    getMissingData() {
        let ret = false;
        if (!this.info_.teamform_) {
            this.conn_?.send(new packetobj_1.PacketObj(packettypes_1.PacketType.RequestTeamForm));
            ret = true;
        }
        else if (!this.info_.matchform_) {
            this.conn_?.send(new packetobj_1.PacketObj(packettypes_1.PacketType.RequestMatchForm));
            ret = true;
        }
        else if (!this.info_.matchlist_) {
            this.conn_?.send(new packetobj_1.PacketObj(packettypes_1.PacketType.RequestMatchList));
            ret = true;
        }
        else if (!this.info_.teamlist_) {
            this.conn_?.send(new packetobj_1.PacketObj(packettypes_1.PacketType.RequestTeamList));
            ret = true;
        }
        else if (!this.match_results_received_ && this.needMatchResults().length > 0) {
            this.conn_?.send(new packetobj_1.PacketObj(packettypes_1.PacketType.RequestMatchResults, Buffer.from(JSON.stringify(this.needMatchResults()))));
            ret = true;
        }
        else if (!this.team_results_received_ && this.needTeamResults().length > 0) {
            this.conn_?.send(new packetobj_1.PacketObj(packettypes_1.PacketType.RequestTeamResults, Buffer.from(JSON.stringify(this.needTeamResults()))));
            ret = true;
        }
        else if (this.needImages().length > 0) {
            this.conn_?.send(new packetobj_1.PacketObj(packettypes_1.PacketType.RequestImages, Buffer.from(JSON.stringify(this.needImages()))));
            ret = true;
        }
        else if (!this.info_.playoff_assignments_ && !this.playoff_assignment_received_) {
            this.conn_?.send(new packetobj_1.PacketObj(packettypes_1.PacketType.RequestPlayoffAssignments));
            ret = true;
        }
        else if (!this.playoff_status_received_) {
            this.conn_?.send(new packetobj_1.PacketObj(packettypes_1.PacketType.RequestPlayoffStatus));
            ret = true;
        }
        if (!ret) {
            this.checkPlayoffMatchGeneration();
            this.sendNavData();
            this.setViewString();
            this.sendScoutingData();
        }
        return ret;
    }
    mainWindowLoaded() {
        this.appInit();
        this.setViewString();
        let v = this.getVersion('application');
        this.sendToRenderer('send-app-status', {
            left: `Xero Scouter ${this.versionToString(v)}`,
            middle: this.info_.evname_ ? this.info_.evname_ : 'No Event Loaded',
            right: this.info_.uuid_ ? this.info_.uuid_ : ''
        });
    }
    setViewString() {
        if (this.info_.uuid_) {
            this.sendToRenderer('tablet-title', this.info_.tablet_);
        }
        else {
            this.setView('text', 'No Event Loaded');
        }
    }
    reverseImage() {
        this.reversed_ = this.reverseImage_.checked;
        this.current_scout_ = undefined;
        if (this.info_.uuid_) {
            this.setViewString();
        }
        else {
            this.setView('empty');
        }
    }
    createMenu() {
        let ret = new electron_1.Menu();
        let filemenu = new electron_1.MenuItem({
            type: 'submenu',
            label: 'File',
            role: 'fileMenu'
        });
        let synctcpitem = new electron_1.MenuItem({
            type: 'normal',
            label: 'Sync Event Local (127.0.0.1)',
            click: () => { this.executeCommand(SCScout.syncEventLocal); }
        });
        filemenu.submenu?.insert(0, synctcpitem);
        synctcpitem = new electron_1.MenuItem({
            type: 'normal',
            label: 'Sync Event Cable (192.168.1.1)',
            click: () => { this.executeCommand(SCScout.syncEventRemote); }
        });
        filemenu.submenu?.insert(1, synctcpitem);
        synctcpitem = new electron_1.MenuItem({
            type: 'normal',
            label: 'Sync Event WiFi (mDNS)',
            click: () => { this.executeCommand(SCScout.syncEventWiFi); }
        });
        filemenu.submenu?.insert(2, synctcpitem);
        synctcpitem = new electron_1.MenuItem({
            type: 'normal',
            label: 'Sync Event IP Address (Manual)',
            click: () => { this.executeCommand(SCScout.syncEventIPAddr); }
        });
        filemenu.submenu?.insert(3, synctcpitem);
        filemenu.submenu?.insert(4, new electron_1.MenuItem({ type: 'separator' }));
        ret.append(filemenu);
        let resetmenu = new electron_1.MenuItem({
            type: 'submenu',
            label: 'Reset',
            submenu: new electron_1.Menu()
        });
        let resetitem = new electron_1.MenuItem({
            type: 'normal',
            label: 'Reset Tablet',
            click: () => { this.executeCommand(SCScout.resetTablet); }
        });
        resetmenu.submenu?.insert(0, resetitem);
        ret.append(resetmenu);
        let optionmenu = new electron_1.MenuItem({
            type: 'submenu',
            label: 'Options',
            submenu: new electron_1.Menu()
        });
        this.reverseImage_ = new electron_1.MenuItem({
            type: 'checkbox',
            label: 'Reverse',
            checked: false,
            click: () => { this.executeCommand(SCScout.reverseImage); }
        });
        optionmenu.submenu.append(this.reverseImage_);
        ret.append(optionmenu);
        let viewmenu = new electron_1.MenuItem({
            type: 'submenu',
            role: 'viewMenu'
        });
        viewmenu.submenu?.append(new electron_1.MenuItem({ type: 'separator' }));
        viewmenu.submenu?.append(new electron_1.MenuItem({
            type: 'normal',
            label: 'Resize Window',
            click: () => { this.executeCommand(SCScout.resizeWindow); }
        }));
        this.show_teams_item_ = new electron_1.MenuItem({
            type: 'checkbox',
            label: 'Show Teams',
            click: () => { this.executeCommand(SCScout.showTeams); }
        });
        if (this.show_teams_) {
            this.show_teams_item_.checked = true;
        }
        viewmenu.submenu?.append(this.show_teams_item_);
        viewmenu.submenu?.append(new electron_1.MenuItem({ type: 'separator' }));
        this.show_full_team_names_item_ = new electron_1.MenuItem({
            type: 'checkbox',
            label: 'Show Full Team Names',
            click: () => { this.executeCommand(SCScout.showFullTeamNames); }
        });
        if (this.show_full_team_names_) {
            this.show_full_team_names_item_.checked = true;
        }
        viewmenu.submenu?.append(this.show_full_team_names_item_);
        ret.append(viewmenu);
        let helpmenu = new electron_1.MenuItem({
            type: 'submenu',
            label: 'Help',
            submenu: new electron_1.Menu(),
        });
        let aboutitem = new electron_1.MenuItem({
            type: 'normal',
            label: 'About',
            click: () => { this.showAbout(); }
        });
        helpmenu.submenu?.append(aboutitem);
        ret.append(helpmenu);
        return ret;
    }
    sendTabletData() {
        if (this.tablets_) {
            this.sendToRenderer('send-tablet-data', this.tablets_);
        }
    }
    setTabletNamePurpose(name, purpose) {
        this.tablets_ = undefined;
        this.info_.tablet_ = name;
        this.info_.purpose_ = purpose;
        this.sendToRenderer('tablet-title', this.info_.tablet_);
        this.writeEventFile();
        this.getMissingData();
    }
    checkLastEvent() {
        if (this.hasSetting(SCScout.last_event_setting)) {
            try {
                let fname = this.getSetting(SCScout.last_event_setting);
                let fullpath = path.join(this.appdir_, fname);
                this.readEventFile(fullpath);
            }
            catch (err) {
                let errobj = err;
                electron_1.dialog.showMessageBoxSync(this.win_, {
                    title: 'Error starting scout computer',
                    message: 'Error reading default event - this tablet has been reset.\nError: ' + errobj.message
                });
                this.resetTabletCmd();
            }
        }
    }
    readEventFile(fullpath) {
        let ret = undefined;
        const rawData = fs.readFileSync(fullpath, 'utf-8');
        this.info_ = JSON.parse(rawData);
        return ret;
    }
    writeEventFile() {
        let ret;
        let filename = this.uuidToFileName(this.info_.uuid_);
        this.setSetting(SCScout.last_event_setting, filename);
        const jsonString = JSON.stringify(this.info_);
        let projfile = path.join(this.appdir_, filename);
        fs.writeFile(projfile, jsonString, (err) => {
            if (err) {
                this.unsetSettings(SCScout.last_event_setting);
                fs.rmSync(projfile);
                ret = err;
            }
        });
        return ret;
    }
    target2Alliance(target) {
        let ret = target;
        if (target.startsWith('a')) {
            ret = target.substring(1);
        }
        else if (target.startsWith('l') || target.startsWith('w')) {
            let match = +target.substring(1);
            if (this.info_.playoff_status_ && this.info_.playoff_status_.outcomes) {
                let outcome = this.info_.playoff_status_.outcomes["m" + match.toString()];
                if (outcome) {
                    if (target.startsWith('l')) {
                        ret = outcome.loser.toString();
                    }
                    else if (target.startsWith('w')) {
                        ret = outcome.winner.toString();
                    }
                }
            }
        }
        if (/^a-zA-Z.*/.test(ret)) {
            return undefined;
        }
        ;
        return +ret;
    }
    findPlayoffMatchAssignment(match) {
        for (let a of this.info_.playoff_assignments_) {
            if (a.match === match && a.tablet === this.info_.tablet_) {
                return a;
            }
        }
        return undefined;
    }
    findMatchInList(match) {
        for (let m of this.info_.matchlist_) {
            if (m.comp_level === 'sf' && m.set_number === match && m.match_number === 1 && m.tablet === this.info_.tablet_) {
                return m;
            }
            if (m.comp_level === 'f' && m.set_number === 1 && m.match_number === match - 13 && m.tablet === this.info_.tablet_) {
                return m;
            }
        }
        return undefined;
    }
    findTeam(alliance, target) {
        if (this.info_.playoff_status_ && this.info_.playoff_status_.alliances) {
            if (Array.isArray(this.info_.playoff_status_.alliances) && this.info_.playoff_status_.alliances.length > alliance - 1) {
                let allianceData = this.info_.playoff_status_.alliances[alliance - 1];
                if (allianceData && Array.isArray(allianceData.teams) && allianceData.teams.length > target) {
                    return allianceData.teams[target];
                }
            }
        }
        return undefined;
    }
    createMatchFromAlliance(match, ralliance, balliance) {
        let a = this.findPlayoffMatchAssignment(match);
        if (!a) {
            // No assignment for this match, nothing to do.
            return;
        }
        if (this.findMatchInList(match)) {
            // It's already in the list, no need to create it.
            return;
        }
        let team = this.findTeam(a.alliance === 'red' ? ralliance : balliance, a.which);
        if (!team) {
            return;
        }
        let mtype = (match < 14) ? 'sf' : 'f';
        let setno = (match < 14) ? match : 1;
        let matchno = (match < 14) ? 1 : match - 13;
        let ma = new tabletmgr_1.MatchTablet(mtype, matchno, setno, a.alliance, team, '?', this.info_.tablet_);
        this.info_.matchlist_.push(ma);
        this.writeEventFile();
    }
    checkPlayoffMatchGeneration() {
        for (let m = 1; m <= 16; m++) {
            let match = playoffs_1.kMatchAlliances[m - 1];
            let ralliance = this.target2Alliance(match[0]);
            let balliance = this.target2Alliance(match[1]);
            if (ralliance && balliance) {
                this.createMatchFromAlliance(m, ralliance, balliance);
            }
        }
        this.sendNavData();
        this.setViewString();
    }
    setPlayoffMatchOutcome(match, winner, loser) {
        if (this.info_.playoff_status_) {
            let str = `m${match}`;
            this.info_.playoff_status_.outcomes[str] = {
                winner: winner,
                loser: loser,
            };
            this.checkPlayoffMatchGeneration();
            this.setView('playoffs', this.info_.playoff_status_);
            this.writeEventFile();
            this.sendNavData();
        }
    }
    // Implementation of abstract promptString method - Scout app does not support user prompts
    async promptString(title, message, defaultValue, placeholder) {
        // Scout app does not support user input prompts, always return undefined
        return Promise.resolve(undefined);
    }
}
exports.SCScout = SCScout;
SCScout.last_event_setting = "lastevent";
SCScout.SYNC_IPADDR = 'SYNC_IPADDR';
SCScout.viewPlayoffs = 'view-playoffs';
SCScout.syncEventLocal = "sync-event-local";
SCScout.syncEventRemote = "sync-event-remote";
SCScout.syncEventWiFi = "sync-event-wifi";
SCScout.syncEventIPAddr = "sync-event-ipaddr";
SCScout.resetTablet = "reset-tablet";
SCScout.resizeWindow = "resize-window";
SCScout.showTeams = 'show-teams';
SCScout.showFullTeamNames = 'show-full-team-names';
SCScout.reverseImage = 'reverse';
//# sourceMappingURL=scscout.js.map