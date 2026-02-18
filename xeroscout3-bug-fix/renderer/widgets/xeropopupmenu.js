import { EventEmitter } from "events";
import { XeroPoint } from "../shared/xerogeom.js";
export class XeroPopupMenuItem {
    constructor(text, callback, submenu) {
        this.text_ = text;
        this.callback_ = callback;
        this.submenu_ = submenu;
    }
    get text() {
        return this.text_;
    }
    get action() {
        return this.callback_;
    }
    get submenu() {
        return this.submenu_;
    }
    set topdiv(div) {
        this.topdiv_ = div;
    }
    get topdiv() {
        return this.topdiv_;
    }
    set itemDiv(item) {
        this.item_ = item;
    }
    get itemDiv() {
        return this.item_;
    }
    set subDiv(sub) {
        this.sub_ = sub;
    }
    get subDiv() {
        return this.sub_;
    }
    isSubDiv(elem) {
        return this.sub_ === elem;
    }
    isItemDiv(elem) {
        return this.item_ === elem;
    }
    isTopDiv(elem) {
        return this.topdiv_ === elem;
    }
}
export class XeroPopupMenu extends EventEmitter {
    constructor(name, items) {
        super();
        this.can_close_ = true;
        this.items_ = items;
        this.name_ = name;
        this.global_click_ = this.onGlobalClick.bind(this);
        this.global_key_ = this.onGlobalKey.bind(this);
        this.mouse_move_bind_ = this.onGlobalMouseMove.bind(this);
    }
    onClick(item, event) {
        if (item.action) {
            this.emit('menu-item-selected', item);
            item.action();
            XeroPopupMenu.top_most_menu_.closeMenu();
        }
        event.preventDefault();
        event.stopPropagation();
    }
    onSubmenuShow(item, event) {
        var _a;
        this.emit('submenu-opened', item);
        if (this.child_menu_) {
            this.closeChildren();
        }
        if (item.submenu && this.parent_) {
            this.child_menu_ = item.submenu;
            this.child_menu_.can_close_ = false;
            let bounds = (_a = item.topdiv) === null || _a === void 0 ? void 0 : _a.getBoundingClientRect();
            let y = (bounds.top + bounds.bottom) / 2;
            this.child_menu_.showRelativeInternal(this.parent_, new XeroPoint(bounds.right, y), true);
        }
        event.stopPropagation();
        event.preventDefault();
    }
    onGlobalClick(event) {
        if (XeroPopupMenu.top_most_menu_ && event.target) {
            //
            // See if this is a click outside of any menu elements,  in 
            // this case we close the menu
            //
            let elem = event.target;
            let ret = this.findMenuItemElement(event.target);
            if (!ret) {
                XeroPopupMenu.top_most_menu_.closeMenu();
            }
        }
    }
    onGlobalKey(event) {
        //
        // If the user presses the escape key, close the menu
        //
        if (event.key === 'Escape') {
            this.closeMenu();
        }
    }
    closeMenu() {
        if (this !== XeroPopupMenu.top_most_menu_) {
            throw new Error("closeMenu: not the top menu");
        }
        this.closeMenuInternal();
        document.removeEventListener('mousemove', this.mouse_move_bind_);
        document.removeEventListener('click', this.global_click_);
        document.removeEventListener('keydown', this.global_key_);
        this.emit('menu-closed');
    }
    removeFromParent() {
        var _a;
        if (this.parent_ && ((_a = this.popup_) === null || _a === void 0 ? void 0 : _a.parentElement) === this.parent_) {
            this.parent_.removeChild(this.popup_);
        }
    }
    closeMenuInternal() {
        this.closeChildren();
        this.removeFromParent();
    }
    closeChildren() {
        if (this.child_menu_) {
            this.child_menu_.closeMenuInternal();
            this.child_menu_ = undefined;
        }
    }
    onSubmenuClick(item, event) {
        event.preventDefault();
        event.stopPropagation();
    }
    showRelative(win, pt) {
        this.showRelativeInternal(win, pt, false);
    }
    dumpMenuList() {
        let str = "";
        let menu = XeroPopupMenu.top_most_menu_;
        while (menu) {
            if (str.length > 0) {
                str += " -> ";
            }
            str += menu.name_;
            menu = menu.child_menu_;
        }
        return str;
    }
    findMenuItemElement(elem) {
        let melem = elem;
        while (melem && melem !== document.body) {
            if (melem.classList.contains(XeroPopupMenu.MenuItemTopDivClassName)) {
                break;
            }
            melem = melem.parentElement;
        }
        if (!melem || melem === document.body) {
            return undefined;
        }
        let menu = XeroPopupMenu.top_most_menu_;
        while (menu) {
            for (let item of menu.items_) {
                if (item.topdiv === melem) {
                    return [menu, item];
                }
            }
            menu = menu.child_menu_;
        }
        return undefined;
    }
    onItemMouseEnter(event) {
        let ret = this.findMenuItemElement(event.target);
        if (!ret) {
            return;
        }
        let [menu, item] = ret;
        if (menu.child_menu_) {
            // We are in the item div, and there is a child, close it
            menu.closeChildren();
        }
    }
    onSubmenuMouseEnter(event) {
        let ret = this.findMenuItemElement(event.target);
        if (!ret) {
            return;
        }
        let [menu, item] = ret;
        if (item.isSubDiv(event.target)) {
            if (!menu.child_menu_) {
                // We are in the arrow for a submenu, and there is not child, show the child
                this.onSubmenuShow(item, event);
            }
            else if (menu.child_menu_ !== item.submenu) {
                // We are in the arrow for a submenu, and there is a child but it is not the right child
                this.onSubmenuShow(item, event);
            }
        }
        else if (item.isItemDiv(event.target) || item.isTopDiv(event.target)) {
            //
            // We are in the item div or top div, so if there is a child, close it
            //
            if (menu.child_menu_) {
                menu.closeChildren();
            }
        }
        else {
            // We are not in any of the menu items, so we do nothing
        }
    }
    onGlobalMouseMove(event) {
        event.preventDefault();
        event.stopPropagation();
    }
    showRelativeInternal(win, pt, child) {
        let bounds = win.getBoundingClientRect();
        this.parent_ = win;
        this.popup_ = document.createElement('div');
        this.popup_.className = 'xero-popup-menu';
        this.popup_.style.left = (pt.x - bounds.left) + 'px';
        this.popup_.style.top = (pt.y - bounds.top) + 'px';
        this.popup_.style.zIndex = '1000';
        this.child_ = child;
        for (let item of this.items_) {
            item.topdiv = document.createElement('div');
            item.topdiv.className = XeroPopupMenu.MenuItemTopDivClassName;
            item.itemDiv = document.createElement('div');
            item.itemDiv.className = 'xero-popup-menu-item';
            item.itemDiv.innerText = item.text;
            item.itemDiv.addEventListener('mouseenter', this.onItemMouseEnter.bind(this));
            item.topdiv.appendChild(item.itemDiv);
            item.subDiv = document.createElement('div');
            item.subDiv.className = 'xero-popup-menu-submenu';
            if (item.submenu) {
                item.subDiv.addEventListener('mouseenter', this.onSubmenuMouseEnter.bind(this));
                item.subDiv.innerHTML = '&#x27A4;';
                item.subDiv.addEventListener('click', this.onSubmenuClick.bind(this, item));
                item.itemDiv.addEventListener('click', this.onSubmenuClick.bind(this, item));
                item.topdiv.addEventListener('click', this.onSubmenuClick.bind(this, item));
            }
            else {
                item.itemDiv.addEventListener('click', this.onClick.bind(this, item));
            }
            item.topdiv.appendChild(item.subDiv);
            this.popup_.appendChild(item.topdiv);
        }
        this.parent_.appendChild(this.popup_);
        if (!child) {
            XeroPopupMenu.top_most_menu_ = this;
            document.addEventListener('click', this.global_click_);
            document.addEventListener('keydown', this.global_key_);
            document.addEventListener('mousemove', this.mouse_move_bind_);
        }
    }
}
XeroPopupMenu.MenuItemTopDivClassName = 'xero-popup-menu-item-div';
//# sourceMappingURL=xeropopupmenu.js.map