import EventEmitter from "events";
import { XeroRect } from "./xerogeom.js";
export class RulesEngine extends EventEmitter {
    constructor(form) {
        super();
        this.interval_ = null;
        this.errors_ = new Map();
        this.previousErrors_ = new Map();
        this.perPageRules = [
            this.ruleOne.bind(this),
            this.ruleTwo.bind(this)
        ];
        this.perFormRules = [
            this.ruleThree.bind(this),
            this.ruleFour.bind(this),
            this.ruleFive.bind(this)
        ];
        this.form_ = form;
        this.rule_ = 0;
        this.pageno_ = 0;
        this.dirty_ = true;
        this.first_ = true;
    }
    get errors() {
        let errors = [];
        for (let [tag, errs] of this.errors_) {
            if (errs.length > 0) {
                errors.push(`${tag}: ${errs.join(', ')}`);
            }
        }
        return errors;
    }
    start(t) {
        if (this.interval_) {
            clearInterval(this.interval_); // stop the interval
            this.interval_ = null; // reset the interval
        }
        this.interval_time_ = t;
        this.interval_ = setInterval(this.doRulesWork.bind(this, 1), this.interval_time_);
    }
    //
    // One rule and one page is a step
    //
    doRulesWork(cnt) {
        for (let i = 0; i < cnt && this.dirty_ == true; i++) {
            this.runOne();
            if (this.pageno_ === this.form_.sections.length && this.rule_ == this.perFormRules.length - 1) {
                if (this.interval_) {
                    clearInterval(this.interval_); // stop the interval
                    this.interval_ = null; // reset the interval
                }
                this.dirty = false; // all rules are done, mark for as clean
                if (this.first_) {
                    this.emitErrorsFirst();
                    this.previousErrors_ = this.errors_;
                    this.errors_ = new Map(); // reset errors  
                    this.first_ = false;
                }
                else {
                    this.emitErrorsNext();
                    this.previousErrors_ = this.errors_; // save previous errors
                    this.errors_ = new Map(); // reset errors
                }
            }
            else if (this.pageno_ === this.form_.sections.length) {
                this.rule_++; // Move to the next form rule
            }
            else {
                this.rule_++; // Move to the next page rule
                if (this.rule_ === this.perPageRules.length) {
                    this.rule_ = 0; // reset to the first page rule
                    this.pageno_++; // move to the next page
                }
            }
        }
    }
    get dirty() {
        return this.dirty_;
    }
    reset() {
        this.first_ = true;
        this.pageno_ = 0;
        this.rule_ = 0;
        this.dirty = true;
    }
    set dirty(value) {
        this.dirty_ = value;
        if (value) {
            if (this.interval_time_ && !this.interval_) {
                this.interval_ = setInterval(this.doRulesWork.bind(this, 1), this.interval_time_);
            }
            this.rule_ = 0;
            this.pageno_ = 0;
        }
    }
    runOne() {
        if (this.pageno_ == this.form_.sections.length) {
            this.perFormRules[this.rule_]();
        }
        else {
            this.perPageRules[this.rule_]();
        }
    }
    ruleOne() {
        let page = this.form_.sections[this.pageno_];
        if (!page) {
            return; // no more pages
        }
        for (let ctrl of page.items) {
            if (ctrl.type === 'select') {
                let item = ctrl;
                this.checkChoices(item.tag, item.choices);
            }
            else if (ctrl.type === 'choice') {
                let item = ctrl;
                this.checkChoices(item.tag, item.choices);
            }
        }
    }
    checkChoices(tag, choices) {
        if (choices.length === 0) {
            this.addError(tag, `${tag} - the list of choices cannot be empty`);
            return;
        }
        let value = [];
        for (let choice of choices) {
            if (value.indexOf(choice.value) !== -1) {
                this.addError(tag, `${tag} more the one choice has the value value '${choice.value}'.  Duplicate values are not allowed.`);
            }
            else {
                value.push(choice.value);
            }
        }
    }
    ruleTwo() {
        let page = this.form_.sections[this.pageno_];
        if (!page) {
            return; // no more pages
        }
        for (let ctrl of page.items) {
            if (ctrl.type === 'image') {
                let item = ctrl;
                if (item.field) {
                    continue;
                }
            }
            let overlap = this.findInterectingControls(ctrl, (c) => {
                if (c.type === 'image') {
                    let item = c;
                    if (item.field) {
                        return true; // ignore fields
                    }
                }
                return false; // all other controls
            });
            if (overlap.length > 1) {
                this.addError(ctrl.tag, `${ctrl.tag} - control overlaps with multiple field controls ${overlap.map(c => c.tag).join(', ')}`);
            }
        }
    }
    ruleThree() {
        let tags = [];
        let dups = [];
        for (let page of this.form_.sections) {
            for (let ctrl of page.items) {
                if (ctrl.type === 'image' || ctrl.type === 'label' || ctrl.type === 'box') {
                    continue;
                }
                if (tags.indexOf(ctrl.tag) !== -1) {
                    dups.push(ctrl.tag);
                }
                else {
                    tags.push(ctrl.tag);
                }
            }
        }
        for (let page of this.form_.sections) {
            for (let ctrl of page.items) {
                if (ctrl.type === 'image' || ctrl.type === 'label' || ctrl.type === 'box') {
                    continue;
                }
                if (dups.indexOf(ctrl.tag) !== -1) {
                    this.addError(ctrl.tag, `${ctrl.tag} - tag must be unique.  Controls with duplicate tags are invalid.`);
                }
            }
        }
    }
    ruleFour() {
        for (let page of this.form_.sections) {
            for (let ctrl of page.items) {
                if (ctrl.type === 'image' || ctrl.type === 'label' || ctrl.type === 'box') {
                    continue;
                }
                if (!/^[a-zA-Z_][a-zA-Z_0-9]*$/.test(ctrl.tag)) {
                    this.addError(ctrl.tag, `${ctrl.tag} - tag must start with an underscore or letter and contain only alphanumeric characters and underscores`);
                }
            }
        }
    }
    ruleFive() {
        for (let page of this.form_.sections) {
            for (let ctrl of page.items) {
                if (ctrl.type === 'image' || ctrl.type === 'label' || ctrl.type === 'box') {
                    continue;
                }
                if (/^tag_[0-9]+$/.test(ctrl.tag)) {
                    this.addError(ctrl.tag, `${ctrl.tag} - tag cannot start with 'tag_' followed by a number.  While this is the initial value, it must be changed to something meaningful.`);
                }
            }
        }
    }
    addError(tag, error) {
        var _a;
        if (!this.errors_.has(tag)) {
            this.errors_.set(tag, []);
        }
        (_a = this.errors_.get(tag)) === null || _a === void 0 ? void 0 : _a.push(error);
    }
    emitErrorsFirst() {
        this.emit('reset');
        for (let [tag, errors] of this.errors_) {
            if (errors.length > 0) {
                this.emit('errors', tag, errors);
            }
        }
    }
    emitErrorsNext() {
        var _a, _b;
        // Emit errors that are different from the previous errors
        for (let [tag, errors] of this.errors_) {
            if (errors.length > 0 && (!this.previousErrors_.has(tag) || ((_a = this.previousErrors_.get(tag)) === null || _a === void 0 ? void 0 : _a.join(',')) !== errors.join(','))) {
                this.emit('errors', tag, errors);
            }
        }
        // Emit errors that are no longer present
        for (let [tag, errors] of this.previousErrors_) {
            if (!this.errors_.has(tag) || ((_b = this.errors_.get(tag)) === null || _b === void 0 ? void 0 : _b.length) === 0) {
                this.emit('errors', tag, []);
            }
        }
    }
    findInterectingControls(ctrl, filter) {
        let overlap = [];
        let page = this.form_.sections[this.pageno_];
        if (!page) {
            return overlap; // no more pages
        }
        let bounds = new XeroRect(ctrl.x, ctrl.y, ctrl.width, ctrl.height);
        for (let c of page.items) {
            if (c === ctrl) {
                continue; // skip self
            }
            let cBounds = new XeroRect(c.x, c.y, c.width, c.height);
            if (bounds.intersects(cBounds) && filter(c)) {
                overlap.push(c);
            }
        }
        return overlap;
    }
}
//# sourceMappingURL=rulesengine.js.map