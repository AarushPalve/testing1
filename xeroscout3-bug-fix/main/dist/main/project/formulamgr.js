"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.FormulaManager = exports.FormulaInfo = void 0;
const manager_1 = require("./manager");
const expr_1 = require("../../shared/expr");
class FormulaInfo {
    constructor() {
        this.formulas_ = [];
        this.coach_formulas_ = [];
    }
}
exports.FormulaInfo = FormulaInfo;
class FormulaManager extends manager_1.Manager {
    constructor(logger, writer, info, appType) {
        super(logger, writer);
        this.expr_map_ = new Map(); // Map of formula name to expression
        this.info_ = info;
        this.appType_ = appType;
    }
    get formulas() {
        // Older project files may not contain coach formulas; ensure arrays exist
        if (!this.info_.formulas_) {
            this.info_.formulas_ = [];
        }
        if (!this.info_.coach_formulas_) {
            this.info_.coach_formulas_ = [];
        }
        return [...this.info_.formulas_, ...this.info_.coach_formulas_];
    }
    get formulaNames() {
        return this.formulas.map(f => f.name);
    }
    hasFormula(name) {
        let ret = false;
        for (let f of this.formulas) {
            if (f.name === name) {
                ret = true;
                break;
            }
        }
        return ret;
    }
    findFormula(name) {
        let ret = undefined;
        if (this.expr_map_.has(name)) {
            ret = this.expr_map_.get(name);
        }
        else {
            for (let f of this.formulas) {
                if (f.name === name) {
                    ret = expr_1.Expr.parse(f.formula);
                    this.expr_map_.set(name, ret);
                    break;
                }
            }
        }
        return ret;
    }
    findFormulaIndex(name) {
        let ret = -1;
        for (let i = 0; i < this.info_.formulas_.length; i++) {
            if (this.info_.formulas_[i].name === name) {
                ret = i;
                break;
            }
        }
        return ret;
    }
    deleteFormula(name) {
        let index = this.findFormulaIndex(name);
        if (index != undefined) {
            this.info_.formulas_.splice(index, 1);
            this.write();
        }
    }
    renameFormula(oldName, newName) {
        let index = this.findFormulaIndex(oldName);
        if (index != undefined) {
            this.info_.formulas_[index].name = newName;
        }
    }
    addFormula(name, desc, formula) {
        let index = this.findFormulaIndex(name);
        if (index != -1) {
            this.info_.formulas_[index].formula = formula;
        }
        else {
            let f = {
                name: name,
                desc: desc,
                formula: formula,
                owner: this.appType_
            };
            this.info_.formulas_.push(f);
        }
        this.write();
    }
    importFormulas(obj) {
        // TODO: implement this function
    }
}
exports.FormulaManager = FormulaManager;
//# sourceMappingURL=formulamgr.js.map