/**
 * @license
 * Copyright Paperbits. All Rights Reserved.
 *
 * Use of this source code is governed by a Commercial license that can be found in the LICENSE file and at https://paperbits.io/license.
 */

import * as ko from "knockout";
import template from "./document.html";
import { IRouteHandler } from "@paperbits/common/routing";
import { Component } from "@paperbits/core/ko/decorators";
import { LayoutModelBinder } from "../layout";
import { LayoutViewModelBinder } from "../layout/ko";
import { LayoutViewModel } from "../layout/ko/layoutViewModel";

@Component({
    selector: "email-document",
    template: template,
    injectable: "emailDocument"
})
export class DocumentViewModel {
    public readonly layoutModel: KnockoutObservable<LayoutViewModel>;
    public readonly disableTracking: KnockoutObservable<boolean>;

    constructor(
        private readonly emailLayoutModelBinder: LayoutModelBinder,
        private readonly emailLayoutViewModelBinder: LayoutViewModelBinder,
        private readonly routeHandler: IRouteHandler
    ) {
        // rebinding...
        this.refreshContent = this.refreshContent.bind(this);
        this.onRouteChange = this.onRouteChange.bind(this);

        // setting up...
        this.routeHandler.addRouteChangeListener(this.onRouteChange);

        this.layoutModel = ko.observable<LayoutViewModel>();
        this.disableTracking = ko.observable(false);

        this.refreshContent();
    }

    private async refreshContent(): Promise<void> {
        this.layoutModel(null);

        const layoutModel = await this.emailLayoutModelBinder.getLayoutModel();
        const layoutViewModel = this.emailLayoutViewModelBinder.modelToViewModel(layoutModel);

        this.layoutModel(layoutViewModel);
    }

    private async onRouteChange(): Promise<void> {
        await this.refreshContent();
    }

    public dispose(): void {
        this.routeHandler.removeRouteChangeListener(this.onRouteChange);
    }
}