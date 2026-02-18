import { XeroWidget } from "./xerowidget.js";
export class XeroSplitter extends XeroWidget {
    constructor(orientation, first, second, bar_width = 5) {
        super('div', 'xero-splitter');
        this.bar_width_ = 7;
        this.orientation_ = orientation;
        this.bar_width_ = bar_width;
        this.first_ = first;
        this.second_ = second;
        this.elem.style.display = "flex";
        this.elem.style.width = "100%";
        this.elem.style.height = "100%";
        this.bar_ = new XeroWidget('div', 'xero-splitter-bar');
        this.first_.setParentWidget(this);
        this.bar_.setParentWidget(this);
        this.second_.setParentWidget(this);
        this.first_.elem.style.flexGrow = "1";
        this.bar_.elem.style.flexGrow = "0";
        this.second_.elem.style.flexGrow = "1";
        if (this.orientation_ == "horizontal") {
            this.bar_.elem.style.width = `${this.bar_width_}px`;
            this.bar_.elem.style.height = "100%";
            this.elem.style.flexDirection = "row";
            this.bar_.elem.style.cursor = "col-resize";
        }
        else {
            this.bar_.elem.style.width = "100%";
            this.bar_.elem.style.height = `${this.bar_width_}px`;
            this.elem.style.flexDirection = "column";
            this.bar_.elem.style.cursor = "row-resize";
        }
        this.position = 5;
        document.addEventListener('mousedown', this.mouseDownHandler.bind(this));
        this.mouse_move_handler_ = this.mouseMoveHandler.bind(this);
        this.mouse_up_handler_ = this.mouseUpHandler.bind(this);
    }
    get position() {
        let ret = 0;
        if (this.orientation_ == "horizontal") {
            ret = this.first_.elem.getBoundingClientRect().width;
            ret = (ret / this.elem.getBoundingClientRect().width) * 100; // Convert to percentage   
        }
        else {
            ret = this.first_.elem.getBoundingClientRect().height;
            ret = (ret / this.elem.getBoundingClientRect().height) * 100; // Convert to percentage
        }
        return ret;
    }
    set position(percent) {
        if (this.orientation_ == "horizontal") {
            this.first_.elem.style.width = `${percent}%`;
            this.second_.elem.style.width = `calc(100% - ${percent}% - ${this.bar_width_}px)`; // 10px for the splitter bar
        }
        else {
            this.first_.elem.style.height = `${percent}%`;
            this.second_.elem.style.height = `calc(100% - ${percent}% - ${this.bar_width_}px)`; // 10px for the splitter bar
        }
    }
    mouseDownHandler(event) {
        if (event.target === this.bar_.elem) {
            document.addEventListener('mousemove', this.mouse_move_handler_);
            document.addEventListener('mouseup', this.mouse_up_handler_);
        }
    }
    mouseMoveHandler(event) {
        if (this.orientation_ == "horizontal") {
            const newWidth = event.clientX - this.elem.getBoundingClientRect().left;
            this.first_.elem.style.width = `${newWidth}px`;
            this.second_.elem.style.width = `calc(100% - ${newWidth}px - ${this.bar_width_}px)`; // 10px for the splitter bar
        }
        else {
            const newHeight = event.clientY - this.elem.getBoundingClientRect().top;
            this.first_.elem.style.height = `${newHeight}px`;
            this.second_.elem.style.height = `calc(100% - ${newHeight}px - ${this.bar_width_}px)`; // 10px for the splitter bar
        }
    }
    mouseUpHandler(event) {
        document.removeEventListener('mousemove', this.mouse_move_handler_);
        document.removeEventListener('mouseup', this.mouse_up_handler_);
        this.emit('changed');
    }
}
//# sourceMappingURL=xerosplitter.js.map