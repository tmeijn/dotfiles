/*
    Copyright 2024 Teal Penguin

    This program is free software: you can redistribute it and/or modify
    it under the terms of the GNU General Public License as published by
    the Free Software Foundation, either version 3 of the License, or
    (at your option) any later version.

    This program is distributed in the hope that it will be useful,
    but WITHOUT ANY WARRANTY; without even the implied warranty of
    MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. See the
    GNU General Public License for more details.

    You should have received a copy of the GNU General Public License
    along with this program.  If not, see <http://www.gnu.org/licenses/>.
*/

import Clutter from "gi://Clutter";
import Gio from "gi://Gio";
import GLib from "gi://GLib";
import GObject from "gi://GObject";
import St from "gi://St";

export class PopupWidgets
{
  /** @type {St.Label[]} */
  #stats;

  /**
    * @param {St.Label[]} stats
    */
  constructor(stats)
  {
    this.#stats = stats;
  }

  /**
    * @param {number} index
    * @param {string} string
    */
  setStatLabel(index, string)
  {
    if(index < this.#stats.length) this.#stats[index].text = string;
  }

  static fromJsObject(obj)
  {
    
  }

}

