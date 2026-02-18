"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.DataRecord = void 0;
const datavalue_1 = require("../../shared/datavalue");
class DataRecord {
    constructor() {
        this.data_ = new Map();
    }
    addfield(name, value) {
        this.data_.set(name, value);
    }
    keys() {
        let ret = [];
        for (let key of this.data_.keys()) {
            ret.push(key);
        }
        return ret;
    }
    has(key) {
        return this.data_.has(key);
    }
    value(key) {
        return this.data_.get(key);
    }
    get jsonObj() {
        let obj = {};
        for (let key of this.data_.keys()) {
            try {
                let dval = this.value(key);
                if (dval) {
                    obj[key] = datavalue_1.DataValue.toSQLite3Value(dval);
                }
                else {
                    obj[key] = 'MissingData';
                }
            }
            catch (err) {
                return undefined;
            }
        }
        return obj;
    }
}
exports.DataRecord = DataRecord;
//# sourceMappingURL=datarecord.js.map