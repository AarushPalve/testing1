import { DatabaseView } from "./dbview/dbview.js";
export class XeroTeamDatabaseView extends DatabaseView {
    constructor(app, clname) {
        super(app, 'xero-team-db-view', 'team');
    }
    getInitialSort() {
        return [
            { column: "team_number", dir: "asc" }, //then sort by this second
        ];
    }
}
//# sourceMappingURL=teamdbview.js.map