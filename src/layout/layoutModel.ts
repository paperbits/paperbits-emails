/**
 * @license
 * Copyright Paperbits. All Rights Reserved.
 *
 * Use of this source code is governed by a Commercial license that can be found in the LICENSE file and at https://paperbits.io/license/commercial.
 */

import { WidgetModel } from "@paperbits/common/widgets";

export class LayoutModel {
    /**
     * Unique identifier.
     */
    public key: string;

    /**
     * Layout title, e.g. Master page.
     */
    public title: string;

    /**
     * Layout description.
     */
    public description: string; 
    
    /**
     * Template of URL where layout needs to be applied.
     */
    public permalinkTemplate: string;

    /**
     * Child nodes.
     */
    public widgets: WidgetModel[];

    constructor() {
        this.widgets = [];
    }
}
