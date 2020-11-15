/**
 * @license
 * Copyright Paperbits. All Rights Reserved.
 *
 * Use of this source code is governed by a Commercial license that can be found in the LICENSE file and at https://paperbits.io/license/commercial.
 */

import * as ko from "knockout";
import * as Objects from "@paperbits/common/objects";
import template from "./sectionEditor.html";
import { Component, OnMounted, Param, Event } from "@paperbits/common/ko/decorators";
import { SectionModel } from "../sectionModel";
import { BackgroundStylePluginConfig } from "@paperbits/styles/contracts";
import { ChangeRateLimit } from "@paperbits/common/ko/consts";

@Component({
    selector: "email-layout-section-editor",
    template: template
})
export class SectionEditor {
    public readonly background: ko.Observable<BackgroundStylePluginConfig>;

    constructor() {
        this.background = ko.observable<BackgroundStylePluginConfig>();
    }

    @Param()
    public model: SectionModel;

    @Event()
    public onChange: (model: SectionModel) => void;

    @OnMounted()
    public initialize(): void {
        this.model.styles = this.model.styles || {};

        this.background(this.model.styles?.instance?.background);
        this.background.extend(ChangeRateLimit).subscribe(this.applyChanges);
    }

    private applyChanges(): void {
        this.onChange(this.model);
    }

    public onBackgroundUpdate(background: BackgroundStylePluginConfig): void {
        Objects.setValue("instance/background", this.model.styles, background);
        this.applyChanges();
    }
}
