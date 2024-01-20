import Adw from 'gi://Adw';
import { addCombo, addSpinButton, addToggle } from './common.js';
export const indicatorStyleOptions = {
    'current-workspace-name': 'Current workspace name',
    'workspaces-bar': 'Workspaces bar',
};
export const scrollWheelOptions = {
    panel: 'Over top panel',
    'workspaces-bar': 'Over indicator',
    disabled: 'Disabled',
};
export const scrollWheelDirectionOptions = {
    normal: 'Normal',
    inverted: 'Inverted',
    disabled: 'Disabled',
};
export const positionOptions = {
    left: 'Left',
    center: 'Center',
    right: 'Right',
};
export class BehaviorPage {
    constructor(extensionPreferences) {
        this.page = new Adw.PreferencesPage();
        this._settings = extensionPreferences.getSettings(`org.gnome.shell.extensions.space-bar.behavior`);
    }
    init() {
        this.page.set_title('_Behavior');
        this.page.use_underline = true;
        this.page.set_icon_name('preferences-system-symbolic');
        this._initGeneralGroup();
        this._initSmartWorkspaceNamesGroup();
    }
    _initGeneralGroup() {
        const group = new Adw.PreferencesGroup();
        group.set_title('General');
        addCombo({
            window: this.window,
            settings: this._settings,
            group,
            key: 'indicator-style',
            title: 'Indicator style',
            options: indicatorStyleOptions,
        });
        addCombo({
            window: this.window,
            settings: this._settings,
            group,
            key: 'position',
            title: 'Position in top panel',
            options: positionOptions,
        }).addSubDialog({
            window: this.window,
            title: 'Position in Top Panel',
            populatePage: (page) => {
                const positionSubDialogGroup = new Adw.PreferencesGroup();
                page.add(positionSubDialogGroup);
                addToggle({
                    settings: this._settings,
                    group: positionSubDialogGroup,
                    key: 'system-workspace-indicator',
                    title: 'Keep system workspace indicator',
                });
                addSpinButton({
                    settings: this._settings,
                    group: positionSubDialogGroup,
                    key: 'position-index',
                    title: 'Position index',
                    subtitle: 'Order relative to other elements',
                    lower: 0,
                    upper: 100,
                });
            },
        });
        addCombo({
            window: this.window,
            settings: this._settings,
            group,
            key: 'scroll-wheel',
            title: 'Switch workspaces with scroll wheel',
            options: scrollWheelOptions,
        }).addSubDialog({
            window: this.window,
            title: 'Switch Workspaces With Scroll Wheel',
            enableIf: {
                key: 'scroll-wheel',
                predicate: (value) => value.get_string()[0] !== 'disabled',
                page: this.page,
            },
            populatePage: (page) => {
                const group = new Adw.PreferencesGroup();
                page.add(group);
                addToggle({
                    settings: this._settings,
                    group,
                    key: 'scroll-wheel-debounce',
                    title: 'Debounce scroll events',
                });
                addSpinButton({
                    settings: this._settings,
                    group,
                    key: 'scroll-wheel-debounce-time',
                    title: 'Debounce time (ms)',
                    lower: 0,
                    upper: 2000,
                    step: 50,
                }).enableIf({
                    key: 'scroll-wheel-debounce',
                    predicate: (value) => value.get_boolean(),
                    page,
                });
                addCombo({
                    window: this.window,
                    settings: this._settings,
                    group,
                    key: 'scroll-wheel-vertical',
                    title: 'Vertical scrolling',
                    options: scrollWheelDirectionOptions,
                });
                addCombo({
                    window: this.window,
                    settings: this._settings,
                    group,
                    key: 'scroll-wheel-horizontal',
                    title: 'Horizontal scrolling',
                    options: scrollWheelDirectionOptions,
                });
                addToggle({
                    settings: this._settings,
                    group,
                    key: 'scroll-wheel-wrap-around',
                    title: 'Wrap around',
                });
            },
        });
        addToggle({
            settings: this._settings,
            group,
            key: 'always-show-numbers',
            title: 'Always show workspace numbers',
        });
        addToggle({
            settings: this._settings,
            group,
            key: 'show-empty-workspaces',
            title: 'Show empty workspaces',
            subtitle: 'Also affects switching with scroll wheel',
        });
        addToggle({
            settings: this._settings,
            group,
            key: 'toggle-overview',
            title: 'Toggle overview',
            subtitle: 'When clicking on the active or an empty workspace',
        });
        this.page.add(group);
    }
    _initSmartWorkspaceNamesGroup() {
        const group = new Adw.PreferencesGroup();
        group.set_title('Smart Workspace Names');
        group.set_description('Remembers open applications when renaming a workspace and automatically assigns workspace names based on the first application started on a new workspace.');
        addToggle({
            settings: this._settings,
            group,
            key: 'smart-workspace-names',
            title: 'Enable smart workspace names',
        });
        this.page.add(group);
    }
}
