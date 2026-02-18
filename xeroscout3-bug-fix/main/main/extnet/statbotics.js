"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.StatBotics = void 0;
const netbase_1 = require("./netbase");
class StatBotics extends netbase_1.NetBase {
    constructor(year) {
        super(StatBotics.statboticsURL, StatBotics.statboticsPrefix);
        this.year_ = year;
    }
    getStatsEvent(key, teams) {
        let ret = new Promise((resolve, reject) => {
            let promises = [];
            for (let team of teams) {
                let req = this.request('/team_event/' + team + '/' + key);
                promises.push(req);
            }
            Promise.all(promises)
                .then((results) => {
                resolve(results);
            })
                .catch((err) => {
                reject(err);
            });
        });
        return ret;
    }
    getStatsYear(teams) {
        let ret = new Promise((resolve, reject) => {
            let promises = [];
            for (let team of teams) {
                let req = this.request('/team_year/' + team + '/' + this.year_);
                promises.push(req);
            }
            Promise.all(promises)
                .then((results) => {
                resolve(results);
            })
                .catch((err) => {
                reject(err);
            });
        });
        return ret;
    }
}
exports.StatBotics = StatBotics;
StatBotics.statboticsURL = "api.statbotics.io";
StatBotics.statboticsPrefix = "/v3";
//# sourceMappingURL=statbotics.js.map