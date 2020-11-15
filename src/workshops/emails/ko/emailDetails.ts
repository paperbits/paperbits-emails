/**
 * @license
 * Copyright Paperbits. All Rights Reserved.
 *
 * Use of this source code is governed by a Commercial license that can be found in the LICENSE file and at https://paperbits.io/license/commercial.
 */

import template from "./emailDetails.html";
import { EmailService } from "../../../emailService";
import { Router } from "@paperbits/common/routing";
import { EventManager } from "@paperbits/common/events";
import { ViewManager } from "@paperbits/common/ui";
import { Component, Param, Event, OnMounted } from "@paperbits/common/ko/decorators";
import { EmailItem } from "./emailItem";


@Component({
    selector: "email-details-workshop",
    template: template
})
export class EmailDetailsWorkshop {
    @Param()
    public emailItem: EmailItem;

    @Event()
    public onDeleteCallback: () => void;

    constructor(
        private readonly emailService: EmailService,
        private readonly router: Router,
        private readonly eventManager: EventManager,
        private readonly viewManager: ViewManager
    ) { }

    @OnMounted()
    public async onMounted(): Promise<void> {
        this.emailItem.title
            .extend(<any>{ required: true, onlyValid: true })
            .subscribe(this.updateEmail);

        this.emailItem.description
            .subscribe(this.updateEmail);

        this.eventManager.dispatchEvent("onEmailTemplateSelect", this.emailItem.key);
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

        this.viewManager.setHost({ name: "page-host" }); // Returning to editing current page.
    }
}