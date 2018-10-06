/**
 * @license
 * Copyright Paperbits. All Rights Reserved.
 *
 * Use of this source code is governed by a Commercial license that can be found in the LICENSE file and at https://paperbits.io/license.
 */

import * as ko from "knockout";
import template from "./emails.html";
import { IRouteHandler } from "@paperbits/common/routing";
import { IViewManager } from "@paperbits/common/ui";
import { IFileService } from "@paperbits/common/files";
import { Keys } from "@paperbits/common/keyboard";
import { IBlockService } from "@paperbits/common/blocks";
import { Component } from "@paperbits/core/ko/decorators";
import { EmailItem } from "./emailItem";
import { EmailService } from "../../../emailService";

const templateBlockKey = "blocks/8730d297-af39-8166-83b6-9439addca789";

@Component({
    selector: "emails",
    template: template,
    injectable: "emailsWorkshop"
})
export class EmailsWorkshop {
    private searchTimeout: any;

    public readonly searchPattern: KnockoutObservable<string>;
    public readonly emails: KnockoutObservableArray<EmailItem>;
    public readonly working: KnockoutObservable<boolean>;
    public readonly selectedEmail: KnockoutObservable<EmailItem>;

    constructor(
        private readonly emailService: EmailService,
        private readonly fileService: IFileService,
        private readonly routeHandler: IRouteHandler,
        private readonly blockService: IBlockService,
        private readonly viewManager: IViewManager
    ) {
        // rebinding...
        this.searchEmails = this.searchEmails.bind(this);
        this.addEmail = this.addEmail.bind(this);
        this.selectEmail = this.selectEmail.bind(this);
        this.onKeyDown = this.onKeyDown.bind(this);

        // setting up...
        this.emails = ko.observableArray<EmailItem>();
        this.selectedEmail = ko.observable<EmailItem>();
        this.searchPattern = ko.observable<string>("");
        this.searchPattern.subscribe(this.searchEmails);
        this.working = ko.observable(true);

        this.searchEmails();
    }

    private async launchSearch(searchPattern: string = ""): Promise<void> {
        this.working(true);
        const emails = await this.emailService.search(searchPattern);
        const emailItems = emails.map(email => new EmailItem(email));

        this.emails(emailItems);
        this.working(false);
    }

    public async searchEmails(searchPattern: string = ""): Promise<void> {
        clearTimeout(this.searchTimeout);

        this.searchTimeout = setTimeout(() => {
            this.launchSearch(searchPattern);
        }, 600);
    }

    public selectEmail(emailItem: EmailItem): void {
        this.selectedEmail(emailItem);
        this.viewManager.setDocument({ src: "/email.html", componentName: "email-document" });
        this.viewManager.openViewAsWorkshop("Email", "email-details-workshop", {
            emailItem: emailItem,
            onDeleteCallback: () => {
                this.searchEmails();
            }
        });
    }

    public async addEmail(): Promise<void> {
        this.working(true);

        const email = await this.emailService.createEmailTemplate("New email", "");
        const contentTemplate = await this.blockService.getBlockByKey(templateBlockKey);

        const template = {
            object: "block",
            nodes: [contentTemplate.content],
            type: "email"
        };

        const content = await this.fileService.createFile(template);
        email.contentKey = content.key;

        await this.emailService.updateEmailTemplate(email);

        // this.routeHandler.navigateTo(permalink.uri);

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

        this.routeHandler.navigateTo("/");
    }

    public onKeyDown(item: EmailItem, event: KeyboardEvent): boolean {
        if (event.keyCode === Keys.Delete) {
            this.deleteSelectedEmail();
        }
        return true;
    }
}