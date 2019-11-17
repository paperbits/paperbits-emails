/**
 * @license
 * Copyright Paperbits. All Rights Reserved.
 *
 * Use of this source code is governed by a Commercial license that can be found in the LICENSE file and at https://paperbits.io/license/commercial.
 */

import { ModelBinderSelector } from "@paperbits/common/widgets";
import { LayoutModel } from "./layoutModel";
import { Contract, Bag } from "@paperbits/common";
import { EmailService } from "../emailService";
import { EmailContract } from "../emailContract";

export class LayoutModelBinder {
    constructor(
        private readonly emailService: EmailService,
        private readonly modelBinderSelector: ModelBinderSelector) {

        // rebinding...
        this.contractToModel = this.contractToModel.bind(this);
    }

    public canHandleContract(contract: Contract): boolean {
        return contract.type === "email-layout";
    }

    public canHandleModel(model: Object): boolean {
        return model instanceof LayoutModel;
    }

    public async getLayoutModel(emailTemplateKey?: string): Promise<LayoutModel> {
        const emailTemplate = await this.emailService.getEmailTemplateByKey(emailTemplateKey);

        return await this.contractToModel(emailTemplate);
    }

    public async contractToModel(emailContract: EmailContract, bindingContext?: Bag<any>): Promise<LayoutModel> {
        const layoutModel = new LayoutModel();
        layoutModel.key = emailContract.key;
        layoutModel.title = emailContract.title;
        layoutModel.description = emailContract.description;

        const layoutContent = await this.emailService.getEmailTemplateContent(emailContract.key);

        const modelPromises = layoutContent.nodes.map(async (contract: Contract) => {
            const modelBinder = this.modelBinderSelector.getModelBinderByContract(contract);
            return await modelBinder.contractToModel(contract, bindingContext);
        });

        const widgetModels = await Promise.all<any>(modelPromises);
        layoutModel.widgets = widgetModels;

        return layoutModel;
    }

    public modelToContract(layoutModel: LayoutModel): Contract {
        const layoutConfig: Contract = {
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