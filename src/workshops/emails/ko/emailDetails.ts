/**
 * @license
 * Copyright Paperbits. All Rights Reserved.
 *
 * Use of this source code is governed by a Commercial license that can be found in the LICENSE file and at https://paperbits.io/license.
 */

import template from "./emailDetails.html";
import { EmailService } from "../../../emailService";
import { IRouteHandler } from "@paperbits/common/routing";
import { IViewManager } from "@paperbits/common/ui";
import { Component } from "@paperbits/core/ko/component";
import { EmailItem } from "./emailItem";

@Component({
    selector: "email-details-workshop",
    template: template,
    injectable: "emailDetailsWorkshop"
})
export class EmailDetailsWorkshop {
    private readonly onDeleteCallback: () => void;

    public emailItem: EmailItem;

    constructor(
        private readonly emailService: EmailService,
        private readonly routeHandler: IRouteHandler,
        private readonly viewManager: IViewManager,
        params
    ) {

        // initialization...
        this.emailItem = params.emailItem;
        this.onDeleteCallback = params.onDeleteCallback;

        // rebinding...
        this.deleteEmail = this.deleteEmail.bind(this);
        this.updateEmail = this.updateEmail.bind(this);

        this.emailItem.title
            .extend({ required: true, onlyValid: true })
            .subscribe(this.updateEmail);

        this.emailItem.description
            .subscribe(this.updateEmail);
    }

    private async updateEmail(): Promise<void> {
        await this.emailService.updateEmailTemplate(this.emailItem.toContract());
    }

    public async deleteEmail(): Promise<void> {
        // TODO: Show confirmation dialog according to mockup
        await this.emailService.deleteEmailTemplate(this.emailItem.toContract());

        this.viewManager.notifySuccess("Emails", `Email "${this.emailItem.title()}" was deleted.`);
        this.viewManager.closeWorkshop("email-details-workshop");

        if (this.onDeleteCallback) {
            this.onDeleteCallback();
        }

        this.routeHandler.navigateTo("/");
    }
}