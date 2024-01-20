import GObject from 'gi://GObject';
import St from 'gi://St';
import * as Lib from './lib.js';
const { separator } = Lib;
export class Shortcut {
    constructor(description) {
        this.description = description;
        this.bindings = new Array();
    }
    add(binding) {
        this.bindings.push(binding);
        return this;
    }
}
export class Section {
    constructor(header, shortcuts) {
        this.header = header;
        this.shortcuts = shortcuts;
    }
}
export class Column {
    constructor(sections) {
        this.sections = sections;
    }
}
export var ShortcutOverlay = GObject.registerClass(class ShortcutOverlay extends St.BoxLayout {
    constructor() {
        super();
        this.title = '';
        this.columns = new Array();
    }
    _init(title, columns) {
        super.init({
            styleClass: 'pop-shell-shortcuts',
            destroyOnClose: false,
            shellReactive: true,
            shouldFadeIn: true,
            shouldFadeOut: true,
        });
        let columns_layout = new St.BoxLayout({
            styleClass: 'pop-shell-shortcuts-columns',
            horizontal: true,
        });
        for (const column of columns) {
            let column_layout = new St.BoxLayout({
                styleClass: 'pop-shell-shortcuts-column',
            });
            for (const section of column.sections) {
                column_layout.add(this.gen_section(section));
            }
            columns_layout.add(column_layout);
        }
        this.add(new St.Label({
            styleClass: 'pop-shell-shortcuts-title',
            text: title,
        }));
        this.add(columns_layout);
    }
    gen_combination(combination) {
        let layout = new St.BoxLayout({
            styleClass: 'pop-shell-binding',
            horizontal: true,
        });
        for (const key of combination) {
            layout.add(St.Label({ text: key }));
        }
        return layout;
    }
    gen_section(section) {
        let layout = new St.BoxLayout({
            styleclass: 'pop-shell-section',
        });
        layout.add(new St.Label({
            styleClass: 'pop-shell-section-header',
            text: section.header,
        }));
        for (const subsection of section.shortcuts) {
            layout.add(separator());
            layout.add(this.gen_shortcut(subsection));
        }
        return layout;
    }
    gen_shortcut(shortcut) {
        let layout = new St.BoxLayout({
            styleClass: 'pop-shell-shortcut',
            horizontal: true,
        });
        layout.add(new St.Label({
            text: shortcut.description,
        }));
        return layout;
    }
});
