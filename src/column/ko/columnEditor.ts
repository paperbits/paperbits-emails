/**
 * @license
 * Copyright Paperbits. All Rights Reserved.
 *
 * Use of this source code is governed by a Commercial license that can be found in the LICENSE file and at https://paperbits.io/license.
 */

import * as ko from "knockout";
import template from "./columnEditor.html";
import { IViewManager } from "@paperbits/common/ui";
import { Component, OnMounted, Param, Event } from "@paperbits/common/ko/decorators";
import { ColumnModel } from "../columnModel";

@Component({
    selector: "email-column-editor",
    template: template,
    injectable: "columnEditor"
})
export class ColumnEditor {
    public readonly verticalAlignment: ko.Observable<string>;
    public readonly horizontalAlignment: ko.Observable<string>;
    public readonly alignment: ko.Observable<string>;
    public readonly order: ko.Observable<number>;

    constructor(
        private readonly viewManager: IViewManager
    ) {
        this.alignment = ko.observable<string>();
        this.verticalAlignment = ko.observable<string>();
        this.horizontalAlignment = ko.observable<string>();
        this.order = ko.observable<number>();
    }

    /**
     * Collecting changes from the editor UI and invoking callback method.
     */
    private applyChanges(): void {
        const viewport = this.viewManager.getViewport();

        switch (viewport) {
            case "xl":
                this.model.alignmentXl = this.alignment();
                break;

            case "lg":
                this.model.alignmentLg = this.alignment();
                break;

            case "md":
                this.model.alignmentMd = this.alignment();
                break;

            case "sm":
                this.model.alignmentSm = this.alignment();
                break;

            case "xs":
                this.model.alignmentXs = this.alignment();
                break;

            default:
                throw new Error("Unknown viewport");
        }

        this.onChange(this.model);
    }

    public alignContent(alignment: string): void {
        this.alignment(alignment);
    }

    private align(): void {
        this.alignment(`${this.verticalAlignment()} ${this.horizontalAlignment()}`);
    }

    public determineAlignment(viewport: string, model: ColumnModel): string {
        switch (viewport) {
            case "xl":
                return model.alignmentXl || this.determineAlignment("lg", model);

            case "lg":
                return model.alignmentLg || this.determineAlignment("md", model);

            case "md":
                return model.alignmentMd || this.determineAlignment("sm", model);

            case "sm":
                return model.alignmentSm || this.determineAlignment("xs", model);

            case "xs":
                return model.alignmentXs || "start start";

            default:
                throw new Error("Unknown viewport");
        }
    }

    @Param()
    public model: ColumnModel;

    @Event()
    public onChange: (model: ColumnModel) => void;

    @OnMounted()
    public initialize(): void {
        const viewport = this.viewManager.getViewport();

        const alignment = this.determineAlignment(viewport, this.model);
        this.alignment(alignment);

        const directions = this.alignment().split(" ");
        this.verticalAlignment(directions[0]);
        this.horizontalAlignment(directions[1]);

        this.alignment.subscribe(this.applyChanges);
        this.order.subscribe(this.applyChanges);
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
