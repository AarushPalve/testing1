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
exports.scappbase = void 0;
const electron_1 = require("electron");
const path = __importStar(require("path"));
const scscout_1 = require("./main/apps/scscout");
const sccentral_1 = require("./main/apps/sccentral");
const sccoach_1 = require("./main/apps/sccoach");
const ipchandlers_1 = require("./main/ipchandlers");
const unittest_1 = require("./main/units/unittest");
exports.scappbase = undefined;
const Config = require('electron-config');
let config = new Config();
function createWindow() {
    const args = process.argv;
    let content = path.join(process.cwd(), 'content');
    let icon = path.join(content, 'images', 'tardis.ico');
    let bounds = config.get('windowBounds');
    let opts = {
        icon: icon,
        webPreferences: {
            nodeIntegration: false,
            contextIsolation: true,
            preload: path.join(__dirname, 'main', 'preload.js'),
        },
        title: "XeroScout"
    };
    if (bounds) {
        opts.width = bounds.width;
        opts.height = bounds.height;
        opts.x = bounds.x;
        opts.y = bounds.y;
    }
    const win = new electron_1.BrowserWindow(opts);
    bounds = undefined;
    if (!bounds) {
        win.maximize();
    }
    if (process.argv.length > 2) {
        let index = 2;
        while (index < process.argv.length && process.argv[index].startsWith('-')) {
            index++;
        }
        if (index === process.argv.length) {
            exports.scappbase = new sccentral_1.SCCentral(win, args);
        }
        else if (process.argv[index] === "scout") {
            exports.scappbase = new scscout_1.SCScout(win, args);
        }
        else if (process.argv[index] === "coach") {
            exports.scappbase = new sccoach_1.SCCoach(win, args);
        }
        else if (process.argv[index] === 'central') {
            exports.scappbase = new sccentral_1.SCCentral(win, args);
        }
        else if (process.argv[index] === 'unittests') {
            (0, unittest_1.runUnitTests)();
            electron_1.app.exit(0);
        }
        else {
            electron_1.dialog.showMessageBoxSync(win, {
                type: 'error',
                title: 'Error',
                message: 'Invalid application specified - the first argument that is not a flag must be the application name (e.g. scout, coach, central)',
                buttons: ['OK']
            });
            electron_1.app.exit(1);
        }
    }
    if (!exports.scappbase) {
        console.log("No App Created, args: " + process.argv);
        electron_1.app.exit(1);
    }
    win
        .loadFile(exports.scappbase.basePage())
        .then(() => {
        exports.scappbase?.mainWindowLoaded();
    })
        .catch((e) => {
        exports.scappbase?.logger_.error("Error loading page: " + e);
    });
    electron_1.Menu.setApplicationMenu(exports.scappbase.createMenu());
    win.on('ready-to-show', () => {
        // win.webContents.openDevTools() ;
    });
    win.on("close", (event) => {
        if (exports.scappbase) {
            if (!exports.scappbase.canQuit()) {
                event.preventDefault();
            }
            else {
                config.set('windowBounds', win.getBounds());
            }
        }
    });
    exports.scappbase.windowCreated();
}
electron_1.app.on("ready", () => {
    electron_1.ipcMain.on('sync-ipaddr', (event, ...args) => { (0, ipchandlers_1.syncIPAddr)('splitter-changed', ...args); });
    electron_1.ipcMain.on('splitter-changed', (event, ...args) => { (0, ipchandlers_1.splitterChanged)('splitter-changed', ...args); });
    electron_1.ipcMain.on('get-nav-data', (event, ...args) => { (0, ipchandlers_1.getNavData)('get-nav-data', ...args); });
    electron_1.ipcMain.on('get-info-data', (event, ...args) => { (0, ipchandlers_1.getInfoData)('get-info-data', ...args); });
    electron_1.ipcMain.on('get-formulas', (event, ...args) => { (0, ipchandlers_1.getFormulas)('get-formulas', ...args); });
    electron_1.ipcMain.on('get-datasets', (event, ...args) => { (0, ipchandlers_1.getDataSets)('get-datasets', ...args); });
    electron_1.ipcMain.on('update-datasets', (event, ...args) => { (0, ipchandlers_1.updateDataSet)('update-datasets', ...args); });
    electron_1.ipcMain.on('delete-formula', (event, ...args) => { (0, ipchandlers_1.deleteFormula)('delete-formulas', ...args); });
    electron_1.ipcMain.on('rename-formula', (event, ...args) => { (0, ipchandlers_1.renameFormula)('rename-formula', ...args); });
    electron_1.ipcMain.on('update-formula', (event, ...args) => { (0, ipchandlers_1.updateFormula)('update-formula', ...args); });
    electron_1.ipcMain.on('generate-random-data', (event, ...args) => { (0, ipchandlers_1.generateRandomData)('generate-random-data', ...args); });
    electron_1.ipcMain.on('set-event-name', (event, ...args) => { (0, ipchandlers_1.setEventName)('set-event-name', ...args); });
    electron_1.ipcMain.on('get-event-data', (event, ...args) => { (0, ipchandlers_1.getSelectEventData)('get-event-data', ...args); });
    electron_1.ipcMain.on('get-tablet-data', (event, ...args) => { (0, ipchandlers_1.getTabletData)('get-tablet-data', ...args); });
    electron_1.ipcMain.on('set-tablet-data', (event, ...args) => { (0, ipchandlers_1.setTabletData)('set-tablet-data', ...args); });
    electron_1.ipcMain.on('get-team-data', (event, ...args) => { (0, ipchandlers_1.getTeamData)('get-team-data', ...args); });
    electron_1.ipcMain.on('get-team-field-list', (event, ...args) => { (0, ipchandlers_1.getTeamFieldList)('get-team-field-list', ...args); });
    electron_1.ipcMain.on('get-match-field-list', (event, ...args) => { (0, ipchandlers_1.getMatchFieldList)('get-match-field-list', ...args); });
    electron_1.ipcMain.on('get-match-db', (event, ...args) => { (0, ipchandlers_1.getMatchDB)('get-match-db', ...args); });
    electron_1.ipcMain.on('update-match-db', (event, ...args) => { (0, ipchandlers_1.updateMatchDB)('update-match-db', ...args); });
    electron_1.ipcMain.on('get-team-db', (event, ...args) => { (0, ipchandlers_1.getTeamDB)('get-team-db', ...args); });
    electron_1.ipcMain.on('update-team-db', (event, ...args) => { (0, ipchandlers_1.updateTeamDB)('update-team-db', ...args); });
    electron_1.ipcMain.on('get-preview-match-db', (event, ...args) => { (0, ipchandlers_1.getPreviewMatchDB)('get-preview-match-db', ...args); });
    electron_1.ipcMain.on('update-preview-match-db', (event, ...args) => { (0, ipchandlers_1.updatePreviewMatchDB)('update-preview-match-db', ...args); });
    electron_1.ipcMain.on('reset-preview-match-db', (event, ...args) => { (0, ipchandlers_1.resetPreviewMatchDB)('reset-preview-match-db', ...args); });
    electron_1.ipcMain.on('get-form', (event, ...args) => { (0, ipchandlers_1.getForm)('get-form', ...args); });
    electron_1.ipcMain.on('get-image-data', (event, ...args) => { (0, ipchandlers_1.getImageData)('get-image-data', ...args); });
    electron_1.ipcMain.on('save-form', (event, ...args) => { (0, ipchandlers_1.saveForm)('save-form', ...args); });
    electron_1.ipcMain.on('get-match-data', (event, ...args) => { (0, ipchandlers_1.getMatchData)('get-match-data', ...args); });
    electron_1.ipcMain.on('get-team-status', (event, ...args) => { (0, ipchandlers_1.getTeamStatus)('get-team-status', ...args); });
    electron_1.ipcMain.on('get-match-status', (event, ...args) => { (0, ipchandlers_1.getMatchStatus)('get-match-status', ...args); });
    electron_1.ipcMain.on('set-team-data', (event, ...args) => { (0, ipchandlers_1.setTeamData)('set-team-data', ...args); });
    electron_1.ipcMain.on('set-match-data', (event, ...args) => { (0, ipchandlers_1.setMatchData)('set-match-data', ...args); });
    electron_1.ipcMain.on('load-ba-event-data', (event, ...args) => { (0, ipchandlers_1.loadBaEventData)('load-ba-event-data', ...args); });
    electron_1.ipcMain.on('execute-command', (event, ...args) => { (0, ipchandlers_1.executeCommand)('execute-command', ...args); });
    electron_1.ipcMain.on('set-tablet-name-purpose', (event, ...args) => { (0, ipchandlers_1.setTabletNamePurpose)('set-table-name-purpose', ...args); });
    electron_1.ipcMain.on('provide-result', (event, ...args) => { (0, ipchandlers_1.provideResult)('provide-result', ...args); });
    electron_1.ipcMain.on('send-match-col-config', (event, ...args) => { (0, ipchandlers_1.sendMatchColConfig)('send-match-col-config', ...args); });
    electron_1.ipcMain.on('send-team-col-config', (event, ...args) => { (0, ipchandlers_1.sendTeamColConfig)('send-team-col-config', ...args); });
    electron_1.ipcMain.on('get-team-list', (event, ...args) => { (0, ipchandlers_1.getTeamList)('get-team-list', ...args); });
    electron_1.ipcMain.on('get-hint-db', (event, ...args) => { (0, ipchandlers_1.getHintDB)('get-hint-db', ...args); });
    electron_1.ipcMain.on('set-hint-hidden', (event, ...args) => { (0, ipchandlers_1.setHintHidden)('get-hint-db', ...args); });
    electron_1.ipcMain.on('get-playoff-status', (event, ...args) => { (0, ipchandlers_1.getPlayoffStatus)('get-playoff-status', ...args); });
    electron_1.ipcMain.on('set-alliance-teams', (event, ...args) => { (0, ipchandlers_1.setAllianceTeams)('set-alliance-teams', ...args); });
    electron_1.ipcMain.on('set-playoff-match-outcome', (event, ...args) => { (0, ipchandlers_1.setPlayoffMatchOutcome)('set-playoff-match-outcome', ...args); });
    electron_1.ipcMain.on('get-match-format-formulas', (event, ...args) => { (0, ipchandlers_1.getMatchFormatFormulas)('get-match-format-formulas', ...args); });
    electron_1.ipcMain.on('get-team-format-formulas', (event, ...args) => { (0, ipchandlers_1.getTeamFormatFormulas)('get-team-format-formulas', ...args); });
    electron_1.ipcMain.on('set-match-format-formulas', (event, ...args) => { (0, ipchandlers_1.setMatchFormatFormulas)('set-match-format-formulas', ...args); });
    electron_1.ipcMain.on('set-team-format-formulas', (event, ...args) => { (0, ipchandlers_1.setTeamFormatFormulas)('set-team-format-formulas', ...args); });
    electron_1.ipcMain.on('get-image-names', (event, ...args) => { (0, ipchandlers_1.getImageNames)('get-image-names', ...args); });
    electron_1.ipcMain.on('get-chart-data', (event, ...args) => { (0, ipchandlers_1.getGraphData)('get-chart-data', ...args); });
    electron_1.ipcMain.on('get-single-team-configs', (event, ...args) => { (0, ipchandlers_1.getSingleTeamConfigs)('get-single-team-configs', ...args); });
    electron_1.ipcMain.on('update-single-team-configs', (event, ...args) => { (0, ipchandlers_1.updateSingleTeamConfigs)('update-single-team-configs', ...args); });
    electron_1.ipcMain.on('get-multi-team-configs', (event, ...args) => { (0, ipchandlers_1.getSingleTeamConfigs)('get-multi-team-configs', ...args); });
    electron_1.ipcMain.on('update-multi-team-configs', (event, ...args) => { (0, ipchandlers_1.updateSingleTeamConfigs)('update-multi-team-configs', ...args); });
    electron_1.ipcMain.on('get-match-configs', (event, ...args) => { (0, ipchandlers_1.getSingleTeamConfigs)('get-match-configs', ...args); });
    electron_1.ipcMain.on('update-match-configs', (event, ...args) => { (0, ipchandlers_1.updateSingleTeamConfigs)('update-match-configs', ...args); });
    electron_1.ipcMain.on('get-chart-data', (event, ...args) => { (0, ipchandlers_1.getGraphData)('get-graph-data', ...args); });
    electron_1.ipcMain.on('get-picklist-configs', (event, ...args) => { (0, ipchandlers_1.getPicklistConfigs)('get-picklist-config', ...args); });
    electron_1.ipcMain.on('save-picklist-config', (event, ...args) => { (0, ipchandlers_1.savePicklistConfig)('save-picklist-config', ...args); });
    electron_1.ipcMain.on('get-picklist-data', (event, ...args) => { (0, ipchandlers_1.getPicklistData)('get-picklist-data', ...args); });
    electron_1.ipcMain.on('prompt-string-request', (event, ...args) => { (0, ipchandlers_1.promptStringRequest)('prompt-string-request', ...args); });
    electron_1.ipcMain.on('prompt-string-response', (event, ...args) => { (0, ipchandlers_1.promptStringResponse)('prompt-string-response', ...args); });
    electron_1.ipcMain.on('get-match-configs', (event, ...args) => { (0, ipchandlers_1.getMatchConfigs)('get-match-configs', ...args); });
    electron_1.ipcMain.on('update-match-config', (event, ...args) => { (0, ipchandlers_1.updateMatchConfig)('update-match-config', ...args); });
    electron_1.ipcMain.on('update-match-current', (event, ...args) => { (0, ipchandlers_1.updateMatchCurrent)('update-match-current', ...args); });
    electron_1.ipcMain.on('delete-match-config', (event, ...args) => { (0, ipchandlers_1.deleteMatchConfig)('delete-match-config', ...args); });
    electron_1.ipcMain.on('get-match-config-data', (event, ...args) => { (0, ipchandlers_1.getMatchConfigData)('get-match-config-data', ...args); });
    electron_1.ipcMain.on('get-match-list', (event, ...args) => { (0, ipchandlers_1.getMatchList)('get-match-list', ...args); });
    createWindow();
});
electron_1.app.on('window-all-closed', () => {
    if (process.platform !== 'darwin') {
        electron_1.app.quit();
    }
});
electron_1.app.on('before-quit', (ev) => {
    if (exports.scappbase) {
        if (!exports.scappbase.canQuit()) {
            ev.preventDefault();
        }
        else {
            exports.scappbase.close();
        }
    }
});
//# sourceMappingURL=main.js.map