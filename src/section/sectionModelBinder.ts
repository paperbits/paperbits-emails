/**
 * @license
 * Copyright Paperbits. All Rights Reserved.
 *
 * Use of this source code is governed by a Commercial license that can be found in the LICENSE file and at https://paperbits.io/license/commercial.
 */

import { SectionContract } from "./sectionContract";
import { SectionModel } from "./sectionModel";
import { CollectionModelBinder, IModelBinder } from "@paperbits/common/editing";
import { Contract, Bag } from "@paperbits/common";

export class SectionModelBinder implements IModelBinder<SectionModel> {
    public canHandleContract(contract: Contract): boolean {
        return contract.type === "email-layout-section";
    }

    public canHandleModel(model: Object): boolean {
        return model instanceof SectionModel;
    }

    constructor(private readonly containerModelBinder: CollectionModelBinder) { }

    public async contractToModel(contract: SectionContract, bindingContext?: Bag<any>): Promise<SectionModel> {
        const model = new SectionModel();

        contract.nodes = contract.nodes || [];
        model.styles = contract.styles || {};
        model.widgets = await this.containerModelBinder.getChildModels(contract.nodes, bindingContext);

        return model;
    }

    public modelToContract(sectionModel: SectionModel): Contract {
        const sectionContract: SectionContract = {
            type: "email-layout-section",
            styles: sectionModel.styles,
            nodes: this.containerModelBinder.getChildContracts(sectionModel.widgets)
        };

        return sectionContract;
    }
}
