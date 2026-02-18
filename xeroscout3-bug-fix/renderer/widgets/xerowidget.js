import { XeroMainProcessInterface } from "./xerocbtarget.js";
export class XeroWidget extends XeroMainProcessInterface {
    constructor(etype, cname) {
        super();
        this.parentWidget_ = undefined;
        this.elem = document.createElement(etype);
        this.elem.className = cname;
    }
    parent() {
        return this.elem.parentElement;
    }
    parentWidget() {
        return this.parentWidget_;
    }
    setParent(parent) {
        if (this.elem.parentElement) {
            this.elem.parentElement.removeChild(this.elem);
        }
        parent.appendChild(this.elem);
    }
    setParentWidget(parent) {
        this.parentWidget_ = parent;
        this.setParent(this.parentWidget_.elem);
    }
    static checkWidgetPositions(elem) {
        let body = document.body;
        let bodybounds = body.getBoundingClientRect();
        let rect = elem.getBoundingClientRect();
        if (rect.left < bodybounds.left || rect.right > bodybounds.right || rect.top < bodybounds.top || rect.bottom > bodybounds.bottom) {
            console.log(`Widget tag ${elem.tagName}, class ${elem.className} is out of bounds!`);
            console.log(`    widget: rect.left=${rect.left}, rect.right=${rect.right}, rect.top=${rect.top}, rect.bottom=${rect.bottom}`);
            console.log(`    body: left=${bodybounds.left}, right=${bodybounds.right}, top=${bodybounds.top}, bottom=${bodybounds.bottom}`);
        }
        for (let child of elem.children) {
            XeroWidget.checkWidgetPositions(child);
        }
    }
    static isChildOf(parent, child) {
        let elem = child;
        while (elem) {
            if (elem === parent) {
                return true;
            }
            elem = elem.parentElement;
        }
        return false;
    }
}
//# sourceMappingURL=xerowidget.js.map