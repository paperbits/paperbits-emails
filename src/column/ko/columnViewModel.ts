import * as ko from "knockout";
import template from "./column.html";
import { Component } from "@paperbits/common/ko/decorators";

@Component({
    selector: "email-layout-column",
    template: template
})
export class ColumnViewModel {
    public widgets: ko.ObservableArray<Object>;
    public css: ko.Computed<string>;
    public size: ko.Observable<string>;
    public horizontalAlign: ko.Observable<string>;
    public verticalAlign: ko.Observable<string>;
    public alignment: ko.Observable<string>;

    constructor() {
        this.widgets = ko.observableArray<Object>();
        this.size = ko.observable<string>();
        this.horizontalAlign = ko.observable<string>("center");
        this.verticalAlign = ko.observable<string>("center");

        this.alignment = ko.observable<string>();

        this.css = ko.computed(() => {
            const classes = [];

            if (this.size()) {
                classes.push(`email-layout-column-${this.size()}`);
            }

            if (this.alignment()) {
                const alignment = this.alignment().split(" ");
                const vertical = alignment[0];
                const horizontal = alignment[1];

                this.verticalAlign(vertical);
                this.horizontalAlign(horizontal);
            }

            return classes.join(" ");
        });
    }
}
