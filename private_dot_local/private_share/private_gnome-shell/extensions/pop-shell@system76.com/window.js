const Me = imports.misc.extensionUtils.getCurrentExtension();
const lib = Me.imports.lib;
const log = Me.imports.log;
const once_cell = Me.imports.once_cell;
const Rect = Me.imports.rectangle;
const Tags = Me.imports.tags;
const utils = Me.imports.utils;
const xprop = Me.imports.xprop;
const scheduler = Me.imports.scheduler;
const focus = Me.imports.focus;
const { Gdk, Meta, Shell, St, GLib } = imports.gi;
const { OnceCell } = once_cell;
var window_tracker = Shell.WindowTracker.get_default();
let SCHEDULED_RESTACK = null;
let ACTIVE_HINT_SHOW_ID = null;
const WM_TITLE_BLACKLIST = [
    'Firefox',
    'Nightly',
    'Tor Browser'
];
var RESTACK_STATE;
(function (RESTACK_STATE) {
    RESTACK_STATE[RESTACK_STATE["RAISED"] = 0] = "RAISED";
    RESTACK_STATE[RESTACK_STATE["WORKSPACE_CHANGED"] = 1] = "WORKSPACE_CHANGED";
    RESTACK_STATE[RESTACK_STATE["NORMAL"] = 2] = "NORMAL";
})(RESTACK_STATE || (RESTACK_STATE = {}));
var RESTACK_SPEED;
(function (RESTACK_SPEED) {
    RESTACK_SPEED[RESTACK_SPEED["RAISED"] = 430] = "RAISED";
    RESTACK_SPEED[RESTACK_SPEED["WORKSPACE_CHANGED"] = 300] = "WORKSPACE_CHANGED";
    RESTACK_SPEED[RESTACK_SPEED["NORMAL"] = 200] = "NORMAL";
})(RESTACK_SPEED || (RESTACK_SPEED = {}));
var ShellWindow = class ShellWindow {
    constructor(entity, window, window_app, ext) {
        var _a;
        this.stack = null;
        this.grab = false;
        this.activate_after_move = false;
        this.ignore_detach = false;
        this.destroying = false;
        this.reassignment = false;
        this.smart_gapped = false;
        this.border = new St.Bin({ style_class: 'pop-shell-active-hint pop-shell-border-normal' });
        this.prev_rect = null;
        this.was_hidden = false;
        this.extra = {
            normal_hints: new OnceCell(),
            wm_role_: new OnceCell(),
            xid_: new OnceCell()
        };
        this.border_size = 0;
        this.window_app = window_app;
        this.entity = entity;
        this.meta = window;
        this.ext = ext;
        this.known_workspace = this.workspace_id();
        if (this.meta.is_fullscreen()) {
            ext.add_tag(entity, Tags.Floating);
        }
        if (this.may_decorate()) {
            if (!window.is_client_decorated()) {
                if (ext.settings.show_title()) {
                    this.decoration_show(ext);
                }
                else {
                    this.decoration_hide(ext);
                }
            }
        }
        this.bind_window_events();
        this.bind_hint_events();
        if (this.border)
            global.window_group.add_child(this.border);
        this.hide_border();
        this.restack();
        this.update_border_layout();
        if ((_a = this.meta.get_compositor_private()) === null || _a === void 0 ? void 0 : _a.get_stage())
            this.on_style_changed();
    }
    activate(move_mouse = true) {
        activate(this.ext, move_mouse, this.meta);
    }
    actor_exists() {
        return !this.destroying && this.meta.get_compositor_private() !== null;
    }
    bind_window_events() {
        this.ext.window_signals.get_or(this.entity, () => new Array())
            .push(this.meta.connect('size-changed', () => { this.window_changed(); }), this.meta.connect('position-changed', () => { this.window_changed(); }), this.meta.connect('workspace-changed', () => { this.workspace_changed(); }), this.meta.connect('notify::wm-class', () => { this.wm_class_changed(); }), this.meta.connect('raised', () => { this.window_raised(); }));
    }
    bind_hint_events() {
        if (!this.border)
            return;
        let settings = this.ext.settings;
        let change_id = settings.ext.connect('changed', (_, key) => {
            if (this.border) {
                if (key === 'hint-color-rgba') {
                    this.update_hint_colors();
                }
            }
            return false;
        });
        this.border.connect('destroy', () => { settings.ext.disconnect(change_id); });
        this.border.connect('style-changed', () => {
            this.on_style_changed();
        });
        this.update_hint_colors();
    }
    update_hint_colors() {
        let settings = this.ext.settings;
        const color_value = settings.hint_color_rgba();
        if (this.ext.overlay) {
            const gdk = new Gdk.RGBA();
            const overlay_alpha = 0.3;
            const orig_overlay = 'rgba(53, 132, 228, 0.3)';
            gdk.parse(color_value);
            if (utils.is_dark(gdk.to_string())) {
                gdk.parse(orig_overlay);
            }
            gdk.alpha = overlay_alpha;
            this.ext.overlay.set_style(`background: ${gdk.to_string()}`);
        }
        this.update_border_style();
    }
    cmdline() {
        let pid = this.meta.get_pid(), out = null;
        if (-1 === pid)
            return out;
        const path = '/proc/' + pid + '/cmdline';
        if (!utils.exists(path))
            return out;
        const result = utils.read_to_string(path);
        if (result.kind == 1) {
            out = result.value.trim();
        }
        else {
            log.error(`failed to fetch cmdline: ${result.value.format()}`);
        }
        return out;
    }
    decoration(_ext, callback) {
        if (this.may_decorate()) {
            const xid = this.xid();
            if (xid)
                callback(xid);
        }
    }
    decoration_hide(ext) {
        if (this.ignore_decoration())
            return;
        this.was_hidden = true;
        this.decoration(ext, (xid) => xprop.set_hint(xid, xprop.MOTIF_HINTS, xprop.HIDE_FLAGS));
    }
    decoration_show(ext) {
        if (!this.was_hidden)
            return;
        this.decoration(ext, (xid) => xprop.set_hint(xid, xprop.MOTIF_HINTS, xprop.SHOW_FLAGS));
    }
    icon(_ext, size) {
        let icon = this.window_app.create_icon_texture(size);
        if (!icon) {
            icon = new St.Icon({
                icon_name: 'applications-other',
                icon_type: St.IconType.FULLCOLOR,
                icon_size: size
            });
        }
        return icon;
    }
    ignore_decoration() {
        const name = this.meta.get_wm_class();
        if (name === null)
            return true;
        return WM_TITLE_BLACKLIST.findIndex((n) => name.startsWith(n)) !== -1;
    }
    is_maximized() {
        return this.meta.get_maximized() !== 0;
    }
    is_max_screen() {
        return this.is_maximized() || this.ext.settings.gap_inner() === 0 || this.smart_gapped;
    }
    is_single_max_screen() {
        const display = this.meta.get_display();
        if (display) {
            let monitor_count = display.get_n_monitors();
            return (this.is_maximized() || this.smart_gapped) && monitor_count == 1;
        }
        return false;
    }
    is_snap_edge() {
        return this.meta.get_maximized() == Meta.MaximizeFlags.VERTICAL;
    }
    is_tilable(ext) {
        let tile_checks = () => {
            let wm_class = this.meta.get_wm_class();
            if (wm_class !== null && wm_class.trim().length === 0) {
                wm_class = this.name(ext);
            }
            const role = this.meta.get_role();
            if (role === "quake")
                return false;
            if (this.meta.get_title() === "Steam") {
                const rect = this.rect();
                const is_dialog = rect.width < 400 && rect.height < 200;
                const is_first_login = rect.width === 432 && rect.height === 438;
                if (is_dialog || is_first_login)
                    return false;
            }
            if (wm_class !== null && ext.conf.window_shall_float(wm_class, this.title())) {
                return ext.contains_tag(this.entity, Tags.ForceTile);
            }
            return this.meta.window_type == Meta.WindowType.NORMAL
                && !this.is_transient()
                && wm_class !== null;
        };
        return !ext.contains_tag(this.entity, Tags.Floating)
            && tile_checks();
    }
    is_transient() {
        return this.meta.get_transient_for() !== null;
    }
    may_decorate() {
        const xid = this.xid();
        return xid ? xprop.may_decorate(xid) : false;
    }
    move(ext, rect, on_complete) {
        if ((!this.same_workspace() && this.is_maximized())) {
            return;
        }
        this.hide_border();
        const clone = Rect.Rectangle.from_meta(rect);
        const meta = this.meta;
        const actor = meta.get_compositor_private();
        if (actor) {
            meta.unmaximize(Meta.MaximizeFlags.HORIZONTAL);
            meta.unmaximize(Meta.MaximizeFlags.VERTICAL);
            meta.unmaximize(Meta.MaximizeFlags.HORIZONTAL | Meta.MaximizeFlags.VERTICAL);
            actor.remove_all_transitions();
            ext.movements.insert(this.entity, clone);
            ext.register({ tag: 2, window: this, kind: { tag: 1 } });
            if (on_complete)
                ext.register_fn(on_complete);
            if (meta.appears_focused) {
                this.update_border_layout();
                ext.show_border_on_focused();
            }
        }
    }
    name(ext) {
        return ext.names.get_or(this.entity, () => "unknown");
    }
    on_style_changed() {
        if (!this.border)
            return;
        this.border_size = this.border.get_theme_node().get_border_width(St.Side.TOP);
    }
    rect() {
        return Rect.Rectangle.from_meta(this.meta.get_frame_rect());
    }
    size_hint() {
        return this.extra.normal_hints.get_or_init(() => {
            const xid = this.xid();
            return xid ? xprop.get_size_hints(xid) : null;
        });
    }
    swap(ext, other) {
        let ar = this.rect().clone();
        let br = other.rect().clone();
        other.move(ext, ar);
        this.move(ext, br, () => place_pointer_on(this.ext, this.meta));
    }
    title() {
        const title = this.meta.get_title();
        return title ? title : this.name(this.ext);
    }
    wm_role() {
        return this.extra.wm_role_.get_or_init(() => {
            const xid = this.xid();
            return xid ? xprop.get_window_role(xid) : null;
        });
    }
    workspace_id() {
        const workspace = this.meta.get_workspace();
        if (workspace) {
            return workspace.index();
        }
        else {
            this.meta.change_workspace_by_index(0, false);
            return 0;
        }
    }
    xid() {
        return this.extra.xid_.get_or_init(() => {
            if (utils.is_wayland())
                return null;
            return xprop.get_xid(this.meta);
        });
    }
    show_border() {
        if (!this.border)
            return;
        this.restack();
        this.update_border_style();
        if (this.ext.settings.active_hint()) {
            let border = this.border;
            const permitted = () => {
                return this.actor_exists()
                    && this.ext.focus_window() == this
                    && !this.meta.is_fullscreen()
                    && (!this.is_single_max_screen() || this.is_snap_edge())
                    && !this.meta.minimized;
            };
            if (permitted()) {
                if (this.meta.appears_focused) {
                    border.show();
                    let applications = 0;
                    if (ACTIVE_HINT_SHOW_ID !== null)
                        GLib.source_remove(ACTIVE_HINT_SHOW_ID);
                    ACTIVE_HINT_SHOW_ID = GLib.timeout_add(GLib.PRIORITY_DEFAULT, 600, () => {
                        if (applications > 4 && !this.same_workspace() || !permitted()) {
                            ACTIVE_HINT_SHOW_ID = null;
                            return GLib.SOURCE_REMOVE;
                        }
                        applications += 1;
                        border.show();
                        return GLib.SOURCE_CONTINUE;
                    });
                }
            }
        }
    }
    same_workspace() {
        const workspace = this.meta.get_workspace();
        if (workspace) {
            let workspace_id = workspace.index();
            return workspace_id === global.workspace_manager.get_active_workspace_index();
        }
        return false;
    }
    same_monitor() {
        return this.meta.get_monitor() === global.display.get_current_monitor();
    }
    restack(updateState = RESTACK_STATE.NORMAL) {
        this.update_border_layout();
        if (this.meta.is_fullscreen() ||
            (this.is_single_max_screen() && !this.is_snap_edge()) ||
            this.meta.minimized) {
            this.hide_border();
        }
        let restackSpeed = RESTACK_SPEED.NORMAL;
        switch (updateState) {
            case RESTACK_STATE.NORMAL:
                restackSpeed = RESTACK_SPEED.NORMAL;
                break;
            case RESTACK_STATE.RAISED:
                restackSpeed = RESTACK_SPEED.RAISED;
                break;
            case RESTACK_STATE.WORKSPACE_CHANGED:
                restackSpeed = RESTACK_SPEED.WORKSPACE_CHANGED;
                break;
        }
        let restacks = 0;
        const action = () => {
            const count = restacks;
            restacks += 1;
            if (!this.actor_exists && count === 0)
                return true;
            if (count === 3) {
                if (SCHEDULED_RESTACK !== null)
                    GLib.source_remove(SCHEDULED_RESTACK);
                SCHEDULED_RESTACK = null;
            }
            const border = this.border;
            const actor = this.meta.get_compositor_private();
            const win_group = global.window_group;
            if (actor && border && win_group) {
                this.update_border_layout();
                win_group.set_child_above_sibling(border, null);
                if (this.always_top_windows.length > 0) {
                    for (const above_actor of this.always_top_windows) {
                        if (actor != above_actor) {
                            if (border.get_parent() === above_actor.get_parent()) {
                                win_group.set_child_below_sibling(border, above_actor);
                            }
                        }
                    }
                    if (border.get_parent() === actor.get_parent()) {
                        win_group.set_child_above_sibling(border, actor);
                    }
                }
                for (const window of this.ext.windows.values()) {
                    const parent = window.meta.get_transient_for();
                    const window_actor = window.meta.get_compositor_private();
                    if (!parent || !window_actor)
                        continue;
                    const parent_actor = parent.get_compositor_private();
                    if (!parent_actor && parent_actor !== actor)
                        continue;
                    win_group.set_child_below_sibling(border, window_actor);
                }
            }
            return true;
        };
        if (SCHEDULED_RESTACK !== null)
            GLib.source_remove(SCHEDULED_RESTACK);
        SCHEDULED_RESTACK = GLib.timeout_add(GLib.PRIORITY_LOW, restackSpeed, action);
    }
    get always_top_windows() {
        let above_windows = new Array();
        for (const actor of global.get_window_actors()) {
            if (actor && actor.get_meta_window() && actor.get_meta_window().is_above())
                above_windows.push(actor);
        }
        return above_windows;
    }
    hide_border() {
        let b = this.border;
        if (b)
            b.hide();
    }
    update_border_layout() {
        var _a;
        let { x, y, width, height } = this.meta.get_frame_rect();
        const border = this.border;
        let borderSize = this.border_size;
        if (border) {
            if (!(this.is_max_screen() || this.is_snap_edge())) {
                border.remove_style_class_name('pop-shell-border-maximize');
            }
            else {
                borderSize = 0;
                border.add_style_class_name('pop-shell-border-maximize');
            }
            const stack_number = this.stack;
            let dimensions = null;
            if (stack_number !== null) {
                const stack = (_a = this.ext.auto_tiler) === null || _a === void 0 ? void 0 : _a.forest.stacks.get(stack_number);
                if (stack) {
                    let stack_tab_height = stack.tabs_height;
                    if (borderSize === 0 || this.grab) {
                        stack_tab_height = 0;
                    }
                    dimensions = [
                        x - borderSize,
                        y - stack_tab_height - borderSize,
                        width + 2 * borderSize,
                        height + stack_tab_height + 2 * borderSize
                    ];
                }
            }
            else {
                dimensions = [
                    x - borderSize,
                    y - borderSize,
                    width + (2 * borderSize),
                    height + (2 * borderSize)
                ];
            }
            if (dimensions) {
                [x, y, width, height] = dimensions;
                const workspace = this.meta.get_workspace();
                if (workspace === null)
                    return;
                const screen = workspace.get_work_area_for_monitor(this.meta.get_monitor());
                if (screen) {
                    width = Math.min(width, screen.x + screen.width);
                    height = Math.min(height, screen.y + screen.height);
                }
                border.set_position(x, y);
                border.set_size(width, height);
            }
        }
    }
    update_border_style() {
        const { settings } = this.ext;
        const color_value = settings.hint_color_rgba();
        const radius_value = settings.active_hint_border_radius();
        if (this.border) {
            this.border.set_style(`border-color: ${color_value}; border-radius: ${radius_value}px;`);
        }
    }
    wm_class_changed() {
        var _a;
        if (this.is_tilable(this.ext)) {
            this.ext.connect_window(this);
            if (!this.meta.minimized) {
                (_a = this.ext.auto_tiler) === null || _a === void 0 ? void 0 : _a.auto_tile(this.ext, this, this.ext.init);
            }
        }
    }
    window_changed() {
        this.update_border_layout();
        this.ext.show_border_on_focused();
    }
    window_raised() {
        this.restack(RESTACK_STATE.RAISED);
        this.ext.show_border_on_focused();
    }
    workspace_changed() {
        this.restack(RESTACK_STATE.WORKSPACE_CHANGED);
    }
}
function activate(ext, move_mouse, win) {
    var _a;
    try {
        if (!win.get_compositor_private())
            return;
        if ((_a = ext.get_window(win)) === null || _a === void 0 ? void 0 : _a.destroying)
            return;
        if (win.is_override_redirect())
            return;
        const workspace = win.get_workspace();
        if (!workspace)
            return;
        scheduler.setForeground(win);
        win.unminimize();
        workspace.activate_with_focus(win, global.get_current_time());
        win.raise();
        const pointer_placement_permitted = move_mouse
            && imports.ui.main.modalCount === 0
            && ext.settings.mouse_cursor_follows_active_window()
            && !pointer_already_on_window(win)
            && pointer_in_work_area();
        if (pointer_placement_permitted) {
            place_pointer_on(ext, win);
        }
    }
    catch (error) {
        log.error(`failed to activate window: ${error}`);
    }
}
function pointer_in_work_area() {
    const cursor = lib.cursor_rect();
    const indice = global.display.get_current_monitor();
    const mon = global.display.get_workspace_manager()
        .get_active_workspace()
        .get_work_area_for_monitor(indice);
    return mon ? cursor.intersects(mon) : false;
}
function place_pointer_on(ext, win) {
    const rect = win.get_frame_rect();
    let x = rect.x;
    let y = rect.y;
    let key = Object.keys(focus.FocusPosition)[ext.settings.mouse_cursor_focus_location()];
    let pointer_position_ = focus.FocusPosition[key];
    switch (pointer_position_) {
        case focus.FocusPosition.TopLeft:
            x += 8;
            y += 8;
            break;
        case focus.FocusPosition.BottomLeft:
            x += 8;
            y += (rect.height - 16);
            break;
        case focus.FocusPosition.TopRight:
            x += (rect.width - 16);
            y += 8;
            break;
        case focus.FocusPosition.BottomRight:
            x += (rect.width - 16);
            y += (rect.height - 16);
            break;
        case focus.FocusPosition.Center:
            x += (rect.width / 2) + 8;
            y += (rect.height / 2) + 8;
            break;
        default:
            x += 8;
            y += 8;
    }
    const display = Gdk.DisplayManager.get().get_default_display();
    if (display) {
        display
            .get_default_seat()
            .get_pointer()
            .warp(display.get_default_screen(), x, y);
    }
}
function pointer_already_on_window(meta) {
    const cursor = lib.cursor_rect();
    return cursor.intersects(meta.get_frame_rect());
}
