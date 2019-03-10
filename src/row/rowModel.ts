/**
 * @license
 * Copyright Paperbits. All Rights Reserved.
 *
 * Use of this source code is governed by a Commercial license that can be found in the LICENSE file and at https://paperbits.io/license/commercial.
 */

import { WidgetModel } from "@paperbits/common/widgets";

export class RowModel implements WidgetModel {
    public widgets: WidgetModel[];
    public alignSm: string;
    public alignMd: string;
    public alignLg: string;
    public justifySm: string;
    public justifyMd: string;
    public justifyLg: string;

    constructor() {
        this.widgets = [];
    }
}
