/**
 * @license
 * Copyright Paperbits. All Rights Reserved.
 *
 * Use of this source code is governed by a Commercial license that can be found in the LICENSE file and at https://paperbits.io/license.
 */

import { RowViewModel } from "./rowViewModel";
import { IViewModelBinder } from "@paperbits/common/widgets/IViewModelBinder";
import { DragSession } from "@paperbits/common/ui/draggables/dragSession";
import { IContextualEditor, IViewManager } from "@paperbits/common/ui";
import { GridHelper, IWidgetBinding } from "@paperbits/common/editing";
import { RowModel } from "../rowModel";
import { ColumnModel } from "../../column/columnModel";
import { PlaceholderViewModel } from "@paperbits/core/placeholder/ko";
import { ViewModelBinderSelector } from "@paperbits/core/ko/viewModelBinderSelector";

export class RowViewModelBinder implements IViewModelBinder<RowModel, RowViewModel> {
    constructor(
        private readonly viewModelBinderSelector: ViewModelBinderSelector,
        private readonly viewManager: IViewManager
    ) {
        this.modelToViewModel = this.modelToViewModel.bind(this);
    }

    public modelToViewModel(model: RowModel, readonly: boolean, viewModel?: RowViewModel): RowViewModel {
        if (!viewModel) {
            viewModel = new RowViewModel();
        }

        const viewModels = model.widgets
            .map(widgetModel => {
                const viewModelBinder = this.viewModelBinderSelector.getViewModelBinderByModel(widgetModel);
                const viewModel = viewModelBinder.modelToViewModel(widgetModel, readonly);

                return viewModel;
            });

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

        const binding: IWidgetBinding = {
            name: "row",
            displayName: "Row",
            readonly: readonly,
            model: model,
            applyChanges: () => {
                this.modelToViewModel(model, readonly, viewModel);
            },
            onDragOver: (dragSession: DragSession): boolean => {
                return dragSession.type === "column";
            },
            onDragDrop: (dragSession: DragSession): void => {
                switch (dragSession.type) {
                    case "column":
                        model.widgets.splice(dragSession.insertIndex, 0, <ColumnModel>dragSession.sourceModel);
                        break;

                    case "widget":
                        const columnToInsert = new ColumnModel();
                        columnToInsert.sizeMd = 3;
                        columnToInsert.widgets.push(dragSession.sourceModel);
                        model.widgets.splice(dragSession.insertIndex, 0, columnToInsert);
                        break;
                }
                binding.applyChanges();
            },

            getContextualEditor: (element: HTMLElement, half: string): IContextualEditor => {
                const rowContextualEditor: IContextualEditor = {
                    element: element,
                    color: "#29c4a9",
                    hoverCommand: {
                        color: "#29c4a9",
                        position: half,
                        tooltip: "Add row",
                        component: {
                            name: "email-row-layout-selector",
                            params: {
                                onSelect: (newRowModel: RowModel) => {
                                    const parentElement = GridHelper.getParentElementWithModel(element);
                                    const parentModel = GridHelper.getModel(parentElement);
                                    const parentWidgetModel = GridHelper.getWidgetBinding(parentElement);
                                    const rowModel = GridHelper.getModel(element);
                                    let index = parentModel.widgets.indexOf(rowModel);

                                    if (half === "bottom") {
                                        index++;
                                    }

                                    parentModel.widgets.splice(index, 0, newRowModel);
                                    parentWidgetModel.applyChanges();

                                    this.viewManager.clearContextualEditors();
                                }
                            }
                        },
                    },
                    selectionCommands: null,
                    deleteCommand: {
                        tooltip: "Delete row",
                        color: "#29c4a9",
                        callback: () => {
                            const parentElement = GridHelper.getParentElementWithModel(element);
                            const parentModel = GridHelper.getModel(parentElement);
                            const parentBinding = GridHelper.getWidgetBinding(parentElement);
                            const rowModel = GridHelper.getModel(element);

                            parentModel.widgets.remove(rowModel);
                            parentBinding.applyChanges();

                            this.viewManager.clearContextualEditors();
                        }
                    }
                };

                return rowContextualEditor;
            }
        };

        viewModel["widgetBinding"] = binding;

        return viewModel;
    }

    public canHandleModel(model: RowModel): boolean {
        return model instanceof RowModel;
    }
}