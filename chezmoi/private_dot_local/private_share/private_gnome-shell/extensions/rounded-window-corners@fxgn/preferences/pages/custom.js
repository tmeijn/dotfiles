import Adw from 'gi://Adw';
import GLib from 'gi://GLib';
import GObject from 'gi://GObject';
import { gettext as _ } from 'resource:///org/gnome/Shell/Extensions/js/extensions/prefs.js';
import { getPref, setPref } from '../../utils/settings.js';
import { CustomEffectRow, CustomEffectRowClass, } from '../widgets/customeffect_row.js';
export const Custom = GObject.registerClass({
    Template: GLib.uri_resolve_relative(import.meta.url, 'custom.ui', GLib.UriFlags.NONE),
    GTypeName: 'PrefsCustom',
    InternalChildren: ['custom_group'],
}, class extends Adw.PreferencesPage {
    constructor() {
        super();
        this._settings_cfg = getPref('custom-rounded-corner-settings');
        for (const title in this._settings_cfg) {
            this.add_window(undefined, title);
        }
    }
    add_window(_, title) {
        const callbacks = {
            on_delete: row => this.delete_row(row),
            on_title_changed: (row, old_title, new_title) => this.change_title(row, old_title, new_title),
        };
        const row = new CustomEffectRow(callbacks);
        if (title) {
            this.setup_row(row, title);
        }
        row.set_subtitle(title ?? '');
        this._custom_group.add(row);
    }
    delete_row(row) {
        delete this._settings_cfg[row.subtitle];
        setPref('custom-rounded-corner-settings', this._settings_cfg);
        this._custom_group.remove(row);
    }
    change_title(row, old_title, new_title) {
        if (this._settings_cfg[new_title] !== undefined) {
            const win = this.root;
            win.add_toast(new Adw.Toast({
                title: _(`Can't add ${new_title} to the list, because it already there`),
            }));
            return false;
        }
        if (old_title === '') {
            this._settings_cfg[new_title] = getPref('global-rounded-corner-settings');
        }
        else {
            const cfg = this._settings_cfg[old_title];
            delete this._settings_cfg[old_title];
            this._settings_cfg[new_title] = cfg;
        }
        this.setup_row(row, new_title);
        setPref('custom-rounded-corner-settings', this._settings_cfg);
        return true;
    }
    setup_row(row, title) {
        if (!(row instanceof CustomEffectRowClass)) {
            return;
        }
        const r = row;
        r.connect('notify::subtitle', (row) => {
            row.check_state();
        });
        r.enabled_row.set_active(this._settings_cfg[title].enabled);
        r.enabled_row.connect('notify::active', (row) => {
            r.check_state();
            this._settings_cfg[title].enabled = row.get_active();
            setPref('custom-rounded-corner-settings', this._settings_cfg);
        });
        r.corner_radius.set_value(this._settings_cfg[title].borderRadius);
        r.corner_radius.connect('value-changed', (adj) => {
            this._settings_cfg[title].borderRadius = adj.get_value();
            setPref('custom-rounded-corner-settings', this._settings_cfg);
        });
        r.corner_smoothing.set_value(this._settings_cfg[title].smoothing);
        r.corner_smoothing.connect('value-changed', (adj) => {
            this._settings_cfg[title].smoothing = adj.get_value();
            setPref('custom-rounded-corner-settings', this._settings_cfg);
        });
        r.keep_for_maximized.set_active(this._settings_cfg[title].keepRoundedCorners.maximized);
        r.keep_for_maximized.connect('notify::active', (row) => {
            this._settings_cfg[title].keepRoundedCorners.maximized =
                row.get_active();
            setPref('custom-rounded-corner-settings', this._settings_cfg);
        });
        r.keep_for_fullscreen.set_active(this._settings_cfg[title].keepRoundedCorners.fullscreen);
        r.keep_for_fullscreen.connect('notify::active', (row) => {
            this._settings_cfg[title].keepRoundedCorners.fullscreen =
                row.get_active();
            setPref('custom-rounded-corner-settings', this._settings_cfg);
        });
        r.paddings.paddingTop = this._settings_cfg[title].padding.top;
        r.paddings.connect('notify::padding-top', (row) => {
            this._settings_cfg[title].padding.top = row.paddingTop;
            setPref('custom-rounded-corner-settings', this._settings_cfg);
        });
        r.paddings.paddingBottom = this._settings_cfg[title].padding.bottom;
        r.paddings.connect('notify::padding-bottom', (row) => {
            this._settings_cfg[title].padding.bottom =
                row.paddingBottom;
            setPref('custom-rounded-corner-settings', this._settings_cfg);
        });
        r.paddings.paddingStart = this._settings_cfg[title].padding.left;
        r.paddings.connect('notify::padding-start', (row) => {
            this._settings_cfg[title].padding.left = row.paddingStart;
            setPref('custom-rounded-corner-settings', this._settings_cfg);
        });
        r.paddings.paddingEnd = this._settings_cfg[title].padding.right;
        r.paddings.connect('notify::padding-end', (row) => {
            this._settings_cfg[title].padding.right = row.paddingEnd;
            setPref('custom-rounded-corner-settings', this._settings_cfg);
        });
    }
});
