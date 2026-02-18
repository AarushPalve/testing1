import { XeroWidget } from "../widgets/xerowidget.js";
export class ResizeBar extends XeroWidget {
    constructor(count, text = false) {
        super('div', 'resize-bar');
        this.divs_ = [];
        this.text_ = text;
        for (let i = 0; i < count; i++) {
            const div = document.createElement('div');
            div.className = 'resize-bar-div';
            this.divs_.push(div);
            this.elem.appendChild(div);
            if (this.text_) {
                let pcnt = (i + 1) / count * 100.0;
                div.innerText = pcnt.toFixed(0);
            }
            div.addEventListener('click', this.divSelected.bind(this, i));
        }
    }
    divSelected(which) {
        this.emit('resized', which / this.divs_.length * 100);
    }
}
//# sourceMappingURL=resizebar.js.map