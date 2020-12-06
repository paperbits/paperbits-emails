/**
 * @license
 * Copyright Paperbits. All Rights Reserved.
 *
 * Use of this source code is governed by a Commercial license that can be found in the LICENSE file https://paperbits.io/license/commercial.
 */

import { RowViewModel } from "./rowViewModel";
import { ViewModelBinder } from "@paperbits/common/widgets/IViewModelBinder";
import { IWidgetBinding } from "@paperbits/common/editing";
import { RowModel } from "../rowModel";
import { PlaceholderViewModel } from "@paperbits/core/placeholder/ko";
import { ViewModelBinderSelector } from "@paperbits/core/ko/viewModelBinderSelector";
import { RowHandlers } from "../rowHandlers";
import { EventManager } from "@paperbits/common/events";
import { Bag } from "@paperbits/common";

export class RowViewModelBinder implements ViewModelBinder<RowModel, RowViewModel> {
    constructor(
        private readonly viewModelBinderSelector: ViewModelBinderSelector,
        private readonly eventManager: EventManager
    ) { }

    public async modelToViewModel(model: RowModel, viewModel?: RowViewModel, bindingContext?: Bag<any>): Promise<RowViewModel> {
        if (!viewModel) {
            viewModel = new RowViewModel();
        }

        const viewModels = [];

        for (const widgetModel of model.widgets) {
            const widgetViewModelBinder = this.viewModelBinderSelector.getViewModelBinderByModel(widgetModel);
            const widgetViewModel = await widgetViewModelBinder.modelToViewModel(widgetModel, null, bindingContext);

            viewModels.push(widgetViewModel);
        }

        if (viewModels.length === 0) {
            viewModels.push(<any>new PlaceholderViewModel("Row"));
        }

        viewModel.widgets(viewModels);

        viewModel.alignSm(model.alignSm);
        viewModel.alignMd(model.alignMd);
        viewModel.alignLg(model.alignLg);

        viewModel.justifySm(model.justifySm);
        viewModel.justifyMd(model.justifyMd);
        viewModel.justifyLg(model.justifyLg);

        const binding: IWidgetBinding<RowModel> = {
            name: "email-layout-row",
            displayName: "Row",
            readonly: bindingContext ? bindingContext.readonly : false,
            model: model,
            draggable: false,
            handler: RowHandlers,
            applyChanges: async () => {
                await this.modelToViewModel(model, viewModel, bindingContext);
                this.eventManager.dispatchEvent("onContentUpdate");
            }
        };

        viewModel["widgetBinding"] = binding;

        return viewModel;
    }

    public canHandleModel(model: RowModel): boolean {
        return model instanceof RowModel;
    }
}