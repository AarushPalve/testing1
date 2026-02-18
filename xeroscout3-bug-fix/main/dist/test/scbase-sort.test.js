"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const vitest_1 = require("vitest");
const scbase_1 = require("../main/apps/scbase");
const compare = (a, b) => {
    const sortCompFun = scbase_1.SCBase.prototype.sortCompFun;
    const mapMatchType = scbase_1.SCBase.prototype.mapMatchType;
    return sortCompFun.call({ mapMatchType }, a, b);
};
(0, vitest_1.test)("sortCompFun sorts numeric match_number values numerically even when strings", () => {
    const matches = [
        { comp_level: "qm", match_number: "10", set_number: "1" },
        { comp_level: "qm", match_number: "2", set_number: "1" },
        { comp_level: "qm", match_number: "1", set_number: "1" },
    ];
    matches.sort(compare);
    (0, vitest_1.expect)(matches.map((m) => Number(m.match_number))).toEqual([1, 2, 10]);
});
(0, vitest_1.test)("sortCompFun uses set_number as numeric tie-breaker", () => {
    const matches = [
        { comp_level: "sf", match_number: "1", set_number: "10" },
        { comp_level: "sf", match_number: "1", set_number: "2" },
        { comp_level: "sf", match_number: "1", set_number: "1" },
    ];
    matches.sort(compare);
    (0, vitest_1.expect)(matches.map((m) => Number(m.set_number))).toEqual([1, 2, 10]);
});
//# sourceMappingURL=scbase-sort.test.js.map