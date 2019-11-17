/**
 * @license
 * Copyright Paperbits. All Rights Reserved.
 *
 * Use of this source code is governed by a Commercial license that can be found in the LICENSE file and at https://paperbits.io/license/commercial.
 */

import * as ko from "knockout";
import * as Utils from "@paperbits/common/utils";
import * as fs from "fs";
import * as path from "path";
import { process } from "./inlineContent";
import { IPublisher } from "@paperbits/common/publishing";
import { EmailService } from "../emailService";
import { EmailContract } from "../emailContract";
import { IBlobStorage } from "@paperbits/common/persistence";
import { ISettingsProvider } from "@paperbits/common/configuration";
import { LayoutViewModelBinder } from "../layout/ko";
import { createDocument } from "@paperbits/core/ko/knockout-rendering";
import { StyleCompiler } from "@paperbits/styles";

export class EmailPublisher implements IPublisher {
    constructor(
        private readonly emailService: EmailService,
        private readonly styleCompiler: StyleCompiler,
        private readonly outputBlobStorage: IBlobStorage,
        private readonly settingsProvider: ISettingsProvider,
        private readonly emailLayoutViewModelBinder: LayoutViewModelBinder
    ) {
        this.publish = this.publish.bind(this);
        this.renderEmailTemplate = this.renderEmailTemplate.bind(this);
    }

    private readFileAsString(filepath): Promise<string> {
        return new Promise<string>((resolve, reject) => {
            fs.readFile(filepath, "utf8", (error, content) => {
                if (error) {
                    reject(error);
                    return;
                }

                resolve(content);
            });
        });
    }

    private replacePermalinks(container: HTMLElement, permalinkBaseUrl: string): void {
        const elements = container.querySelectorAll("[href]");
        const elementsWithHref: HTMLAnchorElement[] = Array.prototype.slice.call(elements);

        // TODO: Move into inlining code!
        elementsWithHref.forEach(element => {
            if (!element.href.startsWith("http://") && !element.href.startsWith("https://") && !element.href.startsWith("mailto:")) {
                if (!element.href.startsWith("/")) {
                    element.href = "/" + element.href;
                }

                element.href = `${permalinkBaseUrl}${element.href}`;
            }
        });
    }

    private replaceSources(container: HTMLElement, mediaBaseUrl: string): void {
        const elements = container.querySelectorAll("[src]");
        const elementsWithSrc = Array.prototype.slice.call(elements);

        // TODO: Move into inlining code!
        elementsWithSrc.forEach(el => {
            if (!el.src.startsWith("http://") && !el.src.startsWith("https://") && !el.src.startsWith("mailto:")) {
                if (!el.src.startsWith("/")) {
                    el.src = "/" + el.src;
                }

                el.src = `${mediaBaseUrl}${el.src}`;
            }
        });
    }

    private async renderEmailTemplate(emailTemplate: EmailContract, stylesString: string, permalinkBaseUrl: string, mediaBaseUrl: string): Promise<{ name, bytes }> {
        console.log(`Publishing email template ${emailTemplate.title}...`);

        const templateDocument = createDocument();
        const layoutViewModel = await this.emailLayoutViewModelBinder.getLayoutViewModel(emailTemplate.key);
        ko.applyBindingsToNode(templateDocument.body, { widget: layoutViewModel }, null);

        const resourceUri = `${Utils.slugify(emailTemplate.title)}.html`;

        let htmlContent: string;

        const buildContentPromise = new Promise<void>(async (resolve, reject) => {
            setTimeout(() => {
                this.replacePermalinks(templateDocument.body, permalinkBaseUrl);
                this.replaceSources(templateDocument.body, mediaBaseUrl);

                const regexpComment = /\<![ \r\n\t]*(--([^\-]|[\r\n]|-[^\-])*--[ \r\n\t]*)\>/gm;
                const regexpDataBind = /\s?data-bind="([\S\s]*?)"/gm;

                const styleElement: HTMLStyleElement = templateDocument.createElement("style");
                styleElement.innerHTML = stylesString;
                templateDocument.body.appendChild(styleElement);

                htmlContent = templateDocument.documentElement.outerHTML;
                htmlContent = htmlContent.replace(regexpComment, "");
                htmlContent = htmlContent.replace(regexpDataBind, "");
                resolve();
            }, 1000);
        });

        await buildContentPromise;

        htmlContent = await process(htmlContent, {
            baseUrl: mediaBaseUrl,
            removeHtmlSelectors: true,
            applyTableAttributes: true,
            preserveMediaQueries: true,
            applyWidthAttributes: true,
            applyLinkTags: true
        });

        document.body.innerHTML = htmlContent;

        const contentBytes = Utils.stringToUnit8Array(document.documentElement.outerHTML);

        return { name: resourceUri, bytes: contentBytes };
    }

    public async publish(): Promise<void> {
        const emailTemplates = await this.emailService.search("");
        const stylesPath = path.resolve(__dirname, "assets/styles/theme.css");
        const stylesString = await this.readFileAsString(stylesPath);
        const settings = await this.settingsProvider.getSetting<any>("emailTemplates");
        const permalinkBaseUrl = settings.permalinkBaseUrl;
        const mediaBaseUrl = settings.mediaBaseUrl;

        const css = await this.styleCompiler.compileCss();

        for (const emailTemplate of emailTemplates) {
            const result = await this.renderEmailTemplate(emailTemplate, stylesString + " " + css, permalinkBaseUrl, mediaBaseUrl);
            await this.outputBlobStorage.uploadBlob(`/email-templates/${result.name}`, result.bytes);
        }
    }
}