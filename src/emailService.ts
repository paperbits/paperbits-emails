/**
 * @license
 * Copyright Paperbits. All Rights Reserved.
 *
 * Use of this source code is governed by a Commercial license that can be found in the LICENSE file and at https://paperbits.io/license/commercial.
 */

import * as Utils from "@paperbits/common/utils";
import { IObjectStorage, Query, Operator } from "@paperbits/common/persistence";
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

    public async getEmailTemplateByKey(key: string): Promise<EmailContract> {
        return this.objectStorage.getObject<EmailContract>(key);
    }

    public async search(pattern: string): Promise<EmailContract[]> {
        const query = Query
            .from<EmailContract>()
            .where("title", Operator.contains, pattern)
            .orderBy("title");

        const result = await this.objectStorage.searchObjects<EmailContract>(emailTemplatesPath, query);

        if (!result) {
            return [];
        }

        return Object.values(result);
    }

    public async deleteEmailTemplate(emailTemplate: EmailContract): Promise<void> {
        const deleteContentPromise = this.objectStorage.deleteObject(emailTemplate.contentKey);
        const deleteEmailTemplatePromise = this.objectStorage.deleteObject(emailTemplate.key);

        await Promise.all([deleteContentPromise, deleteEmailTemplatePromise]);
    }

    public async createEmailTemplate(title: string, description: string): Promise<EmailContract> {
        const identifier = Utils.guid();
        const emailTemplateKey = `${emailTemplatesPath}/${identifier}`;
        const contentKey = `${documentsPath}/${identifier}`;

        const emailTemplate: EmailContract = {
            key: emailTemplateKey,
            title: title,
            description: description,
            contentKey: contentKey
        };

        await this.objectStorage.addObject(emailTemplateKey, emailTemplate);

        const template = await this.blockService.getBlockContent(templateBlockKey);

        await this.objectStorage.addObject(contentKey, template);

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