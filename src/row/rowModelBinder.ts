/**
 * @license
 * Copyright Paperbits. All Rights Reserved.
 *
 * Use of this source code is governed by a Commercial license that can be found in the LICENSE file and at https://paperbits.io/license/commercial.
 */

import { Contract, Bag } from "@paperbits/common";
import { RowContract } from "./rowContract";
import { RowModel } from "./rowModel";
import { IWidgetService, ModelBinderSelector } from "@paperbits/common/widgets";
import { CollectionModelBinder, IModelBinder } from "@paperbits/common/editing";

export class RowModelBinder extends CollectionModelBinder implements IModelBinder<RowModel> {
    constructor(
        protected readonly widgetService: IWidgetService,
        protected modelBinderSelector: ModelBinderSelector
    ) {
        super(widgetService, modelBinderSelector);
    }

    public canHandleContract(contract: Contract): boolean {
        return contract.type === "email-layout-row";
    }

    public canHandleModel(model: Object): boolean {
        return model instanceof RowModel;
    }

    public async contractToModel(contract: RowContract, bindingContext?: Bag<any>): Promise<RowModel> {
        const rowModel = new RowModel();

        if (contract.align) {
            if (contract.align.sm) {
                rowModel.alignSm = contract.align.sm;
            }
            if (contract.align.md) {
                rowModel.alignMd = contract.align.md;
            }
            if (contract.align.lg) {
                rowModel.alignLg = contract.align.lg;
            }
        }

        if (contract.justify) {
            if (contract.justify.sm) {
                rowModel.justifySm = contract.justify.sm;
            }
            if (contract.justify.md) {
                rowModel.justifyMd = contract.justify.md;
            }
            if (contract.justify.lg) {
                rowModel.justifyLg = contract.justify.lg;
            }
        }

        rowModel.widgets = await this.getChildModels(contract.nodes, bindingContext);

        return rowModel;
    }

    public modelToContract(model: RowModel): Contract {
        const rowConfig: RowContract = {
            type: "email-layout-row",
            nodes: this.getChildContracts(model.widgets),
        };

        rowConfig.align = {};
        rowConfig.align.sm = model.alignSm;
        rowConfig.align.md = model.alignMd;
        rowConfig.align.lg = model.alignLg;

        rowConfig.justify = {};
        rowConfig.justify.sm = model.justifySm;
        rowConfig.justify.md = model.justifyMd;
        rowConfig.justify.lg = model.justifyLg;

        return rowConfig;
    }
}
