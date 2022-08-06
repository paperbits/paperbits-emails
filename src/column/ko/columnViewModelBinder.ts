/**
 * @license
 * Copyright Paperbits. All Rights Reserved.
 *
 * Use of this source code is governed by a Commercial license that can be found in the LICENSE file and at https://paperbits.io/license/commercial.
 */

import { ColumnViewModel } from "./columnViewModel";
import { IWidgetService, ViewModelBinder } from "@paperbits/common/widgets";
import { IWidgetBinding } from "@paperbits/common/editing";
import { ColumnModel } from "../columnModel";
import { PlaceholderViewModel } from "@paperbits/core/placeholder/ko";
import { ViewModelBinderSelector } from "@paperbits/core/ko/viewModelBinderSelector";
import { ColumnHandlers } from "../columnHandlers";
import { EventManager, Events } from "@paperbits/common/events";
import { StyleCompiler } from "@paperbits/common/styles";
import { Bag } from "@paperbits/common";

export class ColumnViewModelBinder implements ViewModelBinder<ColumnModel, ColumnViewModel> {
    constructor(
        private readonly viewModelBinderSelector: ViewModelBinderSelector,
        private readonly eventManager: EventManager,
        private readonly widgetService: IWidgetService
    ) { }

    public async modelToViewModel(model: ColumnModel, viewModel?: ColumnViewModel, bindingContext?: Bag<any>): Promise<ColumnViewModel> {
        if (!viewModel) {
            viewModel = new ColumnViewModel();
        }

        const promises = model.widgets.map(widgetModel => {
            const definition = this.widgetService.getWidgetDefinitionForModel(widgetModel);

            if (definition) {
                const bindingPromise = this.widgetService.createWidgetBinding(definition, widgetModel, bindingContext);
                return bindingPromise;
            }

            // legacy binding resolution
            const widgetViewModelBinder = this.viewModelBinderSelector.getViewModelBinderByModel(widgetModel);
            const bindingPromise = widgetViewModelBinder.modelToViewModel(widgetModel, null, bindingContext);
            return bindingPromise;
        });

        const widgetViewModels = await Promise.all(promises);

        if (widgetViewModels.length === 0) {
            widgetViewModels.push(new PlaceholderViewModel("Column"));
        }

        viewModel.widgets(widgetViewModels);

        const binding: IWidgetBinding<ColumnModel, ColumnViewModel> = {
            name: "column",
            displayName: "Column",
            layer: bindingContext?.layer,
            model: model,
            draggable: false,
            editor: "email-layout-column-editor",
            handler: ColumnHandlers,
            applyChanges: async () => {
                await this.modelToViewModel(model, viewModel, bindingContext);
                this.eventManager.dispatchEvent(Events.ContentUpdate);
            }
        };

        viewModel["widgetBinding"] = binding;

        return viewModel;
    }

    public canHandleModel(model: ColumnModel): boolean {
        return model instanceof ColumnModel;
    }
}