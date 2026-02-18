var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
import { XeroDialog } from "./xerodialog.js";
export class XeroYesNo extends XeroDialog {
    constructor(title, question) {
        super(title, true);
        this.question_ = question;
    }
    populateDialog(pdiv) {
        return __awaiter(this, void 0, void 0, function* () {
            this.span_ = document.createElement('span');
            this.span_.innerText = this.question_;
            pdiv.appendChild(this.span_);
        });
    }
}
//# sourceMappingURL=xeroyesnow.js.map