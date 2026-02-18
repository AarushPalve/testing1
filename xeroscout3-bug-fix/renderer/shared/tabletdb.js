export class TabletDB {
    static getTablet(name) {
        return this.tablets_.find(tablet => tablet.name === name);
    }
    static getTabletNames() {
        return this.tablets_.map(tablet => tablet.name);
    }
    static getDefaultTablet() {
        return this.tablets_[0];
    }
}
TabletDB.tablets_ = [
    {
        name: 'surface',
        size: { width: 1089, height: 727 },
    },
    {
        name: 'dell',
        size: { width: 1292, height: 777 },
    }
];
//# sourceMappingURL=tabletdb.js.map