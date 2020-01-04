/**
 * @license
 * Copyright Paperbits. All Rights Reserved.
 *
 * Use of this source code is governed by a Commercial license that can be found in the LICENSE file and at https://paperbits.io/license/commercial.
 */

import template from "./rowLayoutSelector.html";
import { IResourceSelector } from "@paperbits/common/ui/IResourceSelector";
import { Component, Event } from "@paperbits/common/ko/decorators";
import { ColumnModel } from "../../column/columnModel";
import { RowModel } from "../rowModel";

export interface ColumnSizeCfg {
    xs?: number;
    sm?: number;
    md?: number;
    lg?: number;
    xl?: number;
    display?: number;
}

@Component({
    selector: "email-row-layout-selector",
    template: template
})
export class RowLayoutSelector implements IResourceSelector<RowModel> {
    public readonly rowConfigs: ColumnSizeCfg[][] = [
        [{ xs: 12 }],
        [{ xs: 6 }, { xs: 6 }],
        [{ xs: 4 }, { xs: 4 }, { xs: 4 }]
    ];

    @Event()
    public onSelect: (rowModel: RowModel) => void;

    constructor() {
        this.selectRowLayout = this.selectRowLayout.bind(this);
    }

    public selectRowLayout(columnSizeCfgs: ColumnSizeCfg[]): void {
        const rowModel = new RowModel();

        columnSizeCfgs.forEach(size => {
            const column = new ColumnModel();
            column.size = size.xs.toString();
            rowModel.widgets.push(column);
        });

        if (this.onSelect) {
            this.onSelect(rowModel);
        }
    }
}