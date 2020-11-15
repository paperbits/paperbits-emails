import * as ko from "knockout";
import template from "./emailHost.html";
import { LayoutViewModelBinder, LayoutViewModel } from "../../../layout/ko";
import { Component, OnMounted } from "@paperbits/common/ko/decorators";
import { Router } from "@paperbits/common/routing";
import { EventManager } from "@paperbits/common/events";
import { ViewManager, ViewManagerMode } from "@paperbits/common/ui";
import { EmailService } from "../../../emailService";
import { Contract } from "@paperbits/common";
import { StyleManager, StyleCompiler } from "@paperbits/common/styles";


@Component({
    selector: "email-host",
    template: template
})
export class EmailHost {
    public readonly layoutViewModel: ko.Observable<LayoutViewModel>;

    constructor(
        private readonly emailLayoutViewModelBinder: LayoutViewModelBinder,
        private readonly router: Router,
        private readonly emailService: EmailService,
        private readonly eventManager: EventManager,
        private readonly viewManager: ViewManager,
        private readonly styleCompiler: StyleCompiler
    ) {
        this.layoutViewModel = ko.observable();
        this.eventManager.addEventListener("onDataPush", () => this.onDataPush());
        this.eventManager.addEventListener("onEmailTemplateSelect", (key: string) => this.refreshContent(key));
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

    private async refreshContent(key: string): Promise<void> {
        this.viewManager.setShutter();
        const styleManager = new StyleManager(this.eventManager);
        const styleSheet = await this.styleCompiler.getStyleSheet();
        styleManager.setStyleSheet(styleSheet);

        const bindingContext = {
            styleManager: styleManager,
            routeKind: "page"
        };

        const layoutViewModel = await this.emailLayoutViewModelBinder.getLayoutViewModel(key, bindingContext);
        layoutViewModel["widgetBinding"].provides = ["html", "email"];
        this.layoutViewModel(layoutViewModel);
        this.viewManager.removeShutter();
    }

    public dispose(): void {
        this.router.removeRouteChangeListener(this.refreshContent);
    }
}