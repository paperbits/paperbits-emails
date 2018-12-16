/**
 * @license
 * Copyright Paperbits. All Rights Reserved.
 *
 * Use of this source code is governed by a Commercial license that can be found in the LICENSE file and at https://paperbits.io/license.
 */

import * as ko from "knockout";
import { EmailContract } from "../../../emailContract";

export class AnchorItem {
    public hasFocus: KnockoutObservable<boolean>;
    public title: string;
    public shortTitle: string;

    constructor() {
        this.hasFocus = ko.observable<boolean>(false);
    }
}

export class EmailItem {
    public contentKey?: string;
    public key: string;
    public permalinkUrl: KnockoutObservable<string>;
    public title: KnockoutObservable<string>;
    public description: KnockoutObservable<string>;
    public keywords: KnockoutObservable<string>;
    public hasFocus: KnockoutObservable<boolean>;

    public anchors: AnchorItem[];

    constructor(email: EmailContract) {
        this.contentKey = email.contentKey;
        this.key = email.key;

        this.permalinkUrl = ko.observable<string>();
        this.title = ko.observable<string>(email.title);
        this.description = ko.observable<string>(email.description);
        this.hasFocus = ko.observable<boolean>(false);
        this.anchors = [];
    }

    public toContract(): EmailContract {
        return {
            key: this.key,
            title: this.title(),
            description: this.description(),
            contentKey: this.contentKey
        };
    }
}