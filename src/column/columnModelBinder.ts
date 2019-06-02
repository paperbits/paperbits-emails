/**
 * @license
 * Copyright Paperbits. All Rights Reserved.
 *
 * Use of this source code is governed by a Commercial license that can be found in the LICENSE file and at https://paperbits.io/license/commercial.
 */
import * as Utils from "@paperbits/common/utils";
import { ColumnModel } from "./columnModel";
import { ColumnContract } from "./columnContract";
import { ModelBinderSelector } from "@paperbits/common/widgets";
import { IModelBinder } from "@paperbits/common/editing";
import { Contract, Bag } from "@paperbits/common";


export class ColumnModelBinder implements IModelBinder<ColumnModel> {
    constructor(private readonly modelBinderSelector: ModelBinderSelector) {
        this.contractToModel = this.contractToModel.bind(this);
    }

    public canHandleContract(contract: Contract): boolean {
        return contract.type === "email-layout-column";
    }

    public canHandleModel(model: Object): boolean {
        return model instanceof ColumnModel;
    }

    public async contractToModel(contract: ColumnContract, bindingContext?: Bag<any>): Promise<ColumnModel> {
        const columnModel = new ColumnModel();

        if (contract.size) {
            columnModel.size = contract.size;
        }

        if (contract.alignment) {
            columnModel.alignment = contract.alignment;
        }

        if (!contract.nodes) {
            contract.nodes = [];
        }

        const modelPromises = contract.nodes.map(async (contract: Contract) => {
            const modelBinder = this.modelBinderSelector.getModelBinderByContract(contract);
            return modelBinder.contractToModel(contract, bindingContext);
        });

        columnModel.widgets = await Promise.all<any>(modelPromises);

        return columnModel;
    }

    public modelToContract(model: ColumnModel): Contract {
        const contract: ColumnContract = {
            type: "email-layout-column",
            nodes: []
        };

        contract.size = model.size;
        contract.alignment = model.alignment;
      

        model.widgets.forEach(widgetModel => {
            const modelBinder = this.modelBinderSelector.getModelBinderByModel(widgetModel);
            contract.nodes.push(modelBinder.modelToContract(widgetModel));
        });

        return contract;
    }
}
