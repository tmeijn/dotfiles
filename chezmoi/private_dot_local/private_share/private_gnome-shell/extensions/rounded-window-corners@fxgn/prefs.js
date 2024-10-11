import GLib from 'gi://GLib';
import Gdk from 'gi://Gdk';
import Gtk from 'gi://Gtk';
import { ExtensionPreferences } from 'resource:///org/gnome/Shell/Extensions/js/extensions/prefs.js';
import { pages } from './preferences/index.js';
import { logDebug } from './utils/log.js';
import { initPrefs, uninitPrefs } from './utils/settings.js';
export default class RoundedWindowCornersRebornPrefs extends ExtensionPreferences {
    _load_css() {
        const display = Gdk.Display.get_default();
        if (display) {
            const css = new Gtk.CssProvider();
            const path = GLib.build_filenamev([
                import.meta.url,
                'stylesheet-prefs.css',
            ]);
            css.load_from_path(path);
            Gtk.StyleContext.add_provider_for_display(display, css, 0);
        }
    }
    fillPreferencesWindow(win) {
        initPrefs(this.getSettings());
        for (const page of pages()) {
            win.add(page);
        }
        // Disconnect all signal when close prefs
        win.connect('close-request', () => {
            logDebug('Disconnect Signals');
            uninitPrefs();
        });
        this._load_css();
    }
}
