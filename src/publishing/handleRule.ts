/**
 * @license
 * Copyright Paperbits. All Rights Reserved.
 *
 * Use of this source code is governed by a Commercial license that can be found in the LICENSE file and at https://paperbits.io/license/commercial.
 */

import * as parseCSS from "css-rules";
import { cssSelector } from "./styleSelector";
import { addProps } from "./addProps";

const styleSelector = cssSelector("<style attribute>", [1, 0, 0, 0]);

export function handleRule(rule, $): any[] {
    const sel = rule[0],
        style = rule[1],
        selector = cssSelector(sel),
        editedElements = [];

    $(sel).each((index, el) => {
        let cssText;

        if (!el.styleProps) {
            el.styleProps = {};

            // if the element has inline styles, fake selector with topmost specificity
            if ($(el).attr("style")) {
                cssText = "* { " + $(el).attr("style") + " } ";
                addProps(el, parseCSS(cssText)[0][1], styleSelector);
            }

            // store reference to an element we need to compile style="" attr for
            editedElements.push(el);
        }

        addProps(el, style, selector);
    });

    return editedElements;
}