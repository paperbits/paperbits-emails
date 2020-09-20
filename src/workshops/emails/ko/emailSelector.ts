/**
 * @license
 * Copyright Paperbits. All Rights Reserved.
 *
 * Use of this source code is governed by a Commercial license that can be found in the LICENSE file and at https://paperbits.io/license/commercial.
 */

import * as ko from "knockout";
import template from "./emailSelector.html";
import { IResourceSelector } from "@paperbits/common/ui";
import { Component, Event, Param, OnMounted } from "@paperbits/common/ko/decorators";
import { Operator, Page, Query } from "@paperbits/common/persistence";
import { ChangeRateLimit } from "@paperbits/common/ko/consts";
import { EmailItem } from "./emailItem";
import { EmailContract } from "../../../emailContract";
import { EmailService } from "../../../emailService";


@Component({
    selector: "email-selector",
    template: template
})
export class EmailSelector implements IResourceSelector<EmailContract> {
    private currentPage: Page<EmailContract>;
    public readonly searchPattern: ko.Observable<string>;
    public readonly emails: ko.ObservableArray<EmailItem>;
    public readonly working: ko.Observable<boolean>;

    constructor(private readonly emailService: EmailService) {
        this.emails = ko.observableArray();
        this.selectedEmailTemplate = ko.observable();
        this.searchPattern = ko.observable();
        this.working = ko.observable();
    }

    @Param()
    public selectedEmailTemplate: ko.Observable<EmailItem>;

    @Event()
    public onSelect: (email: EmailContract) => void;

    @OnMounted()
    public async initialize(): Promise<void> {
        await this.searchEmails();

        this.searchPattern
            .extend(ChangeRateLimit)
            .subscribe(this.searchEmails);
    }

    public async searchEmails(searchPattern: string = ""): Promise<void> {
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

    public async selectEmail(email: EmailItem): Promise<void> {
        this.selectedEmailTemplate(email);

        if (this.onSelect) {
            this.onSelect(email.toContract());
        }
    }
}