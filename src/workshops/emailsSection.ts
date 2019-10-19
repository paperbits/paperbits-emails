import { ToolButton, ViewManager, View } from "@paperbits/common/ui";

export class EmailsWorkshopSection implements ToolButton {
    public readonly iconClass: string = "paperbits-icon paperbits-at-sign";
    public readonly title: string = "Email templates";

    constructor(private readonly viewManager: ViewManager) { }

    public onActivate(): void {
        this.viewManager.clearJourney();

        const view: View = {
            heading: this.title,
            helpText: "Manage your email templates.",
            component: { name: "emails" }
        };

        this.viewManager.openViewAsWorkshop(view);
    }
}