import { IWidgetHandler, WidgetContext } from "@paperbits/common/editing";
import { DragSession } from "@paperbits/common/ui/draggables";
import { IContextCommandSet, ViewManager } from "@paperbits/common/ui";
import { WidgetModel } from "@paperbits/common/widgets";


export class ColumnHandlers implements IWidgetHandler {
    constructor(private readonly viewManager: ViewManager) { }

    public canAccept(dragSession: DragSession): boolean {
        return !["section", "row", "column"].includes(dragSession.sourceBinding.name);
    }

    public getContextCommands(context: WidgetContext): IContextCommandSet {
        const columnContextualEditor: IContextCommandSet = {
            color: "#4c5866",
            hoverCommands: [],
            deleteCommand: null,
            selectCommands: [{
                controlType: "toolbox-button",
                displayName: "Edit column",
                position: "top right",
                color: "#4c5866",
                callback: () => this.viewManager.openWidgetEditor(context.binding)
            },
            {
                controlType: "toolbox-splitter"
            },
            {
                controlType: "toolbox-button",
                tooltip: "Switch to parent",
                iconClass: "paperbits-icon paperbits-enlarge-vertical",
                position: "top right",
                color: "#4c5866",
                callback: () => {
                    context.switchToParent();
                }
            }]
        };

        if (context.model.widgets.length === 0) {
            columnContextualEditor.hoverCommands.push({
                controlType: "toolbox-button",
                color: "#607d8b",
                iconClass: "paperbits-icon paperbits-simple-add",
                position: "center",
                tooltip: "Add widget",
                component: {
                    name: "widget-selector",
                    params: {
                        onRequest: () => context.providers,
                        onSelect: (widget: WidgetModel) => {
                            context.model.widgets.push(widget);
                            context.binding.applyChanges();
                            this.viewManager.clearContextualCommands();
                        }
                    }
                }
            });
        }

        return columnContextualEditor;
    }
}