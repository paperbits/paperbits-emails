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

export class SectionModelBinder implements IModelBinder {
    public canHandleContract(contract: Contract): boolean {
        return contract.type === "email-layout-section";
    }

    public canHandleModel(model: Object): boolean {
        return model instanceof SectionModel;
    }

    constructor(
        private readonly modelBinderSelector: ModelBinderSelector,
        private readonly backgroundModelBinder: BackgroundModelBinder) {

        this.contractToModel = this.contractToModel.bind(this);
    }

    public async contractToModel(sectionContract: SectionContract, bindingContext?: Bag<any>): Promise<SectionModel> {
        const sectionModel = new SectionModel();

        sectionContract.nodes = sectionContract.nodes || [];
        sectionModel.container = sectionContract.layout;
        sectionModel.padding = sectionContract.padding;
        sectionModel.snap = sectionContract.snapping;
        sectionModel.height = sectionContract.height;

        if (sectionContract.background) {
            sectionModel.background = await this.backgroundModelBinder.contractToModel(sectionContract.background);
        }

        const modelPromises = sectionContract.nodes.map(async (contract: Contract) => {
            const modelBinder: IModelBinder = this.modelBinderSelector.getModelBinderByContract(contract);
            return await modelBinder.contractToModel(contract, bindingContext);
        });

        sectionModel.widgets = await Promise.all<WidgetModel>(modelPromises);

        return sectionModel;
    }

    public modelToContract(sectionModel: SectionModel): Contract {
        const sectionContract: SectionContract = {
            type: "email-layout-section",
            nodes: [],
            layout: sectionModel.container,
            padding: sectionModel.padding,
            snapping: sectionModel.snap,
            height: sectionModel.height
        };

        if (sectionModel.background) {
            sectionContract.background = {
                color: sectionModel.background.colorKey,
                size: sectionModel.background.size,
                position: sectionModel.background.position
            };

            if (sectionModel.background.sourceType === "picture") {
                sectionContract.background.picture = {
                    sourceKey: sectionModel.background.sourceKey,
                    repeat: sectionModel.background.repeat
                };
            }
        }

        sectionModel.widgets.forEach(widgetModel => {
            const modelBinder = this.modelBinderSelector.getModelBinderByModel(widgetModel);
            sectionContract.nodes.push(modelBinder.modelToContract(widgetModel));
        });

        return sectionContract;
    }
}
