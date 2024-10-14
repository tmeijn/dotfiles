/**
 * @file Provides wrappers around the GSettings object that add type safety and
 * automatically convert values between JS types and GLib Variant types that
 * are used for storing GSettings.
 */
import GLib from 'gi://GLib';
import { logDebug } from './log.js';
/** Mapping of schema keys to their GLib Variant type string */
const Schema = {
    'settings-version': 'u',
    blacklist: 'as',
    'skip-libadwaita-app': 'b',
    'skip-libhandy-app': 'b',
    'border-width': 'i',
    'border-color': '(dddd)',
    'global-rounded-corner-settings': 'a{sv}',
    'custom-rounded-corner-settings': 'a{sv}',
    'focused-shadow': 'a{si}',
    'unfocused-shadow': 'a{si}',
    'debug-mode': 'b',
    'tweak-kitty-terminal': 'b',
    'enable-preferences-entry': 'b',
};
/** The raw GSettings object for direct manipulation. */
export let prefs;
/**
 * Initialize the {@link prefs} object with existing GSettings.
 *
 * @param gSettings - GSettings to initialize the prefs with.
 */
export function initPrefs(gSettings) {
    resetOutdated(gSettings);
    prefs = gSettings;
}
/** Delete the {@link prefs} object for garbage collection. */
export function uninitPrefs() {
    prefs = null;
}
/**
 * Get a preference from GSettings and convert it from a GLib Variant to a
 * JavaScript type.
 *
 * @param key - The key of the preference to get.
 * @returns The value of the preference.
 */
export function getPref(key) {
    return prefs.get_value(key).recursiveUnpack();
}
/**
 * Pack a value into a GLib Variant type and store it in GSettings.
 *
 * @param key - The key of the preference to set.
 * @param value - The value to set the preference to.
 */
export function setPref(key, value) {
    logDebug(`Settings pref: ${key}, ${value}`);
    let variant;
    if (key === 'global-rounded-corner-settings') {
        variant = packRoundedCornerSettings(value);
    }
    else if (key === 'custom-rounded-corner-settings') {
        variant = packCustomRoundedCornerSettings(value);
    }
    else {
        variant = new GLib.Variant(Schema[key], value);
    }
    prefs.set_value(key, variant);
}
/** A simple type-checked wrapper around {@link prefs.bind} */
export function bindPref(key, object, property, flags) {
    prefs.bind(key, object, property, flags);
}
/**
 * Reset setting keys that changed their type between releases
 * to avoid conflicts.
 *
 * @param prefs the GSettings object to clean.
 */
function resetOutdated(prefs) {
    const lastVersion = 6;
    const currentVersion = prefs
        .get_user_value('settings-version')
        ?.recursiveUnpack();
    if (!currentVersion || currentVersion < lastVersion) {
        if (prefs.list_keys().includes('black-list')) {
            prefs.reset('black-list');
        }
        prefs.reset('global-rounded-corner-settings');
        prefs.reset('custom-rounded-corner-settings');
        prefs.reset('focused-shadow');
        prefs.reset('unfocused-shadow');
        prefs.set_uint('settings-version', lastVersion);
    }
}
/**
 * Pack rounded corner settings into a GLib Variant object.
 *
 * Since rounded corner settings are stored as a dictionary where the values
 * are of different types, it can't be automatically packed into a variant.
 * Instead, we need to pack each of the values into the correct variant
 * type, and only then pack the entire dictionary into a variant with type
 * "a{sv}" (dictionary with string keys and arbitrary variant values).
 *
 * @param settings - The rounded corner settings to pack.
 * @returns The packed GLib Variant object.
 */
function packRoundedCornerSettings(settings) {
    const padding = new GLib.Variant('a{su}', settings.padding);
    const keepRoundedCorners = new GLib.Variant('a{sb}', settings.keepRoundedCorners);
    const borderRadius = GLib.Variant.new_uint32(settings.borderRadius);
    const smoothing = GLib.Variant.new_double(settings.smoothing);
    const enabled = GLib.Variant.new_boolean(settings.enabled);
    const variantObject = {
        padding: padding,
        keepRoundedCorners: keepRoundedCorners,
        borderRadius: borderRadius,
        smoothing: smoothing,
        enabled: enabled,
    };
    return new GLib.Variant('a{sv}', variantObject);
}
/**
 * Pack custom rounded corner overrides into a GLib Variant object.
 *
 * Custom rounded corner settings are stored as a dictionary from window
 * wm_class to {@link RoundedCornerSettings} objects. See the documentation for
 * {@link packRoundedCornerSettings} for more information on why manual packing
 * is needed here.
 *
 * @param settings - The custom rounded corner setting overrides to pack.
 * @returns The packed GLib Variant object.
 */
function packCustomRoundedCornerSettings(settings) {
    const packedSettings = {};
    for (const [wmClass, windowSettings] of Object.entries(settings)) {
        packedSettings[wmClass] = packRoundedCornerSettings(windowSettings);
    }
    const variant = new GLib.Variant('a{sv}', packedSettings);
    return variant;
}
