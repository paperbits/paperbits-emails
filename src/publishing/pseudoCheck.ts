/**
 * @license
 * Copyright Paperbits. All Rights Reserved.
 *
 * Use of this source code is governed by a Commercial license that can be found in the LICENSE file and at https://paperbits.io/license/commercial.
 */

const parser = require("slick").parse;

/**
 * Parses a selector and returns the tokens.
 *
 * @param {String} selector
 */
function parse(text: string) {
    try {
        return parser(text)[0];
    }
    catch (e) {
        return [];
    }
}

export function pseudoCheck(rule) {
    let i;
    let j;
    let subSelPseudos;
    const ignoredPseudos = ["hover", "active", "focus", "visited", "link"];

    // skip rule if the selector has any pseudos which are ignored
    const parsedSelector = parse(rule[0]);

    for (i = 0; i < parsedSelector.length; ++i) {
        subSelPseudos = parsedSelector[i].pseudos;

        if (subSelPseudos) {
            for (j = 0; j < subSelPseudos.length; ++j) {
                if (ignoredPseudos.indexOf(subSelPseudos[j].name) >= 0) {
                    return true;
                }
            }
        }
        else {
            return false;
        }
    }
}