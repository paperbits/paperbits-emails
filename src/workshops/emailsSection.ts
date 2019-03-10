import { IWorkshopSection, IViewManager } from "@paperbits/common/ui";

export class EmailsWorkshopSection implements IWorkshopSection {
    public iconClass = "paperbits-icon paperbits-at-sign";
    public title = "Email templates";

    constructor(private readonly viewManager: IViewManager) { }

    public onActivate(): void {
        this.viewManager.clearJourney();
        this.viewManager.openViewAsWorkshop(this.title, "emails"); // TODO: Specify IComponent rather than just name.
    }
}