import * as ko from "knockout";

ko.bindingHandlers["tableCell"] = {
    init: (element: HTMLElement, valueAccessor) => {
        const config = ko.unwrap(valueAccessor());

        const horizontalAlign = config.horizontalAlign;
        const verticalAlign = config.verticalAlign;
        const size = config.size();

        const width = size * 100 / 12;

        ko.applyBindingsToNode(element, { attr: { width: `${width}%`, align: horizontalAlign, valign: verticalAlign } }, null);
    }
};