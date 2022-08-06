/**
 * @license
 * Copyright Paperbits. All Rights Reserved.
 *
 * Use of this source code is governed by a Commercial license that can be found in the LICENSE file and at https://paperbits.io/license/commercial.
 */
import { ColumnModel } from "./columnModel";
import { ColumnContract } from "./columnContract";
import { IWidgetService, ModelBinderSelector } from "@paperbits/common/widgets";
import { IModelBinder, ContainerModelBinder } from "@paperbits/common/editing";
import { Contract, Bag } from "@paperbits/common";


export class ColumnModelBinder extends ContainerModelBinder implements IModelBinder<ColumnModel> {
    constructor(
        protected readonly widgetService: IWidgetService,
        protected readonly modelBinderSelector: ModelBinderSelector
    ) {
        super(widgetService, modelBinderSelector);
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

        columnModel.widgets = await this.getChildModels(contract.nodes, bindingContext);

        return columnModel;
    }

    public modelToContract(model: ColumnModel): Contract {
        const contract: ColumnContract = {
            type: "email-layout-column",
            nodes: this.getChildContracts(model.widgets),
            size: model.size,
            alignment: model.alignment
        };

        return contract;
    }
}
