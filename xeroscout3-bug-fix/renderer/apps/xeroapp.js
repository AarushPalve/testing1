var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
import { XeroLogger } from "../utils/xerologger.js";
import { XeroInfoView } from "../views/infoview.js";
import { XeroNav } from "../xeronav.js";
import { XeroSelectEvent } from "../views/selectevent.js";
import { XeroTextView } from "../views/textview.js";
import { XeroMainProcessInterface } from "../widgets/xerocbtarget.js";
import { XeroSplitter } from "../widgets/xerosplitter.js";
import { XeroStatusWindow } from "../widgets/xerostatus.js";
import { XeroWidget } from "../widgets/xerowidget.js";
import { XeroAssignTablets } from "../views/assigntablets.js";
import { XeroEditFormView } from "../views/forms/editformview.js";
import { XeroScoutFormView } from "../views/forms/scoutformview.js";
import { XeroTeamStatus } from "../views/teamstatus.js";
import { XeroMatchStatus } from "../views/matchstatus.js";
import { MessageOverlay } from "../messages/messageoverlay.js";
import { XeroTeamDatabaseView } from "../views/teamdbview.js";
import { XeroMatchDatabaseView } from "../views/matchdbview.js";
import { HintManager } from "./hintmgr.js";
import { ImageDataSource } from "./imagesrc.js";
import { XeroSelectTablet } from "../views/selecttablet/selecttablet.js";
import { XeroSyncIPAddrView } from "../views/syncipaddr/syncipaddr.js";
import { ResizeBar } from "./resizebar.js";
import { XeroFormulasView } from "../views/formulas/formulas.js";
import { XeroPlayoffsView } from "../views/playoffs/playoffs.js";
import { DataSetEditor } from "../views/dataset/datasetedit.js";
import { EditTeamsView } from "../views/editteams/editteamsview.js";
import { EditMatchesView } from "../views/editmatches/editmatchesview.js";
import { SingleTeamView } from "../views/singleteam/singleteamview.js";
import { PickListView } from "../views/picklist/picklistview.js";
import { XeroStringDialog } from "../widgets/xerostringdialog.js";
import { XeroPredictorView } from "../views/matchPredictor/predictor.js";
let mainapp = undefined;
document.addEventListener('DOMContentLoaded', function () {
    // Initialize the XeroScout app
    mainapp = new XeroApp();
});
export class XeroApp extends XeroMainProcessInterface {
    constructor() {
        super();
        this.viewmap_ = new Map(); // Map of view name to class
        this.resize_bar_ = new ResizeBar(50, true);
        this.resize_bar_.elem.style.display = 'none';
        this.resize_bar_.elem.style.left = '0px';
        this.resize_bar_.elem.style.top = '100px';
        this.resize_bar_.on('resized', this.resizeBarChangedSize.bind(this));
        this.registerCallback('xero-app-init', this.init.bind(this));
        this.registerCallback('resize-window', this.resizeWinow.bind(this));
        this.registerCallback('tablet-title', this.setTabletTitle.bind(this));
        this.registerCallback('prompt-string-request', this.handlePromptStringRequest.bind(this));
    }
    get appType() {
        return this.type_;
    }
    init(init) {
        let logger_ = XeroLogger.getInstance();
        logger_.debug(`XeroApp init called with type ${init.type}`);
        this.type_ = init.type;
        this.hintdb_ = new HintManager();
        this.image_src_ = new ImageDataSource();
        let body = document.getElementsByTagName("body")[0];
        this.left_nav_pane_ = new XeroNav();
        this.right_view_pane_ = new XeroWidget('div', "xero-view-pane");
        this.splitter_ = new XeroSplitter("horizontal", this.left_nav_pane_, this.right_view_pane_);
        this.splitter_.on('changed', this.splitterChanged.bind(this));
        this.splitter_.position = init.splitter || 10;
        this.message_overlay_ = new MessageOverlay(this.right_view_pane_);
        this.status_ = new XeroStatusWindow(this.splitter_);
        this.status_.setParent(body);
        this.registerCallback('update-main-window-view', this.updateView.bind(this));
        this.registerCallback('send-app-status', this.updateStatusBar.bind(this));
        this.registerViews();
    }
    setTabletTitle(title) {
        document.title = title;
    }
    handlePromptStringRequest(request) {
        return __awaiter(this, void 0, void 0, function* () {
            const dialog = new XeroStringDialog(request.title, request.message, request.defaultValue, request.placeholder);
            // Create a promise that resolves when the dialog is closed
            const result = yield new Promise((resolve) => {
                dialog.on('closed', (ok) => {
                    resolve(ok);
                });
                // Show the dialog centered on the main view pane
                if (this.right_view_pane_) {
                    dialog.showCentered(this.right_view_pane_.elem);
                }
                else {
                    dialog.showCentered(document.body);
                }
            });
            // Create response
            const response = {
                id: request.id,
                value: result ? dialog.getResult() : undefined
            };
            // Send response back to main process
            this.request('prompt-string-response', response);
        });
    }
    resizeWinow() {
        if (this.status_) {
            this.resize_bar_.elem.style.display = 'flex';
            this.status_.elem.appendChild(this.resize_bar_.elem);
        }
    }
    resizeBarChangedSize(pcnt) {
        if (this.splitter_) {
            this.splitter_.position = pcnt;
            this.resize_bar_.elem.style.display = 'none';
        }
    }
    splitterChanged() {
        this.request('splitter-changed', this.splitter_.position);
    }
    get imageSource() {
        return this.image_src_;
    }
    get statusBar() {
        return this.status_.statusBar();
    }
    get hintDB() {
        return this.hintdb_;
    }
    get messageOverlay() {
        return this.message_overlay_;
    }
    processArg(arg) {
        return arg;
    }
    updateStatusBar(args) {
        let logger = XeroLogger.getInstance();
        this.status_.statusBar().setLeftStatus(this.processArg(args.left));
        this.status_.statusBar().setMiddleStatus(this.processArg(args.middle));
        this.status_.statusBar().setRightStatus(this.processArg(args.right));
    }
    updateView(args) {
        let logger = XeroLogger.getInstance();
        if (args === undefined || args.view === undefined) {
            const obj = {
                stack: ''
            };
            Error.captureStackTrace(obj);
            console.log(obj.stack);
            logger.error("updateView called with undefined args or view");
        }
        if (this.current_view_ && !this.current_view_.isOkToClose) {
            return;
        }
        if (!this.closeCurrentView()) {
            return;
        }
        if (!this.viewmap_.has(args.view)) {
            logger.error(`view ${args.view} not registered`);
            args.args = [`View ${args.view} not a valid view`];
            args.view = 'text'; // Default to text view
        }
        let classObj = this.viewmap_.get(args.view);
        this.current_view_ = new classObj(this, args.args);
        this.right_view_pane_.elem.appendChild(this.current_view_.elem);
        this.current_view_.onVisible();
    }
    closeCurrentView() {
        let ret = true;
        if (this.current_view_) {
            if (this.current_view_.isOkToClose) {
                this.current_view_.close();
                if (this.right_view_pane_.elem && this.right_view_pane_.elem.contains(this.current_view_.elem)) {
                    this.right_view_pane_.elem.removeChild(this.current_view_.elem);
                }
                this.current_view_ = undefined;
            }
            else {
                ret = false;
            }
        }
        return ret;
    }
    registerView(view, viewclass, programs) {
        if (this.type_ && programs.includes(this.type_)) {
            this.viewmap_.set(view, viewclass);
        }
    }
    registerViews() {
        this.registerView('text', XeroTextView, ['central', 'scout', 'coach']);
        this.registerView('info', XeroInfoView, ['central', 'coach']);
        this.registerView('select-event', XeroSelectEvent, ['central']);
        this.registerView('assign-tablets', XeroAssignTablets, ['central']);
        this.registerView('form-edit', XeroEditFormView, ['central']);
        this.registerView('form-scout', XeroScoutFormView, ['central', 'scout', 'coach']);
        this.registerView('team-status', XeroTeamStatus, ['central', 'coach']);
        this.registerView('team-db', XeroTeamDatabaseView, ['central', 'coach']);
        this.registerView('match-status', XeroMatchStatus, ['central', 'coach']);
        this.registerView('match-db', XeroMatchDatabaseView, ['central', 'coach']);
        this.registerView('select-tablet', XeroSelectTablet, ['scout']);
        this.registerView('sync-ipaddr', XeroSyncIPAddrView, ['scout', 'coach']);
        this.registerView('formulas', XeroFormulasView, ['central', 'coach']);
        this.registerView('playoffs', XeroPlayoffsView, ['central', 'scout', 'coach']);
        this.registerView('datasets', DataSetEditor, ['central']);
        this.registerView('edit-teams', EditTeamsView, ['central']);
        this.registerView('edit-matches', EditMatchesView, ['central']);
        this.registerView('singleteam', SingleTeamView, ['central', 'coach']);
        this.registerView('picklist', PickListView, ['central', 'coach']);
        this.registerView('predictor', XeroPredictorView, ['central']);
    }
}
//# sourceMappingURL=xeroapp.js.map