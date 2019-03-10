/**
 * @license
 * Copyright Paperbits. All Rights Reserved.
 *
 * Use of this source code is governed by a Commercial license that can be found in the LICENSE file and at https://paperbits.io/license/commercial.
 */

export function removeClassId(el, $) {
    const selectors = ["class", "id"];

    selectors.forEach((selector) => {
        const attribute = $(el).attr(selector);

        if (typeof attribute !== "undefined") {
            $(el).removeAttr(selector);
        }
    });
}