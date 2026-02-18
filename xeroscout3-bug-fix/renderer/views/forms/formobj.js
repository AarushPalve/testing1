export class FormObject {
    constructor(form) {
        this.form_ = form;
    }
    get json() {
        return this.form_;
    }
    get sectionCount() {
        return this.form_.sections.length;
    }
    get sections() {
        return this.form_.sections;
    }
    findItemByTag(tag) {
        for (let section of this.form_.sections) {
            for (let item of section.items) {
                if (item.tag === tag) {
                    return item;
                }
            }
        }
        return undefined;
    }
    containsSection(name) {
        for (let section of this.form_.sections) {
            if (section.name === name) {
                return true;
            }
        }
        return false;
    }
    findSectionIndexByName(name) {
        for (let i = 0; i < this.form_.sections.length; i++) {
            if (this.form_.sections[i].name === name) {
                return i;
            }
        }
        return -1;
    }
    findSectionByName(name) {
        for (let sect of this.form_.sections) {
            if (sect.name === name) {
                return sect;
            }
        }
        return undefined;
    }
    findNewSectionName() {
        let name = 'New Section';
        if (this.findSectionByName(name) === undefined) {
            return name;
        }
        let i = 1;
        while (true) {
            let newname = name + ' ' + i;
            if (this.findSectionByName(newname) === undefined) {
                return newname;
            }
            i++;
        }
    }
    createNewSection() {
        let section = {
            name: this.findNewSectionName(),
            items: []
        };
        this.form_.sections.push(section);
        return section;
    }
    removeSection(section) {
        let index = this.form_.sections.indexOf(section);
        if (index !== -1) {
            this.form_.sections.splice(index, 1);
        }
    }
    removeSectionByIndex(index) {
        if (index >= 0 && index < this.form_.sections.length) {
            this.form_.sections.splice(index, 1);
        }
    }
    getItemFromTag(tag) {
        for (let section of this.form_.sections) {
            for (let item of section.items) {
                if (item.tag === tag) {
                    return item;
                }
            }
        }
        return undefined;
    }
}
//# sourceMappingURL=formobj.js.map