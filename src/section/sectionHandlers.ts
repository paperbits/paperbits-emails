import { IContextCommandSet, View, ViewManager } from "@paperbits/common/ui";
import { DragSession } from "@paperbits/common/ui/draggables";
import { WidgetContext } from "@paperbits/common/editing";
import { SectionModel } from "./sectionModel";
import { RowModel } from "../row/rowModel";


export class SectionHandlers {
    constructor(private readonly viewManager: ViewManager) { }

    public canAccept(dragSession: DragSession): boolean {
        return dragSession.sourceBinding.name === "row";
    }

    public getContextCommands(context: WidgetContext): IContextCommandSet {
        const sectionContextualEditor: IContextCommandSet = {
            color: "#2b87da",
            hoverCommands: [{
                controlType: "toolbox-button",
                position: context.half,
                iconClass: "paperbits-icon paperbits-simple-add",
                tooltip: "Add section",
                color: "#2b87da",
                component: {
                    name: "email-layout-section-layout-selector",
                    params: {
                        onSelect: (newSectionModel: SectionModel) => {
                            const sectionHalf = context.half;

                            let index = context.parentModel.widgets.indexOf(context.model);

                            if (sectionHalf === "bottom") {
                                index++;
                            }

                            context.parentModel.widgets.splice(index, 0, newSectionModel);
                            context.parentBinding.applyChanges();

                            this.viewManager.clearContextualCommands();
                        }
                    }
                }
            }],
            deleteCommand: {
                controlType: "toolbox-button",
                tooltip: "Delete section",
                color: "#2b87da",
                callback: () => {
                    context.parentModel.widgets.remove(context.model);
                    context.parentBinding.applyChanges();

                    this.viewManager.clearContextualCommands();
                }
            },
            selectCommands: [{
                controlType: "toolbox-button",
                displayName: "Section settings",
                position: "top right",
                color: "#2b87da",
                callback: () => this.viewManager.openWidgetEditor(context.binding)
            },
            {
                controlType: "toolbox-button",
                tooltip: "Add to library",
                iconClass: "paperbits-icon paperbits-simple-add",
                position: "top right",
                color: "#2b87da",
                callback: () => {
                    const view: View = {
                        heading: "Add to library",
                        component: {
                            name: "add-block-dialog",
                            params: context.model
                        },
                        resizing: "vertically horizontally"
                    };

                    this.viewManager.openViewAsPopup(view);
                }
            }]
        };


        if (context.model.widgets.length === 0) {
            sectionContextualEditor.hoverCommands.push({
                controlType: "toolbox-button",
                position: "center",
                iconClass: "paperbits-icon paperbits-simple-add",
                tooltip: "Add row",
                color: "#29c4a9",
                component: {
                    name: "email-layout-row-layout-selector",
                    params: {
                        onSelect: (newRowModel: RowModel) => {
                            context.model.widgets.push(newRowModel);
                            context.binding.applyChanges();

                            this.viewManager.clearContextualCommands();
                        }
                    }
                }
            });
        }

        return sectionContextualEditor;
    }
}