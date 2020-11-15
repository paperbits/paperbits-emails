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
import parallel from "await-parallel-limit";
import { process } from "./inlineContent";
import { HtmlPageOptimizer, IPublisher } from "@paperbits/common/publishing";
import { EmailService } from "../emailService";
import { EmailContract } from "../emailContract";
import { IBlobStorage, Query, Page } from "@paperbits/common/persistence";
import { ISettingsProvider } from "@paperbits/common/configuration";
import { LayoutViewModelBinder } from "../layout/ko";
import { createDocument } from "@paperbits/core/ko/knockout-rendering";
import { StyleCompiler, StyleManager, StyleSheet } from "@paperbits/common/styles";
import { Logger } from "@paperbits/common/logging";
import { LocalStyleBuilder } from "@paperbits/styles";
import { JssCompiler } from "@paperbits/styles/jssCompiler";

export class EmailPublisher implements IPublisher {
    private localStyleBuilder: LocalStyleBuilder;

    constructor(
        private readonly emailService: EmailService,
        private readonly styleCompiler: StyleCompiler,
        private readonly outputBlobStorage: IBlobStorage,
        private readonly settingsProvider: ISettingsProvider,
        private readonly emailLayoutViewModelBinder: LayoutViewModelBinder,
        private readonly logger: Logger,
        private readonly htmlPageOptimizer: HtmlPageOptimizer
    ) {
        this.localStyleBuilder = new LocalStyleBuilder(this.outputBlobStorage);
    }

    private readFile(filepath: string): Promise<string> {
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

    private async renderEmailTemplate(emailTemplate: EmailContract, globalStyleSheet: StyleSheet, permalinkBaseUrl: string, mediaBaseUrl: string): Promise<void> {
        this.logger.trackEvent("Publishing", { message: `Publishing email template ${emailTemplate.title}...` });

        const styleManager = new StyleManager();
        styleManager.setStyleSheet(globalStyleSheet);

        const bindingContext = {
            styleManager: styleManager
        };

        const templateDocument = createDocument();
        const layoutViewModel = await this.emailLayoutViewModelBinder.getLayoutViewModel(emailTemplate.key, bindingContext);
        ko.applyBindingsToNode(templateDocument.body, { widget: layoutViewModel }, null);
        await Utils.delay(400);

        const resourceUri = `${Utils.slugify(emailTemplate.title)}.html`;

        let htmlContent: string;
        const styleSheets = styleManager.getAllStyleSheets();
        const compiler = new JssCompiler();

        const stylesPath = path.resolve(__dirname, "assets/styles/theme.css");
        let css = await this.readFile(stylesPath);

        styleSheets.forEach(styleSheet => {
            css += " " + compiler.compile(styleSheet);
        });

        const customStyleElement: HTMLStyleElement = templateDocument.createElement("style");
        customStyleElement.setAttribute("type", "text/css");
        customStyleElement.textContent = css.replace(/\n/g, "").replace(/\s\s+/g, " ");

        templateDocument.head.appendChild(customStyleElement);

        this.replacePermalinks(templateDocument.body, permalinkBaseUrl);
        this.replaceSources(templateDocument.body, mediaBaseUrl);
        htmlContent = templateDocument.documentElement.outerHTML;

        htmlContent = await process(htmlContent, {
            baseUrl: mediaBaseUrl,
            removeHtmlSelectors: true,
            applyTableAttributes: true,
            preserveMediaQueries: true,
            applyWidthAttributes: true,
            applyLinkTags: true
        });

        const optimizedHtmlContent = await this.htmlPageOptimizer.optimize(htmlContent);

        document.body.innerHTML = optimizedHtmlContent;

        const contentBytes = Utils.stringToUnit8Array(document.documentElement.outerHTML);

        await this.outputBlobStorage.uploadBlob(`/email-templates/${resourceUri}`, contentBytes);
    }

    public async publish(): Promise<void> {
        const settings = await this.settingsProvider.getSetting<any>("emailTemplates");
        const permalinkBaseUrl = settings.permalinkBaseUrl;
        const mediaBaseUrl = settings.mediaBaseUrl;

        const globalStyleSheet = await this.styleCompiler.getStyleSheet();

        // Building global styles
        this.localStyleBuilder.buildGlobalStyle(globalStyleSheet);

        const query: Query<EmailContract> = Query.from<EmailContract>();
        let pagesOfResults = await this.emailService.search(query);

        do {
            const tasks = [];
            const emailTemplates = pagesOfResults.value;

            for (const emailTemplate of emailTemplates) {
                tasks.push(() => this.renderEmailTemplate(emailTemplate, globalStyleSheet, permalinkBaseUrl, mediaBaseUrl));
            }

            await parallel(tasks, 7);

            if (pagesOfResults.takeNext) {
                pagesOfResults = await pagesOfResults.takeNext();
            }
            else {
                pagesOfResults = null;
            }
        }
        while (pagesOfResults);
    }
}