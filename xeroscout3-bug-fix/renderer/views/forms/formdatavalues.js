export class XeroFormDataValues {
    constructor(dvalues = []) {
        this.dvalues_ = dvalues;
    }
    get values() {
        return this.dvalues_;
    }
    get(tag) {
        let dvalue = this.dvalues_.find((dvalue) => dvalue.tag === tag);
        if (dvalue === undefined) {
            return undefined;
        }
        return dvalue.value;
    }
    set(tag, value) {
        const index = this.dvalues_.findIndex((dvalue) => dvalue.tag === tag);
        if (index !== -1) {
            this.dvalues_[index].value = value;
        }
        else {
            this.dvalues_.push({ tag, value });
        }
    }
    clear() {
        this.dvalues_ = [];
    }
}
//# sourceMappingURL=formdatavalues.js.map