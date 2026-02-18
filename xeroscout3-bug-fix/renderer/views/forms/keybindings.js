export class Keybinding {
    constructor(key, ctrl, alt, shift, desc, action) {
        this.key = key;
        this.ctrl = ctrl;
        this.alt = alt;
        this.shift = shift;
        this.desc = desc;
        this.action = action;
    }
    get bindingAsText() {
        let ret = '';
        if (this.ctrl) {
            ret = 'Ctrl+' + ret;
        }
        if (this.alt) {
            ret = 'Alt+' + ret;
        }
        if (this.shift) {
            ret = 'Shift+' + ret;
        }
        return ret + this.key;
    }
}
export class KeybindingManager {
    constructor() {
        this.keybindings_ = new Map();
    }
    getAllKeybindings() {
        let ret = [];
        for (let key of this.keybindings_.keys()) {
            const keybindings = this.keybindings_.get(key);
            if (keybindings) {
                for (let binding of keybindings) {
                    ret.push(binding);
                }
            }
        }
        return ret;
    }
    addKeybinding(key, ctrl, alt, shift, desc, action) {
        var _a;
        const keybinding = new Keybinding(key, ctrl, alt, shift, desc, action);
        if (!this.keybindings_.has(key)) {
            this.keybindings_.set(key, []);
        }
        (_a = this.keybindings_.get(key)) === null || _a === void 0 ? void 0 : _a.push(keybinding);
    }
    getKeybindings(key, ctrl, alt, shift) {
        let ret = undefined;
        if (this.keybindings_.has(key)) {
            const keybindings = this.keybindings_.get(key);
            for (let binding of keybindings) {
                if (binding.ctrl === ctrl && binding.alt === alt && binding.shift === shift) {
                    ret = binding;
                    break;
                }
            }
        }
        return ret;
    }
}
//# sourceMappingURL=keybindings.js.map