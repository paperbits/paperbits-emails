/**
 * @license
 * Copyright Paperbits. All Rights Reserved.
 *
 * Use of this source code is governed by a Commercial license that can be found in the LICENSE file and at https://paperbits.io/license.
 */

import * as parseCSS from "css-rules";
import * as cheerio from "cheerio";
import * as flatten from "flatten";
import * as pick from "object.pick";
import * as extend from "extend";
import * as Batch from "batch";
import * as url from "url";
import * as fs from "fs";
import { pseudoCheck } from "./pseudoCheck";
import { handleRule } from "./handleRule";
import { setWidthAttrs } from "./setWidthAttrs";
import { removeClassId } from "./removeClassId";
import { mediaQueryText } from "./mediaquery";



cheerio.prototype.resetAttr = function (attribute) {
    if (!this.attr(attribute)) {
        this.attr(attribute, 0);
    }
    return this;
};

export class StyleInliner {
    public static applyStylesAsProps($el, styleToAttrMap) {
        let style;
        let styleVal;

        for (style in styleToAttrMap) {
            styleVal = $el.css(style);

            if (styleVal !== undefined) {
                $el.attr(styleToAttrMap[style], styleVal);
                $el.css(style, "");
            }
        }
    }

    public static batchApplyStylesAsProps($el, sel, $): void {
        $el.find(sel).each((i, childEl) => {
            StyleInliner.applyStylesAsProps($(childEl), tableStyleAttrMap[sel]);
        });
    }

    public static setTableAttrs(el, $): void {
        let selector,
            $el = $(el);

        $el = $el.resetAttr("border")
            .resetAttr("cellpadding")
            .resetAttr("cellspacing");

        for (selector in tableStyleAttrMap) {
            if (selector === "table") {
                StyleInliner.applyStylesAsProps($el, tableStyleAttrMap.table);
            }
            else {
                StyleInliner.batchApplyStylesAsProps($el, selector, $);
            }
        }
    }

    public static inlineCss(html: string, css?, options?) {
        const opts = options || {};
        let rules;
        let editedElements = [];
        const codeBlockLookup = [];

        const encodeCodeBlocks = (_html: string) => {
            let __html = _html;
            const blocks = opts.codeBlocks;

            Object.keys(blocks).forEach((key) => {
                const re = new RegExp(blocks[key].start + "([\\S\\s]*?)" + blocks[key].end, "g");

                __html = __html.replace(re, (match) => {
                    codeBlockLookup.push(match);
                    return "EXCS_CODE_BLOCK_" + (codeBlockLookup.length - 1) + "_";
                });
            });
            return __html;
        };

        const decodeCodeBlocks = (_html) => {
            let index, re;
            let __html = _html;

            for (index = 0; index < codeBlockLookup.length; index++) {
                re = new RegExp(`EXCS_CODE_BLOCK_${index}_(="")?`, "gi");
                __html = StyleInliner.replaceCodeBlock(__html, re, codeBlockLookup[index]);
            }
            return __html;
        };

        const encodeEntities = (_html) => {
            return encodeCodeBlocks(_html);
        };

        const decodeEntities = (_html) => {
            return decodeCodeBlocks(_html);
        };


        const $ = cheerio.load(encodeEntities(html), pick(opts, [
            "xmlMode",
            "decodeEntities",
            "lowerCaseTags",
            "lowerCaseAttributeNames",
            "recognizeCDATA",
            "recognizeSelfClosing"
        ]));

        try {
            rules = parseCSS(css);
        }
        catch (err) {
            throw new Error(err);
        }

        rules.forEach((rule) => {
            let el;
            let ignoredPseudos;

            ignoredPseudos = pseudoCheck(rule);

            if (ignoredPseudos) {
                return false;
            }

            try {
                el = handleRule(rule, $);

                editedElements.push(el);
            }
            catch (err) {
                // skip invalid selector
                return false;
            }
        });

        // flatten array if nested
        editedElements = flatten(editedElements);

        editedElements.forEach((el) => {
            this.setStyleAttrs(el, $);

            if (opts.applyWidthAttributes) {
                setWidthAttrs(el, $);
            }

            if (opts.removeHtmlSelectors) {
                removeClassId(el, $);
            }
        });

        if (opts.applyTableAttributes) {
            $("table").each((index, el) => {
                StyleInliner.setTableAttrs(el, $);
            });
        }

        return decodeEntities($.html());
    }

