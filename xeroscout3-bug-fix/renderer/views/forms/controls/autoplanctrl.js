import { DataValue } from "../../../shared/datavalue.js";
import { EditAutoPlanDialog } from "../dialogs/editautoplanctrldialog.js";
import { FormControl } from "./formctrl.js";
import { XeroStringDialog } from "../../../widgets/xerostringdialog.js";
import { XeroTextDialog } from "../../../widgets/xerotextdialog.js";
export class AutoPlanControl extends FormControl {
    constructor(imsrc, view, tag, bounds) {
        super(view, AutoPlanControl.item_desc_);
        this.state_ = this.createDefaultState();
        this.history_ = [];
        this.redo_ = [];
        this.id_counter_ = 1;
        this.mode_ = 'select';
        this.selected_action_ = null;
        this.selected_node_id_ = null;
        this.selected_edge_id_ = null;
        this.dragging_node_id_ = null;
        this.drag_start_state_ = null;
        this.drawing_from_node_id_ = null;
        this.dragging_edge_id_ = null;
        this.edge_drag_start_state_ = null;
        this.end_toggle_node_id_ = null;
        this.end_toggle_pointer_id_ = null;
        this.end_hold_active_ = false;
        this.end_toggle_listener_active_ = false;
        this.onDrawPointerMove = (ev) => {
            if (!this.preview_line_ || !this.canvas_) {
                return;
            }
            const rect = this.canvas_.getBoundingClientRect();
            const x = ev.clientX - rect.left;
            const y = ev.clientY - rect.top;
            const fromId = this.drawing_from_node_id_;
            const from = fromId ? this.getActiveAuto().nodes.find(n => n.id === fromId) : undefined;
            if (!from) {
                return;
            }
            this.draw_control_point_ = this.pixelToNode(ev.clientX, ev.clientY, rect);
            const p = this.nodeToPixel(from, rect);
            const c = { x, y };
            const q = { x, y };
            this.preview_line_.setAttribute('d', `M ${p.x} ${p.y} Q ${c.x} ${c.y} ${q.x} ${q.y}`);
            this.preview_line_.setAttribute('fill', 'none');
            this.renderEdges();
        };
        this.onEdgeHandlePointerMove = (ev) => {
            if (!this.dragging_edge_id_ || !this.canvas_) {
                return;
            }
            const rect = this.canvas_.getBoundingClientRect();
            const pos = this.pixelToNode(ev.clientX, ev.clientY, rect);
            const auto = this.getActiveAuto();
            const edge = auto.edges.find(e => e.id === this.dragging_edge_id_);
            if (!edge) {
                return;
            }
            edge.cx = pos.x;
            edge.cy = pos.y;
            this.render();
        };
        this.onEdgeHandlePointerUp = (_ev) => {
            document.removeEventListener('pointermove', this.onEdgeHandlePointerMove);
            document.removeEventListener('pointerup', this.onEdgeHandlePointerUp);
            if (this.dragging_edge_id_) {
                if (this.edge_drag_start_state_ && this.edge_drag_start_state_ !== this.serializeState()) {
                    this.commitHistory();
                }
                this.dragging_edge_id_ = null;
                this.edge_drag_start_state_ = null;
            }
        };
        this.handleEndTogglePointerUp = (ev) => {
            if (this.end_toggle_node_id_ && this.end_toggle_pointer_id_ === ev.pointerId) {
                this.cancelEndToggleTimer();
                this.removeEndToggleListener();
                if (!this.dragging_node_id_) {
                    this.toggleEndModifier(this.end_toggle_node_id_);
                }
                this.end_hold_active_ = false;
                this.end_toggle_node_id_ = null;
                this.end_toggle_pointer_id_ = null;
                this.end_toggle_start_pos_ = undefined;
            }
        };
        this.setTag(tag);
        this.setBounds(bounds);
        this.image_src_ = imsrc;
        this.resetHistory();
    }
    copyObject() {
        return new AutoPlanControl(this.image_src_, this.view, this.item.tag, this.bounds);
    }
    updateFromItem(editing, scale, xoff, yoff) {
        if (!this.ctrl) {
            return;
        }
        this.setPosition(scale, xoff, yoff, 850);
        this.updateFieldImage();
        this.renderActions();
        this.renderAutos();
        this.render();
    }
    createForEdit(parent, xoff, yoff) {
        super.createForEdit(parent, xoff, yoff);
        this.ctrl = document.createElement('div');
        this.setClassList(this.ctrl, 'edit');
        const label = document.createElement('div');
        label.className = 'xero-autoplan-edit-label';
        label.innerText = 'Auto Planner';
        this.ctrl.appendChild(label);
        parent.appendChild(this.ctrl);
        this.updateFromItem(true, 1.0, xoff, yoff);
    }
    createForScouting(parent, scale, xoff, yoff) {
        super.createForScouting(parent, scale, xoff, yoff);
        this.ctrl = document.createElement('div');
        this.setClassList(this.ctrl, 'scout');
        this.ctrl.classList.add('xero-autoplan-shell');
        this.toolbar_ = document.createElement('div');
        this.toolbar_.className = 'xero-autoplan-toolbar';
        this.actions_bar_ = document.createElement('div');
        this.actions_bar_.className = 'xero-autoplan-actions';
        this.toolbar_.appendChild(this.actions_bar_);
        this.tools_bar_ = document.createElement('div');
        this.tools_bar_.className = 'xero-autoplan-tools';
        this.toolbar_.appendChild(this.tools_bar_);
        this.select_button_ = this.createToolButton('Select', () => this.setMode('select'));
        this.draw_button_ = this.createToolButton('Draw', () => this.setMode('draw'));
        this.undo_button_ = this.createToolButton('Undo', () => this.undo());
        this.redo_button_ = this.createToolButton('Redo', () => this.redo());
        this.delete_button_ = this.createToolButton('Delete', () => this.deleteSelection());
        this.clear_button_ = this.createToolButton('Clear', () => this.clearAuto());
        this.dump_button_ = this.createToolButton('Dump JSON', () => this.dumpJson());
        this.tools_bar_.appendChild(this.select_button_);
        this.tools_bar_.appendChild(this.draw_button_);
        this.tools_bar_.appendChild(this.undo_button_);
        this.tools_bar_.appendChild(this.redo_button_);
        this.tools_bar_.appendChild(this.delete_button_);
        this.tools_bar_.appendChild(this.clear_button_);
        this.tools_bar_.appendChild(this.dump_button_);
        this.autos_select_ = document.createElement('select');
        this.autos_select_.className = 'xero-autoplan-autos-select';
        this.autos_select_.addEventListener('change', () => {
            this.state_.activeAutoId = this.autos_select_.value;
            this.selected_node_id_ = null;
            this.selected_edge_id_ = null;
            this.render();
        });
        this.tools_bar_.appendChild(this.autos_select_);
        this.add_auto_button_ = this.createToolButton('+', () => this.addAuto());
        this.rename_auto_button_ = this.createToolButton('Rename', () => this.renameAuto());
        this.delete_auto_button_ = this.createToolButton('-', () => this.deleteAuto());
        this.tools_bar_.appendChild(this.add_auto_button_);
        this.tools_bar_.appendChild(this.rename_auto_button_);
        this.tools_bar_.appendChild(this.delete_auto_button_);
        this.canvas_ = document.createElement('div');
        this.canvas_.className = 'xero-autoplan-canvas';
        this.canvas_.addEventListener('pointerdown', this.onCanvasPointerDown.bind(this));
        this.canvas_.addEventListener('pointerup', this.onCanvasPointerUp.bind(this));
        this.field_image_ = document.createElement('img');
        this.field_image_.className = 'xero-autoplan-field';
        this.canvas_.appendChild(this.field_image_);
        this.svg_ = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
        this.svg_.classList.add('xero-autoplan-svg');
        this.canvas_.appendChild(this.svg_);
        this.nodes_layer_ = document.createElement('div');
        this.nodes_layer_.className = 'xero-autoplan-nodes';
        this.canvas_.appendChild(this.nodes_layer_);
        this.ctrl.appendChild(this.toolbar_);
        this.ctrl.appendChild(this.canvas_);
        parent.appendChild(this.ctrl);
        this.setMode('select');
        this.updateFromItem(false, scale, xoff, yoff);
        this.resetHistory();
    }
    createEditDialog() {
        return new EditAutoPlanDialog(this, this.image_src_.getImageNames());
    }
    getData() {
        return DataValue.fromString(this.serializeState());
    }
    setData(data) {
        if (!data) {
            return;
        }
        if (data.type === 'string' && typeof data.value === 'string' && data.value.length > 0) {
            this.loadState(data.value, false);
            this.resetHistory();
            this.render();
        }
    }
    createDefaultState() {
        const auto = {
            id: 'auto-1',
            name: 'Auto 1',
            nodes: [],
            edges: [],
        };
        return {
            version: 1,
            autos: [auto],
            activeAutoId: auto.id,
        };
    }
    serializeState() {
        return JSON.stringify(this.state_);
    }
    loadState(serialized, pushHistory) {
        try {
            const parsed = JSON.parse(serialized);
            if (!parsed.autos || parsed.autos.length === 0) {
                this.state_ = this.createDefaultState();
            }
            else {
                this.state_ = parsed;
            }
            this.ensureActiveAuto();
            this.normalizeAutos();
            if (pushHistory) {
                this.commitHistory();
            }
        }
        catch (_a) {
            this.state_ = this.createDefaultState();
        }
    }
    resetHistory() {
        this.history_ = [this.serializeState()];
        this.redo_ = [];
        this.updateUndoRedoButtons();
    }
    commitHistory() {
        this.history_.push(this.serializeState());
        if (this.history_.length > 50) {
            this.history_.shift();
        }
        this.redo_ = [];
        this.updateUndoRedoButtons();
    }
    undo() {
        if (this.history_.length <= 1) {
            return;
        }
        const current = this.history_.pop();
        this.redo_.push(current);
        const prev = this.history_[this.history_.length - 1];
        this.loadState(prev, false);
        this.render();
        this.updateUndoRedoButtons();
    }
    redo() {
        if (this.redo_.length === 0) {
            return;
        }
        const next = this.redo_.pop();
        this.history_.push(next);
        this.loadState(next, false);
        this.render();
        this.updateUndoRedoButtons();
    }
    updateUndoRedoButtons() {
        if (this.undo_button_) {
            this.undo_button_.disabled = this.history_.length <= 1;
        }
        if (this.redo_button_) {
            this.redo_button_.disabled = this.redo_.length === 0;
        }
    }
    updateFieldImage() {
        if (!this.field_image_) {
            return;
        }
        const item = this.item;
        if (item.fieldImage && item.fieldImage.endsWith('.png')) {
            item.fieldImage = item.fieldImage.replace(/\.png$/i, '');
        }
        this.image_src_.getImageData(item.fieldImage)
            .then((data) => {
            if (data.data) {
                if (data.newname) {
                    item.fieldImage = data.newname;
                }
                this.field_image_.src = `data:image/png;base64,${data.data}`;
            }
        });
    }
    renderActions() {
        if (!this.actions_bar_) {
            return;
        }
        this.actions_bar_.innerHTML = '';
        const item = this.item;
        if (!item.approvedActions || item.approvedActions.length === 0) {
            item.approvedActions = [...AutoPlanControl.defaultActions];
        }
        for (const action of AutoPlanControl.lockedActions) {
            if (!item.approvedActions.includes(action)) {
                item.approvedActions.unshift(action);
            }
        }
        if (this.selected_action_ && !(item.approvedActions || []).includes(this.selected_action_)) {
            this.selected_action_ = null;
        }
        for (const action of item.approvedActions || []) {
            const btn = document.createElement('button');
            btn.className = 'xero-autoplan-action-button';
            btn.innerText = action;
            btn.addEventListener('click', () => this.toggleAction(action));
            if (this.selected_action_ === action) {
                btn.classList.add('selected');
            }
            this.actions_bar_.appendChild(btn);
        }
    }
    renderAutos() {
        if (!this.autos_select_) {
            return;
        }
        this.autos_select_.innerHTML = '';
        for (const auto of this.state_.autos) {
            const opt = document.createElement('option');
            opt.value = auto.id;
            opt.innerText = auto.name;
            if (auto.id === this.state_.activeAutoId) {
                opt.selected = true;
            }
            this.autos_select_.appendChild(opt);
        }
    }
    render() {
        if (!this.canvas_ || !this.svg_ || !this.nodes_layer_) {
            return;
        }
        this.renderAutos();
        this.renderActions();
        this.renderEdges();
        this.renderNodes();
        this.updateModeButtons();
        this.updateMultiAutoButtons();
        this.updateSelectionButtons();
    }
    renderEdges() {
        if (!this.svg_) {
            return;
        }
        this.svg_.innerHTML = '';
        const rect = this.canvas_.getBoundingClientRect();
        this.svg_.setAttribute('width', rect.width.toString());
        this.svg_.setAttribute('height', rect.height.toString());
        this.svg_.setAttribute('viewBox', `0 0 ${rect.width} ${rect.height}`);
        const defs = document.createElementNS('http://www.w3.org/2000/svg', 'defs');
        const marker = document.createElementNS('http://www.w3.org/2000/svg', 'marker');
        marker.setAttribute('id', 'xero-autoplan-arrow');
        marker.setAttribute('markerWidth', '10');
        marker.setAttribute('markerHeight', '10');
        marker.setAttribute('refX', '8');
        marker.setAttribute('refY', '3');
        marker.setAttribute('orient', 'auto');
        marker.setAttribute('markerUnits', 'strokeWidth');
        const arrow = document.createElementNS('http://www.w3.org/2000/svg', 'path');
        arrow.setAttribute('d', 'M0,0 L0,6 L9,3 z');
        arrow.setAttribute('fill', '#9cc3ff');
        marker.appendChild(arrow);
        defs.appendChild(marker);
        this.svg_.appendChild(defs);
        const auto = this.getActiveAuto();
        for (const edge of auto.edges) {
            const from = auto.nodes.find(n => n.id === edge.from);
            const to = auto.nodes.find(n => n.id === edge.to);
            if (!from || !to) {
                continue;
            }
            const path = document.createElementNS('http://www.w3.org/2000/svg', 'path');
            const p1 = this.nodeToPixel(from, rect);
            const p2 = this.nodeToPixel(to, rect);
            let cx = edge.cx;
            let cy = edge.cy;
            if (cx === undefined || cy === undefined) {
                cx = (from.x + to.x) / 2;
                cy = (from.y + to.y) / 2;
            }
            const cp = this.nodeToPixel({ id: '', action: '', x: cx, y: cy }, rect);
            path.setAttribute('d', `M ${p1.x} ${p1.y} Q ${cp.x} ${cp.y} ${p2.x} ${p2.y}`);
            path.setAttribute('class', 'xero-autoplan-edge');
            path.setAttribute('fill', 'none');
            path.setAttribute('marker-end', 'url(#xero-autoplan-arrow)');
            path.dataset.edgeId = edge.id;
            path.addEventListener('click', (ev) => {
                ev.stopPropagation();
                this.selectEdge(edge.id);
            });
            if (this.selected_edge_id_ === edge.id) {
                path.classList.add('selected');
            }
            this.svg_.appendChild(path);
            const handle = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
            handle.setAttribute('cx', cp.x.toString());
            handle.setAttribute('cy', cp.y.toString());
            handle.setAttribute('r', '6');
            handle.setAttribute('class', 'xero-autoplan-edge-handle');
            handle.dataset.edgeId = edge.id;
            handle.addEventListener('pointerdown', (ev) => this.onEdgeHandlePointerDown(ev, edge.id));
            this.svg_.appendChild(handle);
        }
        if (this.preview_line_) {
            this.svg_.appendChild(this.preview_line_);
        }
    }
    renderNodes() {
        if (!this.nodes_layer_) {
            return;
        }
        this.nodes_layer_.innerHTML = '';
        const rect = this.canvas_.getBoundingClientRect();
        const auto = this.getActiveAuto();
        for (const node of auto.nodes) {
            const nodeEl = document.createElement('div');
            nodeEl.className = 'xero-autoplan-node';
            if (node.action === 'End') {
                nodeEl.innerText = 'End';
            }
            else {
                nodeEl.innerText = node.end ? `${node.action}\nEnd` : node.action;
            }
            nodeEl.dataset.nodeId = node.id;
            const pos = this.nodeToPixel(node, rect);
            nodeEl.style.left = `${pos.x}px`;
            nodeEl.style.top = `${pos.y}px`;
            if (this.selected_node_id_ === node.id) {
                nodeEl.classList.add('selected');
            }
            nodeEl.addEventListener('pointerdown', (ev) => this.onNodePointerDown(ev, node.id));
            nodeEl.addEventListener('pointermove', (ev) => this.onNodePointerMove(ev, node.id));
            nodeEl.addEventListener('pointerup', (ev) => this.onNodePointerUp(ev, node.id));
            this.nodes_layer_.appendChild(nodeEl);
        }
    }
    onCanvasPointerDown(ev) {
        if (!this.canvas_) {
            return;
        }
        ev.preventDefault();
        if (this.mode_ !== 'select') {
            return;
        }
        if (!this.selected_action_) {
            this.clearSelection();
            return;
        }
        const rect = this.canvas_.getBoundingClientRect();
        const pos = this.pixelToNode(ev.clientX, ev.clientY, rect);
        this.addNode(this.selected_action_, pos.x, pos.y);
    }
    onCanvasPointerUp(ev) {
        if (ev.target && ev.target instanceof HTMLElement) {
            if (ev.target.closest('.xero-autoplan-node') || ev.target.closest('.xero-autoplan-edge-handle')) {
                return;
            }
        }
        if (this.dragging_node_id_) {
            if (this.drag_start_state_ && this.drag_start_state_ !== this.serializeState()) {
                this.commitHistory();
            }
            this.dragging_node_id_ = null;
            this.drag_start_state_ = null;
        }
        if (this.mode_ === 'draw') {
            this.cancelDraw();
        }
    }
    onNodePointerDown(ev, nodeId) {
        ev.preventDefault();
        ev.stopPropagation();
        if (this.mode_ === 'draw') {
            this.startDraw(nodeId, ev);
            return;
        }
        if (this.selected_action_ === 'End') {
            this.startEndToggleOrDrag(ev, nodeId);
            return;
        }
        this.selectNode(nodeId);
        this.dragging_node_id_ = nodeId;
        this.drag_start_state_ = this.serializeState();
        ev.target.setPointerCapture(ev.pointerId);
    }
    onNodePointerMove(ev, nodeId) {
        if (this.end_toggle_node_id_ === nodeId && this.end_toggle_pointer_id_ === ev.pointerId && this.end_toggle_start_pos_) {
            const dx = ev.clientX - this.end_toggle_start_pos_.x;
            const dy = ev.clientY - this.end_toggle_start_pos_.y;
            if (this.end_hold_active_ && Math.hypot(dx, dy) > 6) {
                this.beginDragFromEndHold(nodeId, ev);
            }
        }
        if (this.dragging_node_id_ !== nodeId || this.mode_ !== 'select') {
            return;
        }
        const rect = this.canvas_.getBoundingClientRect();
        const pos = this.pixelToNode(ev.clientX, ev.clientY, rect);
        const auto = this.getActiveAuto();
        const node = auto.nodes.find(n => n.id === nodeId);
        if (!node) {
            return;
        }
        node.x = pos.x;
        node.y = pos.y;
        this.render();
    }
    onNodePointerUp(ev, nodeId) {
        ev.stopPropagation();
        if (this.mode_ === 'draw') {
            this.finishDraw(nodeId);
            return;
        }
        this.handleEndTogglePointerUp(ev);
        if (this.dragging_node_id_) {
            if (this.drag_start_state_ && this.drag_start_state_ !== this.serializeState()) {
                this.commitHistory();
            }
            this.dragging_node_id_ = null;
            this.drag_start_state_ = null;
        }
    }
    startDraw(nodeId, ev) {
        this.drawing_from_node_id_ = nodeId;
        const rect = this.canvas_.getBoundingClientRect();
        const from = this.getActiveAuto().nodes.find(n => n.id === nodeId);
        if (!from) {
            return;
        }
        const p = this.nodeToPixel(from, rect);
        this.preview_line_ = document.createElementNS('http://www.w3.org/2000/svg', 'path');
        this.preview_line_.setAttribute('d', `M ${p.x} ${p.y} Q ${p.x} ${p.y} ${p.x} ${p.y}`);
        this.preview_line_.setAttribute('fill', 'none');
        this.preview_line_.setAttribute('class', 'xero-autoplan-edge preview');
        this.draw_control_point_ = { x: from.x, y: from.y };
        document.addEventListener('pointermove', this.onDrawPointerMove);
    }
    finishDraw(nodeId) {
        if (!this.drawing_from_node_id_) {
            return;
        }
        const fromId = this.drawing_from_node_id_;
        this.cancelDraw();
        if (fromId === nodeId) {
            return;
        }
        this.addEdge(fromId, nodeId, this.draw_control_point_);
    }
    cancelDraw() {
        if (this.preview_line_ && this.preview_line_.parentElement) {
            this.preview_line_.parentElement.removeChild(this.preview_line_);
        }
        this.preview_line_ = undefined;
        this.drawing_from_node_id_ = null;
        this.draw_control_point_ = undefined;
        document.removeEventListener('pointermove', this.onDrawPointerMove);
        this.renderEdges();
    }
    onEdgeHandlePointerDown(ev, edgeId) {
        ev.preventDefault();
        ev.stopPropagation();
        this.selected_action_ = null;
        this.cancelEndToggleTimer();
        this.removeEndToggleListener();
        this.cancelDraw();
        this.dragging_edge_id_ = edgeId;
        this.edge_drag_start_state_ = this.serializeState();
        document.addEventListener('pointermove', this.onEdgeHandlePointerMove);
        document.addEventListener('pointerup', this.onEdgeHandlePointerUp);
    }
    startEndToggleOrDrag(ev, nodeId) {
        this.end_toggle_node_id_ = nodeId;
        this.end_toggle_pointer_id_ = ev.pointerId;
        this.end_toggle_start_pos_ = { x: ev.clientX, y: ev.clientY };
        this.end_hold_active_ = false;
        ev.target.setPointerCapture(ev.pointerId);
        this.cancelEndToggleTimer();
        this.addEndToggleListener();
        this.end_toggle_timer_ = window.setTimeout(() => {
            this.end_hold_active_ = true;
        }, 350);
    }
    beginDragFromEndHold(nodeId, ev) {
        if (this.dragging_node_id_) {
            return;
        }
        this.cancelEndToggleTimer();
        this.removeEndToggleListener();
        this.end_hold_active_ = false;
        this.selectNode(nodeId);
        this.dragging_node_id_ = nodeId;
        this.drag_start_state_ = this.serializeState();
        if (this.canvas_) {
            const rect = this.canvas_.getBoundingClientRect();
            const pos = this.pixelToNode(ev.clientX, ev.clientY, rect);
            const auto = this.getActiveAuto();
            const node = auto.nodes.find(n => n.id === nodeId);
            if (node) {
                node.x = pos.x;
                node.y = pos.y;
                this.render();
            }
        }
    }
    cancelEndToggleTimer() {
        if (this.end_toggle_timer_ !== undefined) {
            window.clearTimeout(this.end_toggle_timer_);
            this.end_toggle_timer_ = undefined;
        }
        this.end_hold_active_ = false;
    }
    addEndToggleListener() {
        if (this.end_toggle_listener_active_) {
            return;
        }
        this.end_toggle_listener_active_ = true;
        document.addEventListener('pointerup', this.handleEndTogglePointerUp);
    }
    removeEndToggleListener() {
        if (!this.end_toggle_listener_active_) {
            return;
        }
        this.end_toggle_listener_active_ = false;
        document.removeEventListener('pointerup', this.handleEndTogglePointerUp);
    }
    addNode(action, x, y) {
        const auto = this.getActiveAuto();
        if (AutoPlanControl.uniqueNodeActions.includes(action)) {
            const existing = auto.nodes.find(n => n.action === action);
            if (existing) {
                this.selectNode(existing.id);
                return;
            }
        }
        if (action === 'End') {
            for (const node of auto.nodes) {
                node.end = false;
            }
            const existing = auto.nodes.find(n => n.action === 'End');
            if (existing) {
                this.selectNode(existing.id);
                return;
            }
        }
        auto.nodes.push({
            id: this.nextId('node'),
            action,
            x,
            y,
        });
        this.commitHistory();
        this.render();
    }
    addEdge(from, to, control) {
        const auto = this.getActiveAuto();
        if (auto.edges.find(e => e.from === from && e.to === to)) {
            return;
        }
        let cx = control === null || control === void 0 ? void 0 : control.x;
        let cy = control === null || control === void 0 ? void 0 : control.y;
        if (cx === undefined || cy === undefined) {
            const fromNode = auto.nodes.find(n => n.id === from);
            const toNode = auto.nodes.find(n => n.id === to);
            if (fromNode && toNode) {
                cx = (fromNode.x + toNode.x) / 2;
                cy = (fromNode.y + toNode.y) / 2;
            }
        }
        auto.edges.push({
            id: this.nextId('edge'),
            from,
            to,
            cx,
            cy,
        });
        this.commitHistory();
        this.render();
    }
    deleteSelection() {
        const auto = this.getActiveAuto();
        let changed = false;
        if (this.selected_node_id_) {
            const nodeId = this.selected_node_id_;
            auto.nodes = auto.nodes.filter(n => n.id !== nodeId);
            auto.edges = auto.edges.filter(e => e.from !== nodeId && e.to !== nodeId);
            this.selected_node_id_ = null;
            changed = true;
        }
        else if (this.selected_edge_id_) {
            auto.edges = auto.edges.filter(e => e.id !== this.selected_edge_id_);
            this.selected_edge_id_ = null;
            changed = true;
        }
        if (changed) {
            this.commitHistory();
            this.render();
        }
    }
    clearAuto() {
        const auto = this.getActiveAuto();
        if (auto.nodes.length === 0 && auto.edges.length === 0) {
            return;
        }
        const ok = window.confirm(`Clear all nodes and paths for ${auto.name}?`);
        if (!ok) {
            return;
        }
        auto.nodes = [];
        auto.edges = [];
        this.selected_node_id_ = null;
        this.selected_edge_id_ = null;
        this.commitHistory();
        this.render();
    }
    dumpJson() {
        const pretty = JSON.stringify(this.state_, null, 2);
        const dialog = new XeroTextDialog('Auto Planner JSON', 'Current auto planner data:', pretty);
        dialog.showCentered(this.view.elem);
    }
    selectNode(nodeId) {
        this.selected_node_id_ = nodeId;
        this.selected_edge_id_ = null;
        this.render();
    }
    selectEdge(edgeId) {
        this.selected_edge_id_ = edgeId;
        this.selected_node_id_ = null;
        this.render();
    }
    clearSelection() {
        this.selected_node_id_ = null;
        this.selected_edge_id_ = null;
        this.render();
    }
    setMode(mode) {
        this.mode_ = mode;
        this.updateModeButtons();
    }
    updateModeButtons() {
        if (!this.select_button_ || !this.draw_button_) {
            return;
        }
        this.select_button_.classList.toggle('selected', this.mode_ === 'select');
        this.draw_button_.classList.toggle('selected', this.mode_ === 'draw');
    }
    updateMultiAutoButtons() {
        const item = this.item;
        const allow = item.allowMultipleAutos;
        if (this.add_auto_button_) {
            this.add_auto_button_.disabled = !allow;
        }
        if (this.delete_auto_button_) {
            this.delete_auto_button_.disabled = !allow || this.state_.autos.length <= 1;
        }
    }
    updateSelectionButtons() {
        if (this.delete_button_) {
            this.delete_button_.disabled = !this.selected_node_id_ && !this.selected_edge_id_;
        }
    }
    toggleAction(action) {
        if (this.selected_action_ === action) {
            this.selected_action_ = null;
        }
        else {
            this.selected_action_ = action;
        }
        this.renderActions();
    }
    addAuto() {
        const item = this.item;
        if (!item.allowMultipleAutos) {
            return;
        }
        const nextName = this.nextAutoName();
        const auto = {
            id: this.nextId('auto'),
            name: nextName,
            nodes: [],
            edges: [],
        };
        this.state_.autos.push(auto);
        this.state_.activeAutoId = auto.id;
        this.commitHistory();
        this.render();
    }
    renameAuto() {
        const auto = this.getActiveAuto();
        const dialog = new XeroStringDialog('Rename Auto', 'Enter a new name for this auto.', auto.name);
        dialog.on('closed', (ok) => {
            if (!ok) {
                return;
            }
            const name = dialog.getResult();
            if (!name || name.trim().length === 0) {
                return;
            }
            auto.name = name.trim();
            this.commitHistory();
            this.render();
        });
        dialog.showCentered(this.view.elem);
    }
    deleteAuto() {
        const item = this.item;
        if (!item.allowMultipleAutos) {
            return;
        }
        if (this.state_.autos.length <= 1) {
            alert('At least one auto is required.');
            return;
        }
        const auto = this.getActiveAuto();
        const ok = window.confirm(`Delete ${auto.name}?`);
        if (!ok) {
            return;
        }
        this.state_.autos = this.state_.autos.filter(a => a.id !== auto.id);
        this.state_.activeAutoId = this.state_.autos[0].id;
        this.commitHistory();
        this.render();
    }
    nextAutoName() {
        let index = 1;
        while (true) {
            const name = `Auto ${index}`;
            if (!this.state_.autos.find(a => a.name === name)) {
                return name;
            }
            index++;
        }
    }
    getActiveAuto() {
        this.ensureActiveAuto();
        return this.state_.autos.find(a => a.id === this.state_.activeAutoId);
    }
    ensureActiveAuto() {
        if (!this.state_.autos || this.state_.autos.length === 0) {
            this.state_ = this.createDefaultState();
        }
        if (!this.state_.autos.find(a => a.id === this.state_.activeAutoId)) {
            this.state_.activeAutoId = this.state_.autos[0].id;
        }
    }
    normalizeAutos() {
        for (const auto of this.state_.autos) {
            for (const action of AutoPlanControl.uniqueNodeActions) {
                let found = false;
                auto.nodes = auto.nodes.filter(node => {
                    if (node.action !== action) {
                        return true;
                    }
                    if (!found) {
                        found = true;
                        return true;
                    }
                    return false;
                });
            }
            const endModifiers = auto.nodes.filter(n => n.end && n.action !== 'End');
            if (endModifiers.length > 1) {
                let first = true;
                for (const node of endModifiers) {
                    if (first) {
                        first = false;
                        continue;
                    }
                    node.end = false;
                }
            }
            const endNodes = auto.nodes.filter(n => n.action === 'End');
            if (endModifiers.length > 0) {
                if (endNodes.length > 0) {
                    auto.nodes = auto.nodes.filter(n => n.action !== 'End');
                }
            }
            else if (endNodes.length > 1) {
                let first = true;
                auto.nodes = auto.nodes.filter(n => {
                    if (n.action !== 'End') {
                        return true;
                    }
                    if (first) {
                        first = false;
                        return true;
                    }
                    return false;
                });
            }
        }
    }
    toggleEndModifier(nodeId) {
        const auto = this.getActiveAuto();
        const target = auto.nodes.find(n => n.id === nodeId);
        if (!target) {
            return;
        }
        const nextValue = !target.end;
        auto.nodes = auto.nodes.filter(n => n.action !== 'End');
        for (const node of auto.nodes) {
            node.end = false;
        }
        target.end = nextValue;
        this.commitHistory();
        this.render();
    }
    nextId(prefix) {
        return `${prefix}-${Date.now()}-${this.id_counter_++}`;
    }
    nodeToPixel(node, rect) {
        const x = rect.width * node.x;
        const y = rect.height * node.y;
        return { x, y };
    }
    pixelToNode(clientX, clientY, rect) {
        let x = (clientX - rect.left) / rect.width;
        let y = (clientY - rect.top) / rect.height;
        x = Math.max(0, Math.min(1, x));
        y = Math.max(0, Math.min(1, y));
        return { x, y };
    }
    createToolButton(label, handler) {
        const btn = document.createElement('button');
        btn.className = 'xero-autoplan-tool-button';
        btn.innerText = label;
        btn.addEventListener('click', (ev) => {
            ev.stopPropagation();
            handler();
        });
        return btn;
    }
}
AutoPlanControl.defaultActions = ['Start', 'Shoot', 'Intake', 'Feed', 'Climb', 'Ferry', 'End'];
AutoPlanControl.lockedActions = ['Start', 'End'];
AutoPlanControl.uniqueNodeActions = ['Start'];
AutoPlanControl.item_desc_ = {
    type: 'autoplan',
    tag: '',
    x: 0,
    y: 0,
    width: 0,
    height: 0,
    color: '#ffffff',
    background: '#0d1220',
    fontFamily: 'Arial',
    fontSize: 16,
    fontWeight: 'bold',
    fontStyle: 'normal',
    datatype: 'string',
    transparent: false,
    fieldImage: 'field2025',
    approvedActions: [...AutoPlanControl.defaultActions],
    allowMultipleAutos: true,
};
//# sourceMappingURL=autoplanctrl.js.map