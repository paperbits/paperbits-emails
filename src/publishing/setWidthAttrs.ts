/**
 * @license
 * Copyright Paperbits. All Rights Reserved.
 *
 * Use of this source code is governed by a Commercial license that can be found in the LICENSE file and at https://paperbits.io/license/commercial.
 */

const widthElements = [ "table", "td", "img" ];

export function setWidthAttrs (el, $) {
    let i,
        pxWidth;

    if (widthElements.indexOf(el.name) > -1) {
        for (i in el.styleProps) {
            if (el.styleProps[i].prop === "width" && el.styleProps[i].value.match(/px/)) {
                pxWidth = el.styleProps[i].value.replace("px", "");

                $(el).attr("width", pxWidth);
                return;
            }
        }
    }
}
