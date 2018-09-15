/**
 * @license
 * Copyright Paperbits. All Rights Reserved.
 *
 * Use of this source code is governed by a Commercial license that can be found in the LICENSE file and at https://paperbits.io/license.
 */

import { cssSelector } from "./styleSelector";
import { cssProperty } from "./cssProperty";

const importantSelector = cssSelector("<!important>", [2, 0, 0, 0]);

function getProperty(style, name, selector) {
    const value = style[name];
    const sel = style._importants[name] ? importantSelector : selector;

    return cssProperty(name, value, sel);
}

// go through the properties
export function addProps(el, style, selector) {
    let i,
        name,
        prop,
        existing,
        winner;

    for (i = 0; i < style.length; i++) {
        name = style[i];
        prop = getProperty(style, name, selector);
        existing = el.styleProps[name];

        if (existing) {
            winner = existing.compare(prop);

            if (winner === prop) {
                el.styleProps[name] = prop;
            }
        }
        else {
            el.styleProps[name] = prop;
        }
    }
};
