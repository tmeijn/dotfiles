export var LOG_LEVELS;
(function (LOG_LEVELS) {
    LOG_LEVELS[LOG_LEVELS["OFF"] = 0] = "OFF";
    LOG_LEVELS[LOG_LEVELS["ERROR"] = 1] = "ERROR";
    LOG_LEVELS[LOG_LEVELS["WARN"] = 2] = "WARN";
    LOG_LEVELS[LOG_LEVELS["INFO"] = 3] = "INFO";
    LOG_LEVELS[LOG_LEVELS["DEBUG"] = 4] = "DEBUG";
})(LOG_LEVELS || (LOG_LEVELS = {}));
export function log_level() {
    let settings = globalThis.popShellExtension.getSettings();
    let log_level = settings.get_uint('log-level');
    return log_level;
}
export function log(text) {
    globalThis.log('pop-shell: ' + text);
}
export function error(text) {
    if (log_level() > LOG_LEVELS.OFF)
        log('[ERROR] ' + text);
}
export function warn(text) {
    if (log_level() > LOG_LEVELS.ERROR)
        log('[WARN] ' + text);
}
export function info(text) {
    if (log_level() > LOG_LEVELS.WARN)
        log('[INFO] ' + text);
}
export function debug(text) {
    if (log_level() > LOG_LEVELS.INFO)
        log('[DEBUG] ' + text);
}
