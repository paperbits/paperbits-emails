/**
 * @license
 * Copyright Paperbits. All Rights Reserved.
 *
 * Use of this source code is governed by a Commercial license that can be found in the LICENSE file and at https://paperbits.io/license.
 */

import { IRouteHandler } from "@paperbits/common/routing";
import { IFileService } from "@paperbits/common/files";
import { ModelBinderSelector } from "@paperbits/common/widgets";
import { LayoutModel } from "./layoutModel";
import { ILayoutService, LayoutContract } from "@paperbits/common/layouts";
import { Contract } from "@paperbits/common";
import { EmailService } from "../emailService";
import { EmailContract } from "../emailContract";

export class LayoutModelBinder {
    constructor(
        private readonly emailService: EmailService,
        private readonly fileService: IFileService,
        private readonly modelBinderSelector: ModelBinderSelector) {

        // rebinding...
        this.contractToModel = this.contractToModel.bind(this);
    }

    public canHandleWidgetType(widgetType: string): boolean {
        return widgetType === "email-layout";
    }

    public canHandleModel(model: Object): boolean {
        return model instanceof LayoutModel;
    }

    public async getLayoutModel(emailTemplateKey?: string): Promise<LayoutModel> {
        const emailTemplate = await this.emailService.getEmailTemplateByKey(emailTemplateKey || "emailTemplates/c17ea920-cc6b-b3b5-6da4-ef8d19b758ff");

        return await this.contractToModel(emailTemplate);
    }

    public async contractToModel(emailContract: EmailContract): Promise<LayoutModel> {
        const layoutModel = new LayoutModel();
        layoutModel.title = emailContract.title;
        layoutModel.description = emailContract.description;

        const emailContentNode = await this.fileService.getFileByKey(emailContract.contentKey);

        const modelPromises = emailContentNode.nodes.map(async (nodeContract) => {
            const modelBinder = this.modelBinderSelector.getModelBinderByNodeType(nodeContract.type);
            return await modelBinder.contractToModel(nodeContract);
        });

        const widgetModels = await Promise.all<any>(modelPromises);
        layoutModel.widgets = widgetModels;

        return layoutModel;
    }

    public modelToContract(layoutModel: LayoutModel): Contract {
        const layoutConfig: Contract = {
            object: "block",
            type: "email-layout",
            nodes: []
        };
        layoutModel.widgets.forEach(model => {
            const modelBinder = this.modelBinderSelector.getModelBinderByModel(model);
            layoutConfig.nodes.push(modelBinder.modelToContract(model));
        });

        return layoutConfig;
    }

    public async setConfig(layout: LayoutContract, config: Contract): Promise<void> {
        const file = await this.fileService.getFileByKey(layout.contentKey);

        Object.assign(file, config);

        await this.fileService.updateFile(file);
    }

    public async updateContent(layoutModel: LayoutModel): Promise<void> {
        const emailContract = await this.emailService.getEmailTemplateByKey("emailTemplates/c17ea920-cc6b-b3b5-6da4-ef8d19b758ff");
        const file = await this.fileService.getFileByKey(emailContract.contentKey);
        const config = this.modelToContract(layoutModel);

        Object.assign(file, config);

        await this.fileService.updateFile(file);
    }
}