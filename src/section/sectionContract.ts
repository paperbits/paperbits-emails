/**
 * @license
 * Copyright Paperbits. All Rights Reserved.
 *
 * Use of this source code is governed by a Commercial license that can be found in the LICENSE file and at https://paperbits.io/license/commercial.
 */

import { Contract } from "@paperbits/common";
import { BackgroundContract } from "@paperbits/common/ui";

export interface SectionContract extends Contract {
    background?: BackgroundContract;

    /**
     *  Layout types: container, full width.
     */
    layout?: string;

    /**
     * by content, screen size
     */
    height?: string;

    /**
     * Possible values: top, bottom.
     */
    snapping: string;

    padding: string;
}