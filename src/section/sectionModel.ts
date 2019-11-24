/**
 * @license
 * Copyright Paperbits. All Rights Reserved.
 *
 * Use of this source code is governed by a Commercial license that can be found in the LICENSE file and at https://paperbits.io/license/commercial.
 */

import { WidgetModel } from "@paperbits/common/widgets";
import { BackgroundModel } from "@paperbits/common/widgets/background";
import { StyleContract } from "@paperbits/common/styles";

export class SectionModel {
    public widgets: WidgetModel[];
    public container: string;
    public padding: string;
    public snap: string;
    public height: string;
    public background: BackgroundModel;
    public styles: StyleContract;

    constructor() {
        this.container = "container";
        this.padding = "with-padding";
        this.snap = "none";
        this.background = new BackgroundModel();
        this.widgets = [];
    }
}