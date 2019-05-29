/**
 * @license
 * Copyright Paperbits. All Rights Reserved.
 *
 * Use of this source code is governed by a Commercial license that can be found in the LICENSE file and at https://paperbits.io/license/commercial.
 */

import * as Utils from "@paperbits/common/utils";
import { ColumnViewModel } from "./columnViewModel";
import { ViewModelBinder } from "@paperbits/common/widgets";
import { IWidgetBinding } from "@paperbits/common/editing";
import { ColumnModel } from "../columnModel";
import { PlaceholderViewModel } from "@paperbits/core/placeholder/ko";
import { ViewModelBinderSelector } from "@paperbits/core/ko/viewModelBinderSelector";
import { ColumnHandlers } from "../columnHandlers";
import { IEventManager } from "@paperbits/common/events";
import { IStyleCompiler } from "@paperbits/common/styles";
import { Bag } from "@paperbits/common";

export class ColumnViewModelBinder implements ViewModelBinder<ColumnModel, ColumnViewModel> {
    constructor(
        private readonly viewModelBinderSelector: ViewModelBinderSelector,
        private readonly eventManager: IEventManager,
        private readonly styleCompiler: IStyleCompiler
    ) { }

    public async modelToViewModel(model: ColumnModel, viewModel?: ColumnViewModel, bindingContext?: Bag<any>): Promise<ColumnViewModel> {
        if (!viewModel) {
            viewModel = new ColumnViewModel();
        }

        const viewModels = [];

        for (const widgetModel of model.widgets) {
            const widgetViewModelBinder = this.viewModelBinderSelector.getViewModelBinderByModel(widgetModel);
            const widgetViewModel = await widgetViewModelBinder.modelToViewModel(widgetModel, null, bindingContext);

            viewModels.push(widgetViewModel);
        }

        if (viewModels.length === 0) {
            viewModels.push(new PlaceholderViewModel("Column"));
        }

        viewModel.widgets(viewModels);

        if (model.size) {
            viewModel.size(model.size);
        }

        if (model.alignment) {
            viewModel.alignment(model.alignment);
        }

        // if (model.styles) {
        //     viewModel.styles(await this.styleCompiler.getClassNamesByStyleConfigAsync2(model.styles));
        // }

        const binding: IWidgetBinding = {
            name: "column",
            displayName: "Column",
            flow: "inline",
            model: model,
            editor: "email-layout-column-editor",
            handler: ColumnHandlers,
            applyChanges: (changes) => {
                Object.assign(model, changes);
                this.modelToViewModel(model, viewModel);
                this.eventManager.dispatchEvent("onContentUpdate");
            }
        };

        viewModel["widgetBinding"] = binding;

        return viewModel;
    }

    public canHandleModel(model: ColumnModel): boolean {
        return model instanceof ColumnModel;
    }
}