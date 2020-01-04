/**
 * @license
 * Copyright Paperbits. All Rights Reserved.
 *
 * Use of this source code is governed by a Commercial license that can be found in the LICENSE file and at https://paperbits.io/license/commercial.
 */

import * as ko from "knockout";
import template from "./columnEditor.html";
import { ViewManager } from "@paperbits/common/ui";
import { Component, OnMounted, Param, Event } from "@paperbits/common/ko/decorators";
import { ColumnModel } from "../columnModel";

@Component({
    selector: "email-layout-column-editor",
    template: template
})
export class ColumnEditor {
    public readonly verticalAlignment: ko.Observable<string>;
    public readonly horizontalAlignment: ko.Observable<string>;
    public readonly alignment: ko.Observable<string>;
    public readonly scrollOnOverlow: ko.Observable<boolean>;

    constructor(private readonly viewManager: ViewManager) {
        this.alignment = ko.observable<string>();
        this.verticalAlignment = ko.observable<string>();
        this.horizontalAlignment = ko.observable<string>();
        this.scrollOnOverlow = ko.observable<boolean>();
    }

    @Param()
    public model: ColumnModel;

    @Event()
    public onChange: (model: ColumnModel) => void;

    @OnMounted()
    public initialize(): void {
        const alignment = this.model.alignment;
        this.alignment(alignment);

        const directions = this.alignment().split(" ");
        this.verticalAlignment(directions[0]);
        this.horizontalAlignment(directions[1]);

        this.alignment.subscribe(this.applyChanges);
        this.scrollOnOverlow.subscribe(this.applyChanges);
    }

    /**
     * Collecting changes from the editor UI and invoking callback method.
     */
    private applyChanges(): void {
        this.model.alignment = this.alignment();
        this.onChange(this.model);
    }

    public alignContent(alignment: string): void {
        this.alignment(alignment);
    }

    private align(): void {
        this.alignment(`${this.verticalAlignment()} ${this.horizontalAlignment()}`);
    }

    public determineAlignment(model: ColumnModel): string {
        return model.alignment || "top left";
    }

    public alignLeft(): void {
        this.horizontalAlignment("left");
        this.align();
    }

    public alignRight(): void {
        this.horizontalAlignment("right");
        this.align();
    }

    public alignCenter(): void {
        this.horizontalAlignment("center");
        this.align();
    }

    public alignTop(): void {
        this.verticalAlignment("top");
        this.align();
    }

    public alignBottom(): void {
        this.verticalAlignment("bottom");
        this.align();
    }

    public alignMiddle(): void {
        this.verticalAlignment("center");
        this.align();
    }
}
