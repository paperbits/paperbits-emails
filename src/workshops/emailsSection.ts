import { IToolButton, IViewManager, IView } from "@paperbits/common/ui";

export class EmailsWorkshopSection implements IToolButton {
    public readonly iconClass: string = "paperbits-icon paperbits-at-sign";
    public readonly title: string = "Email templates";

    constructor(private readonly viewManager: IViewManager) { }

    public onActivate(): void {
        this.viewManager.clearJourney();

        const view: IView = {
            heading: this.title,
            helpText: "Manage your email templates.",
            component: { name: "emails" }
        };

        this.viewManager.openViewAsWorkshop(view);
    }
}