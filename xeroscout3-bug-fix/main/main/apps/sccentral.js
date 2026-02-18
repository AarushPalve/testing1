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
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.SCCentral = void 0;
const papaparse_1 = __importDefault(require("papaparse"));
const fs = __importStar(require("fs"));
const path = __importStar(require("path"));
const os = __importStar(require("os"));
const ba_1 = require("../extnet/ba");
const project_1 = require("../project/project");
const electron_1 = require("electron");
const tcpserver_1 = require("../sync/tcpserver");
const packetobj_1 = require("../sync/packetobj");
const packettypes_1 = require("../sync/packettypes");
const matchmodel_1 = require("../model/matchmodel");
const teammodel_1 = require("../model/teammodel");
const statbotics_1 = require("../extnet/statbotics");
const formmgr_1 = require("../project/formmgr");
const udpbroadcast_1 = require("../sync/udpbroadcast");
const sccoachcentralbase_1 = require("./sccoachcentralbase");
class SCCentral extends sccoachcentralbase_1.SCCoachCentralBaseApp {
    constructor(win, args) {
        super(win, 'central');
        this.ba_ = undefined;
        this.statbotics_ = undefined;
        this.tcpsyncserver_ = undefined;
        this.menuitems_ = new Map();
        this.preview_match_db_col_cfg_ = { columns: [], frozenColumnCount: 0 };
        this.preview_match_db_col_descs_ = [];
        this.preview_match_db_values_ = new Map();
        this.preview_match_db_schema_key_ = '';
        this.synctype_ = 'data';
        this.team_number_ = 1425;
        this.udp_broadcast_ = undefined;
        this.packetHandlers_ = new Map();
        this.external_download_in_progress_ = false;
        this.tablets_syncing_ = false;
        this.promptResolvers = new Map();
        this.external_download_timeout_ = undefined;
        this.baloading_ = false;
        this.bacount_ = 0;
        for (let arg of args) {
            if (arg.startsWith('--year:')) {
                this.year_ = +arg.substring(7);
            }
        }
        if (!this.year_) {
            let dt = new Date();
            this.year_ = dt.getFullYear();
        }
        this.statbotics_ = new statbotics_1.StatBotics(this.year_);
        this.tryConnectBlueAlliance();
        this.initPacketHandlers();
    }
    mainWindowLoaded() {
        this.appInit();
        let index = process.argv.indexOf('central');
        if (index < process.argv.length - 1) {
            project_1.Project.openEvent(this.logger_, process.argv[index + 1], this.year_, this.applicationType)
                .then((p) => {
                this.addRecent(p.location);
                this.project = p;
                this.sendHintDB();
                this.updateMenuState(true);
                if (this.project.info?.locked_) {
                    this.startSyncServer();
                }
                this.setView("info");
                this.sendNavData();
            })
                .catch((err) => {
                let errobj = err;
                electron_1.dialog.showErrorBox("Open Project Error", errobj.message);
                this.setView('text', 'No Event Loaded');
            });
        }
        else {
            let recents = this.getSetting(SCCentral.recentFilesSetting);
            if (recents && Array.isArray(recents) && recents.length > 0) {
                let fpath = path.join(recents[0], 'event.json');
                if (fs.existsSync(fpath)) {
                    project_1.Project.openEvent(this.logger_, fpath, this.year_, this.applicationType)
                        .then((p) => {
                        this.addRecent(p.location);
                        this.project = p;
                        this.sendHintDB();
                        this.updateMenuState(true);
                        if (this.project.info?.locked_) {
                            this.startSyncServer();
                        }
                        this.setView("info");
                        this.sendNavData();
                    })
                        .catch((err) => {
                        let errobj = err;
                        electron_1.dialog.showErrorBox("Open Project Error", errobj.message);
                        this.setView('text', 'No Event Loaded');
                    });
                }
                else {
                    this.setView('text', 'No Event Loaded');
                }
            }
            else {
                this.setView('text', 'No Event Loaded');
            }
        }
        let v = this.getVersion('application');
        this.sendToRenderer('send-app-status', {
            left: this.getProgramTitle(),
            middle: undefined,
            right: 'Connecting To Blue Alliance...',
        });
    }
    findPrimaryIPAddress() {
        let ret = 'unknown';
        let ipaddrs = os.networkInterfaces();
        for (let key of Object.keys(ipaddrs)) {
            let ifaces = ipaddrs[key];
            if (ifaces) {
                for (let iface of ifaces) {
                    if (iface.family === 'IPv4' && !iface.internal) {
                        ret = iface.address;
                        break;
                    }
                }
            }
        }
        return ret;
    }
    getProgramTitle() {
        let v = this.getVersion('application');
        return `Xero Central ${this.versionToString(v)} (${this.findPrimaryIPAddress()})`;
    }
    tryAgain() {
        setTimeout(() => {
            this.logger_.info(`trying to connect (${this.bacount_}) to blue alliance again`);
            this.tryConnectBlueAlliance();
        }, 5000);
    }
    async tryConnectBlueAlliance() {
        this.baloading_ = true;
        this.ba_ = new ba_1.BlueAlliance(this.year_);
        this.bacount_++;
        this.ba_.init()
            .then((up) => {
            if (!up) {
                this.ba_ = undefined;
                this.sendToRenderer('send-app-status', { right: 'Blue Alliance not available - trying again' });
                this.tryAgain();
            }
            else {
                this.sendToRenderer('send-app-status', { right: 'Blue Alliance connected' });
                this.logger_.info('connected to the blue alliance site');
                this.baloading_ = false;
            }
        })
            .catch((err) => {
            this.sendToRenderer('send-app-status', { right: `Blue Alliance error - ${err.message} - trying again` });
            this.tryAgain();
        });
    }
    get applicationType() {
        return 'central';
    }
    basePage() {
        return 'content/main.html';
    }
    close() {
        // Clear any pending external download timeouts
        if (this.external_download_timeout_) {
            clearTimeout(this.external_download_timeout_);
            this.external_download_timeout_ = undefined;
        }
    }
    canQuit() {
        let ret = true;
        if (this.project && this.project.data_mgr_) {
            ret = this.project.data_mgr_.close();
        }
        return ret;
    }
    updateView() {
        let ret = false;
        if (this.lastview_ && this.lastview_ === 'formview' && this.lastformview_) {
            this.setView('formview', this.lastformview_);
            ret = true;
        }
        return ret;
    }
    colorMenuItem(color) {
        this.color = color;
        if (!this.updateView()) {
            if (this.project) {
                this.setView('info');
            }
            else {
                this.setView('empty');
            }
        }
    }
    reverseImage() {
        this.reversed = this.reverseImage_.checked;
        if (!this.updateView()) {
            if (this.project) {
                this.setView('info');
            }
            else {
                this.setView('empty');
            }
        }
    }
    createMenu() {
        let ret = new electron_1.Menu();
        let index = 0;
        let filemenu = new electron_1.MenuItem({
            type: 'submenu',
            label: 'File',
            role: 'fileMenu',
        });
        let createitem = new electron_1.MenuItem({
            type: 'normal',
            label: 'Create Event ...',
            id: 'create-event',
            click: () => {
                this.executeCommand(SCCentral.createNewEvent);
            },
        });
        filemenu.submenu.insert(index++, createitem);
        this.menuitems_.set('file/create', createitem);
        let openitem = new electron_1.MenuItem({
            type: 'normal',
            label: 'Open Event ...',
            id: 'open-event',
            click: () => {
                this.executeCommand(SCCentral.openExistingEvent);
            },
        });
        filemenu.submenu.insert(index++, openitem);
        this.menuitems_.set('file/open', openitem);
        if (this.hasSetting(SCCentral.recentFilesSetting)) {
            let recent = new electron_1.MenuItem({
                type: 'submenu',
                label: 'Recent',
                submenu: new electron_1.Menu(),
                click: () => {
                    this.executeCommand(SCCentral.openExistingEvent);
                },
            });
            filemenu.submenu.insert(index++, recent);
            let recents = this.getSetting(SCCentral.recentFilesSetting);
            for (let one of recents) {
                let item = new electron_1.MenuItem({
                    type: 'normal',
                    label: one,
                    click: () => {
                        let evpath = path.join(one, 'event.json');
                        project_1.Project.openEvent(this.logger_, evpath, this.year_, this.applicationType)
                            .then((p) => {
                            this.addRecent(p.location);
                            this.project = p;
                            this.sendHintDB();
                            this.updateMenuState(true);
                            if (this.project && this.project.isLocked) {
                                this.startSyncServer();
                            }
                            this.setView('info');
                            this.sendNavData();
                        })
                            .catch((err) => {
                            let errobj = err;
                            electron_1.dialog.showErrorBox('Open Project Error', errobj.message);
                        });
                    },
                });
                recent.submenu.append(item);
            }
        }
        filemenu.submenu.insert(index++, new electron_1.MenuItem({ type: 'separator' }));
        let closeitem = new electron_1.MenuItem({
            type: 'normal',
            label: 'Close Event',
            id: 'close-event',
            enabled: false,
            click: () => {
                this.executeCommand(SCCentral.closeEvent);
            },
        });
        filemenu.submenu.insert(index++, closeitem);
        this.menuitems_.set('file/close', closeitem);
        ret.append(filemenu);
        let imagemenu = new electron_1.MenuItem({
            type: 'submenu',
            label: 'Images',
            submenu: new electron_1.Menu()
        });
        this.importImage_ = new electron_1.MenuItem({
            type: 'normal',
            label: 'Import ...',
            click: this.importImage.bind(this)
        });
        imagemenu.submenu.append(this.importImage_);
        ret.append(imagemenu);
        let optionmenu = new electron_1.MenuItem({
            type: 'submenu',
            label: 'Options',
            submenu: new electron_1.Menu()
        });
        this.blueMenuItem_ = new electron_1.MenuItem({
            type: 'radio',
            label: 'Blue',
            click: this.colorMenuItem.bind(this, 'blue')
        });
        optionmenu.submenu.append(this.blueMenuItem_);
        this.redMenuItem_ = new electron_1.MenuItem({
            type: 'radio',
            label: 'Red',
            click: this.colorMenuItem.bind(this, 'red')
        });
        optionmenu.submenu.append(this.redMenuItem_);
        this.reverseImage_ = new electron_1.MenuItem({
            type: 'checkbox',
            label: 'Reverse',
            checked: false,
            click: this.reverseImage.bind(this)
        });
        optionmenu.submenu.append(this.reverseImage_);
        ret.append(optionmenu);
        let datamenu = new electron_1.MenuItem({
            type: 'submenu',
            label: 'Data',
            submenu: new electron_1.Menu(),
        });
        let downloadBAData = new electron_1.MenuItem({
            type: 'normal',
            label: 'Import Data From Blue Alliance',
            enabled: false,
            click: () => {
                this.importBlueAllianceData();
            },
        });
        datamenu.submenu?.append(downloadBAData);
        this.menuitems_.set('data/loadbadata', downloadBAData);
        let downloadSTData = new electron_1.MenuItem({
            type: 'normal',
            label: 'Import Data From Statbotics',
            enabled: false,
            click: () => {
                this.importStatboticsData().catch(err => {
                    this.logger_.error(`Error importing Statbotics data: ${err.message}`);
                });
            },
        });
        datamenu.submenu?.append(downloadSTData);
        this.menuitems_.set('data/loadstdata', downloadSTData);
        let importGraphDefns = new electron_1.MenuItem({
            type: 'normal',
            label: 'Import Graph Definitions',
            enabled: false,
            click: () => {
                // this.importGraphDefinitions();
            },
        });
        datamenu.submenu?.append(importGraphDefns);
        this.menuitems_.set('data/graphdefn', importGraphDefns);
        datamenu.submenu?.append(new electron_1.MenuItem({ type: 'separator' }));
        let clearDownloadItem = new electron_1.MenuItem({
            type: 'normal',
            label: 'Clear Stuck External Download',
            enabled: true,
            click: () => {
                this.executeCommand(SCCentral.clearExternalDownload);
            },
        });
        datamenu.submenu?.append(clearDownloadItem);
        this.menuitems_.set('data/cleardownload', clearDownloadItem);
        datamenu.submenu?.append(new electron_1.MenuItem({ type: 'separator' }));
        let exportTeamData = new electron_1.MenuItem({
            type: 'normal',
            label: 'Export Team Data',
            enabled: false,
            click: () => {
                this.doExportData(teammodel_1.TeamDataModel.TableName);
            },
        });
        datamenu.submenu?.append(exportTeamData);
        this.menuitems_.set('data/exportteam', exportTeamData);
        let exportMatchData = new electron_1.MenuItem({
            type: 'normal',
            label: 'Export Match Data',
            enabled: false,
            click: () => {
                this.doExportData(matchmodel_1.MatchDataModel.TableName);
            },
        });
        datamenu.submenu?.append(exportMatchData);
        this.menuitems_.set('data/exportmatch', exportMatchData);
        let exportPicklistData = new electron_1.MenuItem({
            type: 'normal',
            label: 'Export All Picklist Data',
            enabled: false,
            click: () => {
                // this.doExportPicklist();
            },
        });
        datamenu.submenu?.append(exportPicklistData);
        this.menuitems_.set('data/exportpicklist', exportPicklistData);
        datamenu.submenu?.append(new electron_1.MenuItem({ type: 'separator' }));
        let importFormulas = new electron_1.MenuItem({
            type: 'normal',
            label: 'Import Formulas',
            enabled: false,
            click: () => {
                this.importFormulasFromFile();
            },
        });
        datamenu.submenu?.append(importFormulas);
        this.menuitems_.set('data/importformulas', importFormulas);
        ret.append(datamenu);
        let viewmenu = new electron_1.MenuItem({
            type: 'submenu',
            role: 'viewMenu',
        });
        ret.append(viewmenu);
        let helpmenu = new electron_1.MenuItem({
            type: 'submenu',
            label: 'Help',
            submenu: new electron_1.Menu(),
        });
        let helpitem = new electron_1.MenuItem({
            type: 'normal',
            label: 'Help',
            id: 'help-help',
            click: () => {
                this.executeCommand(SCCentral.viewHelp);
            },
        });
        helpmenu.submenu.append(helpitem);
        let aboutitem = new electron_1.MenuItem({
            type: 'normal',
            label: 'About',
            id: 'help-about',
            click: () => {
                this.executeCommand(SCCentral.viewAbout);
            },
        });
        helpmenu.submenu.append(aboutitem);
        ret.append(helpmenu);
        return ret;
    }
    windowCreated() {
    }
    enableMenuItem(item, state) {
        if (this.menuitems_.has(item)) {
            this.menuitems_.get(item).enabled = state;
        }
    }
    updateMenuState(hasEvent) {
        let items = [
            'data/exportmatch',
            'data/exportteam',
            'data/loadbadata',
            'data/loadstdata',
            'data/exportpicklist',
            'data/graphdefn',
            'file/close',
            'data/importformulas',
        ];
        for (let item of items) {
            this.enableMenuItem(item, hasEvent);
        }
    }
    saveForm(type, contents) {
        this.project.form_mgr_.saveForm(type, contents);
    }
    importImage() {
        electron_1.dialog.showOpenDialog(this.win_, {
            title: 'Import image(s)',
            filters: [
                { name: 'PNGFiles', extensions: ['png'] },
                { name: 'All Files', extensions: ['*'] }
            ],
            properties: [
                'openFile',
                'multiSelections',
            ]
        }).then(result => {
            if (!result.canceled) {
                let imported = 0;
                for (const file of result.filePaths) {
                    let name = this.image_mgr_.addImage(file);
                    if (typeof name === 'string') {
                        imported++;
                    }
                    else {
                        electron_1.dialog.showErrorBox('Error', 'Error loading external image, no image directory set');
                        return;
                    }
                }
                if (imported > 0) {
                    this.sendToRenderer('send-images', this.image_mgr_.getImageNames());
                }
            }
        });
    }
    renameDataSet(oldname, newname) {
        this.project?.dataset_mgr_?.renameDataSet(oldname, newname);
        this.sendDataSets();
    }
    updateDataSet(ds) {
        this.project?.dataset_mgr_?.updateDataSet(ds);
    }
    sendTabletData() {
        if (this.project) {
            this.sendToRenderer('send-tablet-data', this.project.tablet_mgr_.getTablets());
        }
    }
    setTabletData(data) {
        if (this.project) {
            this.project?.tablet_mgr_?.setTabletData(data);
            this.setView('info');
        }
    }
    setTeamData(data) {
        this.project?.team_mgr_?.setTeamData(data);
        this.setView('info');
    }
    setEventName(data) {
        this.project?.setEventName(data);
    }
    setMatchData(data) {
        this.project?.match_mgr_?.setMatchData(data);
        this.setView('info');
    }
    updateMatchDB(changes) {
        this.project?.data_mgr_?.updateMatchDB(changes);
    }
    updateTeamDB(changes) {
        this.project?.data_mgr_?.updateTeamDB(changes);
    }
    sendEventData() {
        if (this.project && this.isBAAvailable()) {
            this.ba_?.getEvents()
                .then((frcevs) => {
                this.baevents_ = frcevs;
                this.sendToRenderer('send-event-data', frcevs);
            })
                .catch((err) => {
                this.ba_ = undefined;
                this.tryConnectBlueAlliance();
                this.setView('info');
                let errobj = err;
                electron_1.dialog.showMessageBoxSync(this.win_, {
                    title: 'Load Blue Alliance Event',
                    message: errobj.message,
                });
            });
        }
        else {
            electron_1.dialog.showErrorBox('Load Blue Alliance Event', 'The Blue Alliance site is not available');
            this.setView('info');
        }
    }
    async loadBaEventDataError() {
        this.sendToRenderer('set-status-title', 'Blue Alliance Error');
        this.sendToRenderer('set-status-html', 'Error importing data - invalid request from renderer - internal error');
        this.sendToRenderer('set-status-close-button-visible', true);
        this.setView('info');
    }
    async loadBaEventData(key) {
        // Check if tablets are syncing
        if (this.tablets_syncing_) {
            electron_1.dialog.showErrorBox('Load Blue Alliance Event', 'Cannot download data while tablets are syncing. Please wait for tablet sync to complete and try again.');
            return;
        }
        // Check if another external download is already in progress
        if (this.external_download_in_progress_) {
            electron_1.dialog.showErrorBox('Load Blue Alliance Event', 'Another external download is already in progress. Please wait for it to complete and try again.');
            return;
        }
        if (!this.isBAAvailable()) {
            electron_1.dialog.showErrorBox('Load Blue Alliance Event', 'The Blue Alliance site is not available.');
            return;
        }
        // Set external download flag with timeout protection
        this.setExternalDownloadInProgress(`Blue Alliance Event: ${key}`);
        let fev = this.getEventFromKey(key);
        if (fev) {
            this.sendToRenderer('set-status-title', 'Loading event "' + fev.name + '"');
            this.msg_ = "";
            try {
                await this.project.loadBAEvent(this.ba_, this.statbotics_, fev, (text) => {
                    this.appendStatusText(text);
                });
                this.sendToRenderer("set-status-close-button-visible", true);
                this.sendNavData();
                this.setView("info");
            }
            catch (err) {
                let errobj = err;
                this.sendToRenderer("set-status-visible", true);
                this.sendToRenderer("set-status-title", "Blue Alliance Error");
                this.sendToRenderer("set-status-html", "Error importing data - " + errobj.message);
                this.sendToRenderer("set-status-close-button-visible", true);
                this.setView("info");
            }
            finally {
                // Clear external download flag
                this.clearExternalDownloadInProgress(`Blue Alliance Event: ${key}`);
            }
        }
        else {
            // Clear external download flag
            this.clearExternalDownloadInProgress(`Blue Alliance Event: ${key} (not found)`);
            this.sendToRenderer("set-status-title", "Blue Alliance Error");
            this.sendToRenderer("set-status-html", "Error importing data - no event with key '" + key + "' was found");
            this.sendToRenderer("set-status-close-button-visible", true);
            this.setView("info");
        }
    }
    async promptString(title, message, defaultValue, placeholder) {
        return new Promise((resolve) => {
            const requestId = Math.random().toString(36).substring(2, 15);
            // Store the resolver function to call when we get the response
            this.promptResolvers.set(requestId, resolve);
            // Send request to renderer
            const request = {
                id: requestId,
                title,
                message,
                defaultValue,
                placeholder
            };
            this.sendToRenderer("prompt-string-request", request);
        });
    }
    async importBlueAllianceData() {
        // Check if tablets are syncing
        if (this.tablets_syncing_) {
            let html = "Cannot download data while tablets are syncing. Please wait for tablet sync to complete and try again.";
            this.sendToRenderer("set-status-visible", true);
            this.sendToRenderer("set-status-title", "Error Importing Match Data");
            this.sendToRenderer("set-status-html", html);
            this.sendToRenderer("set-status-close-button-visible", true);
            return;
        }
        // Check if another external download is already in progress
        if (this.external_download_in_progress_) {
            let html = "Another external download is already in progress. Please wait for it to complete and try again.";
            this.sendToRenderer("set-status-visible", true);
            this.sendToRenderer("set-status-title", "Error Importing Match Data");
            this.sendToRenderer("set-status-html", html);
            this.sendToRenderer("set-status-close-button-visible", true);
            return;
        }
        if (!this.project) {
            let html = "Must create or open a project to import data.";
            this.sendToRenderer("set-status-visible", true);
            this.sendToRenderer("set-status-title", "Error Importing Match Data");
            this.sendToRenderer("set-status-html", html);
            this.sendToRenderer("set-status-close-button-visible", true);
            return;
        }
        if (!this.isBAAvailable()) {
            let html = "The Blue Alliance site is not available.";
            this.sendToRenderer("set-status-visible", true);
            this.sendToRenderer("set-status-title", "Error Importing Match Data");
            this.sendToRenderer("set-status-html", html);
            this.sendToRenderer("set-status-close-button-visible", true);
            return;
        }
        // Set external download flag with timeout protection
        this.setExternalDownloadInProgress("Blue Alliance Data Import");
        let fev = this.project?.info?.frcev_;
        if (fev) {
            if (!fev.key) {
                let key = await this.promptString('Blue Alliance Event Key', 'Enter the Blue Alliance event key (e.g. 2024miket)', '');
                if (key) {
                    fev.key = key;
                    // Save the project immediately after setting the key so it's available for future use
                    this.project.writeEventFile();
                }
                else {
                    // User cancelled, stop the import
                    this.clearExternalDownloadInProgress("Blue Alliance Data Import (cancelled)");
                    return;
                }
            }
            this.sendToRenderer("set-status-visible", true);
            this.sendToRenderer("set-status-title", "Loading match data");
            this.msg_ = "";
            this.sendToRenderer("set-status-html", "Requesting match data from the Blue Alliance ...");
            this.project.loadExternalBAData(this.ba_, fev, (text) => {
                this.appendStatusText(text);
            })
                .then(() => {
                this.appendStatusText("All data loaded");
                this.sendToRenderer("set-status-close-button-visible", true);
                this.project.writeEventFile();
            })
                .catch((err) => {
                this.appendStatusText("<br><br>Error loading data - " + err.message);
                this.sendToRenderer("set-status-close-button-visible", true);
                this.project.writeEventFile();
            })
                .finally(() => {
                // Clear external download flag
                this.clearExternalDownloadInProgress("Blue Alliance Data Import");
            });
        }
        else {
            // Clear external download flag
            this.clearExternalDownloadInProgress("Blue Alliance Data Import (no event)");
            let html = "The event is not a blue alliance event";
            this.sendToRenderer("set-status-visible", true);
            this.sendToRenderer("set-status-title", "Load Match Data");
            this.sendToRenderer("set-status-html", html);
            this.sendToRenderer("set-status-close-button-visible", true);
        }
    }
    async importStatboticsData() {
        // Check if tablets are syncing
        if (this.tablets_syncing_) {
            let html = "Cannot download data while tablets are syncing. Please wait for tablet sync to complete and try again.";
            this.sendToRenderer("set-status-visible", true);
            this.sendToRenderer("set-status-title", "Error Importing Match Data");
            this.sendToRenderer("set-status-html", html);
            this.sendToRenderer("set-status-close-button-visible", true);
            return;
        }
        // Check if another external download is already in progress
        if (this.external_download_in_progress_) {
            let html = "Another external download is already in progress. Please wait for it to complete and try again.";
            this.sendToRenderer("set-status-visible", true);
            this.sendToRenderer("set-status-title", "Error Importing Match Data");
            this.sendToRenderer("set-status-html", html);
            this.sendToRenderer("set-status-close-button-visible", true);
            return;
        }
        if (!this.project) {
            let html = "Must create or open a project to import data.";
            this.sendToRenderer("set-status-visible", true);
            this.sendToRenderer("set-status-title", "Error Importing Match Data");
            this.sendToRenderer("set-status-html", html);
            this.sendToRenderer("set-status-close-button-visible", true);
            return;
        }
        if (!this.isBAAvailable()) {
            let html = "The Statbotics site is not available.";
            this.sendToRenderer("set-status-visible", true);
            this.sendToRenderer("set-status-title", "Error Importing Match Data");
            this.sendToRenderer("set-status-html", html);
            this.sendToRenderer("set-status-close-button-visible", true);
            return;
        }
        // Set external download flag with timeout protection
        this.setExternalDownloadInProgress("Statbotics Data Import");
        let fev = this.project?.info?.frcev_;
        if (fev) {
            if (!fev.key) {
                let key = await this.promptString('Blue Alliance Event Key', 'Enter the Blue Alliance event key (e.g. 2024miket)', '');
                if (key) {
                    fev.key = key;
                    // Save the project immediately after setting the key so it's available for future use
                    this.project.writeEventFile();
                }
                else {
                    // User cancelled, stop the import
                    this.clearExternalDownloadInProgress("Statbotics Data Import (cancelled)");
                    return;
                }
            }
            this.sendToRenderer("set-status-visible", true);
            this.sendToRenderer("set-status-title", "Loading match data for event '" + fev.name + "'");
            this.msg_ = "";
            this.sendToRenderer("set-status-html", "Requesting match data from the Blue Alliance ...");
            this.project.loadExternalSTData(this.statbotics_, fev, (text) => {
                this.appendStatusText(text);
            })
                .then(() => {
                this.appendStatusText("All data loaded");
                this.sendToRenderer("set-status-close-button-visible", true);
            })
                .catch((err) => {
                this.appendStatusText("<br><br>Error loading data - " + err.message);
                this.sendToRenderer("set-status-close-button-visible", true);
            })
                .finally(() => {
                // Clear external download flag
                this.clearExternalDownloadInProgress("Statbotics Data Import");
            });
        }
        else {
            // Clear external download flag
            this.clearExternalDownloadInProgress("Statbotics Data Import (no event)");
            // Clear external download flag
            this.clearExternalDownloadInProgress("Statbotics Data Import (no event)");
            let html = "The event is not a blue alliance event";
            this.sendToRenderer("set-status-visible", true);
            this.sendToRenderer("set-status-title", "Load Match Data");
            this.sendToRenderer("set-status-html", html);
            this.sendToRenderer("set-status-close-button-visible", true);
        }
    }
    appendStatusText(text) {
        this.msg_ += text;
        this.sendToRenderer("set-status-html", this.msg_);
    }
    getEventFromKey(key) {
        let ret = undefined;
        if (this.baevents_) {
            ret = this.baevents_.find((element) => element.key === key);
        }
        return ret;
    }
    isBAAvailable() {
        return this.ba_ !== undefined && !this.baloading_;
    }
    sendNavData() {
        let treedata = [];
        let dims = 40;
        treedata.push({ type: "separator", title: "General" });
        treedata.push({
            type: "icon",
            command: SCCentral.viewHelp,
            title: "Help",
            icon: this.getIconData('help.png'),
            width: dims,
            height: dims
        });
        if (this.project) {
            treedata.push({
                type: "icon",
                command: SCCentral.viewInit,
                title: "Event Info",
                icon: this.getIconData('info.png'),
                width: dims,
                height: dims
            });
            treedata.push({ type: "separator", title: "Teams" });
            if (this.project.form_mgr_?.hasTeamForm()) {
                treedata.push({
                    type: "icon",
                    command: SCCentral.viewTeamForm,
                    title: "Team Form",
                    icon: this.getIconData('form.png'),
                    width: dims,
                    height: dims
                });
            }
            if (this.project.info?.locked_) {
                treedata.push({
                    type: "icon",
                    command: SCCentral.viewTeamStatus,
                    title: "Team Status",
                    icon: this.getIconData('status.png'),
                    width: dims,
                    height: dims
                });
                treedata.push({
                    type: "icon",
                    command: SCCentral.viewTeamDB,
                    title: "Team Data",
                    icon: this.getIconData('data.png'),
                    width: dims,
                    height: dims
                });
            }
            treedata.push({ type: "separator", title: "Match" });
            if (this.project.form_mgr_?.hasMatchForm()) {
                treedata.push({
                    type: "icon",
                    command: SCCentral.viewMatchForm,
                    title: "MatchForm",
                    icon: this.getIconData('form.png'),
                    width: dims,
                    height: dims
                });
            }
            if (this.project.info?.locked_) {
                treedata.push({
                    type: "icon",
                    command: SCCentral.viewMatchStatus,
                    title: "Match Status",
                    icon: this.getIconData('status.png'),
                    width: dims,
                    height: dims
                });
                treedata.push({
                    type: "icon",
                    command: SCCentral.viewMatchDB,
                    title: "Match Data",
                    icon: this.getIconData('data.png'),
                    width: dims,
                    height: dims
                });
                treedata.push({
                    type: 'icon',
                    command: SCCentral.viewPlayoffs,
                    title: "Playoffs",
                    icon: this.getIconData('playoffs.png'),
                    width: dims,
                    height: dims
                });
            }
            treedata.push({ type: "separator", title: "Analysis" });
            if (this.project.info?.locked_) {
                treedata.push({
                    type: 'icon',
                    command: SCCentral.viewFormulas,
                    title: "Formulas",
                    icon: this.getIconData('formula.png'),
                    width: dims,
                    height: dims
                });
                treedata.push({
                    type: "icon",
                    command: SCCentral.viewDataSets,
                    title: "Data Sets",
                    icon: this.getIconData('dataset.png'),
                    width: dims,
                    height: dims
                });
                treedata.push({
                    type: 'icon',
                    command: SCCentral.viewPicklist,
                    title: "Picklist",
                    icon: this.getIconData('picklist.png'),
                    width: dims,
                    height: dims
                });
                treedata.push({
                    type: 'icon',
                    command: SCCentral.viewSingleTeamSummary,
                    title: "Single Team View",
                    icon: this.getIconData('singleteam.png'),
                    width: dims,
                    height: dims
                });
            }
        }
        treedata.push({
            type: "icon",
            command: SCCentral.viewPredictor,
            title: "matchPredictor",
            icon: this.getIconData('predictorImage.png'),
            width: dims,
            height: dims
        });
        this.sendToRenderer("send-nav-data", treedata);
    }
    executeCommand(cmd) {
        if (cmd === SCCentral.viewHelp) {
            electron_1.shell.openExternal("https://www.xerosw.org/doku.php?id=software:xeroscout2");
        }
        else if (cmd === SCCentral.viewAbout) {
            this.showAbout();
        }
        else if (cmd === SCCentral.createNewEvent) {
            this.createEvent(this.year_);
        }
        else if (cmd === SCCentral.openExistingEvent) {
            this.openEvent(this.year_);
        }
        else if (cmd === SCCentral.closeEvent) {
            this.closeEvent();
        }
        else if (cmd === SCCentral.selectMatchForm) {
            this.selectMatchForm();
        }
        else if (cmd === SCCentral.selectTeamForm) {
            this.selectTeamForm();
        }
        else if (cmd === SCCentral.loadBAEvent) {
            this.loadBAEvent();
        }
        else if (cmd === SCCentral.assignTablets) {
            this.setView("assign-tablets");
        }
        else if (cmd === SCCentral.viewInit) {
            this.sendNavData();
            this.setView("info");
        }
        else if (cmd === SCCentral.viewPicklist) {
            this.setView('picklist');
        }
        else if (cmd === SCCentral.viewDataSets) {
            this.setView('datasets');
        }
        else if (cmd === SCCentral.lockEvent) {
            this.sendToRenderer("set-status-title", "Locking event");
            this.sendToRenderer("set-status-visible", true);
            this.sendToRenderer('set-status-text', 'Locking event ...');
            this.project.lockEvent()
                .then(() => {
                this.startSyncServer();
                this.setView("info");
                this.sendNavData();
                this.sendToRenderer('set-status-text', 'Locking event ... done');
                this.sendToRenderer("set-status-close-button-visible", true);
            })
                .catch((err) => {
                let errobj = err;
                this.setView("info");
                this.sendNavData();
                this.sendToRenderer('set-status-html', 'Error: ' + errobj.message);
                this.sendToRenderer("set-status-close-button-visible", true);
            });
        }
        else if (cmd === SCCentral.editTeams) {
            this.setView("edit-teams");
        }
        else if (cmd === SCCentral.editMatches) {
            this.setView("edit-matches");
        }
        else if (cmd === SCCentral.importTeams) {
            this.importTeams();
        }
        else if (cmd === SCCentral.importMatches) {
            this.importMatches();
        }
        else if (cmd === SCCentral.viewTeamForm) {
            this.setFormView('team');
        }
        else if (cmd === SCCentral.viewMatchForm) {
            this.setFormView('match');
        }
        else if (cmd === SCCentral.viewTeamStatus) {
            if (!this.project?.tablet_mgr_?.hasTeamAssignments()) {
                this.sendToRenderer("update-main-window-view", "empty", "Scouting schedule not generated yet");
            }
            else {
                this.setView("team-status");
            }
        }
        else if (cmd === SCCentral.viewMatchStatus) {
            if (!this.project?.tablet_mgr_?.hasMatchAssignments()) {
                this.sendToRenderer("update-main-window-view", "empty", "Scouting schedule not generated yet");
            }
            else {
                this.setView('match-status');
            }
        }
        else if (cmd === SCCentral.viewMatchDB) {
            this.setView("match-db");
        }
        else if (cmd === SCCentral.viewTeamDB) {
            this.setView("team-db");
        }
        else if (cmd === SCCentral.viewFormulas) {
            this.setView("formulas");
        }
        else if (cmd === SCCentral.viewPlayoffs) {
            this.setView("playoffs", null);
        }
        else if (cmd === SCCentral.viewSingleTeamSummary) {
            this.setView("singleteam");
        }
        else if (cmd === SCCentral.clearExternalDownload) {
            this.forceClearExternalDownload();
        }
        else if (cmd === SCCentral.createMatchForm) {
            if (this.project && this.project.form_mgr_) {
                if (this.project.form_mgr_.createMatchForm()) {
                    this.executeCommand(SCCentral.editMatchForm);
                }
            }
        }
        else if (cmd === SCCentral.createTeamForm) {
            if (this.project && this.project.form_mgr_) {
                if (this.project.form_mgr_.createTeamForm()) {
                    this.executeCommand(SCCentral.editTeamForm);
                }
            }
        }
        else if (cmd === SCCentral.editMatchForm) {
            this.setFormEdit('match');
        }
        else if (cmd === SCCentral.editTeamForm) {
            this.setFormEdit('team');
        }
        else if (cmd === SCCentral.viewPredictor) {
            this.setView("predictor");
        }
    }
    setFormView(view) {
        this.lastformview_ = view;
        this.setView('form-scout', view);
    }
    ensurePreviewMatchDBSchema() {
        if (!this.project || !this.project.isInitialized() || !this.project.form_mgr_?.hasMatchForm()) {
            return false;
        }
        let cols = this.project.form_mgr_.extractMatchFormFields();
        if (cols instanceof Error) {
            this.logger_.error('error extracting match form fields for preview match DB', cols);
            return false;
        }
        let schema_key = cols.map((c) => `${c.name}:${c.type}`).join('|');
        if (schema_key !== this.preview_match_db_schema_key_) {
            this.preview_match_db_schema_key_ = schema_key;
            this.preview_match_db_col_descs_ = cols;
            this.preview_match_db_col_cfg_ = {
                frozenColumnCount: 0,
                columns: cols.map((c) => {
                    return {
                        name: c.name,
                        width: -1,
                        hidden: c.name.endsWith('_segments'),
                    };
                }),
            };
            this.preview_match_db_values_.clear();
        }
        return true;
    }
    resetPreviewMatchDB() {
        this.preview_match_db_values_.clear();
        this.sendPreviewMatchDB();
    }
    updatePreviewMatchDB(values) {
        if (!this.ensurePreviewMatchDBSchema()) {
            return;
        }
        let names = new Set(this.preview_match_db_col_descs_.map((c) => c.name));
        for (let one of values) {
            if (one && typeof one.tag === 'string' && one.value && names.has(one.tag)) {
                this.preview_match_db_values_.set(one.tag, one.value);
            }
        }
    }
    sendPreviewMatchDB() {
        if (!this.ensurePreviewMatchDBSchema()) {
            return;
        }
        let row = {};
        for (let col of this.preview_match_db_col_descs_) {
            row[col.name] = this.preview_match_db_values_.get(col.name) || { type: 'null', value: null };
        }
        let dataobj = {
            column_configurations: this.preview_match_db_col_cfg_,
            column_definitions: this.preview_match_db_col_descs_,
            keycols: [],
            data: [row],
        };
        this.sendToRenderer('send-preview-match-db', dataobj);
    }
    setFormEdit(name) {
        this.lastformview_ = name;
        this.setView('form-edit', name);
    }
    importTeams() {
        var path = electron_1.dialog.showOpenDialog({
            title: "Import Teams",
            message: "Select teams CVS file",
            filters: [
                {
                    extensions: ["csv"],
                    name: "CSV File",
                },
            ],
            properties: ["openFile"],
        });
        path
            .then((pathname) => {
            if (!pathname.canceled) {
                this.importTeamsFromFile(pathname.filePaths[0]);
            }
        })
            .catch((err) => {
            electron_1.dialog.showErrorBox("Import Teams Error", err.message);
        });
    }
    importMatches() {
        var path = electron_1.dialog.showOpenDialog({
            title: "Import Matches",
            message: "Select Matches CVS file",
            filters: [
                {
                    extensions: ["csv"],
                    name: "CSV File",
                },
            ],
            properties: ["openFile"],
        });
        path
            .then((pathname) => {
            if (!pathname.canceled) {
                this.importMatchesFromFile(pathname.filePaths[0]);
            }
        })
            .catch((err) => {
            electron_1.dialog.showErrorBox("Import Matches Error", err.message);
        });
    }
    importTeamsFromFile(filename) {
        const file = fs.readFileSync(filename, "utf8");
        papaparse_1.default.parse(file, {
            header: true,
            skipEmptyLines: true,
            transformHeader(header, index) {
                let ret = header;
                if (index == 0) {
                    ret = "team_number";
                }
                else if (index == 1) {
                    ret = "nickname";
                }
                return ret;
            },
            complete: (results) => {
                let data = [];
                for (let one of results.data) {
                    let entry = one;
                    let obj = {
                        key: entry.team_number,
                        team_number: +entry.team_number,
                        nickname: entry.nickname,
                        name: entry.nickname,
                        school_name: "",
                        city: "",
                        state_prov: "",
                        country: "",
                        address: "",
                        postal_code: "",
                        gmaps_place_id: "",
                        gmaps_url: "",
                        lat: 0,
                        lng: 0,
                        location_name: "",
                        website: "",
                        rookie_year: 1962,
                    };
                    data.push(obj);
                }
                this.sendToRenderer("send-team-data", data);
            },
            error: (error) => {
                let errobj = error;
                electron_1.dialog.showErrorBox("Error Importing Teams", errobj.message);
            },
        });
    }
    transformData(data) {
        let result = [];
        for (let entry of data) {
            let obj = {
                type_: entry.type_,
                number_: entry.number_,
                red_: [entry.r1_, entry.r2_, entry.r3_],
                blue_: [entry.b1_, entry.b2_, entry.b3_],
            };
            result.push(obj);
        }
        return result;
    }
    importMatchesFromFile(filename) {
        const file = fs.readFileSync(filename, "utf8");
        papaparse_1.default.parse(file, {
            header: true,
            skipEmptyLines: true,
            transformHeader(header, index) {
                let ret = header;
                if (index === 0) {
                    ret = "comp_level";
                }
                else if (index === 1) {
                    ret = "set_number";
                }
                else if (index === 2) {
                    ret = "match_number";
                }
                else if (index === 3) {
                    ret = "r1_";
                }
                else if (index === 4) {
                    ret = "r2_";
                }
                else if (index === 5) {
                    ret = "r3_";
                }
                else if (index === 6) {
                    ret = "b1_";
                }
                else if (index === 7) {
                    ret = "b2_";
                }
                else if (index === 8) {
                    ret = "b3_";
                }
                return ret;
            },
            complete: (results) => {
                let matches = [];
                for (let one of results.data) {
                    let oneobj = one;
                    let obj = {
                        key: "",
                        comp_level: oneobj.comp_level,
                        set_number: oneobj.set_number,
                        match_number: oneobj.match_number,
                        alliances: {
                            red: {
                                team_keys: [oneobj.r1_, oneobj.r2_, oneobj.r3_],
                            },
                            blue: {
                                team_keys: [oneobj.b1_, oneobj.b2_, oneobj.b3_],
                            },
                        },
                    };
                    matches.push(obj);
                }
                this.sendMatchDataInternal(matches);
            },
            error: (error) => {
                let errobj = error;
                electron_1.dialog.showErrorBox("Error Importing Teams", errobj.message);
            },
        });
    }
    loadBAEvent() {
        if (this.isBAAvailable()) {
            this.ba_?.getEvents()
                .then((frcevs) => {
                this.sendToRenderer("send-event-data", frcevs);
            })
                .catch((err) => {
                let errobj = err;
                electron_1.dialog.showMessageBoxSync(this.win_, {
                    title: "Load Blue Alliance Event",
                    message: errobj.message,
                });
                this.setView("info");
            });
        }
    }
    createEvent(year) {
        let ret = new Promise((resolve, reject) => {
            var path = electron_1.dialog.showOpenDialog({
                properties: ["openDirectory", "createDirectory"],
            });
            path
                .then((pathname) => {
                if (!pathname.canceled) {
                    project_1.Project.createEvent(this.logger_, pathname.filePaths[0], year, this.applicationType)
                        .then((p) => {
                        this.addRecent(p.location);
                        this.project = p;
                        this.sendHintDB();
                        this.updateMenuState(true);
                        this.setView("info");
                        this.sendNavData();
                        resolve();
                    })
                        .catch((err) => {
                        let errobj = err;
                        electron_1.dialog.showErrorBox("Create Project Error", errobj.message);
                        reject(err);
                    });
                }
            })
                .catch((err) => {
                electron_1.dialog.showErrorBox("Create Event Error", err.message);
            });
        });
        return ret;
    }
    addRecent(path) {
        let recents = [];
        if (this.hasSetting(SCCentral.recentFilesSetting)) {
            recents = this.getSetting(SCCentral.recentFilesSetting);
        }
        let index = recents.indexOf(path);
        if (index !== -1) {
            recents.splice(index, 1);
        }
        recents.unshift(path);
        if (recents.length > 5) {
            recents.splice(5);
        }
        this.setSetting(SCCentral.recentFilesSetting, recents);
    }
    selectTeamForm() {
        var path = electron_1.dialog.showOpenDialog({
            title: "Select Team Form",
            message: "Select team scouting form",
            filters: [
                {
                    extensions: ["json"],
                    name: "JSON file for team scouting form",
                },
                {
                    extensions: ["html"],
                    name: "HTML file for team scouting form",
                },
            ],
            properties: ["openFile"],
        });
        path.then((pathname) => {
            if (!pathname.canceled) {
                let result = formmgr_1.FormManager.validateForm(pathname.filePaths[0], "team");
                if (result.length > 0) {
                    electron_1.dialog.showErrorBox("Error", 'Error processing team form file: ' + result.join(', '));
                }
                else {
                    let result = this.project.setTeamForm(pathname.filePaths[0]);
                    if (result instanceof Error) {
                        electron_1.dialog.showErrorBox("Error", 'Error processing team form file: ' + result.message);
                    }
                    else {
                        this.sendNavData();
                    }
                }
                this.setView("info");
            }
        });
    }
    selectMatchForm() {
        var path = electron_1.dialog.showOpenDialog({
            title: "Select Match Form",
            message: "Select match scouting form",
            filters: [
                {
                    extensions: ["json"],
                    name: "JSON file for match scouting form",
                },
                {
                    extensions: ["html"],
                    name: "HTML file for match scouting form",
                },
            ],
            properties: ["openFile"],
        });
        path.then((pathname) => {
            if (!pathname.canceled) {
                let result = formmgr_1.FormManager.validateForm(pathname.filePaths[0], "match");
                if (result instanceof Error) {
                    electron_1.dialog.showErrorBox("Error", 'Error processing match form file: ' + result.join(', '));
                }
                else {
                    let result = this.project.setMatchForm(pathname.filePaths[0]);
                    if (result instanceof Error) {
                        electron_1.dialog.showErrorBox("Error", 'Error processing match form file: ' + result.message);
                    }
                    else {
                        this.sendNavData();
                    }
                }
                this.setView("info");
            }
        });
    }
    closeEvent() {
        if (this.project) {
            this.project.closeEvent();
            this.project = undefined;
            this.updateMenuState(false);
            this.sendNavData();
            this.setView("empty");
        }
    }
    openEvent(year) {
        var path = electron_1.dialog.showOpenDialog({
            title: "Event descriptor file",
            message: "Select event descriptor file",
            filters: [
                {
                    extensions: ["json"],
                    name: "JSON File for event descriptor",
                },
            ],
            properties: ["openFile"],
        });
        path
            .then((pathname) => {
            if (!pathname.canceled) {
                project_1.Project.openEvent(this.logger_, pathname.filePaths[0], year, this.applicationType)
                    .then((p) => {
                    this.addRecent(p.location);
                    this.project = p;
                    this.sendHintDB();
                    this.updateMenuState(true);
                    if (this.project.info?.locked_) {
                        this.startSyncServer();
                    }
                    this.setView("info");
                    this.sendNavData();
                })
                    .catch((err) => {
                    let errobj = err;
                    electron_1.dialog.showErrorBox("Open Project Error", errobj.message);
                });
            }
        })
            .catch((err) => {
            electron_1.dialog.showErrorBox("Open Event Error", err.message);
        });
    }
    // #region Sync Server Packet Processing
    initPacketHandlers() {
        this.packetHandlers_.set(packettypes_1.PacketType.HelloFromScouter, this.handleRequestHelloFromScouter.bind(this));
        this.packetHandlers_.set(packettypes_1.PacketType.HelloFromCoach, this.handleRequestHelloFromCoach.bind(this));
        this.packetHandlers_.set(packettypes_1.PacketType.RequestImages, this.handleRequestRequestImages.bind(this));
        this.packetHandlers_.set(packettypes_1.PacketType.RequestMatchResults, this.handleRequestMatchResults.bind(this));
        this.packetHandlers_.set(packettypes_1.PacketType.RequestTeamResults, this.handleRequestTeamResults.bind(this));
        this.packetHandlers_.set(packettypes_1.PacketType.RequestTablets, this.handleRequestTablets.bind(this));
        this.packetHandlers_.set(packettypes_1.PacketType.RequestTeamForm, this.handleRequestTeamForm.bind(this));
        this.packetHandlers_.set(packettypes_1.PacketType.RequestMatchForm, this.handleRequestMatchForm.bind(this));
        this.packetHandlers_.set(packettypes_1.PacketType.RequestTeamList, this.handleRequestTeamList.bind(this));
        this.packetHandlers_.set(packettypes_1.PacketType.RequestPlayoffAssignments, this.handleRequestPlayoffAssignments.bind(this));
        this.packetHandlers_.set(packettypes_1.PacketType.RequestPlayoffStatus, this.handleRequestPlayoffStatus.bind(this));
        this.packetHandlers_.set(packettypes_1.PacketType.RequestMatchList, this.handleRequestMatchList.bind(this));
        this.packetHandlers_.set(packettypes_1.PacketType.ProvideResults, this.handleProvideResults.bind(this));
        this.packetHandlers_.set(packettypes_1.PacketType.RequestProject, this.handleRequestProject.bind(this));
        this.packetHandlers_.set(packettypes_1.PacketType.RequestTeamDB, this.handleRequestTeamDB.bind(this));
        this.packetHandlers_.set(packettypes_1.PacketType.RequestMatchDB, this.handleRequestMatchDB.bind(this));
        this.packetHandlers_.set(packettypes_1.PacketType.GoodbyeFromCoach, this.handleGoodbyeFromCoach.bind(this));
        this.packetHandlers_.set(packettypes_1.PacketType.GoodbyeFromScouter, this.handleGoodbyeFromScouter.bind(this));
        this.packetHandlers_.set(packettypes_1.PacketType.ProvideCoachGraphs, this.handleProvideCoachGraphs.bind(this));
        this.packetHandlers_.set(packettypes_1.PacketType.ProvideCoachPickLists, this.handleProvideCoachPickLists.bind(this));
    }
    processPacket(p) {
        const handler = this.packetHandlers_.get(p.type_);
        if (handler) {
            return handler.call(this, p);
        }
        // Handle unknown packet types
        electron_1.dialog.showErrorBox("Internal Error #4", "Invalid packet type received");
        return new packetobj_1.PacketObj(packettypes_1.PacketType.Error, Buffer.from("internal error #4 - invalid packet type received"));
    }
    handleProvideCoachGraphs(p) {
        let obj = JSON.parse(p.payloadAsString());
        this.project.graph_mgr_.coachConfigs = obj;
        return new packetobj_1.PacketObj(packettypes_1.PacketType.ReceivedCoachGraphcs, Buffer.from("OK", "utf-8"));
    }
    handleProvideCoachPickLists(p) {
        let obj = JSON.parse(p.payloadAsString());
        this.project.picklist_mgr_.coachesPicklists = obj;
        return new packetobj_1.PacketObj(packettypes_1.PacketType.ReceivedCoachPickLists, Buffer.from("OK", "utf-8"));
    }
    handleRequestHelloFromScouter(p) {
        // Check if external download is in progress
        if (this.external_download_in_progress_) {
            return new packetobj_1.PacketObj(packettypes_1.PacketType.Error, Buffer.from("Central is busy downloading data from external sites. Please try syncing again after the download is complete.", "utf-8"));
        }
        // Set tablets syncing flag
        this.tablets_syncing_ = true;
        this.synctype_ = 'data';
        if (p.data_.length > 0) {
            try {
                let obj = JSON.parse(p.payloadAsString());
            }
            catch (err) { }
        }
        let evname;
        if (this.project?.info?.frcev_?.name) {
            evname = this.project.info.frcev_.name;
        }
        else if (this.project?.info?.name_) {
            evname = this.project?.info?.name_;
        }
        else {
            evname = "Unknown Event";
        }
        let evid = {
            uuid: this.project?.info?.uuid_,
            name: evname,
        };
        let uuidbuf = Buffer.from(JSON.stringify(evid), "utf-8");
        return new packetobj_1.PacketObj(packettypes_1.PacketType.HelloFromScouter, uuidbuf);
    }
    handleRequestHelloFromCoach(p) {
        let resp;
        if (!this.project) {
            resp = new packetobj_1.PacketObj(packettypes_1.PacketType.Error, Buffer.from("no event loaded on central", "utf-8"));
        }
        else if (!this.project.info.locked_) {
            resp = new packetobj_1.PacketObj(packettypes_1.PacketType.Error, Buffer.from("event on central is not locked", "utf-8"));
        }
        else {
            this.synctype_ = 'coach';
            if (p.data_.length > 0) {
                try {
                    let obj = JSON.parse(p.payloadAsString());
                }
                catch (err) { }
            }
            let evname;
            if (this.project?.info?.frcev_?.name) {
                evname = this.project.info.frcev_.name;
            }
            else if (this.project?.info?.name_) {
                evname = this.project?.info?.name_;
            }
            else {
                evname = "Unknown Event";
            }
            let evid = {
                uuid: this.project?.info?.uuid_,
                name: evname,
            };
            let uuidbuf = Buffer.from(JSON.stringify(evid), "utf-8");
            resp = new packetobj_1.PacketObj(packettypes_1.PacketType.HelloFromCoach, uuidbuf);
        }
        return resp;
    }
    handleRequestRequestImages(p) {
        let obj = JSON.parse(p.payloadAsString());
        let retdata = {};
        for (let img of obj) {
            let path = this.image_mgr_.getImage(img);
            let imdata = Buffer.from('');
            if (path) {
                let imdata2 = fs.readFileSync(path);
                imdata = Buffer.from(imdata2);
            }
            retdata[img] = imdata.toString('base64');
        }
        let data = new Uint8Array(0);
        let msg = JSON.stringify(retdata);
        data = Buffer.from(msg, "utf-8");
        return new packetobj_1.PacketObj(packettypes_1.PacketType.ProvideImages, data);
    }
    handleRequestMatchResults(p) {
        let obj = JSON.parse(p.payloadAsString());
        let results = [];
        for (let match of obj) {
            let one = this.project.data_mgr_.getMatchResult(match);
            if (one) {
                results.push(one);
            }
        }
        let msg = JSON.stringify(results);
        return new packetobj_1.PacketObj(packettypes_1.PacketType.ProvideMatchResults, Buffer.from(msg, "utf-8"));
    }
    handleRequestTeamResults(p) {
        let obj = JSON.parse(p.payloadAsString());
        let results = [];
        for (let team of obj) {
            let one = this.project.data_mgr_.getTeamResult(team);
            if (one) {
                results.push(one);
            }
        }
        let msg = JSON.stringify(results);
        return new packetobj_1.PacketObj(packettypes_1.PacketType.ProvideTeamResults, Buffer.from(msg, "utf-8"));
    }
    handleRequestTablets(p) {
        this.synctype_ = "initialize";
        let data = new Uint8Array(0);
        if (this.project && this.project.tablet_mgr_?.areTabletsValid()) {
            let tablets = [];
            for (let t of this.project?.tablet_mgr_.getTablets()) {
                if (!t.assigned) {
                    tablets.push({ name: t.name, purpose: t.purpose });
                }
            }
            let msg = JSON.stringify(tablets);
            data = Buffer.from(msg, "utf-8");
        }
        return new packetobj_1.PacketObj(packettypes_1.PacketType.ProvideTablets, data);
    }
    handleRequestTeamForm(p) {
        if (this.project?.form_mgr_?.hasForms()) {
            let jsonstr = fs.readFileSync(this.project.form_mgr_.getTeamFormFullPath()).toString();
            return new packetobj_1.PacketObj(packettypes_1.PacketType.ProvideTeamForm, Buffer.from(jsonstr, "utf8"));
        }
        else {
            electron_1.dialog.showErrorBox("Internal Error #1", "No team form is defined but event is locked");
            return new packetobj_1.PacketObj(packettypes_1.PacketType.Error, Buffer.from("internal error #1 - no team form", "utf-8"));
        }
    }
    handleRequestMatchForm(p) {
        if (this.project?.form_mgr_?.hasForms()) {
            let jsonstr = fs.readFileSync(this.project.form_mgr_.getMatchFormFullPath()).toString();
            return new packetobj_1.PacketObj(packettypes_1.PacketType.ProvideMatchForm, Buffer.from(jsonstr, "utf8"));
        }
        else {
            electron_1.dialog.showErrorBox("Internal Error #1", "No match form is defined but event is locked");
            return new packetobj_1.PacketObj(packettypes_1.PacketType.Error, Buffer.from("internal error #1 - no match form", "utf-8"));
        }
    }
    handleRequestTeamList(p) {
        if (this.project?.tablet_mgr_?.hasTeamAssignments()) {
            let str = JSON.stringify(this.project?.tablet_mgr_?.getTeamAssignments());
            return new packetobj_1.PacketObj(packettypes_1.PacketType.ProvideTeamList, Buffer.from(str));
        }
        else {
            electron_1.dialog.showErrorBox("Internal Error #2", "No team list has been generated for a locked event");
            return new packetobj_1.PacketObj(packettypes_1.PacketType.Error, Buffer.from("internal error #2 - no team list generated for a locked event", "utf-8"));
        }
    }
    handleRequestPlayoffAssignments(p) {
        if (this.project?.tablet_mgr_?.hasPlayoffAssignments()) {
            let str = JSON.stringify(this.project?.tablet_mgr_?.getPlayoffAssignments());
            return new packetobj_1.PacketObj(packettypes_1.PacketType.ProvidePlayoffAssignments, Buffer.from(str));
        }
        else {
            let str = JSON.stringify(null);
            return new packetobj_1.PacketObj(packettypes_1.PacketType.ProvidePlayoffAssignments, Buffer.from(str));
        }
    }
    handleRequestPlayoffStatus(p) {
        if (this.project?.playoff_mgr_?.hasPlayoffStatus()) {
            let str = JSON.stringify(this.project?.playoff_mgr_?.info);
            return new packetobj_1.PacketObj(packettypes_1.PacketType.ProvidePlayoffStatus, Buffer.from(str));
        }
        else {
            let str = JSON.stringify(null);
            return new packetobj_1.PacketObj(packettypes_1.PacketType.ProvidePlayoffStatus, Buffer.from(str));
        }
    }
    handleRequestMatchList(p) {
        if (this.project?.tablet_mgr_?.hasMatchAssignments()) {
            let str = JSON.stringify(this.project?.tablet_mgr_?.getMatchAssignments());
            return new packetobj_1.PacketObj(packettypes_1.PacketType.ProvideMatchList, Buffer.from(str));
        }
        else {
            let str = JSON.stringify([]);
            return new packetobj_1.PacketObj(packettypes_1.PacketType.ProvideMatchList, Buffer.from(str));
        }
    }
    handleProvideResults(p) {
        try {
            let obj = JSON.parse(p.payloadAsString());
            this.project.data_mgr_?.processResults(obj)
                .then((count) => {
                if (this.project.tablet_mgr_.isTabletTeam(obj.tablet)) {
                    this.setView("team-status");
                }
                else {
                    this.setView("match-status");
                }
            })
                .catch((err) => {
                let errobj = err;
                electron_1.dialog.showErrorBox("Internal Error #3", "Error processing results: " + errobj.message);
            });
            return new packetobj_1.PacketObj(packettypes_1.PacketType.ReceivedResults);
        }
        catch (err) {
            electron_1.dialog.showErrorBox("Internal Error #5", "invalid results json received by central host");
            return new packetobj_1.PacketObj(packettypes_1.PacketType.Error, Buffer.from("internal error #5 - invalid results json received by central host", "utf-8"));
        }
    }
    handleRequestProject(p) {
        if (this.project) {
            let msg = JSON.stringify(this.project.info);
            return new packetobj_1.PacketObj(packettypes_1.PacketType.ProvideProject, Buffer.from(msg, "utf-8"));
        }
        return undefined;
    }
    handleRequestTeamDB(p) {
        if (this.project) {
            let data = this.project.data_mgr_.getTeamDBEncoded();
            return new packetobj_1.PacketObj(packettypes_1.PacketType.ProvideTeamDB, data);
        }
        return undefined;
    }
    handleRequestMatchDB(p) {
        if (this.project) {
            let data = this.project.data_mgr_.getMatchDBEncoded();
            return new packetobj_1.PacketObj(packettypes_1.PacketType.ProvideMatchDB, data);
        }
        return undefined;
    }
    handleGoodbyeFromCoach(p) {
        let msg;
        msg = `Coach tablet has sucessfully synchronized scouting data with this host, all data transferred`;
        electron_1.dialog.showMessageBox(this.win_, {
            title: "Synchronization Complete",
            message: msg,
            type: "info",
        });
        return undefined;
    }
    handleGoodbyeFromScouter(p) {
        // Clear tablets syncing flag
        this.tablets_syncing_ = false;
        let msg;
        if (this.synctype_ === "initialize") {
            msg = "Tablet '" + p.payloadAsString() + "' has sucessfully completed synchronization and is ready to use";
        }
        else {
            msg = `Tablet '${p.payloadAsString()}' has sucessfully synchronized scouting data with this host, new records added`;
        }
        electron_1.dialog.showMessageBox(this.win_, {
            title: "Synchronization Complete",
            message: msg,
            type: "info",
        });
        return undefined;
    }
    startSyncServer() {
        if (!this.tcpsyncserver_) {
            this.tcpsyncserver_ = new tcpserver_1.TCPSyncServer(this.logger_);
            this.tcpsyncserver_
                .init()
                .then(() => {
                this.logger_.info("TCPSyncServer: initialization completed sucessfully");
            })
                .catch((err) => {
                let errobj = err;
                electron_1.dialog.showErrorBox("TCP Sync", "Cannot start TCP sync - " + err.message);
            });
            this.tcpsyncserver_.on("packet", (p) => {
                let reply = this.processPacket(p);
                if (reply) {
                    this.tcpsyncserver_.send(reply).then(() => {
                        if (reply.type_ === packettypes_1.PacketType.Error) {
                            this.tablets_syncing_ = false; // Clear flag on error
                            this.tcpsyncserver_.shutdownClient();
                        }
                    });
                }
                else {
                    this.tablets_syncing_ = false; // Clear flag on shutdown
                    this.tcpsyncserver_?.shutdownClient();
                }
            });
            this.tcpsyncserver_.on("error", (err) => {
                this.tablets_syncing_ = false; // Clear flag on error
                this.tcpsyncserver_?.shutdownClient();
                electron_1.dialog.showMessageBox(this.win_, {
                    message: "Error syncing client - " + err.message,
                    title: "Client Sync Error",
                });
            });
        }
        if (!this.udp_broadcast_) {
            this.udp_broadcast_ = new udpbroadcast_1.UDPBroadcast(this.logger_, this.findPrimaryIPAddress(), this.team_number_, 5000);
            this.udp_broadcast_.start();
        }
    }
    // #endregion
    setExternalDownloadInProgress(operation) {
        if (this.external_download_in_progress_) {
            this.logger_.warn(`Attempting to start external download (${operation}) while another download is already in progress`);
        }
        this.external_download_in_progress_ = true;
        this.logger_.info(`External download started: ${operation}`);
        // Set a timeout to automatically clear the flag if download hangs (30 minutes)
        this.external_download_timeout_ = setTimeout(() => {
            this.logger_.error(`External download timeout reached for: ${operation}. Forcing clear of download flag.`);
            this.clearExternalDownloadInProgress(`${operation} (timeout)`);
        }, 30 * 60 * 1000); // 30 minutes
    }
    clearExternalDownloadInProgress(operation) {
        this.external_download_in_progress_ = false;
        this.logger_.info(`External download completed: ${operation}`);
        if (this.external_download_timeout_) {
            clearTimeout(this.external_download_timeout_);
            this.external_download_timeout_ = undefined;
        }
    }
    forceClearExternalDownload() {
        if (this.external_download_in_progress_) {
            this.logger_.warn("Manually clearing stuck external download");
            this.clearExternalDownloadInProgress("Manual Clear");
            electron_1.dialog.showMessageBox(this.win_, {
                title: "External Download Cleared",
                message: "The external download flag has been manually cleared. You can now start new downloads.",
                type: "info",
            });
        }
        else {
            electron_1.dialog.showMessageBox(this.win_, {
                title: "No Download In Progress",
                message: "No external download is currently in progress.",
                type: "info",
            });
        }
    }
    generateRandomData() {
        if (this.lastview_ && this.lastview_ === 'info') {
            if (this.project && this.project.isInitialized() && this.project.isLocked) {
                let ans = electron_1.dialog.showMessageBoxSync({
                    title: 'Generate Random Data',
                    type: 'question',
                    buttons: ['Yes', 'No'],
                    message: `This operation will generate random data for all teams and matches in the event. This will overwrite any existing data. Do you want to continue?`,
                });
                if (ans === 1) {
                    return;
                }
                this.project.generateRandomData()
                    .then(() => {
                    electron_1.dialog.showMessageBox(this.win_, {
                        title: "Random Data",
                        message: "Random data generated",
                    });
                })
                    .catch((err) => {
                    let errobj = err;
                    electron_1.dialog.showMessageBox(this.win_, {
                        title: "Random Data Error",
                        message: `Error generating random data - ${errobj.message}`
                    });
                });
            }
            else {
                electron_1.dialog.showMessageBox(this.win_, {
                    title: "Random Data Error",
                    message: "You can only generate data for an opened and locked project",
                });
            }
        }
    }
    importFormulasFromFileWithPath(path) {
        if (this.project && this.project.isInitialized()) {
            try {
                let data = fs.readFileSync(path, 'utf-8');
                const obj = JSON.parse(data);
                this.project.formula_mgr_.importFormulas(obj);
            }
            catch (err) {
                let errobj = err;
                electron_1.dialog.showErrorBox("Coule not import formulas", errobj.message);
            }
        }
    }
    importFormulasFromFile() {
        electron_1.dialog.showOpenDialog(this.win_, {
            title: 'Import formulas from file',
            filters: [
                { name: 'JSON Files', extensions: ['json'] },
                { name: 'All Files', extensions: ['*'] }
            ],
            properties: [
                'openFile',
            ]
        }).then(result => {
            if (!result.canceled) {
                this.importFormulasFromFileWithPath(result.filePaths[0]);
            }
        });
    }
    sendHintDB() {
        if (this.project && this.project.isInitialized()) {
            let db = this.project.getHintDb(this.content_dir_);
            this.sendToRenderer('send-hint-db', db);
        }
    }
    setHintHidden(id) {
        if (this.project && this.project.isInitialized()) {
            this.project.setHintHidden(id);
        }
    }
    setTeamFormatFormulas(formulas) {
        if (this.project && this.project.isInitialized()) {
            this.project.data_mgr_.setTeamFormatFormulas(formulas);
        }
    }
    setMatchFormatFormulas(formulas) {
        if (this.project && this.project.isInitialized()) {
            this.project.data_mgr_.setMatchFormatFormulas(formulas);
        }
    }
    // Handle the response from the renderer
    handlePromptStringResponse(response) {
        if (this.promptResolvers && this.promptResolvers.has(response.id)) {
            const resolver = this.promptResolvers.get(response.id);
            this.promptResolvers.delete(response.id);
            if (resolver) {
                resolver(response.value);
            }
        }
    }
    async sendMatchConfigs() {
        if (this.project_ && this.project_.isInitialized()) {
            // Store configs in project info or a separate JSON file  
            let config = this.loadMatchConfigsFromFile();
            this.sendToRenderer('send-match-configs', config);
        }
    }
    async updateMatchConfig(config) {
        if (this.project_ && this.project_.isInitialized()) {
            let configs = this.loadMatchConfigsFromFile();
            configs.data.push(config);
            this.saveMatchConfigsToFile(configs);
        }
    }
    async updateMatchCurrent(config) {
        if (this.project_ && this.project_.isInitialized()) {
            let configs = this.loadMatchConfigsFromFile();
            configs.current = config;
            this.saveMatchConfigsToFile(configs);
            this.sendToRenderer('send-match-configs', configs);
        }
    }
    async deleteMatchConfig(name) {
        if (this.project_ && this.project_.isInitialized()) {
            let configs = this.loadMatchConfigsFromFile();
            configs.data = configs.data.filter(c => c.name !== name);
            if (configs.current === name) {
                configs.current = undefined;
            }
            this.saveMatchConfigsToFile(configs);
            this.sendToRenderer('send-match-configs', configs);
        }
    }
    async getMatchData(config) {
        // Implement match data retrieval based on config  
        // Use existing data_mgr_ to get match data  
    }
    loadMatchConfigsFromFile() {
        const configPath = path.join(this.project_.location, 'match-configs.json');
        if (fs.existsSync(configPath)) {
            return JSON.parse(fs.readFileSync(configPath, 'utf-8'));
        }
        return { current: undefined, data: [] };
    }
    saveMatchConfigsToFile(configs) {
        const configPath = path.join(this.project_.location, 'match-configs.json');
        fs.writeFileSync(configPath, JSON.stringify(configs, null, 2));
    }
}
exports.SCCentral = SCCentral;
SCCentral.recentFilesSetting = "recent-files";
SCCentral.matchStatusFields = [
    "comp_level",
    "set_number",
    "match_number",
    "team_key",
    "r1",
    "r2",
    "r3",
    "b1",
    "b2",
    "b3",
];
SCCentral.createMatchForm = 'create-match-form';
SCCentral.editMatchForm = 'edit-match-form';
SCCentral.createTeamForm = 'create-team-form';
SCCentral.editTeamForm = 'edit-team-form';
SCCentral.openExistingEvent = 'open-existing';
SCCentral.closeEvent = 'close-event';
SCCentral.createNewEvent = 'create-new';
SCCentral.selectTeamForm = 'select-team-form';
SCCentral.selectMatchForm = 'select-match-form';
SCCentral.assignTablets = 'assign-tablets';
SCCentral.loadBAEvent = 'load-ba-event';
SCCentral.viewInit = 'view-init';
SCCentral.viewDataSets = 'view-datasets';
SCCentral.viewPicklist = 'view-picklist';
SCCentral.lockEvent = 'lock-event';
SCCentral.editTeams = 'edit-teams';
SCCentral.editMatches = 'edit-matches';
SCCentral.importTeams = 'import-teams';
SCCentral.importMatches = 'import-matches';
SCCentral.viewTeamForm = 'view-team-form';
SCCentral.viewTeamStatus = 'view-team-status';
SCCentral.viewTeamDB = 'view-team-db';
SCCentral.viewMatchForm = 'view-match-form';
SCCentral.viewMatchStatus = 'view-match-status';
SCCentral.viewMatchDB = 'view-match-db';
SCCentral.viewHelp = 'view-help';
SCCentral.viewAbout = 'view-about';
SCCentral.viewFormulas = 'view-formulas';
SCCentral.viewSingleTeamSummary = 'view-single-team-summary';
SCCentral.viewPlayoffs = 'view-playoffs';
SCCentral.clearExternalDownload = 'clear-external-download';
SCCentral.viewPredictor = 'view-predictor';
//# sourceMappingURL=sccentral.js.map