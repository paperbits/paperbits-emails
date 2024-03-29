/**
 * @license
 * Copyright Paperbits. All Rights Reserved.
 *
 * Use of this source code is governed by a Commercial license that can be found in the LICENSE file and at https://paperbits.io/license/commercial.
 */

import { Contract } from "@paperbits/common";
import { LocalStyles } from "@paperbits/common/styles";

export interface SectionContract extends Contract {
    styles?: LocalStyles;
}