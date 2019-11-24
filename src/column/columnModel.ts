/**
 * @license
 * Copyright Paperbits. All Rights Reserved.
 *
 * Use of this source code is governed by a Commercial license that can be found in the LICENSE file and at https://paperbits.io/license/commercial.
 */

import { WidgetModel } from "@paperbits/common/widgets";
import { LocalStyles } from "@paperbits/common/styles";

export class ColumnModel implements WidgetModel {
    public widgets: WidgetModel[];
    public size: string;
    public alignment: string;
    public styles: LocalStyles;

    constructor() {
        this.widgets = [];
        this.alignment = "top left";
    }
}