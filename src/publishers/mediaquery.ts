/**
 * @license
 * Copyright Paperbits. All Rights Reserved.
 *
 * Use of this source code is governed by a Commercial license that can be found in the LICENSE file and at https://paperbits.io/license/commercial.
 */


import * as cssom from "cssom";
import * as os from "os";
import * as tmp from "cssom/lib/CSSFontFaceRule";

const CSSFontFaceRule = tmp.CSSFontFaceRule;

export function mediaQueryText(css) {
    const rules = cssom.parse(css).cssRules || [];
    const queries = [];
    let queryString;
    let style;
    let property;
    let value;
    let important;
    let result;

    rules.forEach((query) => {
        /* CSS types
		  STYLE: 1,
		  IMPORT: 3,
		  MEDIA: 4,
		  FONT_FACE: 5,
		 */

        if (query.type === cssom.CSSMediaRule.prototype.type) {
            queryString = [];

            queryString.push(os.EOL + "@media " + query.media[0] + " {");

            query.cssRules.forEach((rule) => {
                if (rule.type === cssom.CSSStyleRule.prototype.type || rule.type === CSSFontFaceRule.prototype.type) {
                    queryString.push("  " + (rule.type === cssom.CSSStyleRule.prototype.type ? rule.selectorText : "@font-face") + " {");

                    for (style = 0; style < rule.style.length; style++) {
                        property = rule.style[style];
                        value = rule.style[property];
                        important = rule.style._importants[property] ? " !important" : "";
                        queryString.push("    " + property + ": " + value + important + ";");
                    }
                    queryString.push("  }");
                }
            });

            queryString.push("}");
            result = queryString.length ? queryString.join(os.EOL) + os.EOL : "";

            queries.push(result);
        }
    });

    return queries.join(os.EOL);
}