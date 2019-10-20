/**
 * @license
 * Copyright Paperbits. All Rights Reserved.
 *
 * Use of this source code is governed by a Commercial license that can be found in the LICENSE file and at https://paperbits.io/license/commercial.
 */

import * as ko from "knockout";
import template from "./emails.html";
import { Router } from "@paperbits/common/routing";
import { ViewManager, View } from "@paperbits/common/ui";
import { Keys } from "@paperbits/common/keyboard";
import { Component, OnMounted } from "@paperbits/common/ko/decorators";
import { EmailItem } from "./emailItem";
import { EmailService } from "../../../emailService";
import { ChangeRateLimit } from "@paperbits/common/ko/consts";

@Component({
    selector: "emails",
    template: template,
    injectable: "emailsWorkshop"
})
export class EmailsWorkshop {
    public readonly searchPattern: ko.Observable<string>;
    public readonly emails: ko.ObservableArray<EmailItem>;
    public readonly working: ko.Observable<boolean>;
    public readonly selectedEmail: ko.Observable<EmailItem>;

    constructor(
        private readonly emailService: EmailService,
        private readonly router: Router,
        private readonly viewManager: ViewManager
    ) {
        this.emails = ko.observableArray();
        this.selectedEmail = ko.observable();
        this.searchPattern = ko.observable("");
        this.working = ko.observable();
    }

    @OnMounted()
    public async initialize(): Promise<void> {
        await this.searchEmails();

        this.searchPattern
            .extend(ChangeRateLimit)
            .subscribe(this.searchEmails);
    }

    private async searchEmails(searchPattern: string = ""): Promise<void> {
        this.working(true);

        const emails = await this.emailService.search(searchPattern);
        const emailItems = emails.map(email => new EmailItem(email));
        this.emails(emailItems);

        this.working(false);
    }

    public selectEmail(emailItem: EmailItem): void {
        this.selectedEmail(emailItem);
        this.viewManager.setHost({ name: "email-host" });

        const view: View = {
            heading: "Email template",
            component: {
                name: "email-details-workshop",
                params: {
                    emailItem: emailItem,
                    onDeleteCallback: () => {
                        this.searchEmails();
                    }
                }
            }
        };

        this.viewManager.openViewAsWorkshop(view);
    }

    public async addEmail(): Promise<void> {
        this.working(true);

        const email = await this.emailService.createEmailTemplate("New email", "");
        const emailItem = new EmailItem(email);

        this.emails.push(emailItem);
        this.selectEmail(emailItem);
        this.working(false);
    }

    public async deleteSelectedEmail(): Promise<void> {
        // TODO: Show confirmation dialog according to mockup
        this.viewManager.closeWorkshop("email-details-workshop");

        await this.emailService.deleteEmailTemplate(this.selectedEmail().toContract());
        await this.searchEmails();

        this.router.navigateTo("/");
    }

    public onKeyDown(item: EmailItem, event: KeyboardEvent): boolean {
        if (event.keyCode === Keys.Delete) {
            this.deleteSelectedEmail();
        }
        return true;
    }
}