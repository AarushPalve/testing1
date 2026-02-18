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
exports.DataModel = exports.DataModelInfo = void 0;
const sqlite3 = __importStar(require("sqlite3"));
const fs = __importStar(require("fs"));
const format_1 = require("@fast-csv/format");
const events_1 = require("events");
const datarecord_1 = require("./datarecord");
const datavalue_1 = require("../../shared/datavalue");
class DataModelInfo {
    constructor() {
        this.col_descs_ = [];
    }
}
exports.DataModelInfo = DataModelInfo;
class DataModel extends events_1.EventEmitter {
    constructor(dbname, tname, info, logger) {
        super();
        this.dbname_ = dbname;
        this.table_name_ = tname;
        this.info_ = info;
        this.logger_ = logger;
    }
    get colummnDescriptors() {
        return this.info_.col_descs_;
    }
    get columnNames() {
        return this.info_.col_descs_.map((col) => col.name);
    }
    get tableName() {
        return this.table_name_;
    }
    getEncoded() {
        let d = fs.readFileSync(this.dbname_);
        return d;
    }
    remove() {
        if (fs.existsSync(this.dbname_)) {
            this.db_.close((err) => {
                if (err) {
                    this.logger_.error('Error closing database \'' + this.dbname_ + '\'', err);
                }
                else {
                    try {
                        fs.unlinkSync(this.dbname_);
                    }
                    catch (err) {
                        this.logger_.error('Error removing database file \'' + this.dbname_ + '\'', err);
                    }
                }
            });
        }
    }
    getData(table, field, fvalues, data) {
        let ret = new Promise(async (resolve, reject) => {
            let query = 'SELECT ';
            query += this.createCommaList(data);
            query += ' FROM ' + table + ' ';
            query += ' WHERE ';
            let first = true;
            for (let v of fvalues) {
                if (!first) {
                    query += ' OR ';
                }
                let val;
                if (typeof v === 'string') {
                    val = '"' + v.toString() + '"';
                }
                else {
                    val = v.toString();
                }
                query += field + '=' + val;
                first = false;
            }
            query += ';';
            try {
                let result = await this.all(query, undefined);
                resolve(this.convertToDataRecords(result));
            }
            catch (err) {
                reject(err);
            }
        });
        return ret;
    }
    getColumnDesc(field) {
        return this.info_.col_descs_.find((col) => col.name === field);
    }
    convertToDataRecords(rows) {
        let ret = [];
        for (let row of rows) {
            let dr = new datarecord_1.DataRecord();
            for (let key of Object.keys(row)) {
                let col = this.getColumnDesc(key);
                let v = undefined;
                if (col) {
                    try {
                        if (row[key] === null) {
                            v = { type: 'null', value: null };
                        }
                        else {
                            switch (col.type) {
                                case 'integer':
                                    v = { type: 'integer', value: row[key] };
                                    break;
                                case 'real':
                                    v = { type: 'real', value: row[key] };
                                    break;
                                case 'string':
                                    v = { type: 'string', value: row[key] };
                                    break;
                                case 'boolean':
                                    v = { type: 'boolean', value: row[key] };
                                    break;
                                default:
                                    v = { type: 'error', value: new Error('Unknown type \'' + col.type + '\' for column \'' + key + '\'') };
                                    break;
                            }
                        }
                    }
                    catch (err) {
                        v = { type: 'error', value: err };
                    }
                }
                else {
                    v = { type: 'error', value: new Error('Column \'' + key + '\' not found in column descriptions') };
                }
                dr.addfield(key, v);
            }
            ret.push(dr);
        }
        return ret;
    }
    createCommaList(values) {
        if (values.length === 0) {
            return '';
        }
        return values.join(', ');
    }
    syncColumnNames() {
        let ret = new Promise((resolve, reject) => {
            this.getColumnNamesFromDB()
                .then((dbcols) => {
                let i = 0;
                while (i < this.info_.col_descs_.length) {
                    let col = this.info_.col_descs_[i];
                    if (!dbcols.includes(col.name)) {
                        this.info_.col_descs_.splice(i, 1);
                    }
                    else {
                        i++;
                    }
                }
                resolve();
            })
                .catch((err) => {
                this.logger_.error('Error getting column names from database', err);
                reject(err);
            });
        });
        return ret;
    }
    getColumnNamesFromDB() {
        let ret = new Promise((resolve, reject) => {
            let ret = [];
            let query = 'PRAGMA table_info(' + this.table_name_ + ');';
            this.db_?.all(query, (err, rows) => {
                if (err) {
                    this.logger_.error('Error running query \'' + query + '\'', err);
                    reject(err);
                }
                else {
                    if (rows) {
                        for (let row of rows) {
                            ret.push(row.name);
                        }
                    }
                    resolve(ret);
                }
            });
        });
        return ret;
    }
    exportToCSV(filename, table) {
        let ret = new Promise(async (resolve, reject) => {
            try {
                let cols = await this.getColumnNames();
                const csvStream = (0, format_1.format)({
                    headers: cols,
                });
                const outputStream = fs.createWriteStream(filename);
                csvStream.pipe(outputStream).on('end', () => {
                    csvStream.end();
                    resolve();
                });
                let records = await this.getAllData();
                for (let record of records) {
                    let obj = record.jsonObj;
                    if (obj) {
                        csvStream.write(obj);
                    }
                }
                csvStream.end();
            }
            catch (err) {
                reject(err);
            }
        });
        return ret;
    }
    close() {
        let ret = true;
        if (this.db_) {
            this.db_.close(function (err) {
                if (err) {
                    ret = false;
                }
            });
        }
        return true;
    }
    runQuery(query, params) {
        let ret = new Promise((resolve, reject) => {
            let qno = DataModel.queryno_++;
            this.logger_.debug('DATABASE: ' + qno + ': runQuery \'' + query + '\'');
            if (params) {
                this.db_?.run(query, params, (res, err) => {
                    if (err) {
                        this.logger_.error('Error running query \'' + query + '\'', err);
                        reject(err);
                    }
                    else {
                        if (res) {
                            let obj = res;
                            if (obj.code === 'SQLITE_ERROR') {
                                this.logger_.error('Error running query \'' + query + '\'', obj.message);
                                reject(new Error(obj.message));
                                return;
                            }
                        }
                        resolve(res);
                    }
                });
            }
            else {
                this.db_?.run(query, (res, err) => {
                    if (err) {
                        this.logger_.error('Error running query \'' + query + '\'', err);
                        reject(err);
                    }
                    else {
                        if (res) {
                            let obj = res;
                            if (obj.code === 'SQLITE_ERROR') {
                                this.logger_.error('Error running query \'' + query + '\'', obj.message);
                                reject(new Error(obj.message));
                                return;
                            }
                        }
                        resolve(res);
                    }
                });
            }
        });
        return ret;
    }
    allRaw(query) {
        let ret = new Promise((resolve, reject) => {
            let qno = DataModel.queryno_++;
            this.logger_.debug('DATABASE: ' + qno + ': all \'' + query + '\'');
            this.db_?.all(query, (err, rows) => {
                if (err) {
                    reject(err);
                }
                else {
                    resolve(rows);
                }
            });
        });
        return ret;
    }
    all(query, params) {
        let ret = new Promise((resolve, reject) => {
            let qno = DataModel.queryno_++;
            this.logger_.debug('DATABASE: ' + qno + ': all \'' + query + '\'');
            if (params) {
                this.db_?.all(query, ...params, (err, rows) => {
                    if (err) {
                        this.logger_.error('Error running query \'' + query + '\'', err);
                        reject(err);
                    }
                    else {
                        resolve(this.convertToDataRecords(rows));
                    }
                });
            }
            else {
                this.db_?.all(query, (err, rows) => {
                    if (err) {
                        this.logger_.error('Error running query \'' + query + '\'', err);
                        reject(err);
                    }
                    else {
                        resolve(this.convertToDataRecords(rows));
                    }
                });
            }
        });
        return ret;
    }
    getAllData() {
        let ret = new Promise((resolve, reject) => {
            let query = 'select * from ' + this.table_name_ + ';';
            this.all(query, undefined)
                .then((rows) => {
                resolve(rows);
            })
                .catch((err) => {
                reject(err);
            });
        });
        return ret;
    }
    getAllDataWithFields(table, fields) {
        let ret = new Promise((resolve, reject) => {
            let query = 'select ';
            let first = true;
            for (let field of fields) {
                if (!first) {
                    query += ", ";
                }
                query += field;
                first = false;
            }
            query += ' from ' + table + ';';
            this.all(query, undefined)
                .then((rows) => {
                resolve(rows);
            })
                .catch((err) => {
                reject(err);
            });
        });
        return ret;
    }
    getTableNames() {
        let ret = new Promise((resolve, reject) => {
            let query = 'SELECT name FROM sqlite_schema WHERE type =\'table\' AND name NOT LIKE \'sqlite_%\';';
            this.allRaw(query)
                .then((rows) => {
                let tables = [];
                for (let row of rows) {
                    let rowobj = row;
                    tables.push(rowobj.name);
                }
                resolve(tables);
            })
                .catch((err) => {
                reject(err);
            });
        });
        return ret;
    }
    getColumnNames(comparefn) {
        return this.info_.col_descs_.map((col) => col.name);
    }
    init() {
        let ret = new Promise((resolve, reject) => {
            this.db_ = new sqlite3.Database(this.dbname_, (err) => {
                if (err) {
                    reject(err);
                }
                else {
                    resolve();
                }
            });
        });
        return ret;
    }
    containsColumn(name) {
        return this.info_.col_descs_.findIndex((col) => col.name === name) !== -1;
    }
    listContainsColumn(list, name) {
        return list.findIndex((col) => col.name === name) !== -1;
    }
    addColsAndData(keys, records, editable, source) {
        let fields = [];
        let ret = new Promise(async (resolve, reject) => {
            this.syncColumnNames()
                .then(() => {
                //
                // Find the unique set of fields across all records and associated type
                //
                for (let r of records) {
                    for (let f of r.keys()) {
                        if (!this.containsColumn(f) && !this.listContainsColumn(fields, f)) {
                            let type = this.extractType(f, records);
                            fields.push({
                                name: f,
                                type: type,
                                choices: undefined,
                                source: source,
                                editable: editable,
                            });
                        }
                    }
                }
                this.addNecessaryCols(fields)
                    .then(async () => {
                    for (let record of records) {
                        try {
                            await this.insertOrUpdate(this.table_name_, keys, record);
                        }
                        catch (err) {
                            reject(err);
                        }
                    }
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
    mapTeamKeyString(field, namemap) {
        if (namemap && namemap.has(field)) {
            return namemap.get(field);
        }
        if (field.endsWith('_')) {
            field = field.substring(0, field.length - 1);
            if (namemap && namemap.has(field)) {
                return namemap.get(field);
            }
        }
        return field;
    }
    addNecessaryCols(fields) {
        let ret = new Promise(async (resolve, reject) => {
            let toadd = [];
            for (let key of fields) {
                let index = this.info_.col_descs_.findIndex((one) => { return one.name === key.name; });
                if (index === -1) {
                    toadd.push(key);
                }
                else if (this.info_.col_descs_[index].editable != key.editable) {
                    reject(new Error(`column ${key.name} is being added, but already exists with a different 'editable' value`));
                }
                else if (this.info_.col_descs_[index].source != key.source) {
                    reject(new Error(`column ${key.name} is being added, but already exists with a different 'source' value`));
                }
                else if (this.info_.col_descs_[index].type != key.type) {
                    reject(new Error(`column ${key.name} is being added, but already exists with a different 'type' value`));
                }
            }
            if (toadd.length > 0) {
                try {
                    await this.createColumns(this.table_name_, toadd);
                }
                catch (err) {
                    reject(err);
                }
            }
            resolve();
        });
        return ret;
    }
    extractType(key, records) {
        let type = 'error';
        for (let record of records) {
            if (record.has(key)) {
                let v = record.value(key);
                type = v.type;
                break;
            }
            else {
                type = 'error';
            }
        }
        return type;
    }
    generateWhereClause(keys, dr) {
        let query = ' WHERE ';
        let params = [];
        let first = true;
        for (let i = 0; i < keys.length; i++) {
            if (!dr.has(keys[i])) {
                continue;
            }
            if (!first) {
                query += ' AND ';
            }
            query += keys[i] + ' = ?';
            params.push(datavalue_1.DataValue.toSQLite3Value(dr.value(keys[i])));
            first = false;
        }
        return [query, params];
    }
    updateRecord(table, keys, dr) {
        let ret = new Promise((resolve, reject) => {
            let query = 'update ' + table + ' SET ';
            let first = true;
            let params = [];
            for (let key of dr.keys()) {
                if (!keys.includes(key)) {
                    let v = dr.value(key);
                    if (!first) {
                        query += ', ';
                    }
                    query += key + '= ?';
                    params.push(datavalue_1.DataValue.toSQLite3Value(v));
                    first = false;
                }
            }
            let ret = this.generateWhereClause(keys, dr);
            query += ' ' + ret[0] + ';';
            this.runQuery(query, [...params, ...ret[1]])
                .then(() => {
                resolve();
            })
                .catch((err) => {
                reject(err);
            });
        });
        return ret;
    }
    insertRecord(table, dr) {
        let ret = new Promise((resolve, reject) => {
            let query = 'insert into ' + table + ' (';
            let first = true;
            let params = [];
            let values = '';
            for (let key of dr.keys()) {
                let v = dr.value(key);
                if (!first) {
                    query += ',';
                    values += ',';
                }
                query += key;
                values += '?';
                first = false;
                params.push(datavalue_1.DataValue.toSQLite3Value(v));
            }
            query += `) VALUES (${values});`;
            this.runQuery(query, params)
                .then(() => {
                resolve();
            })
                .catch((err) => {
                reject(err);
            });
        });
        return ret;
    }
    async insertOrUpdate(table, keys, dr) {
        let ret = new Promise(async (resolve, reject) => {
            for (let key of keys) {
                if (!dr.has(key)) {
                    let err = new Error('The data record is missing a value for the key \'' + key + '\'');
                    reject(err);
                }
            }
            try {
                let results = this.generateWhereClause(keys, dr);
                let query = 'select * from ' + table + results[0] + ';';
                let rows = await this.all(query, results[1]);
                if (rows.length > 0) {
                    await this.updateRecord(table, keys, dr);
                }
                else {
                    await this.insertRecord(table, dr);
                }
                resolve();
            }
            catch (err) {
                reject(err);
            }
        });
        return ret;
    }
    removeColumns(pred) {
        let ret = new Promise((resolve, reject) => {
            let all = [];
            let cols = [];
            for (let one of this.info_.col_descs_) {
                if (pred(one)) {
                    cols.push(one);
                    let query = 'alter table ' + this.table_name_ + ' drop column ' + one.name + ';';
                    let pr = this.runQuery(query, undefined);
                    all.push(pr);
                }
            }
            if (all.length === 0) {
                resolve();
            }
            else {
                Promise.all(all)
                    .then(() => {
                    for (let col of cols) {
                        let index = this.info_.col_descs_.indexOf(col);
                        this.info_.col_descs_.splice(index, 1);
                    }
                    for (let col of cols) {
                        this.emit('column-removed', col);
                    }
                    resolve();
                })
                    .catch((err) => {
                    this.logger_.error('error removing columns in table \'' + this.table_name_ + '\'', err);
                    reject(err);
                });
            }
        });
        return ret;
    }
    translateColumnType(type) {
        let ret = '';
        switch (type) {
            case 'integer':
                ret = 'integer';
                break;
            case 'real':
                ret = 'real';
                break;
            case 'string':
                ret = 'text';
                break;
            case 'boolean':
                ret = 'integer';
                break;
            default:
                ret = 'error';
        }
        return ret;
    }
    async createColumns(table, toadd) {
        let ret = new Promise((resolve, reject) => {
            let allpromises = [];
            for (let one of toadd) {
                let query = 'alter table ' + table + ' add column ' + one.name + ' ' + this.translateColumnType(one.type) + ';';
                let pr = this.runQuery(query, undefined);
                allpromises.push(pr);
            }
            Promise.all(allpromises)
                .then(() => {
                for (let col of toadd) {
                    this.info_.col_descs_.push(col);
                    this.emit('column-added', col);
                }
                resolve();
            })
                .catch(async (err) => {
                let dbcols = await this.getColumnNamesFromDB();
                for (let col of toadd) {
                    if (dbcols.includes(col.name)) {
                        this.info_.col_descs_.push(col);
                        this.emit('column-added', col);
                    }
                }
                this.logger_.error('error creating columns in table \'' + table + '\'', err);
                reject(err);
            });
        });
        return ret;
    }
    processInitialColumns(cols) {
        this.info_.col_descs_ = [];
        for (let col of cols) {
            this.info_.col_descs_.push(col);
            this.emit('column-added', col);
        }
    }
    createTableIfNecessary(table) {
        let ret = new Promise((resolve, reject) => {
            this.getTableNames()
                .then((tables) => {
                if (!tables.includes(table)) {
                    //
                    // create the table
                    //
                    this.runQuery(this.createTableQuery(), undefined)
                        .then((result) => {
                        this.processInitialColumns(this.initialTableColumns());
                        resolve();
                    })
                        .catch((err) => {
                        reject(err);
                    });
                }
                else {
                    resolve();
                }
            })
                .catch((err) => {
                reject(err);
            });
        });
        return ret;
    }
    update(changes) {
        for (let change of changes) {
            let dr = new datarecord_1.DataRecord();
            let fields = [];
            for (let key of Object.keys(change.search)) {
                dr.addfield(key, change.search[key]);
                fields.push(key);
            }
            dr.addfield(change.column, change.newvalue);
            this.insertOrUpdate(this.table_name_, fields, dr);
        }
    }
}
exports.DataModel = DataModel;
DataModel.ColummTableName = 'cols';
DataModel.queryno_ = 0;
//# sourceMappingURL=datamodel.js.map