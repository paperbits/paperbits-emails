import { IWidgetHandler, WidgetContext } from "@paperbits/common/editing";
import { IContextCommandSet, ViewManager } from "@paperbits/common/ui";
import { RowModel } from "../row/rowModel";
import { switchToParentCommand } from "@paperbits/common/ui/commands";


export class RowHandlers implements IWidgetHandler<RowModel> {
    constructor(private readonly viewManager: ViewManager) { }

    public getContextCommands(context: WidgetContext): IContextCommandSet {
        return {
            color: "#29c4a9",
            hoverCommands: [{
                controlType: "toolbox-button",
                color: "#29c4a9",
                iconClass: "paperbits-icon paperbits-simple-add",
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

                            this.viewManager.clearContextualCommands();
                        }
                    }
                },
            }],
            selectCommands: [switchToParentCommand(context)],
            deleteCommand: {
                controlType: "toolbox-button",
                tooltip: "Delete row",
                color: "#29c4a9",
                callback: () => {
                    context.parentModel.widgets.remove(context.model);
                    context.parentBinding.applyChanges();

                    this.viewManager.clearContextualCommands();
                }
            }
        };
    }
}