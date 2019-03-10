/**
 * @license
 * Copyright Paperbits. All Rights Reserved.
 *
 * Use of this source code is governed by a Commercial license that can be found in the LICENSE file and at https://paperbits.io/license/commercial.
 */

import * as specificity from "specificity";

/**
 * Returns specificity based on selector text and tokens.
 *
 * @param {String} selector
 * @param {Array} tokens
 * @api private.
 */
function getSpecificity(text) {
    const spec = specificity.calculate(text);

    return spec[0].specificity.split(",");
}

/**
 * CSS selector constructor.
 *
 * @param {String} selector text
 * @param {Array} optionally, precalculated specificity
 * @api public
 */

export function cssSelector(text, spec?): any {
    let _spec = spec;

    return {
        spec: _spec,
        specificity: () => {
            if (!spec) {
                _spec = getSpecificity(text);
            }
            return _spec;
        }
    };
}
