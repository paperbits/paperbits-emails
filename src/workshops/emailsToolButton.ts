import { ToolButton, ViewManager, View } from "@paperbits/common/ui";

const helpText = "<h1>Email templates</h1><p>Add or edit your email templates.</p>";

export class EmailsToolButton implements ToolButton {
    public readonly iconClass: string = "paperbits-icon paperbits-at-sign";
    public readonly title: string = "Emails";
    public readonly tooltip: string = helpText;

    constructor(private readonly viewManager: ViewManager) { }

    public onActivate(): void {
        this.viewManager.clearJourney();

        const view: View = {
            heading: this.title,
            helpText: helpText,
            component: { name: "emails" }
        };

        this.viewManager.openViewAsWorkshop(view);
    }
}