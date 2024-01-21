export function get_current_path() {
    return import.meta.url.split('://')[1].split('/').slice(0, -1).join('/');
}
