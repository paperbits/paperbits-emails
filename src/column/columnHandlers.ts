import { IWidgetHandler, WidgetContext } from "@paperbits/common/editing";
import { DragSession } from "@paperbits/common/ui/draggables";
import { IContextCommandSet, ViewManager } from "@paperbits/common/ui";
import { WidgetModel } from "@paperbits/common/widgets";
import { RowModel } from "../row/rowModel";


export class ColumnHandlers implements IWidgetHandler {
    constructor(private readonly viewManager: ViewManager) { }

    public canAccept(dragSession: DragSession): boolean {
        return !["section", "row", "column"].includes(dragSession.sourceBinding.name);
    }

    public getContextualEditor(context: WidgetContext): IContextCommandSet {
        const columnContextualEditor: IContextCommandSet = {
            color: "#4c5866",
            hoverCommands: [],
            deleteCommand: null,
            selectCommands: [{
                tooltip: "Edit column",
                iconClass: "paperbits-edit-72",
                position: "top right",
                color: "#4c5866",
                callback: () => this.viewManager.openWidgetEditor(context.binding)
            },
            {
                tooltip: "Switch to parent",
                iconClass: "paperbits-enlarge-vertical",
                position: "top right",
                color: "#4c5866",
                callback: () => {
                    context.switchToParent();
                }
            }]
        };

        if (context.model.widgets.length === 0) {
            columnContextualEditor.hoverCommands.push({
                color: "#607d8b",
                position: "center",
                tooltip: "Add widget",
                component: {
                    name: "widget-selector",
                    params: {
                        onRequest: () => context.providers,
                        onSelect: (widget: WidgetModel) => {
                            context.model.widgets.push(widget);
                            context.binding.applyChanges();
                            this.viewManager.clearContextualEditors();
                        }
                    }
                }
            });
        }

        return columnContextualEditor;
    }
}