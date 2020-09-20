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
import { Query, Operator, Page } from "@paperbits/common/persistence";
import { EmailContract } from "../../../emailContract";

@Component({
    selector: "emails",
    template: template
})
export class EmailsWorkshop {
    private currentPage: Page<EmailContract>;
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
        this.working = ko.observable(false);
    }

    @OnMounted()
    public async initialize(): Promise<void> {
        await this.searchEmails();

        this.searchPattern
            .extend(ChangeRateLimit)
            .subscribe(this.searchEmails);
    }

    public async searchEmails(searchPattern: string = ""): Promise<void> {
        this.working(true);
        this.emails([]);

        const query = Query
            .from<EmailContract>()
            .orderBy(`title`);

        if (searchPattern) {
            query.where(`title`, Operator.contains, searchPattern);
        }

        const pageOfResults = await this.emailService.search(query);
        this.currentPage = pageOfResults;

        const pageItems = pageOfResults.value.map(email => new EmailItem(email));
        this.emails.push(...pageItems);
        
        this.working(false);
    }

    public async loadNextPage(): Promise<void> {
        if (!this.currentPage?.takeNext || this.working()) {
            this.loadNextPage = null;
            return;
        }

        this.working(true);

        this.currentPage = await this.currentPage.takeNext();

        const pageItems = this.currentPage.value.map(page => new EmailItem(page));
        this.emails.push(...pageItems);

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