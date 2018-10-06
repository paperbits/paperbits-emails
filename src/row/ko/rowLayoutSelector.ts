/**
 * @license
 * Copyright Paperbits. All Rights Reserved.
 *
 * Use of this source code is governed by a Commercial license that can be found in the LICENSE file and at https://paperbits.io/license.
 */

import template from "./rowLayoutSelector.html";
import { IResourceSelector } from "@paperbits/common/ui/IResourceSelector";
import { Component, Event } from "@paperbits/core/ko/decorators";
import { ColumnModel } from "../../column/columnModel";
import { RowModel } from "../rowModel";

export interface columnSizeCfg {
    xs?: number;
    sm?: number;
    md?: number;
    lg?: number;
    xl?: number;
    display?: number;
}

@Component({
    selector: "email-row-layout-selector",
    template: template,
    injectable: "emailRowLayoutSelector"
})
export class RowLayoutSelector implements IResourceSelector<RowModel> {
    public readonly rowConfigs: columnSizeCfg[][] = [
        [{ xs: 12 }],
        [{ xs: 12, md: 6 }, { xs: 12, md: 6 }],
        [{ xs: 12, md: 4 }, { xs: 12, md: 4 }, { xs: 12, md: 4 }],
        [{ xs: 12, md: 3 }, { xs: 12, md: 3 }, { xs: 12, md: 3 }, { xs: 12, md: 3 }],
        [{ xs: 12, md: 8 }, { xs: 12, md: 4 }], [{ xs: 12, md: 4 }, { xs: 12, md: 8 }],
        [{ xs: 12, md: 3 }, { xs: 12, md: 9 }], [{ xs: 12, md: 9 }, { xs: 12, md: 3 }],
        [{ xs: 12, md: 6 }, { xs: 12, md: 3 }, { xs: 12, md: 3 }],
        [{ xs: 12, md: 3 }, { xs: 12, md: 3 }, { xs: 12, md: 6 }],
        [{ xs: 12, md: 3 }, { xs: 12, md: 6 }, { xs: 12, md: 3 }]
    ];

    @Event()
    public onSelect: (rowModel: RowModel) => void;


    constructor() {
        this.selectRowLayout = this.selectRowLayout.bind(this);
    }

    public selectRowLayout(columnSizeCfgs: columnSizeCfg[]): void {
        const rowModel = new RowModel();

        columnSizeCfgs.forEach(size => {
            const column = new ColumnModel();
            column.sizeXs = size.xs;
            column.sizeSm = size.sm;
            column.sizeMd = size.md;
            column.sizeLg = size.lg;
            column.sizeXl = size.xl;
            rowModel.widgets.push(column);
        });

        if (this.onSelect) {
            this.onSelect(rowModel);
        }
    }
}