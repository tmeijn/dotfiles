import St from 'gi://St';
import * as Main from 'resource:///org/gnome/shell/ui/main.js';
import * as PopupMenu from 'resource:///org/gnome/shell/ui/popupMenu.js';
export function addMenu(widget, request) {
    const menu = new PopupMenu.PopupMenu(widget, 0.0, St.Side.TOP, 0);
    Main.uiGroup.add_child(menu.actor);
    menu.actor.hide();
    menu.actor.add_style_class_name('panel-menu');
    widget.connect('button-press-event', (_, event) => {
        if (event.get_button() === 3) {
            request(menu);
        }
    });
    return menu;
}
export function addContext(menu, name, activate) {
    const menu_item = appendMenuItem(menu, name);
    menu_item.connect('activate', () => activate());
}
function appendMenuItem(menu, label) {
    let item = new PopupMenu.PopupMenuItem(label);
    menu.addMenuItem(item);
    return item;
}
