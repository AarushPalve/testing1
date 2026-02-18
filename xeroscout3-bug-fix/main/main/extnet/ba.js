"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.BlueAlliance = void 0;
const netbase_1 = require("./netbase");
class BlueAlliance extends netbase_1.NetBase {
    constructor(year) {
        super(BlueAlliance.BlueAllianceHost, BlueAlliance.BlueAlliancePrefix, BlueAlliance.BlueAllianceAPIKey);
        if (year) {
            this.year_ = year;
        }
        else {
            this.year_ = -1;
        }
        this.max_season_ = -1;
    }
    async init() {
        let ret = new Promise((resolve, reject) => {
            this.request('/status')
                .then((obj) => {
                if (obj.current_season && this.year_ == -1) {
                    this.year_ = obj.current_season;
                }
                if (obj.max_season) {
                    this.max_season_ = obj.max_season;
                }
                resolve(!obj.is_datafeed_down);
            })
                .catch((err) => {
                reject(err);
            });
        });
        return ret;
    }
    async getAlliances(evkey) {
        let str = process.env.XEROSCOUTDEBUG;
        let query = "/event/" + evkey + "/alliances";
        let ret = new Promise((resolve, reject) => {
            if (str && str.indexOf('noplayoffs') !== -1) {
                resolve([]);
                return;
            }
            this.request(query)
                .then((obj) => {
                resolve(obj);
            })
                .catch((err) => {
                reject(err);
            });
        });
        return ret;
    }
    async getEvents(year) {
        if (!year) {
            year = this.year_;
        }
        let ret = new Promise((resolve, reject) => {
            let query = "/events/" + year + "/simple";
            this.request(query)
                .then((obj) => {
                resolve(obj);
            })
                .catch((err) => {
                reject(err);
            });
        });
        return ret;
    }
    async getRankings(evkey) {
        let ret = new Promise((resolve, reject) => {
            let query = "/event/" + evkey + "/rankings";
            this.request(query)
                .then((rankings) => {
                resolve(rankings);
            })
                .catch((err) => {
                reject(err);
            });
        });
        return ret;
    }
    async getOPR(evkey) {
        let ret = new Promise((resolve, reject) => {
            let query = "/event/" + evkey + "/oprs";
            this.request(query)
                .then((rankings) => {
                resolve(rankings);
            })
                .catch((err) => {
                reject(err);
            });
        });
        return ret;
    }
    async getMatches(evkey) {
        let ret = new Promise((resolve, reject) => {
            let str = process.env.XEROSCOUTDEBUG;
            //
            // If the string 'nomatches' is in the environment variable, return an empty array.  This is used to simulate
            // the pre-match scenario, where the teams are known but the matches schedule is not available yet.
            //
            if (str && str.indexOf('nomatches') !== -1) {
                resolve([]);
                return;
            }
            let query = "/event/" + evkey + "/matches";
            this.request(query)
                .then((obj) => {
                if (str) {
                    //
                    // If the string 'noplayoffs' is in the environment variable, filter out playoff matches.  To simulate the
                    // pre-playoff scenario, have the XEROSCOUTDEBUG environment variable contain the word noplayoffs.
                    //
                    if (str && str.indexOf('noplayoffs') !== -1) {
                        obj = obj.filter((match) => {
                            return match.comp_level !== 'f' && match.comp_level !== 'sf';
                        });
                    }
                    //
                    // If the string 'noscores' is not in the environment variable add in the score breakdowns.  To simulate the
                    // pre-match scenario, have the XEROSCOUTDEBUG environment variable contain the word noscores.  Note if the word
                    // noplayoffs is also in the environment variable, it will filter out the playoff matches and therefore any scores
                    // assocaited with playoff matches.
                    //
                    if (str && str.indexOf('noscores') !== -1) {
                        for (let one of obj) {
                            one.score_breakdown = undefined;
                        }
                    }
                }
                if (!obj) {
                    resolve([]);
                }
                else {
                    resolve(obj);
                }
            })
                .catch((err) => {
                reject(err);
            });
        });
        return ret;
    }
    async getTeams(evkey) {
        let ret = new Promise((resolve, reject) => {
            let query = "/event/" + evkey + "/teams";
            this.request(query)
                .then((obj) => {
                resolve(obj);
            })
                .catch((err) => {
                reject(err);
            });
        });
        return ret;
    }
}
exports.BlueAlliance = BlueAlliance;
BlueAlliance.BlueAllianceHost = "www.thebluealliance.com";
BlueAlliance.BlueAlliancePrefix = "/api/v3";
BlueAlliance.BlueAllianceAPIKey = "cgbzLmpXlA5GhIew3E4xswwLqHOm4j0hQ1Mizvg71zkuQZIazcXgf3dd8fguhpxC";
//# sourceMappingURL=ba.js.map