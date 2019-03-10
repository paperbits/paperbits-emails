import * as ko from "knockout";

ko.bindingHandlers["tableCell"] = {
    init: (element: HTMLElement, valueAccessor) => {
        const config = ko.unwrap(valueAccessor());

        const horizontalAlign = config.horizontalAlign;
        const verticalAlign = config.verticalAlign;

        ko.applyBindingsToNode(element, { attr: { align: horizontalAlign, valign: verticalAlign } }, null);
    }
};