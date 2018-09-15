/**
 * @license
 * Copyright Paperbits. All Rights Reserved.
 *
 * Use of this source code is governed by a Commercial license that can be found in the LICENSE file and at https://paperbits.io/license.
 */

import { ColumnModel } from "./columnModel";
import { ColumnContract } from "./columnContract";
import { ModelBinderSelector } from "@paperbits/common/widgets";
import { IModelBinder } from "@paperbits/common/editing/IModelBinder";
import { Contract } from "@paperbits/common";

export class ColumnModelBinder implements IModelBinder {
    constructor(private readonly modelBinderSelector: ModelBinderSelector) {
        this.contractToModel = this.contractToModel.bind(this);
    }

    public canHandleWidgetType(widgetType: string): boolean {
        return widgetType === "email-column";
    }

    public canHandleModel(model: Object): boolean {
        return model instanceof ColumnModel;
    }

    public async contractToModel(contract: ColumnContract): Promise<ColumnModel> {
        const columnModel = new ColumnModel();

        if (contract.size) {
            columnModel.sizeXs = Number.parseInt(contract.size.xs);
            columnModel.sizeSm = Number.parseInt(contract.size.sm);
            columnModel.sizeMd = Number.parseInt(contract.size.md);
            columnModel.sizeLg = Number.parseInt(contract.size.lg);
            columnModel.sizeXl = Number.parseInt(contract.size.xl);
        }

        if (contract.alignment) {
            columnModel.alignmentXs = contract.alignment.xs;
            columnModel.alignmentSm = contract.alignment.sm;
            columnModel.alignmentMd = contract.alignment.md;
            columnModel.alignmentLg = contract.alignment.lg;
            columnModel.alignmentXl = contract.alignment.xl;
        }

        if (!contract.nodes) {
            contract.nodes = [];
        }

        const modelPromises = contract.nodes.map(async (node) => {
            const modelBinder = this.modelBinderSelector.getModelBinderByNodeType(node.type);
            return await modelBinder.contractToModel(node);
        });

        columnModel.widgets = await Promise.all<any>(modelPromises);

        return columnModel;
    }

    public modelToContract(columnModel: ColumnModel): Contract {
        const contract: ColumnContract = {
            type: "email-column",
            object: "block",
            nodes: []
        };

        contract.size = {};
        contract.alignment = {};

        if (columnModel.sizeSm) {
            contract.size.sm = columnModel.sizeSm.toString();
        }

        if (columnModel.sizeMd) {
            contract.size.md = columnModel.sizeMd.toString();
        }

        if (columnModel.sizeLg) {
            contract.size.lg = columnModel.sizeLg.toString();
        }

        if (columnModel.sizeXl) {
            contract.size.xl = columnModel.sizeXl.toString();
        }

        if (columnModel.alignmentXs) {
            contract.alignment.xs = columnModel.alignmentXs;
        }

        if (columnModel.alignmentSm) {
            contract.alignment.sm = columnModel.alignmentSm;
        }

        if (columnModel.alignmentMd) {
            contract.alignment.md = columnModel.alignmentMd;
        }

        if (columnModel.alignmentLg) {
            contract.alignment.lg = columnModel.alignmentLg;
        }

        if (columnModel.alignmentXl) {
            contract.alignment.xl = columnModel.alignmentXl;
        }

        columnModel.widgets.forEach(widgetModel => {
            const modelBinder = this.modelBinderSelector.getModelBinderByModel(widgetModel);
            contract.nodes.push(modelBinder.modelToContract(widgetModel));
        });

        return contract;
    }
}
