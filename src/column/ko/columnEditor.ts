/**
 * @license
 * Copyright Paperbits. All Rights Reserved.
 *
 * Use of this source code is governed by a Commercial license that can be found in the LICENSE file and at https://paperbits.io/license.
 */

import * as ko from "knockout";
import template from "./columnEditor.html";
import { IViewManager } from "@paperbits/common/ui";
import { IWidgetEditor } from "@paperbits/common/widgets/IWidgetEditor";
import { Component } from "@paperbits/core/ko/decorators";
import { ColumnModel } from "../columnModel";

@Component({
    selector: "email-column-editor",
    template: template,
    injectable: "columnEditor"
})
export class ColumnEditor implements IWidgetEditor {
    private column: ColumnModel;
    private applyChangesCallback: () => void;
    private readonly verticalAlignment: KnockoutObservable<string>;
    private readonly horizontalAlignment: KnockoutObservable<string>;

    public readonly alignment: KnockoutObservable<string>;
    public readonly order: KnockoutObservable<number>;

    constructor(
        private readonly viewManager: IViewManager
    ) {
        this.setWidgetModel = this.setWidgetModel.bind(this);

        this.alignment = ko.observable<string>();
        this.alignment.subscribe(this.onChange.bind(this));

        this.verticalAlignment = ko.observable<string>();
        this.horizontalAlignment = ko.observable<string>();

        this.order = ko.observable<number>();
        this.order.subscribe(this.onChange.bind(this));

        this.alignLeft.bind(this);
        this.alignRight.bind(this);
        this.alignCenter.bind(this);
        this.alignTop.bind(this);
        this.alignBottom.bind(this);
        this.alignMiddle.bind(this);
    }

    /**
     * Collecting changes from the editor UI and invoking callback method.
     */
    private onChange(): void {
        if (!this.applyChangesCallback) {
            return;
        }

        const viewport = this.viewManager.getViewport();

        switch (viewport) {
            case "xl":
                this.column.alignmentXl = this.alignment();
                break;

            case "lg":
                this.column.alignmentLg = this.alignment();
                break;

            case "md":
                this.column.alignmentMd = this.alignment();
                break;

            case "sm":
                this.column.alignmentSm = this.alignment();
                break;

            case "xs":
                this.column.alignmentXs = this.alignment();
                break;

            default:
                throw new Error("Unknown viewport");
        }

        this.applyChangesCallback();
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

    public setWidgetModel(column: ColumnModel, applyChangesCallback?: () => void): void {
        this.column = column;

        const viewport = this.viewManager.getViewport();

        const alignment = this.determineAlignment(viewport, column);
        this.alignment(alignment);

        const directions = this.alignment().split(" ");
        this.verticalAlignment(directions[0]);
        this.horizontalAlignment(directions[1]);

        this.applyChangesCallback = applyChangesCallback;
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
