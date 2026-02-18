import { DataValue } from "./datavalue.js";
export class ExprNode {
}
export class ExprValue extends ExprNode {
    constructor(value) {
        super();
        this.value = value;
        this.value_ = value;
    }
    getValue(varvalues) {
        return this.value_;
    }
    variables(vars) {
    }
    toString() {
        return DataValue.toDisplayString(this.value_);
    }
}
export class ExprVariable extends ExprNode {
    constructor(name) {
        super();
        this.name_ = name;
    }
    variables(vars) {
        if (!vars.includes(this.name_)) {
            vars.push(this.name_);
        }
    }
    getValue(varvalues) {
        if (varvalues.has(this.name_)) {
            return varvalues.get(this.name_);
        }
        return {
            type: "error",
            value: new Error(`reference to undefined variable ${this.name_}`),
        };
    }
    toString() {
        return this.name_;
    }
}
export class ExprFunctionDef {
    constructor(name, argcnt, func) {
        this.name_ = name;
        this.argcnt_ = argcnt;
        this.func_ = func;
    }
    getValue(args) {
        return this.func_(args);
    }
    getName() {
        return this.name_;
    }
    getArgCount() {
        return this.argcnt_;
    }
}
export class ExprFunction extends ExprNode {
    constructor(name, args, fun) {
        super();
        this.name_ = name;
        this.func_ = fun;
        this.args_ = args;
    }
    toString() {
        return `(${this.name_}${this.args_ ? ", " + this.args_.map(arg => arg.toString()).join(", ") : ""})`;
    }
    variables(vars) {
        if (this.args_) {
            for (let arg of this.args_) {
                arg.variables(vars);
            }
        }
    }
    getValue(varvalues) {
        if (!this.args_) {
            return {
                type: "error",
                value: new Error("no arguments for function " + this.name_),
            };
        }
        const args = [];
        for (const arg of this.args_) {
            args.push(arg.getValue(varvalues));
        }
        if (args.length !== this.func_.getArgCount() &&
            this.func_.getArgCount() >= 0) {
            return {
                type: "error",
                value: new Error(`Invalid number of arguments for function '${this.name_}'`),
            };
        }
        return this.func_.getValue(args);
    }
}
export class ExprOperator extends ExprNode {
    constructor(which) {
        super();
        this.which_ = which;
    }
    toString() {
        if (!this.args_ || this.args_.length === 0) {
            return this.which_;
        }
        else if (this.args_.length === 1) {
            return `(${this.which_} ${this.args_[0].toString()})`;
        }
        return `(${this.args_.map(arg => arg.toString()).join(` ${this.which_} `)})`;
    }
    variables(vars) {
        if (this.args_) {
            for (let arg of this.args_) {
                arg.variables(vars);
            }
        }
    }
    setArgs(args) {
        this.args_ = args;
    }
    operatorPrecedence() {
        switch (this.which_) {
            case "^":
                return 1;
            case "!":
                return 2;
            case "*":
            case "/":
            case "%":
                return 3;
            case "+":
            case "-":
                return 4;
            case "<":
            case "<=":
            case ">":
            case ">=":
                return 6;
            case "==":
            case "!=":
                return 7;
            case "&&":
                return 11;
            case "||":
                return 12;
            default:
                throw new Error('Invalid operator: ' + this.which_);
        }
    }
    getValue(varvalues) {
        if (!this.args_) {
            return {
                type: "error",
                value: new Error("no arguments for operator " + this.which_),
            };
        }
        const args = [];
        for (const arg of this.args_) {
            args.push(arg.getValue(varvalues));
        }
        let ret = {
            type: "error",
            value: new Error("invalid operator " + this.which_),
        };
        switch (this.which_) {
            case "+":
                ret = this.operPlus(args[0], args[1]);
                break;
            case "-":
                ret = this.operMinus(args[0], args[1]);
                break;
            case "*":
                ret = this.operMul(args[0], args[1]);
                break;
            case "/":
                ret = this.operDiv(args[0], args[1]);
                break;
            case "%":
                ret = this.operMod(args[0], args[1]);
                break;
            case "^":
                ret = this.operPow(args[0], args[1]);
                break;
            case "==":
                ret = this.operEqual(args[0], args[1]);
                break;
            case "!=":
                ret = this.operNotEqual(args[0], args[1]);
                break;
            case "<":
                ret = this.operLess(args[0], args[1]);
                break;
            case "<=":
                ret = this.operLessEqual(args[0], args[1]);
                break;
            case ">":
                ret = this.operGreater(args[0], args[1]);
                break;
            case ">=":
                ret = this.operGreaterEqual(args[0], args[1]);
                break;
            case "&&":
                ret = this.operAnd(args[0], args[1]);
                break;
            case "||":
                ret = this.operOr(args[0], args[1]);
                break;
            case "!":
                ret = this.operNot(args[0]);
                break;
        }
        return ret;
    }
    operPlus(a, b) {
        let ret = {
            type: "error",
            value: new Error("operatorn + invalid argument types"),
        };
        if (DataValue.isString(a) &&
            DataValue.isString(b)) {
            ret = {
                type: "string",
                value: a.value + b.value,
            };
        }
        else if (DataValue.isInteger(a) &&
            DataValue.isInteger(b)) {
            ret = {
                type: "integer",
                value: a.value + b.value,
            };
        }
        else if (DataValue.isNumber(a) &&
            DataValue.isNumber(b)) {
            ret = {
                type: "real",
                value: a.value + b.value,
            };
        }
        return ret;
    }
    operMinus(a, b) {
        let ret = {
            type: "error",
            value: new Error("operatorn + invalid argument types"),
        };
        if (DataValue.isInteger(a) &&
            DataValue.isInteger(b)) {
            ret = {
                type: "integer",
                value: a.value - b.value,
            };
        }
        else if (DataValue.isNumber(a) &&
            DataValue.isNumber(b)) {
            ret = {
                type: "real",
                value: a.value - b.value,
            };
        }
        return ret;
    }
    operMul(a, b) {
        let ret = {
            type: "error",
            value: new Error("operatorn + invalid argument types"),
        };
        if (DataValue.isInteger(a) &&
            DataValue.isInteger(b)) {
            ret = {
                type: "integer",
                value: a.value * b.value,
            };
        }
        else if (DataValue.isNumber(a) &&
            DataValue.isNumber(b)) {
            ret = {
                type: "real",
                value: a.value * b.value,
            };
        }
        return ret;
    }
    operDiv(a, b) {
        let ret = {
            type: "error",
            value: new Error("operatorn + invalid argument types"),
        };
        if (DataValue.isInteger(a) &&
            DataValue.isInteger(b)) {
            // integer division
            if (b.value === 0) {
                ret = {
                    type: "error",
                    value: new Error("division by zero"),
                };
            }
            else {
                ret = {
                    type: "integer",
                    value: Math.floor(a.value / b.value),
                };
            }
        }
        else if (DataValue.isNumber(a) &&
            DataValue.isNumber(b)) {
            if (b.value === 0.0) {
                ret = {
                    type: "error",
                    value: new Error("division by zero"),
                };
            }
            else {
                ret = {
                    type: "real",
                    value: a.value / b.value,
                };
            }
        }
        return ret;
    }
    operMod(a, b) {
        let ret = {
            type: "error",
            value: new Error("operatorn + invalid argument types"),
        };
        if (DataValue.isInteger(a) &&
            DataValue.isInteger(b)) {
            if (b.value === 0) {
                ret = {
                    type: "error",
                    value: new Error("division by zero"),
                };
            }
            else {
                ret = {
                    type: "integer",
                    value: a.value % b.value,
                };
            }
        }
        else if (DataValue.isNumber(a) &&
            DataValue.isNumber(b)) {
            if (b.value === 0.0) {
                ret = {
                    type: "error",
                    value: new Error("division by zero"),
                };
            }
            else {
                ret = {
                    type: "real",
                    value: a.value % b.value,
                };
            }
        }
        return ret;
    }
    operPow(a, b) {
        let ret = {
            type: "error",
            value: new Error("operatorn + invalid argument types"),
        };
        if (DataValue.isInteger(a) &&
            DataValue.isInteger(b)) {
            if (b.value === 0) {
                ret = {
                    type: "integer",
                    value: 1,
                };
            }
            else if (a.value === 0) {
                ret = {
                    type: "integer",
                    value: 0,
                };
            }
            else {
                ret = {
                    type: "integer",
                    value: Math.pow(a.value, b.value),
                };
            }
        }
        else if (DataValue.isNumber(a) &&
            DataValue.isNumber(b)) {
            if (b.value === 0.0) {
                ret = {
                    type: "real",
                    value: 1.0,
                };
            }
            else if (a.value === 0.0) {
                ret = {
                    type: "real",
                    value: 0.0,
                };
            }
            else {
                ret = {
                    type: "real",
                    value: Math.pow(a.value, b.value),
                };
            }
        }
        return ret;
    }
    operEqual(a, b) {
        let ret = {
            type: "error",
            value: new Error("operatorn + invalid argument types"),
        };
        if (DataValue.isString(a) && DataValue.isString(b)) {
            ret = {
                type: "boolean",
                value: a.value === b.value,
            };
        }
        else if (DataValue.isNumber(a) && DataValue.isNumber(b)) {
            ret = {
                type: "boolean",
                value: a.value === b.value,
            };
        }
        else if (DataValue.isBoolean(a) && DataValue.isBoolean(b)) {
            ret = {
                type: "boolean",
                value: a.value === b.value,
            };
        }
        return ret;
    }
    operNotEqual(a, b) {
        let ret = {
            type: "error",
            value: new Error("operatorn + invalid argument types"),
        };
        if (DataValue.isString(a) && DataValue.isString(b)) {
            ret = {
                type: "boolean",
                value: a.value !== b.value,
            };
        }
        else if (DataValue.isNumber(a) && DataValue.isNumber(b)) {
            ret = {
                type: "boolean",
                value: a.value !== b.value,
            };
        }
        else if (DataValue.isBoolean(a) && DataValue.isBoolean(b)) {
            ret = {
                type: "boolean",
                value: a.value !== b.value,
            };
        }
        return ret;
    }
    operLess(a, b) {
        let ret = {
            type: "error",
            value: new Error("operatorn + invalid argument types"),
        };
        if (DataValue.isString(a) &&
            DataValue.isString(b)) {
            ret = {
                type: "boolean",
                value: a.toString() < b.toString(),
            };
        }
        else if (DataValue.isNumber(a) &&
            DataValue.isNumber(b)) {
            ret = {
                type: "boolean",
                value: a.value < b.value,
            };
        }
        return ret;
    }
    operLessEqual(a, b) {
        let ret = {
            type: "error",
            value: new Error("operatorn + invalid argument types"),
        };
        if (DataValue.isString(a) &&
            DataValue.isString(b)) {
            ret = {
                type: "boolean",
                value: a.value <= b.value,
            };
        }
        else if (DataValue.isNumber(a) &&
            DataValue.isNumber(b)) {
            ret = {
                type: "boolean",
                value: a.value <= b.value,
            };
        }
        return ret;
    }
    operGreater(a, b) {
        let ret = {
            type: "error",
            value: new Error("operatorn + invalid argument types"),
        };
        if (DataValue.isString(a) &&
            DataValue.isString(b)) {
            ret = {
                type: "boolean",
                value: a.value > b.value,
            };
        }
        else if (DataValue.isNumber(a) &&
            DataValue.isNumber(b)) {
            ret = {
                type: "boolean",
                value: a.value > b.value,
            };
        }
        return ret;
    }
    operGreaterEqual(a, b) {
        let ret = {
            type: "error",
            value: new Error("operatorn + invalid argument types"),
        };
        if (DataValue.isString(a) &&
            DataValue.isString(b)) {
            ret = {
                type: "boolean",
                value: a.value >= b.value,
            };
        }
        else if (DataValue.isNumber(a) &&
            DataValue.isNumber(b)) {
            ret = {
                type: "boolean",
                value: a.value >= b.value,
            };
        }
        return ret;
    }
    operAnd(a, b) {
        let ret = {
            type: "error",
            value: new Error("operatorn + invalid argument types"),
        };
        if (DataValue.isBoolean(a) &&
            DataValue.isBoolean(b)) {
            ret = {
                type: "boolean",
                value: a.value && b.value,
            };
        }
        return ret;
    }
    operOr(a, b) {
        let ret = {
            type: "error",
            value: new Error("operatorn + invalid argument types"),
        };
        if (DataValue.isBoolean(a) &&
            DataValue.isBoolean(b)) {
            ret = {
                type: "boolean",
                value: a.value || b.value,
            };
        }
        return ret;
    }
    operNot(a) {
        let ret = {
            type: "error",
            value: new Error("operatorn + invalid argument types"),
        };
        if (DataValue.isBoolean(a)) {
            ret = {
                type: "boolean",
                value: !a.value,
            };
        }
        return ret;
    }
}
class ExprArray extends ExprNode {
    constructor(args) {
        super();
        this.args_ = args;
    }
    toString() {
        return `[${this.args_.map(arg => arg.toString()).join(", ")}]`;
    }
    variables(vars) {
        if (this.args_) {
            for (let arg of this.args_) {
                arg.variables(vars);
            }
        }
    }
    getValue(varvalues) {
        const args = [];
        for (const arg of this.args_) {
            args.push(arg.getValue(varvalues));
        }
        return {
            type: "array",
            value: args,
        };
    }
}
export class Expr {
    constructor(str, node, err) {
        this.expr_ = node;
        this.err_ = err;
        this.str_ = str;
    }
    static availableFunctions() {
        if (!Expr.inited_) {
            Expr.initFunctions();
        }
        let ret = [];
        for (let func of Expr.functions_.values()) {
            ret.push({
                name: func.getName(),
            });
        }
        return ret;
    }
    static registerFunction(name, argcnt, func) {
        if (Expr.functions_.has(name)) {
            throw new Error("Function already registered");
        }
        Expr.functions_.set(name, new ExprFunctionDef(name, argcnt, func));
    }
    toString(orig) {
        if (orig) {
            return this.str_;
        }
        else if (this.hasError()) {
            return `error: ${this.getErrorMessage()}`;
        }
        return this.expr_.toString();
    }
    hasError() {
        return this.err_ !== null;
    }
    getError() {
        return this.err_;
    }
    getErrorMessage() {
        if (this.err_) {
            return this.err_.message;
        }
        return "";
    }
    getString() {
        return this.str_;
    }
    evaluate(varvalues) {
        if (this.hasError()) {
            return {
                type: "error",
                value: this.err_,
            };
        }
        let ret = this.expr_.getValue(varvalues);
        return ret;
    }
    variables() {
        let ret = [];
        if (this.expr_) {
            this.expr_.variables(ret);
        }
        return ret;
    }
    static parse(str) {
        if (!Expr.inited_) {
            Expr.initFunctions();
        }
        let result = Expr.parseNode(str, 0);
        if (result instanceof Error) {
            return new Expr(str, null, result);
        }
        let index = Expr.skipSpaces(str, result[0]);
        if (index != str.length) {
            return new Expr(str, null, new Error("Invalid expression"));
        }
        return new Expr(str, result[1], null);
    }
    static initFunctions() {
        Expr.registerFunction("int", 1, (args) => {
            let ret;
            if (args.length !== 1) {
                return {
                    type: "error",
                    value: new Error("Invalid number of arguments for function int"),
                };
            }
            if (DataValue.isInteger(args[0])) {
                ret = args[0];
            }
            else if (DataValue.isReal(args[0])) {
                if (args[0].value > Number.MAX_SAFE_INTEGER) {
                    ret = {
                        type: "error",
                        value: new Error("Integer overflow"),
                    };
                }
                else if (args[0].value < Number.MIN_SAFE_INTEGER) {
                    ret = {
                        type: "error",
                        value: new Error("Integer underflow"),
                    };
                }
                else if (args[0].value > 0) {
                    ret = {
                        type: "integer",
                        value: Math.floor(args[0].value),
                    };
                }
                else {
                    ret = {
                        type: "integer",
                        value: Math.ceil(args[0].value),
                    };
                }
            }
            else {
                ret = {
                    type: "error",
                    value: new Error("Invalid argument type for function int"),
                };
            }
            return ret;
        });
        Expr.registerFunction("abs", 1, (args) => {
            let ret;
            if (args.length !== 1) {
                ret = {
                    type: "error",
                    value: new Error("Invalid number of arguments for function abs"),
                };
            }
            else if (DataValue.isInteger(args[0])) {
                ret = {
                    type: "integer",
                    value: Math.abs(args[0].value),
                };
            }
            else if (DataValue.isReal(args[0])) {
                ret = {
                    type: "real",
                    value: Math.abs(args[0].value),
                };
            }
            else {
                ret = {
                    type: "error",
                    value: new Error("Invalid argument type for function abs"),
                };
            }
            return ret;
        });
        Expr.registerFunction("ceil", 1, (args) => {
            if (args.length !== 1) {
                return {
                    type: "error",
                    value: new Error("Invalid number of arguments for function ceil"),
                };
            }
            return {
                type: "integer",
                value: Math.ceil(args[0].value),
            };
        });
        Expr.registerFunction("floor", 1, (args) => {
            if (args.length !== 1) {
                return {
                    type: "error",
                    value: new Error("Invalid number of arguments for function floor"),
                };
            }
            return {
                type: "integer",
                value: Math.floor(args[0].value),
            };
        });
        Expr.registerFunction("round", 1, (args) => {
            if (args.length !== 1) {
                return {
                    type: "error",
                    value: new Error("Invalid number of arguments for function round"),
                };
            }
            return {
                type: "integer",
                value: Math.round(args[0].value),
            };
        });
        Expr.registerFunction("sqrt", 1, (args) => {
            if (args.length !== 1) {
                return {
                    type: "error",
                    value: new Error("Invalid number of arguments for function sqrt"),
                };
            }
            return {
                type: "real",
                value: Math.sqrt(args[0].value),
            };
        });
        Expr.registerFunction("sin", 1, (args) => {
            if (args.length !== 1) {
                return {
                    type: "error",
                    value: new Error("Invalid number of arguments for function sin"),
                };
            }
            return {
                type: "real",
                value: Math.sin(args[0].value),
            };
        });
        Expr.registerFunction("cos", 1, (args) => {
            if (args.length !== 1) {
                return {
                    type: "error",
                    value: new Error("Invalid number of arguments for function cos"),
                };
            }
            return {
                type: "real",
                value: Math.cos(args[0].value),
            };
        });
        Expr.registerFunction("tan", 1, (args) => {
            if (args.length !== 1) {
                return {
                    type: "error",
                    value: new Error("Invalid number of arguments for function tan"),
                };
            }
            return {
                type: "real",
                value: Math.tan(args[0].value),
            };
        });
        Expr.registerFunction("asin", 1, (args) => {
            if (args.length !== 1) {
                return {
                    type: "error",
                    value: new Error("Invalid number of arguments for function asin"),
                };
            }
            return {
                type: "real",
                value: Math.asin(args[0].value),
            };
        });
        Expr.registerFunction("acos", 1, (args) => {
            if (args.length !== 1) {
                return {
                    type: "error",
                    value: new Error("Invalid number of arguments for function acos"),
                };
            }
            return {
                type: "real",
                value: Math.acos(args[0].value),
            };
        });
        Expr.registerFunction("atan", 1, (args) => {
            if (args.length !== 1) {
                return {
                    type: "error",
                    value: new Error("Invalid number of arguments for function atan"),
                };
            }
            return {
                type: "real",
                value: Math.atan(args[0].value),
            };
        });
        Expr.registerFunction("atan2", 2, (args) => {
            if (args.length !== 2) {
                return {
                    type: "error",
                    value: new Error("Invalid number of arguments for function atan2"),
                };
            }
            return {
                type: "real",
                value: Math.atan2(args[0].value, args[1].value),
            };
        });
        Expr.registerFunction("exp", 1, (args) => {
            if (args.length !== 1) {
                return {
                    type: "error",
                    value: new Error("Invalid number of arguments for function exp"),
                };
            }
            return {
                type: "real",
                value: Math.exp(args[0].value),
            };
        });
        Expr.registerFunction("log", 1, (args) => {
            if (args.length !== 1) {
                return {
                    type: "error",
                    value: new Error("Invalid number of arguments for function log"),
                };
            }
            return {
                type: "real",
                value: Math.log(args[0].value),
            };
        });
        Expr.registerFunction("log10", 1, (args) => {
            if (args.length !== 1) {
                return {
                    type: "error",
                    value: new Error("Invalid number of arguments for function log10"),
                };
            }
            return {
                type: "real",
                value: Math.log10(args[0].value),
            };
        });
        Expr.registerFunction("log2", 1, (args) => {
            if (args.length !== 1) {
                return {
                    type: "error",
                    value: new Error("Invalid number of arguments for function log2"),
                };
            }
            return {
                type: "real",
                value: Math.log2(args[0].value),
            };
        });
        Expr.registerFunction("ln", 1, (args) => {
            if (args.length !== 1) {
                return {
                    type: "error",
                    value: new Error("Invalid number of arguments for function ln"),
                };
            }
            return {
                type: "real",
                value: Math.log(args[0].value),
            };
        });
        Expr.registerFunction("logn", 2, (args) => {
            if (args.length !== 2) {
                return {
                    type: "error",
                    value: new Error("Invalid number of arguments for function logn"),
                };
            }
            return {
                type: "real",
                value: Math.log(args[0].value) / Math.log(args[1].value),
            };
        });
        Expr.registerFunction("average", -1, (args) => {
            if (args.length === 0) {
                return {
                    type: "error",
                    value: new Error("Invalid number of arguments for function average"),
                };
            }
            let result = [];
            Expr.flatten(args, result);
            let sum = 0.0;
            let count = 0;
            for (let i = 0; i < result.length; i++) {
                if (DataValue.isError(result[i])) {
                    return result[i];
                }
                else if (DataValue.isNull(result[i])) {
                    continue;
                }
                else if (!DataValue.isNumber(result[i])) {
                    return {
                        type: "error",
                        value: new Error("Invalid argument type for function average"),
                    };
                }
                sum += result[i].value;
                count++;
            }
            if (count === 0) {
                return {
                    type: "error",
                    value: new Error("No non-null values for function average"),
                };
            }
            return {
                type: "real",
                value: sum / count,
            };
        });
        Expr.inited_ = true;
        Expr.registerFunction("sum", -1, (args) => {
            if (args.length === 0) {
                return {
                    type: "error",
                    value: new Error("Invalid number of arguments for function average"),
                };
            }
            let result = [];
            Expr.flatten(args, result);
            let sum = 0.0;
            for (let i = 0; i < result.length; i++) {
                if (DataValue.isError(result[i])) {
                    return result[i];
                }
                else if (!DataValue.isNumber(result[i])) {
                    return {
                        type: "error",
                        value: new Error("Invalid argument type for function average"),
                    };
                }
                sum += result[i].value;
            }
            return {
                type: "real",
                value: sum,
            };
        });
        Expr.registerFunction("median", -1, (args) => {
            if (args.length === 0) {
                return {
                    type: "error",
                    value: new Error("Invalid number of arguments for function average"),
                };
            }
            let result = [];
            Expr.flatten(args, result);
            for (let i = 0; i < result.length; i++) {
                if (DataValue.isError(result[i])) {
                    return result[i];
                }
                else if (!DataValue.isNumber(result[i])) {
                    return {
                        type: "error",
                        value: new Error("Invalid argument type for function average"),
                    };
                }
            }
            result.sort((a, b) => {
                return a.value - b.value;
            });
            let len = result.length / 2;
            if (result.length % 2 === 0) {
                return {
                    type: "real",
                    value: (result[len - 1].value + result[len].value) / 2.0,
                };
            }
            else {
                return {
                    type: "real",
                    value: result[Math.floor(len)].value,
                };
            }
        });
        Expr.registerFunction("variance", -1, (args) => {
            if (args.length === 0) {
                return {
                    type: "error",
                    value: new Error("Invalid number of arguments for function average"),
                };
            }
            let result = [];
            Expr.flatten(args, result);
            let sum = 0.0;
            for (let i = 0; i < result.length; i++) {
                if (DataValue.isError(result[i])) {
                    return result[i];
                }
                else if (!DataValue.isNumber(result[i])) {
                    return {
                        type: "error",
                        value: new Error("Invalid argument type for function average"),
                    };
                }
                sum += result[i].value;
            }
            let sum2 = 0.0;
            for (let i = 0; i < result.length; i++) {
                sum2 += Math.pow(result[i].value - sum, 2);
            }
            return {
                type: "real",
                value: sum2 / result.length,
            };
        });
        Expr.registerFunction("stddev", -1, (args) => {
            if (args.length === 0) {
                return {
                    type: "error",
                    value: new Error("Invalid number of arguments for function average"),
                };
            }
            let result = [];
            Expr.flatten(args, result);
            let sum = 0.0;
            for (let i = 0; i < result.length; i++) {
                if (DataValue.isError(result[i])) {
                    return result[i];
                }
                else if (!DataValue.isNumber(result[i])) {
                    return {
                        type: "error",
                        value: new Error("Invalid argument type for function average"),
                    };
                }
                sum += result[i].value;
            }
            let avg = sum / result.length;
            let sum2 = 0.0;
            for (let i = 0; i < result.length; i++) {
                sum2 += Math.pow(result[i].value - avg, 2);
            }
            return {
                type: "real",
                value: Math.sqrt(sum2 / result.length),
            };
        });
        Expr.inited_ = true;
    }
    static flatten(args, result) {
        for (let arg of args) {
            if (arg.type === "array") {
                Expr.flatten(arg.value, result);
            }
            else {
                result.push(arg);
            }
        }
    }
    static skipSpaces(str, index) {
        while (index < str.length && str[index] === " ") {
            index++;
        }
        return index;
    }
    static isDigit(c) {
        return c >= "0" && c <= "9";
    }
    static isAlpha(c) {
        return (c >= "a" && c <= "z") || (c >= "A" && c <= "Z");
    }
    static parseOperand(str, index) {
        let ret = new Error("error parsing operand");
        index = Expr.skipSpaces(str, index);
        if (index >= str.length) {
            return new Error("Invalid operand");
        }
        if (str.substring(index).startsWith("(")) {
            let result = Expr.parseNode(str, index + 1);
            if (result instanceof Error) {
                return result;
            }
            index = Expr.skipSpaces(str, result[0]);
            if (index >= str.length || str.charAt(index) !== ")") {
                return new Error("Invalid operand");
            }
            index++;
            ret = [index, result[1]];
        }
        else if (Expr.isDigit(str.charAt(index)) ||
            str.charAt(index) === "-" ||
            str.charAt(index) === "+") {
            let start = index;
            if (str.charAt(index) === "-" || str.charAt(index) === "+") {
                index++;
            }
            while (index < str.length && Expr.isDigit(str.charAt(index))) {
                index++;
            }
            if (index < str.length && str.charAt(index) === ".") {
                index++;
                while (index < str.length && Expr.isDigit(str.charAt(index))) {
                    index++;
                }
            }
            if (index < str.length && str.charAt(index).toLowerCase() === "e") {
                index++;
                if (index < str.length &&
                    (str.charAt(index) === "+" || str.charAt(index) === "-")) {
                    index++;
                }
                while (index < str.length && Expr.isDigit(str.charAt(index))) {
                    index++;
                }
            }
            let num = str.substring(start, index);
            let v = {
                type: "error",
                value: new Error("Invalid number"),
            };
            if (num.match(/^[+-]?\d+$/)) {
                v = {
                    type: "integer",
                    value: Number.parseInt(num),
                };
            }
            else {
                let fv = Number.parseFloat(num);
                if (Number.isNaN(fv)) {
                    return new Error("Invalid number");
                }
                v = {
                    type: "real",
                    value: fv,
                };
            }
            ret = [index, new ExprValue(v)];
        }
        else if (Expr.isAlpha(str.charAt(index))) {
            let start = index;
            while (index < str.length &&
                (Expr.isAlpha(str.charAt(index)) ||
                    Expr.isDigit(str.charAt(index)) ||
                    str.charAt(index) === "_")) {
                index++;
            }
            let name = str.substring(start, index);
            let args = [];
            if (name.toLowerCase() === "true") {
                ret = [index, new ExprValue({ type: "boolean", value: true })];
            }
            else if (name.toLowerCase() === "false") {
                ret = [index, new ExprValue({ type: "boolean", value: false })];
            }
            else if (str.charAt(index) === "(") {
                // This is a function call
                index++;
                while (true) {
                    let andresult = Expr.parseNode(str, index);
                    if (andresult instanceof Error) {
                        return andresult;
                    }
                    index = andresult[0];
                    args.push(andresult[1]);
                    index = Expr.skipSpaces(str, index);
                    if (index >= str.length) {
                        return new Error("Invalid function call");
                    }
                    if (str.charAt(index) === ",") {
                        index++;
                    }
                    else if (str.charAt(index) === ")") {
                        index++;
                        break;
                    }
                    else {
                        return new Error("Invalid function call");
                    }
                }
                if (!Expr.functions_.has(name)) {
                    return new Error("function " + name + " not found");
                }
                let func = Expr.functions_.get(name);
                if (args.length !== func.getArgCount() && func.getArgCount() >= 0) {
                    return new Error("Invalid number of arguments for function " + name);
                }
                ret = [index, new ExprFunction(name, args, func)];
            }
            else {
                // This is a variable
                ret = [index, new ExprVariable(name)];
            }
        }
        else if (str.charAt(index) === "!") {
            index++;
            let result = Expr.parseNode(str, index);
            if (result instanceof Error) {
                return result;
            }
            index = result[0];
            ret = [index, new ExprOperator("!")];
            ret[1].setArgs([result[1]]);
        }
        else if (str.charAt(index) === "[") {
            index++;
            let args = [];
            while (true) {
                let andresult = Expr.parseNode(str, index);
                if (andresult instanceof Error) {
                    return andresult;
                }
                index = andresult[0];
                args.push(andresult[1]);
                index = Expr.skipSpaces(str, index);
                if (index >= str.length) {
                    return new Error("Invalid array");
                }
                if (str.charAt(index) === ",") {
                    index++;
                }
                else if (str.charAt(index) === "]") {
                    index++;
                    break;
                }
                else {
                    return new Error("Invalid array");
                }
            }
            ret = [index, new ExprArray(args)];
        }
        else if (str.charAt(index) === "'") {
            index++;
            let start = index;
            while (index < str.length && str.charAt(index) !== "'") {
                if (str.charAt(index) === "\\") {
                    index++;
                }
                index++;
            }
            if (index >= str.length) {
                return new Error("Invalid string");
            }
            let strval = str.substring(start, index);
            ret = [index + 1, new ExprValue({ type: "string", value: strval })];
        }
        else if (str.charAt(index) === '"') {
            index++;
            let start = index;
            while (index < str.length && str.charAt(index) !== '"') {
                if (str.charAt(index) === "\\") {
                    index++;
                }
                index++;
            }
            if (index >= str.length) {
                return new Error("Invalid string");
            }
            let strval = str.substring(start, index);
            ret = [index + 1, new ExprValue({ type: "string", value: strval })];
        }
        else {
            return new Error("Invalid operand");
        }
        return ret;
    }
    static parseOperator(str, index) {
        index = Expr.skipSpaces(str, index);
        if (index >= str.length) {
            return null;
        }
        if (str.substring(index).startsWith("+")) {
            index++;
            return [index, new ExprOperator("+")];
        }
        else if (str.substring(index).startsWith("-")) {
            index++;
            return [index, new ExprOperator("-")];
        }
        else if (str.substring(index).startsWith("*")) {
            index++;
            return [index, new ExprOperator("*")];
        }
        else if (str.substring(index).startsWith("/")) {
            index++;
            return [index, new ExprOperator("/")];
        }
        else if (str.substring(index).startsWith("%")) {
            index++;
            return [index, new ExprOperator("%")];
        }
        else if (str.substring(index).startsWith("^")) {
            index++;
            return [index, new ExprOperator("^")];
        }
        else if (str.substring(index).startsWith("==")) {
            index += 2;
            return [index, new ExprOperator("==")];
        }
        else if (str.substring(index).startsWith("!=")) {
            index += 2;
            return [index, new ExprOperator("!=")];
        }
        else if (str.substring(index).startsWith("<=")) {
            index += 2;
            return [index, new ExprOperator("<=")];
        }
        else if (str.substring(index).startsWith("<")) {
            index++;
            return [index, new ExprOperator("<")];
        }
        else if (str.substring(index).startsWith(">=")) {
            index += 2;
            return [index, new ExprOperator(">=")];
        }
        else if (str.substring(index).startsWith(">")) {
            index++;
            return [index, new ExprOperator(">")];
        }
        else if (str.substring(index).startsWith("&&")) {
            index += 2;
            return [index, new ExprOperator("&&")];
        }
        else if (str.substring(index).startsWith("||")) {
            index += 2;
            return [index, new ExprOperator("||")];
        }
        return null;
    }
    static parseNode(str, index) {
        let ret = new ExprValue({
            type: "error",
            value: new Error("Not implemented"),
        });
        let operands = [];
        let operators = [];
        let operand1 = Expr.parseOperand(str, index);
        if (operand1 instanceof Error) {
            return operand1;
        }
        index = operand1[0];
        operands.push(operand1[1]);
        let operator1 = Expr.parseOperator(str, index);
        if (operator1 instanceof Error) {
            return operator1;
        }
        if (operator1 === null) {
            return [index, operands[0]];
        }
        index = operator1[0];
        operators.push(operator1[1]);
        while (index < str.length) {
            let operand2 = Expr.parseOperand(str, index);
            if (operand2 instanceof Error) {
                return operand2;
            }
            index = Expr.skipSpaces(str, operand2[0]);
            operands.push(operand2[1]);
            let operator2 = Expr.parseOperator(str, index);
            if (operator2 instanceof Error) {
                return operator2;
            }
            if (operator2 === null) {
                break;
            }
            index = operator2[0];
            while (operators.length > 0 && operators[operators.length - 1].operatorPrecedence() < operator2[1].operatorPrecedence()) {
                let operand1 = operands.pop();
                let operand2 = operands.pop();
                let operator = operators.pop();
                operator.setArgs([operand2, operand1]);
                operands.push(operator);
            }
            operators.push(operator2[1]);
        }
        while (operators.length > 0) {
            let operand1 = operands.pop();
            let operand2 = operands.pop();
            let operator = operators.pop();
            operator.setArgs([operand2, operand1]);
            operands.push(operator);
        }
        return [index, operands.pop()];
    }
}
Expr.inited_ = false;
Expr.functions_ = new Map();
//# sourceMappingURL=expr.js.map