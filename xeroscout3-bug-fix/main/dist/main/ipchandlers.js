"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getInfoData = getInfoData;
exports.getNavData = getNavData;
exports.getTeamFieldList = getTeamFieldList;
exports.getMatchFieldList = getMatchFieldList;
exports.getFormulas = getFormulas;
exports.getDataSets = getDataSets;
exports.renameDataSet = renameDataSet;
exports.updateDataSet = updateDataSet;
exports.getSelectEventData = getSelectEventData;
exports.getTabletData = getTabletData;
exports.generateRandomData = generateRandomData;
exports.getTeamData = getTeamData;
exports.getMatchData = getMatchData;
exports.setTeamData = setTeamData;
exports.getMatchDB = getMatchDB;
exports.updateMatchDB = updateMatchDB;
exports.getTeamDB = getTeamDB;
exports.getPreviewMatchDB = getPreviewMatchDB;
exports.updatePreviewMatchDB = updatePreviewMatchDB;
exports.resetPreviewMatchDB = resetPreviewMatchDB;
exports.updateTeamDB = updateTeamDB;
exports.getTeamStatus = getTeamStatus;
exports.getMatchStatus = getMatchStatus;
exports.getTeamList = getTeamList;
exports.getMatchList = getMatchList;
exports.loadBaEventData = loadBaEventData;
exports.executeCommand = executeCommand;
exports.setTabletData = setTabletData;
exports.deleteFormula = deleteFormula;
exports.updateFormula = updateFormula;
exports.renameFormula = renameFormula;
exports.setEventName = setEventName;
exports.getForm = getForm;
exports.getImageData = getImageData;
exports.getImageNames = getImageNames;
exports.importImage = importImage;
exports.saveForm = saveForm;
exports.setMatchData = setMatchData;
exports.setTabletNamePurpose = setTabletNamePurpose;
exports.provideResult = provideResult;
exports.sendMatchColConfig = sendMatchColConfig;
exports.sendTeamColConfig = sendTeamColConfig;
exports.getPicklistData = getPicklistData;
exports.getPicklistConfigs = getPicklistConfigs;
exports.savePicklistConfig = savePicklistConfig;
exports.getSingleTeamData = getSingleTeamData;
exports.getSingleTeamConfig = getSingleTeamConfig;
exports.getHintDB = getHintDB;
exports.setHintHidden = setHintHidden;
exports.getPlayoffStatus = getPlayoffStatus;
exports.setAllianceTeams = setAllianceTeams;
exports.getMatchFormatFormulas = getMatchFormatFormulas;
exports.getTeamFormatFormulas = getTeamFormatFormulas;
exports.setTeamFormatFormulas = setTeamFormatFormulas;
exports.setMatchFormatFormulas = setMatchFormatFormulas;
exports.setPlayoffMatchOutcome = setPlayoffMatchOutcome;
exports.syncIPAddr = syncIPAddr;
exports.clientLog = clientLog;
exports.splitterChanged = splitterChanged;
exports.getSingleTeamConfigs = getSingleTeamConfigs;
exports.updateSingleTeamConfigs = updateSingleTeamConfigs;
exports.getGraphData = getGraphData;
exports.promptStringRequest = promptStringRequest;
exports.promptStringResponse = promptStringResponse;
exports.getMatchConfigs = getMatchConfigs;
exports.updateMatchConfig = updateMatchConfig;
exports.updateMatchCurrent = updateMatchCurrent;
exports.deleteMatchConfig = deleteMatchConfig;
exports.getMatchConfigData = getMatchConfigData;
const main_1 = require("../main");
function isScoutType() {
    if (!main_1.scappbase) {
        return false;
    }
    return main_1.scappbase.applicationType === 'scout';
}
function isCentralType() {
    if (!main_1.scappbase) {
        return false;
    }
    return main_1.scappbase.applicationType === 'central';
}
function isCoachType() {
    if (!main_1.scappbase) {
        return false;
    }
    return main_1.scappbase.applicationType === 'coach';
}
function isCentralOrCoachType() {
    if (!main_1.scappbase) {
        return false;
    }
    return main_1.scappbase.applicationType === 'central' || main_1.scappbase.applicationType === 'coach';
}
// get-info-data
async function getInfoData(cmd, ...args) {
    if (isCentralOrCoachType()) {
        main_1.scappbase.logger_.silly({ message: 'renderer -> main', args: { cmd: cmd, cmdargs: args } });
        let app = main_1.scappbase;
        if (args.length === 0) {
            app.sendInfoData();
        }
        else {
            main_1.scappbase.logger_.error({ message: 'renderer -> main invalid args', args: { cmd: cmd, cmdargs: args } });
        }
    }
}
// get-nav-data
async function getNavData(cmd, ...args) {
    if (main_1.scappbase) {
        main_1.scappbase.logger_.silly({ message: 'renderer -> main', args: { cmd: cmd, cmdargs: args } });
        if (args.length === 0) {
            main_1.scappbase.sendNavData();
        }
        else {
            main_1.scappbase.logger_.error({ message: 'renderer -> main invalid args', args: { cmd: cmd, cmdargs: args } });
        }
    }
}
// get-team-field-list
async function getTeamFieldList(cmd, ...args) {
    if (isCentralOrCoachType()) {
        main_1.scappbase.logger_.silly({ message: 'renderer -> main', args: { cmd: cmd, cmdargs: args } });
        let central = main_1.scappbase;
        if (args.length === 0) {
            central.sendTeamFieldList();
        }
        else {
            main_1.scappbase.logger_.error({ message: 'renderer -> main invalid args', args: { cmd: cmd, cmdargs: args } });
        }
    }
}
// get-match-field-list
async function getMatchFieldList(cmd, ...args) {
    if (isCentralOrCoachType()) {
        main_1.scappbase.logger_.silly({ message: 'renderer -> main', args: { cmd: cmd, cmdargs: args } });
        let central = main_1.scappbase;
        if (args.length === 0) {
            central.sendMatchFieldList();
        }
        else {
            main_1.scappbase.logger_.error({ message: 'renderer -> main invalid args', args: { cmd: cmd, cmdargs: args } });
        }
    }
}
// get-formulas
async function getFormulas(cmd, ...args) {
    if (isCentralOrCoachType()) {
        main_1.scappbase.logger_.silly({ message: 'renderer -> main', args: { cmd: cmd, cmdargs: args } });
        let central = main_1.scappbase;
        if (args.length === 0) {
            central.sendFormulas();
        }
        else {
            main_1.scappbase.logger_.error({ message: 'renderer -> main invalid args', args: { cmd: cmd, cmdargs: args } });
        }
    }
}
// get-datasets
async function getDataSets(cmd, ...args) {
    if (isCentralOrCoachType()) {
        main_1.scappbase.logger_.silly({ message: 'renderer -> main', args: { cmd: cmd, cmdargs: args } });
        let central = main_1.scappbase;
        if (args.length === 0) {
            central.sendDataSets();
        }
        else {
            main_1.scappbase.logger_.error({ message: 'renderer -> main invalid args', args: { cmd: cmd, cmdargs: args } });
        }
    }
}
// rename-dataset
async function renameDataSet(cmd, ...args) {
    if (main_1.scappbase && isCentralType()) {
        main_1.scappbase.logger_.silly({ message: 'renderer -> main', args: { cmd: cmd, cmdargs: args } });
        let central = main_1.scappbase;
        if (args.length === 1 && Array.isArray(args[0])) {
            let dargs = args[0];
            if (typeof dargs[0] === 'string' && typeof dargs[1] === 'string') {
                central.renameDataSet(dargs[0], dargs[1]);
            }
        }
        else {
            main_1.scappbase.logger_.error({ message: 'renderer -> main invalid args', args: { cmd: cmd, cmdargs: args } });
        }
    }
}
// update-dataset
async function updateDataSet(cmd, ...args) {
    if (main_1.scappbase && isCentralType()) {
        main_1.scappbase.logger_.silly({ message: 'renderer -> main', args: { cmd: cmd, cmdargs: args } });
        let central = main_1.scappbase;
        if (args.length === 1) {
            central.updateDataSet(args[0]);
        }
        else {
            main_1.scappbase.logger_.error({ message: 'renderer -> main invalid args', args: { cmd: cmd, cmdargs: args } });
        }
    }
}
// get-event-data
async function getSelectEventData(cmd, ...args) {
    if (main_1.scappbase && isCentralType()) {
        main_1.scappbase.logger_.silly({ message: 'renderer -> main', args: { cmd: cmd, cmdargs: args } });
        let central = main_1.scappbase;
        if (args.length === 0) {
            central.sendEventData();
        }
        else {
            main_1.scappbase.logger_.error({ message: 'renderer -> main invalid args', args: { cmd: cmd, cmdargs: args } });
        }
    }
}
// get-tablet-data
async function getTabletData(cmd, ...args) {
    if (main_1.scappbase) {
        main_1.scappbase.logger_.silly({ message: 'renderer -> main', args: { cmd: cmd, cmdargs: args } });
        if (args.length === 0) {
            if (isCentralType()) {
                let central = main_1.scappbase;
                central.sendTabletData();
            }
            else {
                let scout = main_1.scappbase;
                scout.sendTabletData();
            }
        }
        else {
            main_1.scappbase.logger_.error({ message: 'renderer -> main invalid args', args: { cmd: cmd, cmdargs: args } });
        }
    }
}
// generate-random-data
async function generateRandomData(cmd, ...args) {
    if (main_1.scappbase && isCentralType()) {
        main_1.scappbase.logger_.silly({ message: 'renderer -> main', args: { cmd: cmd, cmdargs: args } });
        let central = main_1.scappbase;
        if (args.length === 0) {
            central.generateRandomData();
        }
        else {
            main_1.scappbase.logger_.error({ message: 'renderer -> main invalid args', args: { cmd: cmd, cmdargs: args } });
        }
    }
}
// get-team-data
async function getTeamData(cmd, ...args) {
    if (isCentralOrCoachType()) {
        main_1.scappbase.logger_.silly({ message: 'renderer -> main', args: { cmd: cmd, cmdargs: args } });
        let central = main_1.scappbase;
        if (args.length === 0) {
            central.sendTeamData();
        }
        else {
            main_1.scappbase.logger_.error({ message: 'renderer -> main invalid args', args: { cmd: cmd, cmdargs: args } });
        }
    }
}
// get-match-data
async function getMatchData(cmd, ...args) {
    if (isCentralOrCoachType()) {
        main_1.scappbase.logger_.silly({ message: 'renderer -> main', args: { cmd: cmd, cmdargs: args } });
        let central = main_1.scappbase;
        if (args.length === 0) {
            central.sendMatchData();
        }
        else {
            main_1.scappbase.logger_.error({ message: 'renderer -> main invalid args', args: { cmd: cmd, cmdargs: args } });
        }
    }
}
// set-team-data
async function setTeamData(cmd, ...args) {
    if (main_1.scappbase && isCentralType()) {
        main_1.scappbase.logger_.silly({ message: 'renderer -> main', args: { cmd: cmd, cmdargs: args } });
        let central = main_1.scappbase;
        if (args.length === 1 && Array.isArray(args[0])) {
            central.setTeamData(args[0]);
        }
        else {
            main_1.scappbase.logger_.error({ message: 'renderer -> main invalid args', args: { cmd: cmd, cmdargs: args } });
        }
    }
}
// get-match-db
async function getMatchDB(cmd, ...args) {
    if (isCentralOrCoachType()) {
        main_1.scappbase.logger_.silly({ message: 'renderer -> main', args: { cmd: cmd, cmdargs: args } });
        let central = main_1.scappbase;
        if (args.length === 0) {
            central.sendMatchDB();
        }
        else {
            main_1.scappbase.logger_.error({ message: 'renderer -> main invalid args', args: { cmd: cmd, cmdargs: args } });
        }
    }
}
// update-match-db
async function updateMatchDB(cmd, ...args) {
    if (main_1.scappbase && isCentralType()) {
        main_1.scappbase.logger_.silly({ message: 'renderer -> main', args: { cmd: cmd, cmdargs: args } });
        let central = main_1.scappbase;
        if (args.length === 1 && Array.isArray(args[0])) {
            central.updateMatchDB(args[0]);
        }
        else {
            main_1.scappbase.logger_.error({ message: 'renderer -> main invalid args', args: { cmd: cmd, cmdargs: args } });
        }
    }
}
// get-team-db
async function getTeamDB(cmd, ...args) {
    if (isCentralOrCoachType()) {
        main_1.scappbase.logger_.silly({ message: 'renderer -> main', args: { cmd: cmd, cmdargs: args } });
        let central = main_1.scappbase;
        if (args.length === 0) {
            central.sendTeamDB();
        }
        else {
            main_1.scappbase.logger_.error({ message: 'renderer -> main invalid args', args: { cmd: cmd, cmdargs: args } });
        }
    }
}
// get-preview-match-db
async function getPreviewMatchDB(cmd, ...args) {
    if (main_1.scappbase && isCentralType()) {
        main_1.scappbase.logger_.silly({ message: 'renderer -> main', args: { cmd: cmd, cmdargs: args } });
        let central = main_1.scappbase;
        if (args.length === 0) {
            central.sendPreviewMatchDB();
        }
        else {
            main_1.scappbase.logger_.error({ message: 'renderer -> main invalid args', args: { cmd: cmd, cmdargs: args } });
        }
    }
}
// update-preview-match-db data: IPCNamedDataValue[]
async function updatePreviewMatchDB(cmd, ...args) {
    if (main_1.scappbase && isCentralType()) {
        main_1.scappbase.logger_.silly({ message: 'renderer -> main', args: { cmd: cmd, cmdargs: args } });
        let central = main_1.scappbase;
        if (args.length === 1 && Array.isArray(args[0])) {
            central.updatePreviewMatchDB(args[0]);
        }
        else {
            main_1.scappbase.logger_.error({ message: 'renderer -> main invalid args', args: { cmd: cmd, cmdargs: args } });
        }
    }
}
// reset-preview-match-db
async function resetPreviewMatchDB(cmd, ...args) {
    if (main_1.scappbase && isCentralType()) {
        main_1.scappbase.logger_.silly({ message: 'renderer -> main', args: { cmd: cmd, cmdargs: args } });
        let central = main_1.scappbase;
        if (args.length === 0) {
            central.resetPreviewMatchDB();
        }
        else {
            main_1.scappbase.logger_.error({ message: 'renderer -> main invalid args', args: { cmd: cmd, cmdargs: args } });
        }
    }
}
// update-team-db
async function updateTeamDB(cmd, ...args) {
    if (main_1.scappbase && isCentralType()) {
        main_1.scappbase.logger_.silly({ message: 'renderer -> main', args: { cmd: cmd, cmdargs: args } });
        let central = main_1.scappbase;
        if (args.length === 1 && Array.isArray(args[0])) {
            central.updateTeamDB(args[0]);
        }
        else {
            main_1.scappbase.logger_.error({ message: 'renderer -> main invalid args', args: { cmd: cmd, cmdargs: args } });
        }
    }
}
// get-team-status
async function getTeamStatus(cmd, ...args) {
    if (isCentralOrCoachType()) {
        main_1.scappbase.logger_.silly({ message: 'renderer -> main', args: { cmd: cmd, cmdargs: args } });
        let central = main_1.scappbase;
        if (args.length === 0) {
            central.sendTeamStatus();
        }
        else {
            main_1.scappbase.logger_.error({ message: 'renderer -> main invalid args', args: { cmd: cmd, cmdargs: args } });
        }
    }
}
// get-match-status
async function getMatchStatus(cmd, ...args) {
    if (isCentralOrCoachType()) {
        main_1.scappbase.logger_.silly({ message: 'renderer -> main', args: { cmd: cmd, cmdargs: args } });
        let central = main_1.scappbase;
        if (args.length === 0) {
            central.sendMatchStatus();
        }
        else {
            main_1.scappbase.logger_.error({ message: 'renderer -> main invalid args', args: { cmd: cmd, cmdargs: args } });
        }
    }
}
// get-team-list
async function getTeamList(cmd, ...args) {
    if (isCentralOrCoachType()) {
        main_1.scappbase.logger_.silly({ message: 'renderer -> main', args: { cmd: cmd, cmdargs: args } });
        let central = main_1.scappbase;
        if (args.length === 1 && typeof args[0] === 'object') {
            central.getTeamList(args[0]);
        }
    }
}
// get-match-list
async function getMatchList(cmd, ...args) {
    if (isCentralOrCoachType()) {
        main_1.scappbase.logger_.silly({ message: 'renderer -> main', args: { cmd: cmd, cmdargs: args } });
        let central = main_1.scappbase;
        if (args.length === 0) {
            central.getMatchList();
        }
        else {
            main_1.scappbase.logger_.error({ message: 'renderer -> main invalid args', args: { cmd: cmd, cmdargs: args } });
        }
    }
}
// load-ba-event-data evkey:string
async function loadBaEventData(cmd, ...args) {
    if (main_1.scappbase && isCentralType()) {
        main_1.scappbase.logger_.silly({ message: 'renderer -> main', args: { cmd: cmd, cmdargs: args } });
        let central = main_1.scappbase;
        if (args.length === 1 && typeof args[0] === 'string') {
            central.loadBaEventData(args[0]);
        }
        else {
            main_1.scappbase.logger_.error({ message: 'renderer -> main invalid args', args: { cmd: cmd, cmdargs: args } });
            central.loadBaEventDataError();
        }
    }
}
// execute-command cmd:string
async function executeCommand(cmd, ...args) {
    if (main_1.scappbase) {
        main_1.scappbase.logger_.silly({ message: 'renderer -> main', args: { cmd: cmd, cmdargs: args } });
        if (args.length === 1 && typeof args[0] === 'string') {
            main_1.scappbase.executeCommand(args[0]);
        }
        else {
            main_1.scappbase.logger_.error({ message: 'renderer -> main invalid args', args: { cmd: cmd, cmdargs: args } });
        }
    }
}
// set-tablet-data data:TabletData[]
async function setTabletData(cmd, ...args) {
    if (main_1.scappbase && isCentralType()) {
        main_1.scappbase.logger_.silly({ message: 'renderer -> main', args: { cmd: cmd, cmdargs: args } });
        let central = main_1.scappbase;
        if (args.length === 1) {
            central.setTabletData(args[0]);
        }
        else {
            main_1.scappbase.logger_.error({ message: 'renderer -> main invalid args', args: { cmd: cmd, cmdargs: args } });
        }
    }
}
// delete-formula formula_name:string
async function deleteFormula(cmd, ...args) {
    if (main_1.scappbase && isCentralOrCoachType()) {
        main_1.scappbase.logger_.silly({ message: 'renderer -> main', args: { cmd: cmd, cmdargs: args } });
        let central = main_1.scappbase;
        if (args.length === 1 && typeof args[0] === 'string') {
            central.deleteFormula(args[0]);
        }
        else {
            main_1.scappbase.logger_.error({ message: 'renderer -> main invalid args', args: { cmd: cmd, cmdargs: args } });
        }
    }
}
// update-formula [formula_name:string, formula:string]
async function updateFormula(cmd, ...args) {
    if (main_1.scappbase && isCentralOrCoachType()) {
        main_1.scappbase.logger_.silly({ message: 'renderer -> main', args: { cmd: cmd, cmdargs: args } });
        let central = main_1.scappbase;
        if (args.length === 1 && Array.isArray(args[0])) {
            let data = args[0];
            if (data.length === 3 && typeof data[0] === 'string' && typeof data[1] === 'string' && typeof data[2] === 'string') {
                central.updateFormula(data[0], data[1], data[2]);
            }
            else {
                main_1.scappbase.logger_.error({ message: 'renderer -> main invalid args', args: { cmd: cmd, cmdargs: args } });
            }
        }
        else {
            main_1.scappbase.logger_.error({ message: 'renderer -> main invalid args', args: { cmd: cmd, cmdargs: args } });
        }
    }
}
// rename-formula [old_name:string, new_name:string]
async function renameFormula(cmd, ...args) {
    if (main_1.scappbase && isCentralOrCoachType()) {
        main_1.scappbase.logger_.silly({ message: 'renderer -> main', args: { cmd: cmd, cmdargs: args } });
        let central = main_1.scappbase;
        if (args.length === 1 && Array.isArray(args[0])) {
            let data = args[0];
            if (data.length === 2 && typeof data[0] === 'string' && typeof data[1] === 'string') {
                central.renameFormula(data[0], data[1]);
            }
            else {
                main_1.scappbase.logger_.error({ message: 'renderer -> main invalid args', args: { cmd: cmd, cmdargs: args } });
            }
        }
        else {
            main_1.scappbase.logger_.error({ message: 'renderer -> main invalid args', args: { cmd: cmd, cmdargs: args } });
        }
    }
}
// set-event-name event_name:string
async function setEventName(cmd, ...args) {
    if (main_1.scappbase && isCentralType()) {
        main_1.scappbase.logger_.silly({ message: 'renderer -> main', args: { cmd: cmd, cmdargs: args } });
        let central = main_1.scappbase;
        if (args.length === 1 && typeof args[0] === 'string') {
            central.setEventName(args[0]);
        }
        else {
            main_1.scappbase.logger_.error({ message: 'renderer -> main invalid args', args: { cmd: cmd, cmdargs: args } });
        }
    }
}
// get-form form_name:string
async function getForm(cmd, ...args) {
    if (main_1.scappbase) {
        main_1.scappbase.logger_.silly({ message: 'renderer -> main', args: { cmd: cmd, cmdargs: args } });
        if (args.length === 1 && typeof args[0] === 'string') {
            if (isCentralOrCoachType()) {
                let central = main_1.scappbase;
                central.sendForm(args[0]);
            }
            else if (isScoutType()) {
                let scout = main_1.scappbase;
                scout.sendForm(args[0]);
            }
        }
        else {
            main_1.scappbase.logger_.error({ message: 'renderer -> main invalid args', args: { cmd: cmd, cmdargs: args } });
        }
    }
}
// get-image-data image:string
async function getImageData(cmd, ...args) {
    if (main_1.scappbase) {
        main_1.scappbase.logger_.silly({ message: 'renderer -> main', args: { cmd: cmd, cmdargs: args } });
        if (args.length === 1 && typeof args[0] === 'string') {
            main_1.scappbase.logger_.silly({ message: 'renderer -> main', args: { cmd: cmd, cmdargs: args } });
            main_1.scappbase.sendImageData(args[0]);
        }
        else {
            main_1.scappbase.logger_.error({ message: 'renderer -> main invalid args', args: { cmd: cmd, cmdargs: args } });
        }
    }
}
async function getImageNames(cmd, ...args) {
    if (main_1.scappbase) {
        main_1.scappbase.logger_.silly({ message: 'renderer -> main', args: { cmd: cmd, cmdargs: args } });
        if (args.length === 0) {
            if (isCentralType()) {
                main_1.scappbase.logger_.silly({ message: 'renderer -> main', args: { cmd: cmd, cmdargs: args } });
                let central = main_1.scappbase;
                central.sendImages();
            }
        }
        else {
            main_1.scappbase.logger_.error({ message: 'renderer -> main invalid args', args: { cmd: cmd, cmdargs: args } });
        }
    }
}
async function importImage(cmd, ...args) {
    if (main_1.scappbase) {
        main_1.scappbase.logger_.silly({ message: 'renderer -> main', args: { cmd: cmd, cmdargs: args } });
        if (args.length === 0) {
            if (isCentralType()) {
                main_1.scappbase.logger_.silly({ message: 'renderer -> main', args: { cmd: cmd, cmdargs: args } });
                let central = main_1.scappbase;
                central.importImage();
            }
        }
        else {
            main_1.scappbase.logger_.error({ message: 'renderer -> main invalid args', args: { cmd: cmd, cmdargs: args } });
        }
    }
}
// save-form form_name:string contents:object
async function saveForm(cmd, ...args) {
    if (main_1.scappbase) {
        main_1.scappbase.logger_.silly({ message: 'renderer -> main', args: { cmd: cmd, cmdargs: args } });
        if (args.length === 1 && typeof args[0] === 'object') {
            if (isCentralType()) {
                main_1.scappbase.logger_.silly({ message: 'renderer -> main', args: { cmd: cmd, cmdargs: args } });
                let central = main_1.scappbase;
                let obj = args[0];
                central.saveForm(obj.type, obj.contents);
            }
        }
        else {
            main_1.scappbase.logger_.error({ message: 'renderer -> main invalid args', args: { cmd: cmd, cmdargs: args } });
        }
    }
}
// set-match-data data:object[]
async function setMatchData(cmd, ...args) {
    if (main_1.scappbase && isCentralType()) {
        main_1.scappbase.logger_.silly({ message: 'renderer -> main', args: { cmd: cmd, cmdargs: args } });
        let central = main_1.scappbase;
        if (args.length === 1 && Array.isArray(args[0])) {
            central.setMatchData(args[0]);
        }
        else {
            main_1.scappbase.logger_.error({ message: 'renderer -> main invalid args', args: { cmd: cmd, cmdargs: args } });
        }
    }
}
// set-tablet-name-purpose { name: string, purpose: string }
async function setTabletNamePurpose(cmd, ...args) {
    if (main_1.scappbase && isScoutType()) {
        main_1.scappbase.logger_.silly({ message: 'renderer -> main', args: { cmd: cmd, cmdargs: args } });
        let scout = main_1.scappbase;
        if (args.length === 1 && typeof args[0] === 'object') {
            let obj = args[0];
            if (obj.hasOwnProperty('name') && obj.hasOwnProperty('purpose')) {
                scout.setTabletNamePurpose(obj.name, obj.purpose);
            }
            else {
                main_1.scappbase.logger_.error({ message: 'renderer -> main invalid args', args: { cmd: cmd, cmdargs: args } });
            }
        }
        else {
            main_1.scappbase.logger_.error({ message: 'renderer -> main invalid args', args: { cmd: cmd, cmdargs: args } });
        }
    }
}
// provide-result data:object[]
async function provideResult(cmd, ...args) {
    if (main_1.scappbase && isScoutType()) {
        main_1.scappbase.logger_.silly({ message: 'renderer -> main', args: { cmd: cmd, cmdargs: args } });
        let scout = main_1.scappbase;
        if (args.length === 1 && typeof args[0] === 'object') {
            scout.provideResults(args[0]);
        }
        else {
            main_1.scappbase.logger_.error({ message: 'renderer -> main invalid args', args: { cmd: cmd, cmdargs: args } });
        }
    }
}
// set-team-data data:ProjColConfig
async function sendMatchColConfig(cmd, ...args) {
    if (isCentralOrCoachType()) {
        main_1.scappbase.logger_.silly({ message: 'renderer -> main', args: { cmd: cmd, cmdargs: args } });
        let central = main_1.scappbase;
        if (args.length === 1 && typeof args[0] === 'object') {
            central.setMatchColConfig(args[0]);
        }
        else {
            main_1.scappbase.logger_.error({ message: 'renderer -> main invalid args', args: { cmd: cmd, cmdargs: args } });
        }
    }
}
// set-team-col-config data:ProjColConfig
async function sendTeamColConfig(cmd, ...args) {
    if (isCentralOrCoachType()) {
        main_1.scappbase.logger_.silly({ message: 'renderer -> main', args: { cmd: cmd, cmdargs: args } });
        let central = main_1.scappbase;
        if (args.length === 1 && typeof args[0] === 'object') {
            central.setTeamColConfig(args[0]);
        }
        else {
            main_1.scappbase.logger_.error({ message: 'renderer -> main invalid args', args: { cmd: cmd, cmdargs: args } });
        }
    }
}
// get-picklist-data picklist_name:string
async function getPicklistData(cmd, ...args) {
    if (isCentralOrCoachType()) {
        main_1.scappbase.logger_.silly({ message: 'renderer -> main', args: { cmd: cmd, cmdargs: args } });
        let central = main_1.scappbase;
        if (args.length === 1 && typeof args[0] === 'string') {
            central.sendPicklistData(args[0]);
        }
        else {
            main_1.scappbase.logger_.error({ message: 'renderer -> main invalid args', args: { cmd: cmd, cmdargs: args } });
        }
    }
}
async function getPicklistConfigs(cmd, ...args) {
    if (isCentralOrCoachType()) {
        main_1.scappbase.logger_.silly({ message: 'renderer -> main', args: { cmd: cmd, cmdargs: args } });
        let central = main_1.scappbase;
        if (args.length === 0) {
            central.sendPicklistConfigs();
        }
        else {
            main_1.scappbase.logger_.error({ message: 'renderer -> main invalid args', args: { cmd: cmd, cmdargs: args } });
        }
    }
}
async function savePicklistConfig(cmd, ...args) {
    if (main_1.scappbase && isCentralType()) {
        main_1.scappbase.logger_.silly({ message: 'renderer -> main', args: { cmd: cmd, cmdargs: args } });
        let central = main_1.scappbase;
        if (args.length === 1 && typeof args[0] === 'object') {
            central.savePicklistConfig(args[0]);
        }
        else {
            main_1.scappbase.logger_.error({ message: 'renderer -> main invalid args', args: { cmd: cmd, cmdargs: args } });
        }
    }
}
async function getSingleTeamData(cmd, ...args) {
    if (isCentralOrCoachType()) {
        main_1.scappbase.logger_.silly({ message: 'renderer -> main', args: { cmd: cmd, cmdargs: args } });
        let central = main_1.scappbase;
        if (args.length === 1 && typeof args[0] === 'object') {
            let obj = args[0];
            if (obj.hasOwnProperty('team') && obj.hasOwnProperty('dataset')) {
                central.getSingleTeamData(obj.dataset, obj.team);
            }
            else {
                main_1.scappbase.logger_.error({ message: 'renderer -> main invalid args', args: { cmd: cmd, cmdargs: args } });
            }
        }
        else {
            main_1.scappbase.logger_.error({ message: 'renderer -> main invalid args', args: { cmd: cmd, cmdargs: args } });
        }
    }
}
async function getSingleTeamConfig(cmd, ...args) {
    if (isCentralOrCoachType()) {
        main_1.scappbase.logger_.silly({ message: 'renderer -> main', args: { cmd: cmd, cmdargs: args } });
        let central = main_1.scappbase;
        if (args.length === 1 && typeof args[0] === 'object') {
            central.getSingleTeamConfigs();
        }
        else {
            main_1.scappbase.logger_.error({ message: 'renderer -> main invalid args', args: { cmd: cmd, cmdargs: args } });
        }
    }
}
async function getHintDB(cmd, ...args) {
    if (main_1.scappbase && isCentralType()) {
        main_1.scappbase.logger_.silly({ message: 'renderer -> main', args: { cmd: cmd, cmdargs: args } });
        if (args.length === 0) {
            let central = main_1.scappbase;
            central.sendHintDB();
        }
        else {
            main_1.scappbase.logger_.error({ message: 'renderer -> main invalid args', args: { cmd: cmd, cmdargs: args } });
        }
    }
}
async function setHintHidden(cmd, ...args) {
    if (main_1.scappbase && isCentralType()) {
        main_1.scappbase.logger_.silly({ message: 'renderer -> main', args: { cmd: cmd, cmdargs: args } });
        let central = main_1.scappbase;
        if (args.length === 1 && typeof args[0] === 'string') {
            central.setHintHidden(args[0]);
        }
        else {
            main_1.scappbase.logger_.error({ message: 'renderer -> main invalid args', args: { cmd: cmd, cmdargs: args } });
        }
    }
}
async function getPlayoffStatus(cmd, ...args) {
    if (isCentralOrCoachType()) {
        main_1.scappbase.logger_.silly({ message: 'renderer -> main', args: { cmd: cmd, cmdargs: args } });
        let central = main_1.scappbase;
        if (args.length === 0) {
            central.sendPlayoffStatus();
        }
        else {
            main_1.scappbase.logger_.error({ message: 'renderer -> main invalid args', args: { cmd: cmd, cmdargs: args } });
        }
    }
}
async function setAllianceTeams(cmd, ...args) {
    if (main_1.scappbase && isCentralType()) {
        main_1.scappbase.logger_.silly({ message: 'renderer -> main', args: { cmd: cmd, cmdargs: args } });
        let central = main_1.scappbase;
        if (args.length === 1 && typeof args[0] === 'object') {
            let obj = args[0];
            if (obj.hasOwnProperty('alliance') && obj.hasOwnProperty('teams')) {
                central.setAllianceTeams(obj.alliance, obj.teams);
            }
        }
        else {
            main_1.scappbase.logger_.error({ message: 'renderer -> main invalid args', args: { cmd: cmd, cmdargs: args } });
        }
    }
}
async function getMatchFormatFormulas(cmd, ...args) {
    if (isCentralOrCoachType()) {
        main_1.scappbase.logger_.silly({ message: 'renderer -> main', args: { cmd: cmd, cmdargs: args } });
        let central = main_1.scappbase;
        if (args.length === 0) {
            central.sendMatchFormatFormulas();
        }
        else {
            main_1.scappbase.logger_.error({ message: 'renderer -> main invalid args', args: { cmd: cmd, cmdargs: args } });
        }
    }
}
async function getTeamFormatFormulas(cmd, ...args) {
    if (isCentralOrCoachType()) {
        main_1.scappbase.logger_.silly({ message: 'renderer -> main', args: { cmd: cmd, cmdargs: args } });
        let central = main_1.scappbase;
        if (args.length === 0) {
            central.sendTeamFormatFormulas();
        }
        else {
            main_1.scappbase.logger_.error({ message: 'renderer -> main invalid args', args: { cmd: cmd, cmdargs: args } });
        }
    }
}
async function setTeamFormatFormulas(cmd, ...args) {
    if (main_1.scappbase && isCentralType()) {
        main_1.scappbase.logger_.silly({ message: 'renderer -> main', args: { cmd: cmd, cmdargs: args } });
        let central = main_1.scappbase;
        if (args.length === 1) {
            central.setTeamFormatFormulas(args[0]);
        }
        else {
            main_1.scappbase.logger_.error({ message: 'renderer -> main invalid args', args: { cmd: cmd, cmdargs: args } });
        }
    }
}
async function setMatchFormatFormulas(cmd, ...args) {
    if (main_1.scappbase && isCentralType()) {
        main_1.scappbase.logger_.silly({ message: 'renderer -> main', args: { cmd: cmd, cmdargs: args } });
        let central = main_1.scappbase;
        if (args.length === 1) {
            central.setMatchFormatFormulas(args[0]);
        }
        else {
            main_1.scappbase.logger_.error({ message: 'renderer -> main invalid args', args: { cmd: cmd, cmdargs: args } });
        }
    }
}
async function setPlayoffMatchOutcome(cmd, ...args) {
    if (main_1.scappbase && isCentralType()) {
        main_1.scappbase.logger_.silly({ message: 'renderer -> main', args: { cmd: cmd, cmdargs: args } });
        let central = main_1.scappbase;
        if (args.length === 1 && typeof args[0] === 'object') {
            let obj = args[0];
            if (obj.hasOwnProperty('winner') && obj.hasOwnProperty('loser') && obj.hasOwnProperty('match')) {
                central.setPlayoffMatchOutcome(obj.match, obj.winner, obj.loser);
            }
        }
        else {
            main_1.scappbase.logger_.error({ message: 'renderer -> main invalid args', args: { cmd: cmd, cmdargs: args } });
        }
    }
    else if (main_1.scappbase && isScoutType()) {
        main_1.scappbase.logger_.silly({ message: 'renderer -> main', args: { cmd: cmd, cmdargs: args } });
        let scout = main_1.scappbase;
        if (args.length === 1 && typeof args[0] === 'object') {
            let obj = args[0];
            if (obj.hasOwnProperty('winner') && obj.hasOwnProperty('loser') && obj.hasOwnProperty('match')) {
                scout.setPlayoffMatchOutcome(obj.match, obj.winner, obj.loser);
            }
        }
        else {
            main_1.scappbase.logger_.error({ message: 'renderer -> main invalid args', args: { cmd: cmd, cmdargs: args } });
        }
    }
}
async function syncIPAddr(cmd, ...args) {
    if (main_1.scappbase && isScoutType()) {
        main_1.scappbase.logger_.silly({ message: 'renderer -> main', args: { cmd: cmd, cmdargs: args } });
        let scouter = main_1.scappbase;
        if (args.length === 1 && typeof args[0] === 'object') {
            let obj = args[0];
            if (obj.hasOwnProperty('ipaddr') && obj.hasOwnProperty('port')) {
                scouter.syncIPAddrWithAddr(obj.ipaddr, obj.port);
            }
        }
        else {
            main_1.scappbase.logger_.error({ message: 'renderer -> main invalid args', args: { cmd: cmd, cmdargs: args } });
        }
    }
}
/////////////////////////////////////////////////////////////////////////////////////////
async function clientLog(cmd, ...args) {
    if (main_1.scappbase) {
        main_1.scappbase.logClientMessage(args[0]);
    }
}
async function splitterChanged(cmd, ...args) {
    if (main_1.scappbase && args.length === 1 && typeof args[0] === 'number') {
        main_1.scappbase.splitterChanged(args[0]);
    }
}
// get-single-team-configs
async function getSingleTeamConfigs(cmd, ...args) {
    if (isCentralOrCoachType()) {
        main_1.scappbase.logger_.silly({ message: 'renderer -> main', args: { cmd: cmd, cmdargs: args } });
        let app = main_1.scappbase;
        app.getSingleTeamConfigs();
    }
}
// update-single-team-configs
async function updateSingleTeamConfigs(cmd, ...args) {
    if (main_1.scappbase) {
        main_1.scappbase.logger_.silly({ message: 'renderer -> main', args: { cmd: cmd, cmdargs: args } });
        let central = main_1.scappbase;
        if (args.length === 1 && typeof args[0] === 'object') {
            central.updateSingleTeamConfigs(args[0]);
        }
    }
}
// get-team-chart-data
async function getGraphData(cmd, ...args) {
    if (main_1.scappbase) {
        main_1.scappbase.logger_.silly({ message: 'renderer -> main', args: { cmd: cmd, cmdargs: args } });
        let central = main_1.scappbase;
        if (args.length === 1 && typeof args[0] === 'object') {
            central.getGraphData(args[0]);
        }
    }
}
// prompt-string-request
async function promptStringRequest(cmd, ...args) {
    if (main_1.scappbase) {
        main_1.scappbase.logger_.silly({ message: 'renderer -> main', args: { cmd: cmd, cmdargs: args } });
        if (args.length === 1 && typeof args[0] === 'object') {
            const request = args[0];
            const result = await main_1.scappbase.promptString(request.title, request.message, request.defaultValue, request.placeholder);
            const response = {
                id: request.id,
                value: result
            };
            main_1.scappbase.sendToRenderer("prompt-string-response", response);
        }
    }
}
// prompt-string-response
async function promptStringResponse(cmd, ...args) {
    if (main_1.scappbase) {
        main_1.scappbase.logger_.silly({ message: 'renderer -> main', args: { cmd: cmd, cmdargs: args } });
        if (args.length === 1 && typeof args[0] === 'object') {
            const response = args[0];
            if (main_1.scappbase.applicationType === 'central') {
                const central = main_1.scappbase;
                central.handlePromptStringResponse(response);
            }
        }
    }
}
async function getMatchConfigs(cmd, ...args) {
    if (main_1.scappbase && main_1.scappbase.applicationType === 'central') {
        let central = main_1.scappbase;
        if (args.length === 0) {
            central.sendMatchConfigs();
        }
    }
}
async function updateMatchConfig(cmd, ...args) {
    if (main_1.scappbase && main_1.scappbase.applicationType === 'central') {
        main_1.scappbase.logger_.silly({ message: 'renderer -> main', args: { cmd: cmd, cmdargs: args } });
        let central = main_1.scappbase;
        if (args.length === 1 && typeof args[0] === 'object') {
            central.updateMatchConfig(args[0]);
        }
        else {
            main_1.scappbase.logger_.error({ message: 'renderer -> main invalid args', args: { cmd: cmd, cmdargs: args } });
        }
    }
}
async function updateMatchCurrent(cmd, ...args) {
    if (main_1.scappbase && main_1.scappbase.applicationType === 'central') {
        main_1.scappbase.logger_.silly({ message: 'renderer -> main', args: { cmd: cmd, cmdargs: args } });
        let central = main_1.scappbase;
        if (args.length === 1 && typeof args[0] === 'string') {
            central.updateMatchCurrent(args[0]);
        }
        else {
            main_1.scappbase.logger_.error({ message: 'renderer -> main invalid args', args: { cmd: cmd, cmdargs: args } });
        }
    }
}
async function deleteMatchConfig(cmd, ...args) {
    if (main_1.scappbase && main_1.scappbase.applicationType === 'central') {
        main_1.scappbase.logger_.silly({ message: 'renderer -> main', args: { cmd: cmd, cmdargs: args } });
        let central = main_1.scappbase;
        if (args.length === 1 && typeof args[0] === 'string') {
            central.deleteMatchConfig(args[0]);
        }
        else {
            main_1.scappbase.logger_.error({ message: 'renderer -> main invalid args', args: { cmd: cmd, cmdargs: args } });
        }
    }
}
async function getMatchConfigData(cmd, ...args) {
    if (main_1.scappbase && main_1.scappbase.applicationType === 'central') {
        main_1.scappbase.logger_.silly({ message: 'renderer -> main', args: { cmd: cmd, cmdargs: args } });
        let central = main_1.scappbase;
        if (args.length === 1 && typeof args[0] === 'object') {
            let obj = args[0];
            if (obj.hasOwnProperty('name') && obj.hasOwnProperty('description') && obj.hasOwnProperty('dataset') && obj.hasOwnProperty('fields')) {
                central.getMatchData(obj);
            }
            else {
                main_1.scappbase.logger_.error({ message: 'renderer -> main invalid args', args: { cmd: cmd, cmdargs: args } });
            }
        }
        else {
            main_1.scappbase.logger_.error({ message: 'renderer -> main invalid args', args: { cmd: cmd, cmdargs: args } });
        }
    }
}
//# sourceMappingURL=ipchandlers.js.map