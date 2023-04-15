/**
 * @license
 * Copyright Paperbits. All Rights Reserved.
 *
 * Use of this source code is governed by a Commercial license that can be found in the LICENSE file and at https://paperbits.io/license/commercial.
 */

import { LayoutModel } from "./layoutModel";
import { Contract, Bag } from "@paperbits/common";
import { EmailService } from "../emailService";
import { EmailContract } from "../emailContract";
import { ContainerModelBinder } from "@paperbits/common/editing";

export class LayoutModelBinder {
    constructor(
        private readonly emailService: EmailService,
        private readonly containerModelBinder: ContainerModelBinder
    ) {

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
        layoutModel.widgets = await this.containerModelBinder.getChildModels(layoutContent.nodes, bindingContext);

        return layoutModel;
    }

    public modelToContract(layoutModel: LayoutModel): Contract {
        const layoutConfig: Contract = {
            type: "email-layout",
            nodes: this.containerModelBinder.getChildContracts(layoutModel.widgets)
        };

        return layoutConfig;
    }
}