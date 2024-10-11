// imports.gi
import Clutter from 'gi://Clutter';
import GObject from 'gi://GObject';
import Graphene from 'gi://Graphene';
// gnome-shell modules
import { Extension } from 'resource:///org/gnome/shell/extensions/extension.js';
import { layoutManager, overview } from 'resource:///org/gnome/shell/ui/main.js';
import { WindowPreview } from 'resource:///org/gnome/shell/ui/windowPreview.js';
import { WorkspaceAnimationController } from 'resource:///org/gnome/shell/ui/workspaceAnimation.js';
// local modules
import { LinearFilterEffect } from './effect/linear_filter_effect.js';
import { disableEffect, enableEffect } from './manager/event_manager.js';
import { getRoundedCornersEffect, shouldEnableEffect, windowScaleFactor, } from './manager/utils.js';
import { disableBackgroundMenuItem, enableBackgroundMenuItem, } from './utils/background_menu.js';
import { OVERVIEW_SHADOW_ACTOR, SHADOW_PADDING } from './utils/constants.js';
import { logDebug } from './utils/log.js';
import { getPref, initPrefs, prefs, uninitPrefs } from './utils/settings.js';
import { WindowPicker } from './window_picker/service.js';
// --------------------------------------------------------------- [end imports]
export default class RoundedWindowCornersReborn extends Extension {
    // The methods of gnome-shell to monkey patch
    _orig_add_window;
    _orig_prep_workspace_swt;
    _orig_finish_workspace_swt;
    _windowPicker = null;
    _layoutManagerStartupConnection = null;
    enable() {
        initPrefs(this.getSettings());
        // Restore original methods, those methods will be restore when
        // extensions is disabled
        this._orig_add_window = WindowPreview.prototype._addWindow;
        this._orig_prep_workspace_swt =
            WorkspaceAnimationController.prototype._prepareWorkspaceSwitch;
        this._orig_finish_workspace_swt =
            WorkspaceAnimationController.prototype._finishWorkspaceSwitch;
        this._windowPicker = new WindowPicker();
        this._windowPicker.export();
        // Enable rounded corners effects when gnome-shell is ready
        //
        // https://github.com/aunetx/blur-my-shell/blob/
        //  21d4bbde15acf7c3bf348f7375a12f7b14c3ab6f/src/extension.js#L87
        if (layoutManager._startingUp) {
            this._layoutManagerStartupConnection = layoutManager.connect('startup-complete', () => {
                enableEffect();
                if (getPref('enable-preferences-entry')) {
                    enableBackgroundMenuItem();
                }
                layoutManager.disconnect(
                // Since this happens inside of the connection, there
                // is no way for this to be null.
                // biome-ignore lint/style/noNonNullAssertion:
                this._layoutManagerStartupConnection);
            });
        }
        else {
            enableEffect();
            if (getPref('enable-preferences-entry')) {
                enableBackgroundMenuItem();
            }
        }
        const self = this;
        // WindowPreview is a widgets that show content of window in overview.
        // this widget also contain a St.Label (show title of window), icon and
        // close button for window.
        //
        // When there is new window added into overview, this function will be
        // called. We need add our shadow actor and blur actor of rounded
        // corners window into overview.
        //
        WindowPreview.prototype._addWindow = function (window) {
            // call original method from gnome-shell
            self._orig_add_window.apply(this, [window]);
            // Make sure patched method only be called in _init() of
            // WindowPreview
            // https://gitlab.gnome.org/GNOME/gnome-shell/-/blob/main/js
            // /ui/windowPreview.js#L42
            // Create a new error object and use it to get the call stack of
            // the function.
            //
            // Since the error is not actually being raised, it doesn't need
            // an error message.
            // biome-ignore lint/suspicious/useErrorMessage:
            const stack = new Error().stack?.trim();
            if (stack === undefined ||
                stack.indexOf('_updateAttachedDialogs') !== -1 ||
                stack.indexOf('addDialog') !== -1) {
                return;
            }
            // If the window don't have rounded corners and shadows,
            // just return
            let has_rounded_corners = false;
            const window_actor = window.get_compositor_private();
            const shadow = window_actor.rwcCustomData?.shadow;
            if (shadow) {
                has_rounded_corners = shouldEnableEffect(window);
            }
            if (!(has_rounded_corners && shadow)) {
                return;
            }
            logDebug(`Add shadow for ${window.title} in overview`);
            // WindowPreview.windowContainer used to show content of window
            const windowContainer = this.windowContainer;
            let firstChild = windowContainer.firstChild;
            // Set linear filter to let it looks better
            firstChild?.add_effect(new LinearFilterEffect());
            // Add a clone of shadow to overview
            const shadow_clone = new OverviewShadowActor(shadow, this);
            for (const prop of ['scale-x', 'scale-y']) {
                windowContainer.bind_property(prop, shadow_clone, prop, 1);
            }
            this.insert_child_below(shadow_clone, windowContainer);
            // Disconnect all signals when Window preview in overview is destroy
            const connection = this.connect('destroy', () => {
                shadow_clone.destroy();
                firstChild?.clear_effects();
                firstChild = null;
                this.disconnect(connection);
            });
        };
        // Just Like the monkey patch when enter overview, need to add cloned shadow
        // actor when switching workspaces on Desktop
        WorkspaceAnimationController.prototype._prepareWorkspaceSwitch =
            function (workspaceIndices) {
                self._orig_prep_workspace_swt.apply(this, [workspaceIndices]);
                for (const monitor of this._switchData.monitors) {
                    for (const workspace of monitor._workspaceGroups) {
                        // Let shadow actor always behind the window clone actor when we
                        // switch workspace by Ctrl+Alt+Left/Right
                        //
                        // Fix #55
                        const restacked_id = global.display.connect('restacked', () => {
                            for (const { clone, } of workspace._windowRecords) {
                                const shadow = clone
                                    ._shadow_clone;
                                if (shadow) {
                                    workspace.set_child_below_sibling(shadow, clone);
                                }
                            }
                        });
                        const destroy_id = workspace.connect('destroy', () => {
                            global.display.disconnect(restacked_id);
                            workspace.disconnect(destroy_id);
                        });
                        for (const { windowActor: actor, clone, } of workspace._windowRecords) {
                            const win = actor.metaWindow;
                            const frame_rect = win.get_frame_rect();
                            const shadow = actor
                                .rwcCustomData?.shadow;
                            const enabled = getRoundedCornersEffect(actor)?.enabled;
                            if (shadow && enabled) {
                                // Only create shadow actor when window should have rounded
                                // corners when switching workspace
                                // Copy shadow actor to workspace group, so that to see
                                // shadow when switching workspace
                                const shadow_clone = new Clutter.Clone({
                                    source: shadow,
                                });
                                const paddings = SHADOW_PADDING * windowScaleFactor(win);
                                shadow_clone.width =
                                    frame_rect.width + paddings * 2;
                                shadow_clone.height =
                                    frame_rect.height + paddings * 2;
                                shadow_clone.x =
                                    clone.x + frame_rect.x - actor.x - paddings;
                                shadow_clone.y =
                                    clone.y + frame_rect.y - actor.y - paddings;
                                // Should works well work Desktop Cube extensions
                                const notify_id = clone.connect('notify::translation-z', () => {
                                    shadow_clone.translationZ =
                                        clone.translationZ - 0.05;
                                });
                                const destroy_id = clone.connect('destroy', () => {
                                    clone.disconnect(notify_id);
                                    clone.disconnect(destroy_id);
                                });
                                // Add reference shadow clone for clone actor, so that we
                                // can restack position of shadow when we need
                                clone._shadow_clone =
                                    shadow_clone;
                                clone.bind_property('visible', shadow_clone, 'visible', 0);
                                workspace.insert_child_below(shadow_clone, clone);
                            }
                        }
                    }
                }
            };
        WorkspaceAnimationController.prototype._finishWorkspaceSwitch =
            function (switchData) {
                for (const monitor of this._switchData.monitors) {
                    for (const workspace of monitor._workspaceGroups) {
                        for (const { clone } of workspace._windowRecords) {
                            clone._shadow_clone?.destroy();
                            delete clone._shadow_clone;
                        }
                    }
                }
                self._orig_finish_workspace_swt.apply(this, [switchData]);
            };
        // Gnome-shell will not disable extensions when _logout/shutdown/restart
        // system, it means that the signal handlers will not be cleaned when
        // gnome-shell is closing.
        //
        // Now clear all resources manually before gnome-shell closes
        const connection = global.display.connect('closing', () => {
            logDebug('Clear all resources because gnome-shell is shutdown');
            this.disable();
            global.display.disconnect(connection);
        });
        // Watch changes of GSettings
        prefs.connect('changed', (_, k) => {
            if (k === 'enable-preferences-entry') {
                getPref('enable-preferences-entry')
                    ? enableBackgroundMenuItem()
                    : disableBackgroundMenuItem();
            }
        });
        logDebug('Enabled');
    }
    disable() {
        // Restore patched methods
        WindowPreview.prototype._addWindow = this._orig_add_window;
        WorkspaceAnimationController.prototype._prepareWorkspaceSwitch =
            this._orig_prep_workspace_swt;
        WorkspaceAnimationController.prototype._finishWorkspaceSwitch =
            this._orig_finish_workspace_swt;
        // Remove the item to open preferences page in background menu
        disableBackgroundMenuItem();
        this._windowPicker?.unexport();
        disableEffect();
        // Set all props to null
        this._windowPicker = null;
        if (this._layoutManagerStartupConnection !== null) {
            layoutManager.disconnect(this._layoutManagerStartupConnection);
            this._layoutManagerStartupConnection = null;
        }
        logDebug('Disabled');
        uninitPrefs();
    }
}
/**
 * Copy shadow of rounded corners window and show it in overview.
 * This actor will be created when window preview has created for overview
 */
