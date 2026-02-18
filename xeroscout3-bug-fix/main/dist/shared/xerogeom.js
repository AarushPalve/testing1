"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.XeroRect = exports.XeroSize = exports.XeroPoint = void 0;
class XeroPoint {
    constructor(xv, yv) {
        this.xv = xv;
        this.yv = yv;
        this.x = xv;
        this.y = yv;
    }
    toString() {
        return `XeroPoint(${this.x}, ${this.y})`;
    }
    clone() {
        return new XeroPoint(this.x, this.y);
    }
    add(p) {
        return new XeroPoint(this.x + p.x, this.y + p.y);
    }
    subtract(p) {
        return new XeroPoint(this.x - p.x, this.y - p.y);
    }
    distance(p) {
        return Math.sqrt((this.x - p.x) ** 2 + (this.y - p.y) ** 2);
    }
    static fromDOMPoint(point) {
        return new XeroPoint(point.x, point.y);
    }
}
exports.XeroPoint = XeroPoint;
class XeroSize {
    constructor(wid, hei) {
        this.wid = wid;
        this.hei = hei;
        this.width = wid;
        this.height = hei;
    }
    toString() {
        return `XeroSize(${this.width}, ${this.height})`;
    }
    clone() {
        return new XeroSize(this.width, this.height);
    }
}
exports.XeroSize = XeroSize;
XeroSize.zero = new XeroSize(0, 0);
class XeroRect {
    constructor(xv, yv, wv, hv) {
        this.xv = xv;
        this.yv = yv;
        this.wv = wv;
        this.hv = hv;
        this.x = xv;
        this.y = yv;
        this.width = wv;
        this.height = hv;
    }
    offset(sz) {
        return new XeroRect(this.x + sz.width, this.y + sz.height, this.width, this.height);
    }
    get left() {
        return this.x;
    }
    get right() {
        return this.x + this.width;
    }
    get top() {
        return this.y;
    }
    get bottom() {
        return this.y + this.height;
    }
    clone() {
        return new XeroRect(this.x, this.y, this.width, this.height);
    }
    contains(p) {
        return p.x >= this.x && p.x <= this.x + this.width && p.y >= this.y && p.y <= this.y + this.height;
    }
    intersects(r) {
        return this.x < r.x + r.width && this.x + this.width > r.x && this.y < r.y + r.height && this.y + this.height > r.y;
    }
    intersection(r) {
        if (this.intersects(r)) {
            const x = Math.max(this.x, r.x);
            const y = Math.max(this.y, r.y);
            const w = Math.min(this.x + this.width, r.x + r.width) - x;
            const h = Math.min(this.y + this.height, r.y + r.height) - y;
            return new XeroRect(x, y, w, h);
        }
        return undefined;
    }
    union(r) {
        const x = Math.min(this.x, r.x);
        const y = Math.min(this.y, r.y);
        const w = Math.max(this.x + this.width, r.x + r.width) - x;
        const h = Math.max(this.y + this.height, r.y + r.height) - y;
        return new XeroRect(x, y, w, h);
    }
    toString() {
        return `XeroRect((${this.x}, ${this.y}) ${this.width}x${this.height})`;
    }
    upperLeft() {
        return new XeroPoint(this.x, this.y);
    }
    upperRight() {
        return new XeroPoint(this.x + this.width, this.y);
    }
    lowerLeft() {
        return new XeroPoint(this.x, this.y + this.height);
    }
    lowerRight() {
        return new XeroPoint(this.x + this.width, this.y + this.height);
    }
    center() {
        return new XeroPoint(this.x + this.width / 2, this.y + this.height / 2);
    }
    static fromDOMRect(rect) {
        return new XeroRect(rect.x, rect.y, rect.width, rect.height);
    }
    static fromPoints(points) {
        if (points.length !== 2) {
            throw new Error('XeroRect.fromPoints requires exactly 2 points');
        }
        let minX = points[0].x;
        let minY = points[0].y;
        let maxX = points[0].x;
        let maxY = points[0].y;
        for (const point of points) {
            if (point.x < minX) {
                minX = point.x;
            }
            if (point.y < minY) {
                minY = point.y;
            }
            if (point.x > maxX) {
                maxX = point.x;
            }
            if (point.y > maxY) {
                maxY = point.y;
            }
        }
        return new XeroRect(minX, minY, maxX - minX, maxY - minY);
    }
    static fromPointSize(point, size) {
        return new XeroRect(point.x, point.y, size.width, size.height);
    }
}
exports.XeroRect = XeroRect;
XeroRect.zero = new XeroRect(0, 0, 0, 0);
//# sourceMappingURL=xerogeom.js.map