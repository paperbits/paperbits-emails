import { ToolButton, ViewManager, View } from "@paperbits/common/ui";

export class EmailsWorkshopSection implements ToolButton {
    public readonly iconClass: string = "paperbits-icon paperbits-at-sign";
    public readonly title: string = "Emails";

    constructor(private readonly viewManager: ViewManager) { }

    public onActivate(): void {
        this.viewManager.clearJourney();

        const view: View = {
            heading: this.title,
            helpText: "<h1>Email templates</h1><p>Add or edit your email templates.</p>",
            component: { name: "emails" }
        };

        this.viewManager.openViewAsWorkshop(view);
    }
}