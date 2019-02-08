/**
 * @license
 * Copyright Paperbits. All Rights Reserved.
 *
 * Use of this source code is governed by a Commercial license that can be found in the LICENSE file and at https://paperbits.io/license.
 */

import * as ko from "knockout";
import template from "./emailSelector.html";
import { IResourceSelector } from "@paperbits/common/ui";
import { EmailItem } from "./emailItem";
import { EmailContract } from "../../../emailContract";
import { EmailService } from "../../../emailService";
import { Component, Event, Param } from "@paperbits/common/ko/decorators";

@Component({
    selector: "email-selector",
    template: template,
    injectable: "emailSelector"
})
export class EmailSelector implements IResourceSelector<EmailContract> {
    public readonly searchPattern: ko.Observable<string>;
    public readonly emails: ko.ObservableArray<EmailItem>;
    public readonly working: ko.Observable<boolean>;

    @Param()
    public selectedEmailTemplate: ko.Observable<EmailItem>;

    @Event()
    public onSelect: (email: EmailContract) => void;

    constructor(private readonly emailService: EmailService) {
        this.selectEmail = this.selectEmail.bind(this);

        this.emails = ko.observableArray<EmailItem>();
        this.selectedEmailTemplate = ko.observable<EmailItem>();
        this.searchPattern = ko.observable<string>();
        this.searchPattern.subscribe(this.searchEmails);
        this.working = ko.observable(true);

        // setting up...
        this.emails = ko.observableArray<EmailItem>();
        this.selectedEmailTemplate = ko.observable<EmailItem>();
        this.searchPattern = ko.observable<string>();
        this.searchPattern.subscribe(this.searchEmails);
        this.working = ko.observable(true);

        this.searchEmails();
    }

    public async searchEmails(searchPattern: string = ""): Promise<void> {
        this.working(true);

        const emails = await this.emailService.search(searchPattern);
        const emailItems = emails.map(email => new EmailItem(email));

        this.emails(emailItems);
        this.working(false);
    }

    public async selectEmail(email: EmailItem): Promise<void> {
        this.selectedEmailTemplate(email);

        if (this.onSelect) {
            this.onSelect(email.toContract());
        }
    }
}