const OverviewShadowActor = GObject.registerClass({}, class extends Clutter.Clone {
    _window_preview;
    /**
     * Create shadow actor for WindowPreview in overview
     * @param source the shadow actor create for rounded corners shadow
     * @param window_preview the window preview has shown in overview
     */
    constructor(source, window_preview) {
        super({
            source, // the source shadow actor shown in desktop
            name: OVERVIEW_SHADOW_ACTOR,
            pivotPoint: new Graphene.Point({ x: 0.5, y: 0.5 }),
        });
        this._window_preview = window_preview;
    }
    /**
     * Recompute the position and size of shadow in overview
     * This virtual function will be called when we:
     * - entering/closing overview
     * - dragging window
     * - position and size of window preview in overview changed
     * @param box The bound box of shadow actor
     */
    vfunc_allocate(box) {
        const leaving_overview = overview._overview.controls._workspacesDisplay._leavingOverview;
        // The window container that shown in overview
        const windowContainerBox = leaving_overview
            ? this._window_preview.windowContainer.get_allocation_box()
            : this._window_preview.get_allocation_box();
        // Meta.Window contain the all information about a window
        const meta_win = this._window_preview._windowActor.get_meta_window();
        if (!meta_win) {
            return;
        }
        // As we known, preview shown in overview has been scaled
        // in overview
        const container_scaled = windowContainerBox.get_width() /
            meta_win.get_frame_rect().width;
        const paddings = SHADOW_PADDING * container_scaled * windowScaleFactor(meta_win);
        // Setup bounds box of shadow actor
        box.set_origin(-paddings, -paddings);
        box.set_size(windowContainerBox.get_width() + 2 * paddings, windowContainerBox.get_height() + 2 * paddings);
        // Make bounds box effect actor
        super.vfunc_allocate(box);
    }
});
