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
export class AllianceDialog extends XeroDialog {
    constructor(teams, which, a) {
        super('Alliance # ' + which);
        this.teams_ = [0, 0, 0];
        this.which_ = which;
        this.available_teams_ = teams;
        if (a && Array.isArray(a) && a.length === 3) {
            this.teams_[0] = a[0];
            this.teams_[1] = a[1];
            this.teams_[2] = a[2];
            if (a[0]) {
                this.available_teams_.push(a[0]);
            }
            if (a[1]) {
                this.available_teams_.push(a[1]);
            }
            if (a[2]) {
                this.available_teams_.push(a[2]);
            }
            this.available_teams_ = this.available_teams_.sort((a, b) => {
                return a - b;
            });
        }
        else {
            this.teams_ = [undefined, undefined, undefined];
        }
    }
    get teams() {
        return this.teams_;
    }
    get which() {
        return this.which_;
    }
    createOptions(select) {
        const option = document.createElement('option');
        option.value = '';
        option.innerText = 'None';
        select.appendChild(option);
        for (let i = 0; i < this.available_teams_.length; i++) {
            const option = document.createElement('option');
            option.value = this.available_teams_[i].toString();
            option.innerText = this.available_teams_[i].toString();
            select.appendChild(option);
        }
    }
    populateDialog(pdiv) {
        return __awaiter(this, void 0, void 0, function* () {
            let label;
            let div = document.createElement('div');
            div.className = 'xero-popup-form-edit-dialog-rowdiv';
            this.captain_ = document.createElement('select');
            this.captain_.className = 'xero-popup-form-edit-dialog-input';
            this.createOptions(this.captain_);
            if (this.teams_[0]) {
                this.captain_.value = this.teams_[0].toString();
            }
            else {
                this.captain_.value = '';
            }
            label = document.createElement('label');
            label.className = 'xero-popup-form-edit-dialog-label';
            label.innerText = 'Captian';
            label.appendChild(this.captain_);
            div.appendChild(label);
            this.first_pick_ = document.createElement('select');
            this.first_pick_.className = 'xero-popup-form-edit-dialog-input';
            this.createOptions(this.first_pick_);
            if (this.teams_[1]) {
                this.first_pick_.value = this.teams_[1].toString();
            }
            else {
                this.first_pick_.value = '';
            }
            label = document.createElement('label');
            label.className = 'xero-popup-form-edit-dialog-label';
            label.innerText = 'First Pick';
            label.appendChild(this.first_pick_);
            div.appendChild(label);
            this.second_pick_ = document.createElement('select');
            this.second_pick_.className = 'xero-popup-form-edit-dialog-input';
            this.createOptions(this.second_pick_);
            if (this.teams_[2]) {
                this.second_pick_.value = this.teams_[2].toString();
            }
            else {
                this.second_pick_.value = '';
            }
            label = document.createElement('label');
            label.className = 'xero-popup-form-edit-dialog-label';
            label.innerText = 'Second Pick';
            label.appendChild(this.second_pick_);
            div.appendChild(label);
            pdiv.appendChild(div);
        });
    }
    onInit() {
        if (this.captain_) {
            this.captain_.focus();
        }
    }
    okButton(event) {
        if (this.captain_ && this.first_pick_ && this.second_pick_) {
            if (this.captain_.value.length > 0) {
                this.teams_[0] = parseInt(this.captain_.value, 10);
            }
            else {
                this.teams_[0] = undefined;
            }
            if (this.first_pick_.value.length > 0) {
                this.teams_[1] = parseInt(this.first_pick_.value, 10);
            }
            else {
                this.teams_[1] = undefined;
            }
            if (this.second_pick_.value.length > 0) {
                this.teams_[2] = parseInt(this.second_pick_.value, 10);
            }
            else {
                this.teams_[2] = undefined;
            }
        }
        super.okButton(event);
    }
}
//# sourceMappingURL=alliancedialog.js.map