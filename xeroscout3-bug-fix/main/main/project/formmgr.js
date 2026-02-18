"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.FormManager = exports.FormInfo = void 0;
const manager_1 = require("./manager");
const fs_1 = __importDefault(require("fs"));
const path_1 = __importDefault(require("path"));
const electron_1 = require("electron");
const tabletdb_1 = require("../../shared/tabletdb");
const rulesengine_1 = require("../../shared/rulesengine");
class FormInfo {
}
exports.FormInfo = FormInfo;
class FormManager extends manager_1.Manager {
    constructor(logger, writer, info, dir, datamgr) {
        super(logger, writer);
        this.info_ = info;
        this.location_ = dir;
        this.data_mgr_ = datamgr;
        this.checkForms();
    }
    setTeamForm(filename) {
        let target = path_1.default.join(this.location_, path_1.default.basename(filename));
        fs_1.default.copyFileSync(filename, target);
        this.info_.teamform_ = path_1.default.basename(filename);
        this.write();
        return undefined;
    }
    getTeamFormFullPath() {
        if (this.info_.teamform_ && this.info_.teamform_.length > 0) {
            return path_1.default.join(this.location_, this.info_.teamform_);
        }
        return undefined;
    }
    static validateForm(filename, type) {
        let ret = [];
        let obj = FormManager.readJSONFile(filename);
        if (obj instanceof Error) {
            ret.push(filename + ": " + obj.message);
            return ret;
        }
        let fobj = obj;
        if (!fobj.purpose) {
            ret.push(filename +
                ': the form is missing the "purpose" field to indicate form type');
            return ret;
        }
        if (fobj.purpose !== type) {
            ret.push(filename +
                ": the form type is not valid, expected '" +
                type +
                "' but form '" +
                obj.form +
                "'");
            return ret;
        }
        if (!fobj.sections) {
            ret.push(filename +
                ": the form is missing the 'sections' field to indicate form type");
            return ret;
        }
        if (!Array.isArray(fobj.sections)) {
            ret.push(filename +
                ": the form is missing the 'sections' field to indicate form type");
            return ret;
        }
        let rulesengine = new rulesengine_1.RulesEngine(fobj);
        rulesengine.doRulesWork(Number.MAX_SAFE_INTEGER);
        return rulesengine.errors;
    }
    setMatchForm(filename) {
        let target = path_1.default.join(this.location_, path_1.default.basename(filename));
        fs_1.default.copyFileSync(filename, target);
        this.info_.matchform_ = path_1.default.basename(filename);
        this.write();
        return undefined;
    }
    getMatchFormFullPath() {
        if (this.info_.matchform_ && this.info_.matchform_.length > 0) {
            return path_1.default.join(this.location_, this.info_.matchform_);
        }
        return undefined;
    }
    hasTeamForm() {
        if (this.info_.teamform_ && this.info_.teamform_.length > 0) {
            return true;
        }
        return false;
    }
    hasMatchForm() {
        if (this.info_.matchform_ && this.info_.matchform_.length > 0) {
            return true;
        }
        return false;
    }
    hasForms() {
        return this.hasTeamForm() || this.hasMatchForm();
    }
    extractTeamFormFields() {
        if (this.info_.teamform_ && this.info_.teamform_.length > 0) {
            return this.getFormColumnNamesTypes(this.info_.teamform_);
        }
        return new Error("No team form found");
    }
    extractMatchFormFields() {
        if (this.info_.matchform_ && this.info_.matchform_.length > 0) {
            return this.getFormColumnNamesTypes(this.info_.matchform_);
        }
        return new Error("No match form found");
    }
    populateDBWithForms() {
        let ret = new Promise((resolve, reject) => {
            if (!this.hasForms()) {
                reject(new Error("missing forms for event"));
                return;
            }
            let teamFields = this.extractTeamFormFields();
            if (teamFields instanceof Error) {
                reject(teamFields);
                return;
            }
            let matchFields = this.extractMatchFormFields();
            if (matchFields instanceof Error) {
                reject(matchFields);
                return;
            }
            // Remove any old columns from an old team scouting form
            this.data_mgr_.removeFormColumns()
                .then(() => {
                this.write();
                this.data_mgr_.createFormColumns(teamFields, matchFields)
                    .then(() => {
                    resolve();
                })
                    .catch((err) => {
                    reject(err);
                });
            })
                .catch((err) => {
                reject(err);
            });
        });
        return ret;
    }
    createTeamForm() {
        if (this.info_.teamform_ && this.info_.teamform_.length > 0) {
            let ans = electron_1.dialog.showMessageBoxSync({
                title: 'Replace Team Form',
                type: 'warning',
                buttons: ['Yes', 'No'],
                message: 'There is already a team form.  This will replace the current form.  Do you want to continue?',
            });
            if (ans === 1) {
                return false;
            }
        }
        this.info_.teamform_ = this.createFormInternal('team', 'team.json');
        this.write();
        return true;
    }
    saveForm(type, contents) {
        let target = path_1.default.join(this.location_, type + ".json");
        let jsonstr = JSON.stringify(contents, null, 4);
        fs_1.default.writeFileSync(target, jsonstr);
    }
    createMatchForm() {
        if (this.info_.matchform_ && this.info_.matchform_.length > 0) {
            let ans = electron_1.dialog.showMessageBoxSync({
                title: 'Replace Match Form',
                type: 'warning',
                buttons: ['Yes', 'No'],
                message: 'There is already a match form.  This will replace the current form.  Do you want to continue?',
            });
            if (ans === 1) {
                return false;
            }
        }
        this.info_.matchform_ = this.createFormInternal('match', 'match.json');
        this.write();
        return true;
    }
    createFormInternal(ftype, filename) {
        let target = path_1.default.join(this.location_, filename);
        let jsonobj = {
            purpose: ftype,
            sections: [],
            tablet: tabletdb_1.TabletDB.getDefaultTablet(),
        };
        let jsonstr = JSON.stringify(jsonobj, null, 4);
        fs_1.default.writeFileSync(target, jsonstr);
        return filename;
    }
    getForm(type) {
        let formfile = undefined;
        if (type === "team") {
            formfile = this.info_.teamform_;
        }
        else if (type === "match") {
            formfile = this.info_.matchform_;
        }
        else {
            return new Error("Invalid form type: " + type);
        }
        if (!formfile || formfile.length === 0) {
            return new Error("No form found for type: " + type);
        }
        let fullpath = path_1.default.join(this.location_, formfile);
        if (!fs_1.default.existsSync(fullpath)) {
            return new Error("Form file does not exist: " + fullpath);
        }
        let jsonobj = FormManager.readJSONFile(fullpath);
        if (jsonobj instanceof Error) {
            return jsonobj;
        }
        if (!jsonobj.tablet) {
            jsonobj.tablet = tabletdb_1.TabletDB.getDefaultTablet();
        }
        return jsonobj;
    }
    static readJSONFile(filename) {
        let jsonobj;
        try {
            let jsonstr = fs_1.default.readFileSync(filename).toString();
            let str = jsonstr.replace(/\/\/.*/g, "");
            jsonobj = JSON.parse(str);
        }
        catch (err) {
            jsonobj = err;
        }
        return jsonobj;
    }
    getFormColumnNamesTypes(filename) {
        let ret = [];
        let formfile = path_1.default.join(this.location_, filename);
        let addField = (field) => {
            if (ret.find((x) => x.name === field.name)) {
                return;
            }
            ret.push(field);
        };
        try {
            let jsonobj = FormManager.readJSONFile(formfile);
            if (jsonobj instanceof Error) {
                return jsonobj;
            }
            for (let section of jsonobj.sections) {
                if (section.items && Array.isArray(section.items)) {
                    for (let obj of section.items) {
                        let item = obj;
                        if (item.type === "image" || item.type === "label" || item.type === "box") {
                            // Skip any control that does not provide data, as these are not stored in the database
                            continue;
                        }
                        let choices = undefined;
                        if (item.type === "choice" || item.type === "select") {
                            let choice = item;
                            if (choice.choices && Array.isArray(choice.choices)) {
                                choices = [...choice.choices];
                            }
                        }
                        addField({
                            name: item.tag,
                            type: item.datatype,
                            choices: choices,
                            editable: true,
                            source: 'form'
                        });
                        if (item.type === 'stopwatch') {
                            addField({
                                name: item.tag + '_segments',
                                type: 'string',
                                editable: true,
                                source: 'form'
                            });
                        }
                    }
                }
            }
        }
        catch (err) {
            return err;
        }
        return ret;
    }
    checkFormsValid() {
        let ret = [];
        if (this.info_.teamform_ && this.info_.teamform_.length > 0) {
            let form = path_1.default.join(this.location_, this.info_.teamform_);
            let err = FormManager.validateForm(form, "team");
            for (let e of err) {
                ret.push('team form: ' + e);
            }
        }
        if (this.info_.matchform_ && this.info_.matchform_.length > 0) {
            let form = path_1.default.join(this.location_, this.info_.matchform_);
            let err = FormManager.validateForm(form, "match");
            for (let e of err) {
                ret.push('match form: ' + e);
            }
        }
        return ret;
    }
    checkForms() {
        if (this.info_.teamform_ && this.info_.teamform_.length > 0) {
            let form = path_1.default.join(this.location_, this.info_.teamform_);
            if (!fs_1.default.existsSync(form)) {
                this.logger_.warn(`team form file '${this.info_.teamform_}' was referenced in the project file but does not exist.  Removing reference to file`);
                this.info_.teamform_ = undefined;
            }
        }
        if (this.info_.matchform_ && this.info_.matchform_.length > 0) {
            let form = path_1.default.join(this.location_, this.info_.matchform_);
            if (!fs_1.default.existsSync(form)) {
                this.logger_.warn(`match form file '${this.info_.matchform_}' was referenced in the project file but does not exist.  Removing reference to file`);
                this.info_.matchform_ = undefined;
            }
        }
    }
}
exports.FormManager = FormManager;
//# sourceMappingURL=formmgr.js.map