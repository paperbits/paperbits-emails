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
import { Component, Param, Event, OnMounted } from "@paperbits/common/ko/decorators";
import { EmailItem } from "./emailItem";

@Component({
    selector: "email-details-workshop",
    template: template,
    injectable: "emailDetailsWorkshop"
})
export class EmailDetailsWorkshop {
    @Param()
    public emailItem: EmailItem;

    @Event()
    public onDeleteCallback: () => void;

    constructor(
        private readonly emailService: EmailService,
        private readonly routeHandler: IRouteHandler,
        private readonly viewManager: IViewManager
    ) {
        // rebinding...
        this.onMounted = this.onMounted.bind(this);
        this.deleteEmail = this.deleteEmail.bind(this);
        this.updateEmail = this.updateEmail.bind(this);
    }

    @OnMounted()
    public async onMounted(): Promise<void> {
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