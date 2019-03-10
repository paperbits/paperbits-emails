/**
 * @license
 * Copyright Paperbits. All Rights Reserved.
 *
 * Use of this source code is governed by a Commercial license that can be found in the LICENSE file and at style-guidehttps://paperbits.io/license/mit.
 */

import * as Utils from "@paperbits/common/utils";
import { ColumnViewModel } from "./columnViewModel";
import { IViewModelBinder } from "@paperbits/common/widgets";
import { IWidgetBinding } from "@paperbits/common/editing";
import { ColumnModel } from "../columnModel";
import { PlaceholderViewModel } from "@paperbits/core/placeholder/ko";
import { ViewModelBinderSelector } from "@paperbits/core/ko/viewModelBinderSelector";
import { ColumnHandlers } from "../columnHandlers";
import { IEventManager } from "@paperbits/common/events";

export class ColumnViewModelBinder implements IViewModelBinder<ColumnModel, ColumnViewModel> {
    constructor(
        private readonly viewModelBinderSelector: ViewModelBinderSelector,
        private readonly eventManager: IEventManager
    ) { }

    public modelToViewModel(model: ColumnModel, columnViewModel?: ColumnViewModel): ColumnViewModel {
        if (!columnViewModel) {
            columnViewModel = new ColumnViewModel();
        }

        const widgetViewModels = model.widgets
            .map(widgetModel => {
                const widgetViewModelBinder = this.viewModelBinderSelector.getViewModelBinderByModel(widgetModel);
                const widgetViewModel = widgetViewModelBinder.modelToViewModel(widgetModel);

                return widgetViewModel;
            });

        if (widgetViewModels.length === 0) {
            widgetViewModels.push(new PlaceholderViewModel("Column"));
        }

        columnViewModel.widgets(widgetViewModels);

        if (model.size) {
            columnViewModel.size(model.size);
        }

        if (model.alignment) {
            columnViewModel.alignment(model.alignment);
        }

        // columnViewModel.styles(styles); TODO: Enable when all CSS switched to styling system


        const binding: IWidgetBinding = {
            name: "column",
            displayName: "Column",
            flow: "inline",
            model: model,
            editor: "email-layout-column-editor",
            handler: ColumnHandlers,
            applyChanges: (changes) => {
                Object.assign(model, changes);
                this.modelToViewModel(model, columnViewModel);
                this.eventManager.dispatchEvent("onContentUpdate");
            }
        };

        columnViewModel["widgetBinding"] = binding;

        return columnViewModel;
    }

    public canHandleModel(model: ColumnModel): boolean {
        return model instanceof ColumnModel;
    }
}