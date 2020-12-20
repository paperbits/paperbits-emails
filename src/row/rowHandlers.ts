import { IWidgetHandler, WidgetContext } from "@paperbits/common/editing";
import { IContextCommandSet, ViewManager } from "@paperbits/common/ui";
import { RowModel } from "../row/rowModel";
import { SectionModel } from "../section/sectionModel";


export class RowHandlers implements IWidgetHandler {
    constructor(private readonly viewManager: ViewManager) { }

    public getContextualEditor(context: WidgetContext): IContextCommandSet {
        return {
            color: "#29c4a9",
            hoverCommands: [{
                color: "#29c4a9",
                position: context.half,
                tooltip: "Add row",
                component: {
                    name: "email-row-layout-selector",
                    params: {
                        onSelect: (newRowModel: RowModel) => {
                            let index = context.parentModel.widgets.indexOf(context.model);

                            if (context.half === "bottom") {
                                index++;
                            }

                            context.parentModel.widgets.splice(index, 0, newRowModel);
                            context.parentBinding.applyChanges();

                            this.viewManager.clearContextualEditors();
                        }
                    }
                },
            }],
            selectCommands: [{
                tooltip: "Switch to parent",
                iconClass: "paperbits-enlarge-vertical",
                position: "top right",
                color: "#29c4a9",
                callback: () => {
                    context.switchToParent();
                }             
            }],
            deleteCommand: {
                tooltip: "Delete row",
                color: "#29c4a9",
                callback: () => {
                    context.parentModel.widgets.remove(context.model);
                    context.parentBinding.applyChanges();

                    this.viewManager.clearContextualEditors();
                }
            }
        };
    }
}