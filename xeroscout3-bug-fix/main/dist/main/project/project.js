"use strict";
//
// A scouting project
//
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
exports.Project = void 0;
// #region imports
const fs = __importStar(require("fs"));
const path = __importStar(require("path"));
const uuid = __importStar(require("uuid"));
const datagen_1 = require("./datagen");
const projectinfo_1 = require("./projectinfo");
const picklistmgr_1 = require("./picklistmgr");
const teammgr_1 = require("./teammgr");
const datamgr_1 = require("./datamgr");
const datasetmgr_1 = require("./datasetmgr");
const formulamgr_1 = require("./formulamgr");
const formmgr_1 = require("./formmgr");
const tabletmgr_1 = require("./tabletmgr");
const matchmgr_1 = require("./matchmgr");
const graphmgr_1 = require("./graphmgr");
const playoffmgr_1 = require("./playoffmgr");
const scbase_1 = require("../apps/scbase");
class Project {
    constructor(logger, dir, year) {
        this.serial_ = 0;
        this.location_ = dir;
        this.logger_ = logger;
    }
    isInitialized() {
        if (this.info_) {
            return true;
        }
        return false;
    }
    init(info, apptype) {
        this.info_ = info;
        this.team_mgr_ = new teammgr_1.TeamManager(this.logger_, this.writeEventFile.bind(this), this.info_.team_info_);
        this.match_mgr_ = new matchmgr_1.MatchManager(this.logger_, this.writeEventFile.bind(this), this.info_.match_info_);
        this.formula_mgr_ = new formulamgr_1.FormulaManager(this.logger_, this.writeEventFile.bind(this), this.info_.formula_info_, apptype);
        this.data_mgr_ = new datamgr_1.DataManager(this.logger_, this.writeEventFile.bind(this), this.location_, this.info_.data_info_, this.info_.team_db_info_, this.info_.match_db_info_, this.formula_mgr_);
        this.form_mgr_ = new formmgr_1.FormManager(this.logger_, this.writeEventFile.bind(this), this.info_.form_info_, this.location_, this.data_mgr_);
        this.dataset_mgr_ = new datasetmgr_1.DataSetManager(this.logger_, this.writeEventFile.bind(this), this.info_.dataset_info_, this.team_mgr_);
        this.picklist_mgr_ = new picklistmgr_1.PicklistMgr(this.logger_, this.writeEventFile.bind(this), this.info_.picklist_info_, this.team_mgr_, this.dataset_mgr_, this.data_mgr_, this.formula_mgr_);
        this.tablet_mgr_ = new tabletmgr_1.TabletManager(this.logger_, this.writeEventFile.bind(this), this.info_.tablet_info_, this.team_mgr_, this.match_mgr_);
        this.graph_mgr_ = new graphmgr_1.GraphManager(this.logger_, this.writeEventFile.bind(this), this.info_.graph_info_, this.data_mgr_, this.dataset_mgr_);
        this.playoff_mgr_ = new playoffmgr_1.PlayoffManager(this.logger_, this.writeEventFile.bind(this), this.info_.playoff_info_, this.match_mgr_);
        this.writeEventFile();
        this.logger_.info('Project initialized in directory \'' + this.location_ + '\'');
    }
    closeEvent() {
        this.writeEventFile();
        this.info_ = undefined;
    }
    get isLocked() {
        if (this.info_) {
            return this.info_.locked_;
        }
        return false;
    }
    get info() {
        return this.info_;
    }
    get location() {
        return this.location_;
    }
    setHintHidden(hint) {
        if (this.info_) {
            if (this.info_.hidden_hints_.indexOf(hint) === -1) {
                this.info_.hidden_hints_.push(hint);
                this.writeEventFile();
            }
            if (this.hint_db_) {
                for (let hintdb of this.hint_db_) {
                    if (hintdb.id === hint) {
                        hintdb.hidden = true;
                    }
                }
            }
        }
    }
    getHintDb(contentdir) {
        if (!this.hint_db_) {
            let hintfile = path.join(contentdir, 'json', 'hintdb.json');
            if (fs.existsSync(hintfile)) {
                try {
                    const rawData = fs.readFileSync(hintfile, 'utf-8');
                    this.hint_db_ = JSON.parse(rawData);
                    for (let hint of this.hint_db_) {
                        if (this.info_ && this.info_.hidden_hints_.indexOf(hint.id) !== -1) {
                            hint.hidden = true;
                        }
                        else {
                            hint.hidden = false;
                        }
                    }
                }
                catch (err) {
                    this.logger_.error('Error reading hint database', err);
                    this.hint_db_ = [];
                }
            }
        }
        return this.hint_db_;
    }
    async generateRandomData() {
        let ret = new Promise(async (resolve, reject) => {
            if (this.team_mgr_ && this.match_mgr_ && this.form_mgr_ && this.form_mgr_.hasForms()) {
                if (this.team_mgr_.hasTeams()) {
                    let teams = this.team_mgr_.getTeams().map((v) => { return 'st-' + v.team_number; });
                    let gendata = new datagen_1.DataGenerator(this.form_mgr_.getTeamFormFullPath());
                    let results = gendata.generateData(teams);
                    if (results) {
                        results.purpose = "team";
                        try {
                            await this.data_mgr_.processResults(results);
                        }
                        catch (err) {
                            reject(err);
                        }
                    }
                }
                if (this.match_mgr_.hasMatches()) {
                    let matches = [];
                    for (let match of this.match_mgr_.getMatches()) {
                        for (let i = 0; i < 3; i++) {
                            let blue = 'sm-' + match.comp_level + '-' + match.set_number + '-' +
                                match.match_number + '-' + scbase_1.SCBase.keyToTeamNumber(match.alliances.blue.team_keys[i]);
                            matches.push(blue);
                            let red = 'sm-' + match.comp_level + '-' + match.set_number + '-' +
                                match.match_number + '-' + scbase_1.SCBase.keyToTeamNumber(match.alliances.red.team_keys[i]);
                            matches.push(red);
                        }
                    }
                    let gendata = new datagen_1.DataGenerator(this.form_mgr_.getMatchFormFullPath());
                    let results = gendata.generateData(matches);
                    if (results) {
                        results.purpose = "match";
                        try {
                            await this.data_mgr_.processResults(results);
                            resolve();
                        }
                        catch (err) {
                            reject(err);
                        }
                    }
                }
            }
        });
        return ret;
    }
    async lockEvent() {
        let ret = new Promise(async (resolve, reject) => {
            if (!this.info_) {
                reject(new Error('event is not initialized, cannot lock event'));
            }
            else {
                //
                // Check that all the managers are initialized and have the required data
                //
                if (!this.team_mgr_ || !this.team_mgr_.hasTeams()) {
                    reject(new Error('event is not ready to be locked, missing teams'));
                }
                if (!this.match_mgr_) {
                    reject(new Error('event is not ready to be locked, missing matches'));
                }
                if (!this.form_mgr_ || !this.form_mgr_.hasForms()) {
                    reject(new Error('event is not ready to be locked, missing forms'));
                }
                if (!this.tablet_mgr_ || !this.tablet_mgr_.areTabletsValid()) {
                    reject(new Error('event is not ready to be locked, missing tablets'));
                }
                //
                // Check for duplicate tags in the form definitions
                //
                let errors = this.form_mgr_.checkFormsValid();
                if (errors.length > 0) {
                    let msg = 'Errors were found in the form definitions:';
                    for (let err of errors) {
                        msg += '<br>' + err;
                    }
                    msg += '<br><br>Please correct the form definitions and try again';
                    reject(new Error(msg));
                    return;
                }
                //
                // Initialize the data manager, which creates or opens the databases
                //
                try {
                    await this.data_mgr_.init();
                }
                catch (err) {
                    reject(err);
                    return;
                }
                try {
                    //
                    // Process the team data
                    //
                    await this.data_mgr_.processTeamBAData(this.team_mgr_.getTeams());
                }
                catch (err) {
                    this.data_mgr_.removeDatabases();
                    reject(err);
                    return;
                }
                if (this.match_mgr_ && this.match_mgr_.hasMatches()) {
                    //
                    // Process the match data if it exists, this is not required and can be added
                    // later
                    //
                    try {
                        await this.data_mgr_.processMatchBAData(this.match_mgr_.getMatches(), false);
                    }
                    catch (err) {
                        this.data_mgr_.removeDatabases();
                        reject(err);
                        return;
                    }
                }
                if (!this.tablet_mgr_.generateTabletSchedule()) {
                    this.data_mgr_.removeDatabases();
                    reject(new Error('could not generate tablet schedule for scouting'));
                }
                this.form_mgr_.populateDBWithForms()
                    .then(() => {
                    this.info_.locked_ = true;
                    this.info_.uuid_ = uuid.v4();
                    this.writeEventFile();
                    resolve();
                })
                    .catch((err) => {
                    this.data_mgr_.removeDatabases();
                    this.tablet_mgr_.clearScoutingSchedules();
                    reject(err);
                });
            }
        });
        return ret;
    }
    setTeamForm(form) {
        return this.form_mgr_.setTeamForm(form);
    }
    setMatchForm(form) {
        return this.form_mgr_.setMatchForm(form);
    }
    static async createEvent(logger, dir, year, apptype) {
        let ret = new Promise((resolve, reject) => {
            logger.info('Creating event in directory \'' + dir + '\'');
            if (!fs.existsSync(dir)) {
                logger.info('    directory does not exist, creating directory \'' + dir + '\'');
                //
                // Does not exist, create it
                //
                fs.mkdirSync(dir);
                if (!fs.existsSync(dir)) {
                    let err = new Error("could not create directory '" + dir + "' for new event");
                    logger.error('    directory does not exist, create directory failed', err);
                    reject(err);
                }
            }
            else if (!Project.isDirectoryEmpty(dir)) {
                //
                // The directory exists, it must be empty
                //
                let err = new Error("directory '" + dir + "' is not empty, cannot use a new event directory");
                logger.error('    directory is not empty, location \'' + dir + '\'');
                reject(err);
            }
            let proj = new Project(logger, dir, year);
            proj.init(new projectinfo_1.ProjectInfo(), apptype);
            resolve(proj);
        });
        return ret;
    }
    static async openEvent(logger, filepath, year, apptype) {
        let ret = new Promise((resolve, reject) => {
            logger.info('Open event, location \'' + filepath + '\'');
            let loc = path.dirname(filepath);
            let file = path.basename(filepath);
            if (file !== Project.event_file_name) {
                let err = new Error("the file selected was not an event file, name should be '" + Project.event_file_name + "'");
                logger.error(err);
                reject(err);
                return;
            }
            if (!fs.existsSync(filepath)) {
                let err = new Error('the file selected \'' + filepath + '\'does not exist');
                logger.error(err);
                reject(err);
                return;
            }
            let proj = new Project(logger, loc, year);
            let info = Project.readEventFile(logger, loc);
            if (info instanceof Error) {
                reject(info);
            }
            proj.init(info, apptype);
            if (proj.isLocked) {
                //
                // The project is locked, we need to initialize the databases
                //
                proj.data_mgr_.init()
                    .then(() => {
                    resolve(proj);
                })
                    .catch((err) => {
                    logger.error('Error initializing project', err);
                    reject(err);
                });
            }
            else {
                resolve(proj);
            }
        });
        return ret;
    }
    setEventName(name) {
        if (this.info_) {
            this.info_.name_ = name;
            this.writeEventFile();
        }
        else {
            this.logger_.error('event name cannot be set, event is not initialized');
        }
    }
    //
    // This is called from the renderer for events that are not created using
    // Blue Alliance.  The data from the UI side of the application is sent to this
    // method to initialize the the match list.
    //
    async setMatchData(data) {
        this.match_mgr_.setMatchData(data);
    }
    setTabletData(data) {
        this.tablet_mgr_.setTabletData(data);
    }
    static readEventFile(logger, dir) {
        let ret = new projectinfo_1.ProjectInfo();
        let projfile = path.join(dir, Project.event_file_name);
        logger.info('Reading project file \'' + projfile + '\'');
        if (!fs.existsSync(projfile)) {
            ret = new Error("the directory '" + dir + "' is not a valid event project, missing file '" + Project.event_file_name + "'");
        }
        else {
            try {
                const rawData = fs.readFileSync(projfile, 'utf-8');
                ret = JSON.parse(rawData);
                if (ret.hidden_hints_ === undefined) {
                    ret.hidden_hints_ = [];
                }
            }
            catch (err) {
                ret = err;
            }
        }
        return ret;
    }
    writeEventFile() {
        let ret = undefined;
        let errst = false;
        let projfile = path.join(this.location_, Project.event_file_name);
        this.logger_.info('Writing project file [' + this.serial_++ + '] ' + projfile);
        if (fs.existsSync(projfile) && Project.keepLotsOfBackups) {
            this.logger_.debug('Performing backup file sequence ....');
            let i = 10;
            let fullname = path.join(this.location_, 'event-' + i + '.json');
            if (fs.existsSync(fullname)) {
                this.logger_.debug('    removing file \'' + fullname + '\'');
                try {
                    fs.rmSync(fullname);
                }
                catch (err) {
                    this.logger_.error('    error removing file \'' + fullname + '\'', err);
                    errst = true;
                }
            }
            i--;
            if (!errst) {
                while (i > 0) {
                    fullname = path.join(this.location_, 'event-' + i + '.json');
                    let newname = path.join(this.location_, 'event-' + (i + 1) + '.json');
                    if (fs.existsSync(fullname)) {
                        try {
                            this.logger_.debug('    renaming file \'' + fullname + '\' -> \'' + newname + '\'');
                            fs.renameSync(fullname, newname);
                        }
                        catch (err) {
                            this.logger_.error('    error renaming file \'' + fullname + '\' -> \'' + newname + '\'');
                        }
                    }
                    i--;
                }
                try {
                    fullname = path.join(this.location_, 'event-1.json');
                    this.logger_.debug('    renaming file \'' + projfile + '\' -> \'' + fullname + '\'');
                    fs.renameSync(projfile, fullname);
                }
                catch (err) {
                    this.logger_.error('    error renaming file \'' + projfile + '\' -> \'' + fullname + '\'');
                }
            }
            else {
                this.logger_.warning('could not execute rolling backup strategy due to an error');
            }
        }
        const jsonString = JSON.stringify(this.info_, null, 2);
        try {
            this.logger_.debug('    writing project data to file \'' + projfile + '\'');
            fs.writeFileSync(projfile, jsonString);
        }
        catch (err) {
            ret = err;
        }
        this.logger_.info('    Finished project file [' + (this.serial_ - 1) + '] ' + projfile);
        return ret;
    }
    static isDirectoryEmpty(path) {
        let ret = true;
        try {
            const files = fs.readdirSync(path);
            ret = (files.length === 0);
        }
        catch (err) {
            ret = false;
        }
        return ret;
    }
    async loadMatchData(key, ba, results, callback) {
        let ret = new Promise(async (resolve, reject) => {
            try {
                let type = results ? 'match results' : 'match schedule';
                if (callback) {
                    callback('Requesting ' + type + ' from \'The Blue Alliance\' ... ');
                }
                let matches = await ba.getMatches(key);
                if (callback) {
                    callback('received ' + matches.length + ' matches<br>');
                }
                if (matches.length === 0) {
                    if (callback) {
                        callback('No matches received, try again later<br>');
                    }
                }
                else {
                    this.match_mgr_.setBAMatchData(matches);
                    this.tablet_mgr_.incrementallyGenerateMatchSchedule();
                    if (results) {
                        if (callback) {
                            callback('Inserting ' + type + ' into database ... ');
                        }
                        await this.data_mgr_.processMatchBAData(matches, results);
                        if (callback) {
                            callback('inserted ' + matches.length + ' matches<br>');
                        }
                    }
                }
                resolve();
            }
            catch (err) {
                reject(err);
            }
        });
        return ret;
    }
    loadOprDprData(key, ba, callback) {
        let ret = new Promise(async (resolve, reject) => {
            try {
                if (callback) {
                    callback('Requesting OPR/DPR/CCWMS data from \'The Blue Alliance\' ... ');
                }
                let opr = await ba.getOPR(key);
                if (Object.keys(opr.oprs).length === 0) {
                    if (callback) {
                        callback('No data received, try again later<br>');
                    }
                }
                else {
                    if (callback) {
                        callback(' received data.<br>');
                        callback('Inserting data into database ... ');
                    }
                    await this.data_mgr_.processOPRData(opr);
                    if (callback) {
                        callback('done.<br>');
                    }
                }
                resolve();
            }
            catch (err) {
                reject(err);
            }
        });
        return ret;
    }
    loadRankingData(key, ba, callback) {
        let ret = new Promise(async (resolve, reject) => {
            try {
                if (callback) {
                    callback('Requesting ranking data from \'The Blue Alliance\' ... ');
                }
                let rankings = await ba.getRankings(key);
                if (rankings.rankings.length === 0) {
                    if (callback) {
                        callback('No rankings data received, try again later<br>');
                    }
                }
                else {
                    if (callback) {
                        callback('received data.<br>');
                        callback('Inserting data into database ... ');
                    }
                    await await this.data_mgr_.processRankings(rankings.rankings);
                    if (callback) {
                        callback('done.<br>');
                    }
                }
                resolve();
            }
            catch (err) {
                reject(err);
            }
        });
        return ret;
    }
    loadStatboticsEventData(key, sb, callback) {
        let ret = new Promise(async (resolve, reject) => {
            try {
                if (callback) {
                    callback('Requesting EPA data for the event from \'Statbotics\' ... ');
                }
                let stats = await sb.getStatsEvent(key, this.team_mgr_.getSortedTeamNumbers(false));
                if (callback) {
                    callback('received stats data.<br>');
                    callback('Inserting data into team database ... ');
                }
                await this.data_mgr_.processStatboticsEventData(stats);
                if (callback) {
                    callback('data inserted.<br>');
                }
                resolve();
            }
            catch (err) {
                reject(err);
            }
        });
        return ret;
    }
    loadStatboticsYearData(sb, callback) {
        let ret = new Promise(async (resolve, reject) => {
            try {
                if (callback) {
                    callback('Requesting EPA data for the year from \'Statbotics\' ... ');
                }
                let stats = await sb.getStatsYear(this.team_mgr_.getSortedTeamNumbers(false));
                if (callback) {
                    callback('received stats data.<br>');
                    callback('Inserting data into team database ... ');
                }
                await this.data_mgr_?.processStatboticsYearToDateData(stats);
                if (callback) {
                    callback('data inserted.<br>');
                }
                resolve();
            }
            catch (err) {
                reject(err);
            }
        });
        return ret;
    }
    loadTeams(key, ba, callback) {
        let ret = new Promise(async (resolve, reject) => {
            try {
                if (callback) {
                    callback('Requesting teams from \'The Blue Alliance\' ... ');
                }
                let teams = await ba.getTeams(key);
                if (callback) {
                    callback('received ' + teams.length + ' teams.<br>');
                }
                if (teams.length === 0) {
                    if (callback) {
                        callback('No teams data received, try again later<br>');
                    }
                }
                else {
                    this.team_mgr_.setBATeamData(teams);
                }
                resolve();
            }
            catch (err) {
                reject(err);
            }
        });
        return ret;
    }
    loadBAEvent(ba, sb, frcev, callback) {
        let ret = new Promise(async (resolve, reject) => {
            if (!this.info_) {
                reject(new Error('event is not initialized, cannot load event data'));
                return;
            }
            this.info_.frcev_ = frcev;
            try {
                await this.loadTeams(frcev.key, ba, callback);
                if (this.team_mgr_.hasTeams()) {
                    await this.loadMatchData(frcev.key, ba, false, callback);
                }
                this.writeEventFile();
                if (callback) {
                    callback('Event data file saved.<br>');
                    callback('Event loaded sucessfully.<br>');
                }
                resolve();
            }
            catch (err) {
                reject(err);
            }
        });
        return ret;
    }
    loadAllianceData(key, ba, callback) {
        let ret = new Promise(async (resolve, reject) => {
            try {
                if (callback) {
                    callback('Requesting alliance data from \'The Blue Alliance\' ... ');
                }
                let alliances = await ba.getAlliances(key);
                if (Object.keys(alliances).length === 0) {
                    if (callback) {
                        callback('No alliance data received, try again later<br>');
                    }
                }
                else {
                    if (callback) {
                        callback('received alliance data.<br>');
                        callback('Inserting data into playoff manager ... ');
                    }
                    this.playoff_mgr_.processAllianceData(alliances);
                    if (callback) {
                        callback('done.<br>');
                    }
                }
                resolve();
            }
            catch (err) {
                reject(err);
            }
        });
        return ret;
    }
    loadExternalBAData(ba, frcev, callback) {
        let ret = new Promise(async (resolve, reject) => {
            try {
                await this.loadMatchData(frcev.key, ba, this.isLocked, callback);
                await this.loadOprDprData(frcev.key, ba, callback);
                await this.loadRankingData(frcev.key, ba, callback);
                await this.loadAllianceData(frcev.key, ba, callback);
                resolve(0);
            }
            catch (err) {
                reject(err);
            }
        });
        return ret;
    }
    loadExternalSTData(sb, frcev, callback) {
        let ret = new Promise(async (resolve, reject) => {
            try {
                await this.loadStatboticsEventData(frcev.key, sb, callback);
                await this.loadStatboticsYearData(sb, callback);
                resolve(0);
            }
            catch (err) {
                reject(err);
            }
        });
        return ret;
    }
}
exports.Project = Project;
Project.keepLotsOfBackups = true;
Project.event_file_name = "event.json";
//# sourceMappingURL=project.js.map