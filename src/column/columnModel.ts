/**
 * @license
 * Copyright Paperbits. All Rights Reserved.
 *
 * Use of this source code is governed by a Commercial license that can be found in the LICENSE file and at https://paperbits.io/license.
 */

import { WidgetModel } from "@paperbits/common/widgets";

export class ColumnModel implements WidgetModel {    
    public widgets: WidgetModel[];
    public sizeXs: number;
    public sizeSm: number;
    public sizeMd: number;
    public sizeLg: number;
    public sizeXl: number;
    public alignmentXs: string;
    public alignmentSm: string;
    public alignmentMd: string;
    public alignmentLg: string;
    public alignmentXl: string;

    constructor() {
        this.widgets = [];
    }
}