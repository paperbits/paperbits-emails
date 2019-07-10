/**
 * @license
 * Copyright Paperbits. All Rights Reserved.
 *
 * Use of this source code is governed by a Commercial license that can be found in the LICENSE file and at https://paperbits.io/license/commercial.
 */

import { cssSelector } from "./styleSelector";
import { cssProperty } from "./cssProperty";

const importantSelector = cssSelector("<!important>", [2, 0, 0, 0]);

function getProperty(styles, name, selector) {
    const value = styles[name];
    const sel = styles._importants[name] ? importantSelector : selector;

    return cssProperty(name, value, sel);
}

// go through the properties
export function addProps(el, styles, selector): void {
    let i,
        name,
        prop,
        existing,
        winner;

    for (i = 0; i < styles.length; i++) {
        name = styles[i];
        prop = getProperty(styles, name, selector);
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
}