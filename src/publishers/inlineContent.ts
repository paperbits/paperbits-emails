/**
 * @license
 * Copyright Paperbits. All Rights Reserved.
 *
 * Use of this source code is governed by a Commercial license that can be found in the LICENSE file and at https://paperbits.io/license/commercial.
 */

import { StyleInliner } from "./inline-css";
import * as extend from "extend";

export interface InlinerOptions {
    baseUrl?: string;
    extraCss?: string;
    removeHtmlSelectors?: boolean;
    applyTableAttributes?: boolean;
    preserveMediaQueries?: boolean;
    applyWidthAttributes?: boolean;
    applyLinkTags?: boolean;
    codeBlocks?: any;
    removeLinkTags?: boolean;
}

export async function process(html: string, options: InlinerOptions): Promise<string> {
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

export async function inlineContent(html: string, options: InlinerOptions): Promise<string> {
    if (!options.baseUrl) {
        throw new Error("options.url is required");
    }

    const result = await StyleInliner.extractCss(html, options);
    const extraCss = result.css + "\n" + options.extraCss;
    const content = StyleInliner.inlineCss(result.html, extraCss, options);

    return content;
}