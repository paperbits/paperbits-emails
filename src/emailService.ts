/**
 * @license
 * Copyright Paperbits. All Rights Reserved.
 *
 * Use of this source code is governed by a Commercial license that can be found in the LICENSE file and at https://paperbits.io/license.
 */

import * as Utils from "@paperbits/common/utils";
import { IObjectStorage } from "@paperbits/common/persistence";
import { IBlockService } from "@paperbits/common/blocks";
import { Contract } from "@paperbits/common";
import { EmailContract } from "./emailContract";

const emailTemplatesPath = "emailTemplates";
const documentsPath = "files";
const templateBlockKey = "blocks/new-email-template";

export class EmailService {
    constructor(
        private readonly objectStorage: IObjectStorage,
        private readonly blockService: IBlockService
    ) { }

    private async searchByTags(tags: string[], tagValue: string, startAtSearch: boolean): Promise<EmailContract[]> {
        return this.objectStorage.searchObjects<EmailContract>(emailTemplatesPath, tags, tagValue, startAtSearch);
    }

    public async getEmailTemplateByKey(key: string): Promise<EmailContract> {
        return this.objectStorage.getObject<EmailContract>(key);
    }

    public search(pattern: string): Promise<EmailContract[]> {
        return this.searchByTags(["title"], pattern, true);
    }

    public async deleteEmailTemplate(emailTemplate: EmailContract): Promise<void> {
        const deleteContentPromise = this.objectStorage.deleteObject(emailTemplate.contentKey);
        const deleteEmailTemplatePromise = this.objectStorage.deleteObject(emailTemplate.key);

        await Promise.all([deleteContentPromise, deleteEmailTemplatePromise]);
    }

    public async createEmailTemplate(title: string, description: string): Promise<EmailContract> {
        const identifier = Utils.guid();
        const emailTemplateKey = `${emailTemplatesPath}/${identifier}`;
        const documentKey = `${documentsPath}/${identifier}`;

        const emailTemplate: EmailContract = {
            key: emailTemplateKey,
            title: title,
            description: description,
            contentKey: documentKey
        };

        await this.objectStorage.addObject(emailTemplateKey, emailTemplate);

        const contentTemplate = await this.blockService.getBlockByKey(templateBlockKey);

        await this.objectStorage.addObject(documentKey, { nodes: [contentTemplate.content] });

        return emailTemplate;
    }

    public async updateEmailTemplate(emailTemplate: EmailContract): Promise<void> {
        await this.objectStorage.updateObject<EmailContract>(emailTemplate.key, emailTemplate);
    }

    public async getEmailTemplateContent(templateKey: string): Promise<Contract> {
        const template = await this.getEmailTemplateByKey(templateKey);
        return await this.objectStorage.getObject(template.contentKey);
    }

    public async updateEmailTemplateContent(templateKey: string, document: Contract): Promise<void> {
        const template = await this.getEmailTemplateByKey(templateKey);
        this.objectStorage.updateObject(template.contentKey, document);
    }
}