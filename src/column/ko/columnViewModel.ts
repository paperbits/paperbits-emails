/**
 * @license
 * Copyright Paperbits. All Rights Reserved.
 *
 * Use of this source code is governed by a Commercial license that can be found in the LICENSE file and at https://paperbits.io/license.
 */

import * as ko from "knockout";
import template from "./column.html";
import { Component } from "@paperbits/common/ko/decorators";

@Component({
    selector: "email-column",
    template: template,
    injectable: "column",
    postprocess: (element: Node, viewModel) => {
        // TODO: Get rid of hack!
        if (element.nodeName === "#comment") {
            do {
                element = element.nextSibling;
            }
            while (element !== null && element.nodeName === "#comment");
        }

        ko.applyBindingsToNode(element, {
            layoutcolumn: {},
            css: viewModel.css
        }, null);
    }
})
export class ColumnViewModel {
    public widgets: ko.ObservableArray<Object>;
    public css: ko.Computed<string>;
    public sizeSm: ko.Observable<number>;
    public sizeMd: ko.Observable<number>;
    public sizeLg: ko.Observable<number>;
    public sizeXl: ko.Observable<number>;
    public alignmentXs: ko.Observable<string>;
    public alignmentSm: ko.Observable<string>;
    public alignmentMd: ko.Observable<string>;
    public alignmentLg: ko.Observable<string>;
    public alignmentXl: ko.Observable<string>;
    public orderXs: ko.Observable<number>;
    public orderSm: ko.Observable<number>;
    public orderMd: ko.Observable<number>;
    public orderLg: ko.Observable<number>;
    public orderXl: ko.Observable<number>;

    constructor() {
        this.widgets = ko.observableArray<Object>();
        this.sizeSm = ko.observable<number>();
        this.sizeMd = ko.observable<number>();
        this.sizeLg = ko.observable<number>();
        this.sizeXl = ko.observable<number>();

        this.alignmentXs = ko.observable<string>();
        this.alignmentSm = ko.observable<string>();
        this.alignmentMd = ko.observable<string>();
        this.alignmentLg = ko.observable<string>();
        this.alignmentXl = ko.observable<string>();

        this.orderXs = ko.observable<number>();
        this.orderSm = ko.observable<number>();
        this.orderMd = ko.observable<number>();
        this.orderLg = ko.observable<number>();
        this.orderXl = ko.observable<number>();

        this.css = ko.computed(() => {
            let classes = [];

            // There's no XS size

            if (this.sizeSm()) {
                classes.push("col-sm-" + this.sizeSm());
            }

            if (this.sizeMd()) {
                classes.push("col-md-" + this.sizeMd());
            }

            if (this.sizeLg()) {
                classes.push("col-lg-" + this.sizeLg());
            }

            if (this.sizeXl()) {
                classes.push("col-xl-" + this.sizeXl());
            }

            if (this.alignmentXs()) {
                classes.push(this.getAlignmentClass(this.alignmentXs(), "xs"));
            }

            if (this.alignmentSm()) {
                classes.push(this.getAlignmentClass(this.alignmentSm(), "sm"));
            }

            if (this.alignmentMd()) {
                classes.push(this.getAlignmentClass(this.alignmentMd(), "md"));
            }

            if (this.alignmentLg()) {
                classes.push(this.getAlignmentClass(this.alignmentLg(), "lg"));
            }

            if (this.alignmentXl()) {
                classes.push(this.getAlignmentClass(this.alignmentXl(), "xl"));
            }

            if (this.orderXs()) {
                classes.push(this.getOrderClass(this.orderXs(), "xs"))
            }

            if (this.orderSm()) {
                classes.push(this.getOrderClass(this.orderSm(), "sm"))
            }

            if (this.orderMd()) {
                classes.push(this.getOrderClass(this.orderMd(), "md"))
            }

            if (this.orderLg()) {
                classes.push(this.getOrderClass(this.orderLg(), "lg"))
            }

            if (this.orderXl()) {
                classes.push(this.getOrderClass(this.orderXl(), "xl"))
            }

            return classes.join(" ");
        });
    }

    private getOrderClass(order: number, targetSize: string): string {
        let size = "";

        if (targetSize !== "xs") {
            size = targetSize + "-";
        }

        return `order-${size}${order}`;
    }

    private getAlignmentClass(alignmentString: string, targetSize: string): string {
        const alignment = alignmentString.split(" ");
        const vertical = alignment[0];
        const horizontal = alignment[1];
        let size = "";

        if (targetSize !== "xs") {
            size = targetSize + "-";
        }

        return `align-vertically-${size}${vertical} align-horizontally-${size}${horizontal}`;
    }
}
