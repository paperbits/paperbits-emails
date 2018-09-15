/**
 * @license
 * Copyright Paperbits. All Rights Reserved.
 *
 * Use of this source code is governed by a Commercial license that can be found in the LICENSE file and at https://paperbits.io/license.
 */

import { ColumnViewModel } from "./columnViewModel";
import { IViewModelBinder } from "@paperbits/common/widgets";
import { DragSession } from "@paperbits/common/ui/draggables/dragSession";
import { IWidgetBinding, GridHelper } from "@paperbits/common/editing";
import { IContextualEditor, IViewManager } from "@paperbits/common/ui";
import { ColumnModel } from "../columnModel";
import { PlaceholderViewModel } from "@paperbits/core/placeholder/ko";
import { ViewModelBinderSelector } from "@paperbits/core/ko/viewModelBinderSelector";

export class ColumnViewModelBinder implements IViewModelBinder<ColumnModel, ColumnViewModel> {
    constructor(
        private readonly viewModelBinderSelector: ViewModelBinderSelector,
        private readonly viewManager: IViewManager
    ) {
    }

    public modelToViewModel(model: ColumnModel, readonly: boolean, columnViewModel?: ColumnViewModel): ColumnViewModel {
        if (!columnViewModel) {
            columnViewModel = new ColumnViewModel();
        }

        const widgetViewModels = model.widgets
            .map(widgetModel => {
                const widgetViewModelBinder = this.viewModelBinderSelector.getViewModelBinderByModel(widgetModel);
                const widgetViewModel = widgetViewModelBinder.modelToViewModel(widgetModel, readonly);

                return widgetViewModel;
            });

        if (widgetViewModels.length === 0) {
            widgetViewModels.push(new PlaceholderViewModel("Column"));
        }

        columnViewModel.widgets(widgetViewModels);
        columnViewModel.sizeSm(model.sizeSm);
        columnViewModel.sizeMd(model.sizeMd);
        columnViewModel.sizeLg(model.sizeLg);
        columnViewModel.sizeXl(model.sizeXl);

        if (model.alignmentXs) {
            columnViewModel.alignmentXs(model.alignmentXs);
        }
        else {
            columnViewModel.alignmentXs("center center");
        }

        if (model.alignmentSm) {
            columnViewModel.alignmentSm(model.alignmentSm);
        }
        else {
            columnViewModel.alignmentSm("center center");
        }

        if (model.alignmentMd) {
            columnViewModel.alignmentMd(model.alignmentMd);
        }
        else {
            columnViewModel.alignmentMd("center center");
        }

        if (model.alignmentLg) {
            columnViewModel.alignmentLg(model.alignmentLg);
        }
        else {
            columnViewModel.alignmentLg("center center");
        }

        if (model.alignmentXl) {
            columnViewModel.alignmentXl(model.alignmentXl);
        }
        else {
            columnViewModel.alignmentXl("center center");
        }

        const binding: IWidgetBinding = {
            name: "email-column",
            displayName: "Column",
            readonly: readonly,
            model: model,
            editor: "email-column-editor",
            applyChanges: () => {
                this.modelToViewModel(model, readonly, columnViewModel);
            },
            onDragOver: (dragSession: DragSession): boolean => {
                const canAccept = !readonly && dragSession.type === "widget";
                return canAccept;
            },
            onDragDrop: (dragSession: DragSession): void => {
                if (dragSession.type === "widget") {
                    model.widgets.splice(dragSession.insertIndex, 0, dragSession.sourceModel);
                }
                binding.applyChanges();
            },

            getContextualEditor: (element: HTMLElement, half: string, placeholderElement?: HTMLElement, placeholderHalf?: string): IContextualEditor => {
                const columnContextualEditor: IContextualEditor = {
                    element: element,
                    color: "#4c5866",
                    hoverCommand: null,
                    deleteCommand: null,
                    selectionCommands: [{
                        tooltip: "Edit column",
                        iconClass: "paperbits-edit-72",
                        position: "top right",
                        color: "#4c5866",
                        callback: () => {
                            const binding = GridHelper.getWidgetBinding(element);
                            this.viewManager.openWidgetEditor(binding);
                        }
                    }]
                };

                const attachedModel = <ColumnModel>GridHelper.getModel(element);

                if (attachedModel.widgets.length === 0) {
                    columnContextualEditor.hoverCommand = {
                        color: "#607d8b",
                        position: "center",
                        tooltip: "Add widget",
                        component: {
                            name: "widget-selector",
                            params: {
                                onRequest: () => {
                                    const parentElement = GridHelper.getParentElementWithModel(element);
                                    const bindings = GridHelper.getParentWidgetBindings(parentElement);
                                    const provided = bindings
                                        .filter(x => !!x.provides)
                                        .map(x => x.provides)
                                        .reduce((acc, val) => acc.concat(val));
        
                                    return provided;
                                },
                                onSelect: (widgetModel: any) => {
                                    const columnModel = <ColumnModel>GridHelper.getModel(element);
                                    const columnWidgetBinding = GridHelper.getWidgetBinding(element);

                                    columnModel.widgets.push(widgetModel);
                                    columnWidgetBinding.applyChanges();

                                    this.viewManager.clearContextualEditors();
                                }
                            }
                        }
                    };
                }

                return columnContextualEditor;
            }
        };

        columnViewModel["widgetBinding"] = binding;

        return columnViewModel;
    }

    public canHandleModel(model: ColumnModel): boolean {
        return model instanceof ColumnModel;
    }
}