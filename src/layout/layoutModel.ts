/**
 * @license
 * Copyright Paperbits. All Rights Reserved.
 *
 * Use of this source code is governed by a Commercial license that can be found in the LICENSE file and at style-guidehttps://paperbits.io/license/mit.
 */

import { WidgetModel } from "@paperbits/common/widgets";

export class LayoutModel {
    public type: string = "email-layout";
    public title: string;
    public description: string;   
    public permalinkTemplate: string;
    public widgets: WidgetModel[];

    constructor() {
        this.widgets = [];
    }
}
