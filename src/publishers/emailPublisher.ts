/**
 * @license
 * Copyright Paperbits. All Rights Reserved.
 *
 * Use of this source code is governed by a Commercial license that can be found in the LICENSE file and at https://paperbits.io/license.
 */

import * as ko from "knockout";
import { process } from "./inlineContent";
import * as Utils from "@paperbits/common/utils";
import { IPublisher } from "@paperbits/common/publishing";
import { EmailService } from "../emailService";
import { EmailContract } from "../emailContract";
import { IBlobStorage } from "@paperbits/common/persistence";
import { LayoutModelBinder } from "../layout";
import { LayoutViewModelBinder } from "../layout/ko";
import { createDocument } from "@paperbits/core/ko/knockout-rendring";
import { ISettingsProvider } from "@paperbits/common/configuration";

export class EmailPublisher implements IPublisher {
    constructor(
        private readonly emailService: EmailService,
        private readonly outputBlobStorage: IBlobStorage,
        private readonly emailLayoutModelBinder: LayoutModelBinder,
        private readonly emailLayoutViewModelBinder: LayoutViewModelBinder,
        private readonly settingsProvider: ISettingsProvider
    ) {
        this.publish = this.publish.bind(this);
        this.renderEmailTemplate = this.renderEmailTemplate.bind(this);
    }

    private async renderEmailTemplate(emailTemplate: EmailContract, stylesString: string): Promise<{ name, bytes }> {
        console.log(`Publishing email template ${emailTemplate.title}...`);

        const template = <string>await this.settingsProvider.getSetting("emailTemplate");
        const templateDocument = createDocument(template);

        const resourceUri = `email-templates/${Utils.slugify(emailTemplate.title)}.html`;

        let htmlContent: string;

        const buildContentPromise = new Promise<void>(async (resolve, reject) => {
            const layoutModel = await this.emailLayoutModelBinder.getLayoutModel(emailTemplate.key);
            const viewModel = await this.emailLayoutViewModelBinder.modelToViewModel(layoutModel);

            const element = templateDocument.createElement("div");
            element.innerHTML = `
            <style>${stylesString}</style>
            <table border="0" cellspacing="0" cellpadding="0" align="center">
    <tbody>
        <tr>
            <td>
                <!-- ko foreach: { data: widgets, as: 'widget'  } -->
                <!-- ko widget: widget -->
                <!-- /ko -->
                <!-- /ko -->
            </td>
        </tr>
    </tbody>
</table>`;

            ko.applyBindings(viewModel, element);

            setTimeout(() => {
                const links = element.querySelectorAll("[href]");

                // TODO: Move into inlining code!
                Array.prototype.slice.call(links).forEach(link => {
                    const baseUrl = "https://paperbits.io/images"

                    if (!link.href.startsWith("http://") && !link.href.startsWith("https://") && !link.href.startsWith("mailto:")) {
                        if (!link.href.startsWith("/")) {
                            link.href = "/" + link.href;
                        }

                        link.href = `${baseUrl}${link.href}`;
                    }
                });

                const regexpComment = /\<![ \r\n\t]*(--([^\-]|[\r\n]|-[^\-])*--[ \r\n\t]*)\>/gm;
                const regexpDataBind = /\s?data-bind="([\S\s]*?)"/gm;

                // htmlContent = templateDocument.documentElement.outerHTML;
                htmlContent = element.innerHTML;
                htmlContent = htmlContent.replace(regexpComment, "");
                htmlContent = htmlContent.replace(regexpDataBind, "");
                resolve();
            }, 10);
        });

        await buildContentPromise;

        htmlContent = await process(htmlContent, {
            url: "https://paperbits.io/",
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