    public static replaceCodeBlock(html: string, re, block): string {
        return html.replace(re, () => {
            return block;
        });
    }

    public static setStyleAttrs(el, $): void {
        let i;
        let style = [];

        for (i in el.styleProps) {
            const styleProp = el.styleProps[i];

            // add !important
            if (typeof styleProp.selector.spec !== "undefined") {
                if (styleProp.selector.spec[0] === 2) {
                    styleProp.value += " !important";
                }
            }

            const regex = /url\(["'](.*)\"\)/gm;
            const matches = regex.exec(styleProp.value);

            const baseUrl = "https://paperbits.io/images";

            if (matches && matches.length === 2) {
                let url = matches[1];

                if (!url.startsWith("http://") && !url.startsWith("https://")) {
                    if (!url.startsWith("/")) {
                        url = "/" + url;
                    }

                    styleProp.value = `url("${baseUrl}${url}")`;
                }
            }

            style.push(styleProp.prop + ": " + styleProp.value.replace(/["]/g, "'") + ";");
        }

        // sorting will arrange styles like padding: before padding-bottom: which will preserve the expected styling
        style = style.sort((a, b) => {
            const aProp = a.split(":")[0],
                bProp = b.split(":")[0];

            return (aProp > bProp ? 1 : aProp < bProp ? -1 : 0);
        });

        $(el).attr("style", style.join(" "));
    }

    public static extractCss(html: string, options, callback) {
        const batch = new Batch();
        const data = StyleInliner.getStylesheetList(html, options);

        batch.push((cb) => {
            StyleInliner.getStylesData(data.html, options, cb);
        });

        data.hrefs.forEach((stylesheetHref) => {
            batch.push((cb) => {
                StyleInliner.getHrefContent(stylesheetHref, options.url, cb);
            });
        });

        batch.end((err, results) => {
            let stylesData,
                css;

            if (err) {
                return callback(err);
            }

            stylesData = results.shift();

            results.forEach((content) => {
                stylesData.css.push(content);
            });

            css = stylesData.css.join("\n");

            return callback(null, stylesData.html, css);
        });
    }

    public static getHrefContent(destHref, sourceHref, callback) {
        let resolvedUrl,
            parsedUrl,
            toUrl = destHref;

        if (url.parse(sourceHref).protocol === "file:" && destHref[0] === "/") {
            toUrl = destHref.slice(1);
        }

        resolvedUrl = url.resolve(sourceHref, toUrl);
        parsedUrl = url.parse(resolvedUrl);

        if (parsedUrl.protocol === "file:") {
            fs.readFile(decodeURIComponent(parsedUrl.pathname), "utf8", callback);
        }
        else {
            // getRemoteContent(resolvedUrl, callback);
        }
    }

    public static getStylesheetList(sourceHtml: string, options) {
        const results: any = {};
        const codeBlocks = {
            EJS: { start: "<%", end: "%>" },
            HBS: { start: "{{", end: "}}" }
        };

        const codeBlockLookup = [];

        const encodeCodeBlocks = (html: string): string => {
            const blocks = extend(codeBlocks, options.codeBlocks);

            Object.keys(blocks).forEach((key) => {
                const re = new RegExp(blocks[key].start + "([\\S\\s]*?)" + blocks[key].end, "g");

                html = html.replace(re, (match) => {
                    codeBlockLookup.push(match);
                    return "EXCS_CODE_BLOCK_" + (codeBlockLookup.length - 1) + "_";
                });
            });

            return html;
        };

        const decodeCodeBlocks = (html: string): string => {
            let index, re;

            for (index = 0; index < codeBlockLookup.length; index++) {
                re = new RegExp("EXCS_CODE_BLOCK_" + index + '_(="")?', "gi");
                html = StyleInliner.replaceCodeBlock(html, re, codeBlockLookup[index]);
            }

            return html;
        };

        const encodeEntities = (html: string): string => {
            return encodeCodeBlocks(html);
        };

        const decodeEntities = (html: string): string => {
            return decodeCodeBlocks(html);
        };

        const $ = cheerio.load(encodeEntities(sourceHtml),
            extend({ decodeEntities: false },
                pick(options, [
                    "xmlMode",
                    "decodeEntities",
                    "lowerCaseTags",
                    "lowerCaseAttributeNames",
                    "recognizeCDATA",
                    "recognizeSelfClosing"
                ])));

        results.hrefs = [];

        $("link").each((index, element) => {
            const $el = $(element);

            if ($el.attr("rel") && $el.attr("rel").toLowerCase() === "stylesheet") {
                if (options.applyLinkTags) {
                    results.hrefs.push($el.attr("href"));
                }
                if (options.removeLinkTags) {
                    $el.remove();
                }
            }
        });

        results.html = decodeEntities($.html());

        return results;
    }

    public static getStylesData(html, options, callback) {
        const results: any = {};
        const codeBlocks = {
            EJS: { start: "<%", end: "%>" },
            HBS: { start: "{{", end: "}}" }
        };

        const codeBlockLookup = [];

        const encodeCodeBlocks = (_html) => {
            let __html = _html;
            let blocks = extend(codeBlocks, options.codeBlocks);

            Object.keys(blocks).forEach((key) => {
                const re = new RegExp(blocks[key].start + "([\\S\\s]*?)" + blocks[key].end, "g");

                __html = __html.replace(re, (match) => {
                    codeBlockLookup.push(match);
                    return "EXCS_CODE_BLOCK_" + (codeBlockLookup.length - 1) + "_";
                });
            });
            return __html;
        };

        const decodeCodeBlocks = (_html) => {
            let index, re,
                __html = _html;

            for (index = 0; index < codeBlockLookup.length; index++) {
                re = new RegExp("EXCS_CODE_BLOCK_" + index + '_(="")?', "gi");
                __html = StyleInliner.replaceCodeBlock(__html, re, codeBlockLookup[index]);
            }
            return __html;
        };

        const encodeEntities = (_html) => {
            return encodeCodeBlocks(_html);
        };

        const decodeEntities = (_html) => {
            return decodeCodeBlocks(_html);
        };

        let styleDataList;
        let styleData;

        const $ = cheerio.load(encodeEntities(html), extend({
            decodeEntities: false
        }, pick(options, [
            "xmlMode",
            "decodeEntities",
            "lowerCaseTags",
            "lowerCaseAttributeNames",
            "recognizeCDATA",
            "recognizeSelfClosing"
        ])));

        results.css = [];

        $("style").each((index, element) => {
            let mediaQueries;

            // if data-embed property exists, skip inlining and removing
            if (typeof $(element).data("embed") !== "undefined") {
                return;
            }

            styleDataList = element.childNodes;
            if (styleDataList.length !== 1) {
                callback(new Error("empty style element"));
                return;
            }
            styleData = styleDataList[0].data;

            if (options.applyStyleTags) {
                results.css.push(styleData);
            }

            if (options.removeStyleTags) {
                if (options.preserveMediaQueries) {
                    mediaQueries = mediaQueryText(element.childNodes[0].nodeValue);
                    element.childNodes[0].nodeValue = mediaQueries;
                }
                if (!mediaQueries) {
                    $(element).remove();
                }
            }
        });

        results.html = decodeEntities($.html());

        callback(null, results);
    }
}

const tableStyleAttrMap = {
    "table": {
        "float": "align",
        "background-color": "bgcolor",
        "width": "width",
        "height": "height"
    },
    "tr": {
        "background-color": "bgcolor",
        "vertical-align": "valign",
        "text-align": "align"
    },
    "td,th": {
        "background-color": "bgcolor",
        "width": "width",
        "height": "height",
        "vertical-align": "valign",
        "text-align": "align",
        "white-space": "nowrap"
    },
    "tbody,thead,tfoot": {
        "vertical-align": "valign",
        "text-align": "align"
    }
};
