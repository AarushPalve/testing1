export class DataValue {
    static convertFromString(type, str) {
        switch (type) {
            case 'string':
                return DataValue.fromString(str);
            case 'integer':
                return DataValue.fromInteger(parseInt(str, 10));
            case 'real':
                return DataValue.fromReal(parseFloat(str));
            case 'boolean':
                return DataValue.fromBoolean(str.toLowerCase() === 'true' || str === '1');
            case 'null':
                return DataValue.fromNull();
            default:
                throw new Error(`Unsupported type: ${type}`);
        }
    }
    static fromString(value) {
        return {
            type: 'string',
            value: value
        };
    }
    static fromInteger(value) {
        return {
            type: 'integer',
            value: value
        };
    }
    static fromReal(value) {
        return {
            type: 'real',
            value: value
        };
    }
    static fromBoolean(value) {
        return {
            type: 'boolean',
            value: value
        };
    }
    static fromNull() {
        return {
            type: 'null',
            value: null
        };
    }
    static fromError(value) {
        return {
            type: 'error',
            value: value.message
        };
    }
    static equals(a, b) {
        if (a.type !== b.type) {
            return false;
        }
        if (a.value === null && b.value === null) {
            return true;
        }
        if (a.value === null || b.value === null) {
            return false;
        }
        if (a.type === 'array') {
            if (a.value.length !== b.value.length) {
                return false;
            }
            for (let i = 0; i < a.value.length; i++) {
                if (!DataValue.equals(a.value[i], b.value[i])) {
                    return false;
                }
            }
            return true;
        }
        return a.value === b.value;
    }
    static isValidType(type) {
        return ['integer', 'real', 'string', 'boolean', 'error', 'array'].includes(type);
    }
    static isNull(a) {
        return a.type === 'null';
    }
    static isInteger(a) {
        return a.type === 'integer';
    }
    static isReal(a) {
        return a.type === 'real';
    }
    static isNumber(a) {
        return a.type === 'integer' || a.type === 'real';
    }
    static isString(a) {
        return a.type === 'string';
    }
    static isBoolean(a) {
        return a.type === 'boolean';
    }
    static isArray(a) {
        return a.type === 'array';
    }
    static isError(a) {
        return a.type === 'error';
    }
    static toBoolean(a) {
        if (a.type !== 'boolean') {
            throw new Error(`Cannot convert ${a.type} to boolean`);
        }
        return a.value;
    }
    static toString(a) {
        if (a.type !== 'string') {
            throw new Error(`Cannot convert ${a.type} to string`);
        }
        return a.value;
    }
    static toReal(a) {
        if (a.type !== 'real' && a.type !== 'integer') {
            throw new Error(`Cannot convert ${a.type} to number`);
        }
        return a.value;
    }
    static toInteger(a) {
        if (a.type !== 'integer') {
            throw new Error(`Cannot convert ${a.type} to integer`);
        }
        return a.value;
    }
    static toArray(a) {
        if (a.type !== 'array') {
            throw new Error(`Cannot convert ${a.type} to array`);
        }
        return a.value;
    }
    static toDisplayString(a) {
        let ret = '';
        if (a.value === null) {
            ret = 'null';
        }
        else if (a.type === 'string') {
            ret = DataValue.toString(a);
        }
        else if (a.type === 'boolean') {
            ret = DataValue.toBoolean(a) ? 'true' : 'false';
        }
        else if (a.type === 'integer') {
            ret = DataValue.toInteger(a).toString();
        }
        else if (a.type === 'real') {
            ret = DataValue.toReal(a).toString();
        }
        else if (a.type === 'array') {
            ret = '[';
            for (const v of DataValue.toArray(a)) {
                ret += `${DataValue.toDisplayString(v)},`;
            }
            if (ret.length > 1) {
                ret = ret.slice(0, -1); // remove last comma
            }
            ret += ']';
        }
        else if (a.type === 'error') {
            // Value may be any type; avoid throwing when it is not a string
            ret = `Error: ${typeof a.value === 'string' ? a.value : String(a.value)}`;
        }
        else {
            ret = `Unknown type: ${a.type}`;
        }
        return ret;
    }
    static toSQLite3Value(a) {
        let ret = null;
        if (a.value === null) {
            ret = null;
        }
        else if (a.type === 'string') {
            ret = DataValue.toString(a);
        }
        else if (a.type === 'boolean') {
            ret = DataValue.toBoolean(a);
        }
        else if (a.type === 'integer') {
            ret = DataValue.toInteger(a);
        }
        else if (a.type === 'real') {
            ret = DataValue.toReal(a);
        }
        else {
            throw new Error(`Cannot convert ${a.type} to SQLITE3 value`);
        }
        return ret;
    }
    static isTruthy(a) {
        let ret = false;
        if (a.type === 'boolean' && a.value === true) {
            ret = true;
        }
        else if (a.type === 'integer') {
            ret = DataValue.toInteger(a) !== 0;
        }
        else if (a.type === 'real') {
            ret = DataValue.toReal(a) !== 0;
        }
        else if (a.type === 'string') {
            let str = DataValue.toString(a).trim();
            ret = str === 'true' || str === 'yes' || str === '1' || str === 't';
        }
        return ret;
    }
}
//# sourceMappingURL=datavalue.js.map