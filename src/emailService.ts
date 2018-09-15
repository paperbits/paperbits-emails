/**
 * @license
 * Copyright Paperbits. All Rights Reserved.
 *
 * Use of this source code is governed by a Commercial license that can be found in the LICENSE file and at https://paperbits.io/license.
 */

import * as Utils from "@paperbits/common/utils";
import { IObjectStorage } from "@paperbits/common/persistence";
import { EmailContract } from "./emailContract";

const emailTemplatesPath = "emailTemplates";

export class EmailService {
    constructor(
        private readonly objectStorage: IObjectStorage) { }

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
        const key = `${emailTemplatesPath}/${Utils.guid()}`;

        const emailTemplate: EmailContract = {
            key: key,
            title: title,
            description: description
        };

        await this.objectStorage.addObject(key, emailTemplate);

        return emailTemplate;
    }

    public async updateEmailTemplate(emailTemplate: EmailContract): Promise<void> {
        await this.objectStorage.updateObject<EmailContract>(emailTemplate.key, emailTemplate);
    }
}