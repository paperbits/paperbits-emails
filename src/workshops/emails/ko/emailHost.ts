import * as ko from "knockout";
import template from "./emailHost.html";
import { LayoutViewModelBinder, LayoutViewModel } from "../../../layout/ko";
import { Component, OnMounted } from "@paperbits/common/ko/decorators";
import { Router } from "@paperbits/common/routing";
import { EventManager } from "@paperbits/common/events";
import { IViewManager, ViewManagerMode } from "@paperbits/common/ui";



@Component({
    selector: "email-host",
    template: template,
    injectable: "emailHost"
})
export class EmailHost {
    public readonly layoutViewModel: ko.Observable<LayoutViewModel>;

    constructor(
        private readonly emailLayoutViewModelBinder: LayoutViewModelBinder,
        private readonly router: Router,
        private readonly eventManager: EventManager,
        private readonly viewManager: IViewManager
    ) {
        this.layoutViewModel = ko.observable();
        this.eventManager.addEventListener("onDataPush", () => this.onDataPush());
        this.eventManager.addEventListener("onEmailTemplateSelect", (key: string) => this.onEmailTemplateSelect(key));
    }

    @OnMounted()
    public async initialize(): Promise<void> {
        // this.refreshContent();
    }

    private async onDataPush(): Promise<void> {
        if (this.viewManager.mode === ViewManagerMode.selecting || this.viewManager.mode === ViewManagerMode.selected) {
            // await this.refreshContent();
        }
    }

    private async onEmailTemplateSelect(key: string): Promise<void> {
        const layoutViewModel = await this.emailLayoutViewModelBinder.getLayoutViewModel(key);
        this.layoutViewModel(layoutViewModel);
    }

    public dispose(): void {
        this.router.removeRouteChangeListener(this.onEmailTemplateSelect);
    }
}