/**
 * @license
 * Copyright Paperbits. All Rights Reserved.
 *
 * Use of this source code is governed by a Commercial license that can be found in the LICENSE file and at https://paperbits.io/license/commercial.
 */

import * as ko from "knockout";
import template from "./section.html";
import { BackgroundModel } from "@paperbits/common/widgets/background/backgroundModel";
import { Component } from "@paperbits/common/ko/decorators";
import { WidgetViewModel } from "@paperbits/core/ko/widgetViewModel";
import { StyleModel } from "@paperbits/common/styles";

@Component({
    selector: "email-layout-section",
    template: template
})
export class SectionViewModel implements WidgetViewModel {
    public widgets: ko.ObservableArray<WidgetViewModel>;
    public container: ko.Observable<string>;
    public snapTo: ko.Observable<string>;
    public background: ko.Observable<BackgroundModel>;
    public styles: ko.Observable<StyleModel>;

    constructor() {
        this.widgets = ko.observableArray<WidgetViewModel>();
        this.container = ko.observable<string>();
        this.snapTo = ko.observable<string>();
        this.background = ko.observable<BackgroundModel>();
        this.styles = ko.observable<StyleModel>();
    }
}