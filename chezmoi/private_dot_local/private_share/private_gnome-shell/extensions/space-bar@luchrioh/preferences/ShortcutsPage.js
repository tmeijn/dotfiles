import Adw from 'gi://Adw';
import { addKeyboardShortcut, addToggle } from './common.js';
export class ShortcutsPage {
    constructor(extensionPreferences) {
        this.page = new Adw.PreferencesPage();
        this._settings = extensionPreferences.getSettings(`org.gnome.shell.extensions.space-bar.shortcuts`);
    }
    init() {
        this.page.set_title('_Shortcuts');
        this.page.useUnderline = true;
        this.page.set_icon_name('preferences-desktop-keyboard-shortcuts-symbolic');
        this._initGroup();
    }
    _initGroup() {
        const group = new Adw.PreferencesGroup();
        group.set_description('Shortcuts might not work if they are already bound elsewhere.');
        this.page.add(group);
        addToggle({
            settings: this._settings,
            group,
            key: 'enable-activate-workspace-shortcuts',
            title: 'Switch to workspace',
            shortcutLabel: '<Super>1...0',
        });
        addToggle({
            settings: this._settings,
            group,
            key: 'enable-move-to-workspace-shortcuts',
            title: 'Move to workspace',
            shortcutLabel: '<Super><Shift>1...0',
            subtitle: 'With the current window',
        });
        addKeyboardShortcut({
            settings: this._settings,
            window: this.window,
            group,
            key: 'move-workspace-left',
            title: 'Move current workspace left',
        });
        addKeyboardShortcut({
            settings: this._settings,
            window: this.window,
            group,
            key: 'move-workspace-right',
            title: 'Move current workspace right',
        });
        addKeyboardShortcut({
            settings: this._settings,
            window: this.window,
            group,
            key: 'activate-previous-key',
            title: 'Switch to previous workspace',
        });
        addKeyboardShortcut({
            settings: this._settings,
            window: this.window,
            group,
            key: 'activate-empty-key',
            title: 'Switch to empty workspace',
            subtitle: 'Adds new workspace if needed',
        });
        addKeyboardShortcut({
            settings: this._settings,
            window: this.window,
            group,
            key: 'open-menu',
            title: 'Open menu',
        });
    }
}
