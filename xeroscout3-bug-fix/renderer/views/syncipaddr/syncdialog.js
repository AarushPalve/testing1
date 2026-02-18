var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
import { XeroDialog } from "../../widgets/xerodialog.js";
export class SyncSetupDialog extends XeroDialog {
    constructor() {
        super('Edit Section Name');
        this.ipaddr_value_ = '';
        this.port_value_ = -1;
    }
    get ipaddr() {
        return this.ipaddr_value_;
    }
    get port() {
        return this.port_value_;
    }
    populateDialog(pdiv) {
        return __awaiter(this, void 0, void 0, function* () {
            let label;
            let div = document.createElement('div');
            div.className = 'xero-sync-setup-dialog-rowdiv';
            this.ipaddr_ = document.createElement('input');
            this.ipaddr_.type = 'text';
            this.ipaddr_.className = 'xero-sync-setup-dialog-ipaddr';
            this.ipaddr_.placeholder = 'IP Address';
            label = document.createElement('label');
            label.className = 'xero-sync-setup-dialog-ipaddr-label';
            label.textContent = 'IP Address:';
            label.appendChild(this.ipaddr_);
            div.appendChild(label);
            this.port_ = document.createElement('input');
            this.port_.type = 'number';
            this.port_.className = 'xero-sync-setup-dialog-port';
            this.port_.placeholder = 'Port Number';
            this.port_.min = '1';
            this.port_.max = '65535';
            this.port_.value = '45455';
            label = document.createElement('label');
            label.className = 'xero-sync-setup-dialog-port-label';
            label.textContent = 'Port Number:';
            label.appendChild(this.port_);
            div.appendChild(label);
            pdiv.appendChild(div);
        });
    }
    onInit() {
        var _a;
        (_a = this.ipaddr_) === null || _a === void 0 ? void 0 : _a.focus();
    }
    okButton(event) {
        var _a, _b;
        this.ipaddr_value_ = ((_a = this.ipaddr_) === null || _a === void 0 ? void 0 : _a.value.trim()) || '';
        this.port_value_ = parseInt(((_b = this.port_) === null || _b === void 0 ? void 0 : _b.value.trim()) || '-1');
        super.okButton(event);
    }
}
//# sourceMappingURL=syncdialog.js.map