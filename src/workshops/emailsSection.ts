import { IToolButton, IViewManager } from "@paperbits/common/ui";

export class EmailsWorkshopSection implements IToolButton {
    public iconClass: string = "paperbits-icon paperbits-at-sign";
    public title: string = "Email templates";

    constructor(private readonly viewManager: IViewManager) { }

    public onActivate(): void {
        this.viewManager.clearJourney();
        this.viewManager.openViewAsWorkshop(this.title, "emails"); // TODO: Specify IComponent rather than just name.
    }
}