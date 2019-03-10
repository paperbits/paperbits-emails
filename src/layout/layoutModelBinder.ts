/**
 * @license
 * Copyright Paperbits. All Rights Reserved.
 *
 * Use of this source code is governed by a Commercial license that can be found in the LICENSE file and at style-guidehttps://paperbits.io/license/mit.
 */

import { ModelBinderSelector } from "@paperbits/common/widgets";
import { LayoutModel } from "./layoutModel";
import { Contract } from "@paperbits/common";
import { EmailService } from "../emailService";
import { EmailContract } from "../emailContract";

export class LayoutModelBinder {
    constructor(
        private readonly emailService: EmailService,
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
        const emailTemplate = await this.emailService.getEmailTemplateByKey(emailTemplateKey);

        return await this.contractToModel(emailTemplate);
    }

    public async contractToModel(emailContract: EmailContract): Promise<LayoutModel> {
        const layoutModel = new LayoutModel();
        layoutModel.title = emailContract.title;
        layoutModel.description = emailContract.description;

        const layoutContent = await this.emailService.getEmailTemplateContent(emailContract.key);

        const modelPromises = layoutContent.nodes.map(async (nodeContract) => {
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
}