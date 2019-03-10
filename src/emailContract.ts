/**
 * @license
 * Copyright Paperbits. All Rights Reserved.
 *
 * Use of this source code is governed by a Commercial license that can be found in the LICENSE file and at https://paperbits.io/license/commercial.
 */

export interface EmailContract {
    /**
     * Own key.
     */
    key?: string;

    /**
     * Template title.
     */
    title: string;

    /**
     * Template description.
     */
    description: string;

    /**
     * Key of a file having template content.
     */
    contentKey?: string;
}