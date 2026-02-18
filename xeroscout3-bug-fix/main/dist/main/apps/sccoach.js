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
exports.SCCoach = void 0;
const path = __importStar(require("path"));
const fs = __importStar(require("fs"));
const electron_1 = require("electron");
const tcpclient_1 = require("../sync/tcpclient");
const packetobj_1 = require("../sync/packetobj");
const packettypes_1 = require("../sync/packettypes");
const project_1 = require("../project/project");
const sccoachcentralbase_1 = require("./sccoachcentralbase");
class SCCoach extends sccoachcentralbase_1.SCCoachCentralBaseApp {
    constructor(win, args) {
        super(win, 'coach');
        this.sync_project_file_ = '';
    }
    get applicationType() {
        return 'coach';
    }
    mainWindowLoaded() {
        this.appInit();
        let lastevent = this.getSetting(SCCoach.lastEventLoaded);
        if (lastevent && typeof lastevent === 'string' && lastevent.length > 0) {
            let evfile = path.join(lastevent, 'event.json');
            this.openEvent(evfile)
                .then(() => {
                this.sendNavData();
            });
        }
    }
    openEvent(evfile) {
        let ret = new Promise((resolve, reject) => {
            let d = new Date();
            project_1.Project.openEvent(this.logger_, evfile, d.getFullYear(), this.applicationType)
                .then((proj) => {
                this.project = proj;
                resolve();
            })
                .catch((err) => {
                electron_1.dialog.showErrorBox('Error Opening Event', 'There was an error reopening the last event:\n' + err.message);
                this.logger_.error('Error opening event: ' + err.message);
                reject(err);
            });
        });
        return ret;
    }
    basePage() {
        return "content/main.html";
    }
    canQuit() {
        return true;
    }
    close() {
        if (this.project) {
            this.setSetting(SCCoach.lastEventLoaded, this.project.location);
        }
    }
    sendNavData() {
        let treedata = [];
        let dims = 40;
        if (this.project) {
            treedata.push({
                type: "icon",
                command: SCCoach.viewInit,
                title: "Event Info",
                icon: this.getIconData('info.png'),
                width: dims,
                height: dims
            });
            treedata.push({ type: "separator", title: "Teams" });
            treedata.push({
                type: "icon",
                command: SCCoach.viewTeamForm,
                title: "Team Form",
                icon: this.getIconData('form.png'),
                width: dims,
                height: dims
            });
            treedata.push({
                type: "icon",
                command: SCCoach.viewTeamStatus,
                title: "Team Status",
                icon: this.getIconData('status.png'),
                width: dims,
                height: dims
            });
            treedata.push({
                type: "icon",
                command: SCCoach.viewTeamDB,
                title: "Team Data",
                icon: this.getIconData('data.png'),
                width: dims,
                height: dims
            });
            treedata.push({ type: "separator", title: "Match" });
            treedata.push({
                type: "icon",
                command: SCCoach.viewMatchForm,
                title: "MatchForm",
                icon: this.getIconData('form.png'),
                width: dims,
                height: dims
            });
            treedata.push({
                type: "icon",
                command: SCCoach.viewMatchStatus,
                title: "Match Status",
                icon: this.getIconData('status.png'),
                width: dims,
                height: dims
            });
            treedata.push({
                type: "icon",
                command: SCCoach.viewMatchDB,
                title: "Match Data",
                icon: this.getIconData('data.png'),
                width: dims,
                height: dims
            });
            treedata.push({
                type: 'icon',
                command: SCCoach.viewPlayoffs,
                title: "Playoffs",
                icon: this.getIconData('playoffs.png'),
                width: dims,
                height: dims
            });
            treedata.push({ type: "separator", title: "Analysis" });
            treedata.push({
                type: 'icon',
                command: SCCoach.viewFormulas,
                title: "Formulas",
                icon: this.getIconData('formula.png'),
                width: dims,
                height: dims
            });
            treedata.push({
                type: 'icon',
                command: SCCoach.viewPicklist,
                title: "Picklist",
                icon: this.getIconData('picklist.png'),
                width: dims,
                height: dims
            });
            treedata.push({
                type: 'icon',
                command: SCCoach.viewSingleTeamSummary,
                title: "Single Team View",
                icon: this.getIconData('singleteam.png'),
                width: dims,
                height: dims
            });
        }
        this.sendToRenderer("send-nav-data", treedata);
    }
    windowCreated() {
    }
    executeCommand(cmd) {
        if (cmd === SCCoach.syncEventLocal) {
            this.sync_client_ = new tcpclient_1.TCPClient(this.logger_, '127.0.0.1');
            this.sync_client_.on('close', this.syncDone.bind(this));
            this.sync_client_.on('error', this.syncError.bind(this));
            this.syncCoach();
        }
        else if (cmd === SCCoach.syncEventRemote) {
        }
        else if (cmd === SCCoach.syncEventWiFi) {
        }
        else if (cmd === SCCoach.syncEventIPAddr) {
            this.setView('sync-ipaddr');
        }
        else if (cmd === SCCoach.resetTablet) {
            this.project = undefined;
            this.unsetSettings(SCCoach.lastEventLoaded);
            this.sendNavData();
        }
        else if (cmd === SCCoach.viewInit) {
            this.setView('info');
        }
        else if (cmd === SCCoach.viewTeamForm) {
            this.setView('form-scout', 'team');
        }
        else if (cmd === SCCoach.viewMatchForm) {
            this.setView('form-scout', 'match');
        }
        else if (cmd === SCCoach.viewTeamStatus) {
            this.setView("team-status");
        }
        else if (cmd === SCCoach.viewTeamDB) {
            this.setView("team-db");
        }
        else if (cmd === SCCoach.viewMatchStatus) {
            this.setView("match-status");
        }
        else if (cmd === SCCoach.viewMatchDB) {
            this.setView("match-db");
        }
        else if (cmd === SCCoach.viewFormulas) {
            this.setView("formulas");
        }
        else if (cmd === SCCoach.viewSingleTeamSummary) {
            this.setView("singleteam");
        }
        else if (cmd === SCCoach.viewPicklist) {
            this.setView("picklist");
        }
        else {
            electron_1.dialog.showErrorBox('Unknown Command', `The command '${cmd}' is not recognized by SCCoach.`);
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
            click: () => { this.executeCommand(SCCoach.syncEventLocal); }
        });
        filemenu.submenu?.insert(0, synctcpitem);
        synctcpitem = new electron_1.MenuItem({
            type: 'normal',
            label: 'Sync Event Cable (192.168.1.1)',
            click: () => { this.executeCommand(SCCoach.syncEventRemote); }
        });
        filemenu.submenu?.insert(1, synctcpitem);
        synctcpitem = new electron_1.MenuItem({
            type: 'normal',
            label: 'Sync Event WiFi (mDNS)',
            click: () => { this.executeCommand(SCCoach.syncEventWiFi); }
        });
        filemenu.submenu?.insert(2, synctcpitem);
        synctcpitem = new electron_1.MenuItem({
            type: 'normal',
            label: 'Sync Event IP Address (Manual)',
            click: () => { this.executeCommand(SCCoach.syncEventIPAddr); }
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
            click: () => { this.executeCommand(SCCoach.resetTablet); }
        });
        resetmenu.submenu?.insert(0, resetitem);
        ret.append(resetmenu);
        return ret;
    }
    syncDone() {
    }
    syncError(err) {
        this.logger_.error('Sync error: ' + err.message);
    }
    syncCoach() {
        this.sync_client_.connect()
            .then(async () => {
            this.logger_.info(`ScouterSync: connected to server ' ${this.sync_client_.name()}'`);
            let data = new Uint8Array(0);
            this.sync_client_.on('close', () => {
                this.logger_.info('ScouterSync: connection closed');
                this.sync_client_ = undefined;
            });
            let p = new packetobj_1.PacketObj(packettypes_1.PacketType.HelloFromCoach, data);
            this.sync_client_.on('error', (err) => {
                let msg = "";
                let a = err;
                if (a.errors) {
                    for (let cerror of a.errors) {
                        this.logger_.info('ScouterSync: error from connection \'' + this.sync_client_.name() + '\' - ' + cerror.message);
                        msg += cerror.message + '\n';
                    }
                }
                else {
                    this.logger_.info('ScouterSync: error from connection \'' + this.sync_client_.name() + '\' - ' + err.message);
                    msg = err.message;
                }
                this.sendToRenderer('set-status-title', 'Error Connecting To XeroScout Central');
                this.sendToRenderer('set-status-visible', true);
                this.sendToRenderer('set-status-text', msg);
                this.sendToRenderer('set-status-close-button-visible', true);
            });
            this.sync_client_.on('packet', (p) => {
                this.syncTablet(p);
            });
            await this.sync_client_.send(p);
        })
            .catch((err) => {
            this.logger_.error('Error connecting to sync server: ' + err.message);
        });
    }
    syncTablet(p) {
        let obj;
        let str;
        let data;
        switch (p.type_) {
            case packettypes_1.PacketType.HelloFromCoach:
                this.receiveHello(p);
                let configs = this.project?.graph_mgr_?.coachConfigs || [];
                str = JSON.stringify(configs);
                data = new Uint8Array(Buffer.from(str));
                p = new packetobj_1.PacketObj(packettypes_1.PacketType.ProvideCoachGraphs, data);
                this.sync_client_.send(p);
                break;
            case packettypes_1.PacketType.ReceivedCoachGraphcs:
                this.logger_.debug('SyncTablet: received ReceivedCoachGraphcs packet');
                let picklists = this.project?.picklist_mgr_?.coachesPicklists || [];
                str = JSON.stringify(picklists);
                data = new Uint8Array(Buffer.from(str));
                p = new packetobj_1.PacketObj(packettypes_1.PacketType.ProvideCoachPickLists, data);
                this.sync_client_.send(p);
                break;
            case packettypes_1.PacketType.ReceivedCoachPickLists:
                this.logger_.debug('SyncTablet: received ReceivedCoachPickLists packet');
                p = new packetobj_1.PacketObj(packettypes_1.PacketType.RequestProject, new Uint8Array(0));
                this.sync_client_.send(p);
                break;
            case packettypes_1.PacketType.Error:
                this.logger_.error('SyncTablet: received Error packet: ' + p.payloadAsString());
                electron_1.dialog.showErrorBox('Synchronization Error', p.payloadAsString());
                p = new packetobj_1.PacketObj(packettypes_1.PacketType.GoodbyeFromCoach, new Uint8Array(0));
                this.sync_client_.send(p);
                break;
            case packettypes_1.PacketType.ProvideProject:
                this.receiveProject(p);
                p = new packetobj_1.PacketObj(packettypes_1.PacketType.RequestTeamDB, new Uint8Array(0));
                this.sync_client_.send(p);
                break;
            case packettypes_1.PacketType.ProvideTeamDB:
                this.receiveTeamDB(p);
                p = new packetobj_1.PacketObj(packettypes_1.PacketType.RequestMatchDB, new Uint8Array(0));
                this.sync_client_.send(p);
                break;
            case packettypes_1.PacketType.ProvideMatchDB:
                this.receiveMatchDB(p);
                p = new packetobj_1.PacketObj(packettypes_1.PacketType.RequestTeamForm, new Uint8Array(0));
                this.sync_client_.send(p);
                break;
            case packettypes_1.PacketType.ProvideTeamForm:
                this.logger_.debug('SyncTablet: received ProvideTeamForm packet');
                this.receiveTeamForm(p);
                p = new packetobj_1.PacketObj(packettypes_1.PacketType.RequestMatchForm, new Uint8Array(0));
                this.sync_client_.send(p);
                break;
            case packettypes_1.PacketType.ProvideMatchForm:
                this.logger_.debug('SyncTablet: received ProvideMatchForm packet');
                this.receiveMatchForm(p);
                p = new packetobj_1.PacketObj(packettypes_1.PacketType.GoodbyeFromCoach, new Uint8Array(0));
                this.sync_client_.send(p);
                this.finishSync();
                break;
        }
    }
    finishSync() {
        let evfile = path.join(this.sync_project_file_, 'event.json');
        this.openEvent(evfile)
            .then(() => {
            let form = path.join(this.sync_project_file_, 'match.json');
            this.project?.form_mgr_?.setMatchForm(form);
            form = path.join(this.sync_project_file_, 'team.json');
            this.project?.form_mgr_?.setTeamForm(form);
            this.sync_project_file_ = '';
            this.sendNavData();
        });
    }
    receiveHello(p) {
        this.logger_.debug('SyncTablet: received HelloFromCoach packet');
        try {
            let obj = JSON.parse(p.payloadAsString());
            if (this.project && this.project.info?.uuid_ && obj.uuid !== this.project.info.uuid_) {
                alert('The connected event does not match the currently loaded event.');
                //
                // We have an event loaded and it does not match
                //
                this.sync_client_.close();
                return;
            }
        }
        catch (err) {
        }
    }
    receiveTeamForm(p) {
        let str = p.payloadAsString();
        let fname = path.join(this.sync_project_file_, 'team.json');
        fs.writeFileSync(fname, str);
    }
    receiveMatchForm(p) {
        let str = p.payloadAsString();
        let fname = path.join(this.sync_project_file_, 'match.json');
        fs.writeFileSync(fname, str);
    }
    receiveProject(p) {
        this.logger_.debug('SyncTablet: received ProvideProject packet');
        let str = p.payloadAsString();
        let info = JSON.parse(str);
        this.sync_project_file_ = this.getProjectDir(info);
        if (!fs.existsSync(this.sync_project_file_)) {
            fs.mkdirSync(this.sync_project_file_, { recursive: true });
        }
        fs.writeFileSync(path.join(this.sync_project_file_, 'event.json'), str);
    }
    receiveTeamDB(p) {
        this.logger_.debug('SyncTablet: received ProvideTeamDB packet');
        let fname = path.join(this.sync_project_file_, 'team.db');
        fs.writeFileSync(fname, p.data_);
    }
    receiveMatchDB(p) {
        this.logger_.debug('SyncTablet: received ProvideMatchDB packet');
        let fname = path.join(this.sync_project_file_, 'match.db');
        fs.writeFileSync(fname, p.data_);
    }
    getProjectDir(info) {
        let dir = path.join(this.appdir_, 'projects', info.uuid_);
        return dir;
    }
}
exports.SCCoach = SCCoach;
SCCoach.lastEventLoaded = 'coach-last-event-loaded';
SCCoach.viewInit = 'view-init';
SCCoach.viewTeamStatus = 'view-team-status';
SCCoach.viewTeamDB = 'view-team-db';
SCCoach.viewMatchStatus = 'view-match-status';
SCCoach.viewMatchDB = 'view-match-db';
SCCoach.viewSingleTeamSummary = 'view-single-team-summary';
SCCoach.viewPicklist = 'view-picklist';
SCCoach.viewPlayoffs = 'view-playoffs';
SCCoach.resetTablet = "reset-tablet";
SCCoach.viewTeamForm = 'view-team-form';
SCCoach.viewMatchForm = 'view-match-form';
SCCoach.viewFormulas = 'view-formulas';
SCCoach.syncEventLocal = "sync-event-local";
SCCoach.syncEventRemote = "sync-event-remote";
SCCoach.syncEventWiFi = "sync-event-wifi";
SCCoach.syncEventIPAddr = "sync-event-ipaddr";
//# sourceMappingURL=sccoach.js.map