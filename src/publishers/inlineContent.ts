/**
 * @license
 * Copyright Paperbits. All Rights Reserved.
 *
 * Use of this source code is governed by a Commercial license that can be found in the LICENSE file and at https://paperbits.io/license.
 */

import { StyleInliner } from "./inline-css";
import * as extend from "extend";


export async function process(html: string, options): Promise<string> {
    const opt = extend(true, {
        extraCss: "",
        applyStyleTags: true,
        removeStyleTags: true,
        applyLinkTags: true,
        removeLinkTags: true,
        preserveMediaQueries: false,
        removeHtmlSelectors: false,
        applyWidthAttributes: false,
        applyTableAttributes: false,
        codeBlocks: {
            EJS: { start: "<%", end: "%>" },
            HBS: { start: "{{", end: "}}" }
        },
        xmlMode: false,
        decodeEntities: false,
        lowerCaseTags: true,
        lowerCaseAttributeNames: false,
        recognizeCDATA: false,
        recognizeSelfClosing: false
    }, options);

    return await inlineContent(html, opt);
}

export function inlineContent(html: string, options): Promise<string> {
    return new Promise((resolve, reject) => {
        let content;

        if (!options.url) {
            reject("options.url is required");
        }

        StyleInliner.extractCss(html, options, (err, html, css) => {
            let extraCss;

            if (err) {
                return reject(err);
            }

            extraCss = css + "\n" + options.extraCss;

            try {
                content = StyleInliner.inlineCss(html, extraCss, options);
            }
            catch (e) {
                return reject(e);
            }

            resolve(content);
        });
    });
}