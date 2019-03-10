/**
 * @license
 * Copyright Paperbits. All Rights Reserved.
 *
 * Use of this source code is governed by a Commercial license that can be found in the LICENSE file and at https://paperbits.io/license/commercial.
 */

import { IInjectorModule, IInjector } from "@paperbits/common/injection";
import { EmailsModule } from "./emails.module";
import { EmailsWorkshop } from "./workshops/emails/ko/emails";
import { EmailDetailsWorkshop, EmailSelector, EmailHost } from "./workshops/emails/ko";
import { RowEditorModule } from "./row/ko/rowEditor.module";
import { ColumnEditorModule } from "./column/ko/columnEditor.module";
import { SectionEditorModule } from "./section/ko/sectionEditor.module";
import { EmailsWorkshopSection } from "./workshops/emailsSection";


export class EmailsDesignModule implements IInjectorModule {
    public register(injector: IInjector): void {
        injector.bindModule(new EmailsModule());
        injector.bind("emailsWorkshop", EmailsWorkshop);
        injector.bind("emailDetailsWorkshop", EmailDetailsWorkshop);
        injector.bind("emailSelector", EmailSelector);
        injector.bind("emailHost", EmailHost);
        injector.bindModule(new RowEditorModule());
        injector.bindModule(new ColumnEditorModule());
        injector.bindModule(new SectionEditorModule());
        injector.bindToCollection("workshopSections", EmailsWorkshopSection);
    }
}