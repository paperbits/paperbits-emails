/**
 * @license
 * Copyright Paperbits. All Rights Reserved.
 *
 * Use of this source code is governed by a Commercial license that can be found in the LICENSE file and at https://paperbits.io/license/commercial.
 */

import { SectionContract } from "./sectionContract";
import { SectionModel } from "./sectionModel";
import { IModelBinder } from "@paperbits/common/editing";
import { BackgroundModelBinder } from "@paperbits/common/widgets/background";
import { Contract, Bag } from "@paperbits/common";
import { ModelBinderSelector, WidgetModel } from "@paperbits/common/widgets";

export class SectionModelBinder implements IModelBinder<SectionModel> {
    public canHandleContract(contract: Contract): boolean {
        return contract.type === "email-layout-section";
    }

    public canHandleModel(model: Object): boolean {
        return model instanceof SectionModel;
    }

    constructor(private readonly modelBinderSelector: ModelBinderSelector) { }

    public async contractToModel(contract: SectionContract, bindingContext?: Bag<any>): Promise<SectionModel> {
        const model = new SectionModel();

        contract.nodes = contract.nodes || [];
        model.styles = contract.styles || {};

        const modelPromises = contract.nodes.map(async (contract: Contract) => {
            const modelBinder = this.modelBinderSelector.getModelBinderByContract<any>(contract);
            return await modelBinder.contractToModel(contract, bindingContext);
        });

        model.widgets = await Promise.all<any>(modelPromises);

        return model;
    }

    public modelToContract(sectionModel: SectionModel): Contract {
        const sectionContract: SectionContract = {
            type: "email-layout-section",
            styles: sectionModel.styles,
            nodes: []
        };

        sectionModel.widgets.forEach(widgetModel => {
            const modelBinder = this.modelBinderSelector.getModelBinderByModel(widgetModel);
            sectionContract.nodes.push(modelBinder.modelToContract(widgetModel));
        });

        return sectionContract;
    }
}
