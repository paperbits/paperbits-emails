/**
 * @license
 * Copyright Paperbits. All Rights Reserved.
 *
 * Use of this source code is governed by a Commercial license that can be found in the LICENSE file and at https://paperbits.io/license.
 */

import * as ko from "knockout";
import * as Utils from "@paperbits/common/utils";
import { process } from "./inlineContent";
import { IPublisher } from "@paperbits/common/publishing";
import { EmailService } from "../emailService";
import { EmailContract } from "../emailContract";
import { IBlobStorage } from "@paperbits/common/persistence";
import { LayoutViewModelBinder } from "../layout/ko";
import { createDocument } from "@paperbits/core/ko/knockout-rendring";

export class EmailPublisher implements IPublisher {
    constructor(
        private readonly emailService: EmailService,
        private readonly outputBlobStorage: IBlobStorage,
        private readonly emailLayoutViewModelBinder: LayoutViewModelBinder
    ) {
        this.publish = this.publish.bind(this);
        this.renderEmailTemplate = this.renderEmailTemplate.bind(this);
    }

    private async renderEmailTemplate(emailTemplate: EmailContract, stylesString: string): Promise<{ name, bytes }> {
        console.log(`Publishing email template ${emailTemplate.title}...`);

        const templateDocument = createDocument();
        const layoutViewModel = await this.emailLayoutViewModelBinder.getLayoutViewModel();
        ko.applyBindingsToNode(templateDocument.body, { widget: layoutViewModel });

        const resourceUri = `email-templates/${Utils.slugify(emailTemplate.title)}.html`;

        let htmlContent: string;

        const buildContentPromise = new Promise<void>(async (resolve, reject) => {
            setTimeout(() => {
                const links = templateDocument.body.querySelectorAll("[href]");
                const linkElements: HTMLAnchorElement[] = Array.prototype.slice.call(links);

                // TODO: Move into inlining code!
                linkElements.forEach(link => {
                    const baseUrl = "https://paperbits.io/"

                    if (!link.href.startsWith("http://") && !link.href.startsWith("https://") && !link.href.startsWith("mailto:")) {
                        if (!link.href.startsWith("/")) {
                            link.href = "/" + link.href;
                        }

                        link.href = `${baseUrl}${link.href}`;
                    }
                });

                const regexpComment = /\<![ \r\n\t]*(--([^\-]|[\r\n]|-[^\-])*--[ \r\n\t]*)\>/gm;
                const regexpDataBind = /\s?data-bind="([\S\s]*?)"/gm;

                const styleElement: HTMLStyleElement = templateDocument.createElement("style");
                styleElement.innerHTML = stylesString;
                templateDocument.body.appendChild(styleElement);

                htmlContent = templateDocument.documentElement.outerHTML;
                htmlContent = htmlContent.replace(regexpComment, "");
                htmlContent = htmlContent.replace(regexpDataBind, "");

                resolve();
            }, 10);
        });

        await buildContentPromise;

        htmlContent = await process(htmlContent, {
            baseUrl: "https://paperbits.io/",
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
        const emailStylesContent = await this.outputBlobStorage.downloadBlob(`email-templates\\theme.css`);
        const stylesString = Utils.uint8ArrayToString(emailStylesContent);

        for (const emailTemplate of emailTemplates) {
            const result = await this.renderEmailTemplate(emailTemplate, stylesString);
            await this.outputBlobStorage.uploadBlob(`email-templates\\${result.name}`, result.bytes);
        }
    }
}