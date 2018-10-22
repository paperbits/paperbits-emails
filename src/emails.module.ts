/**
 * @license
 * Copyright Paperbits. All Rights Reserved.
 *
 * Use of this source code is governed by a Commercial license that can be found in the LICENSE file and at https://paperbits.io/license.
 */

import { IInjectorModule, IInjector } from "@paperbits/common/injection";
import { EmailService } from "./emailService";
import { LayoutModule } from "./layout/ko/layout.module";
import { ColumnModule } from "./column/ko/column.module";
import { RowModule } from "./row/ko/row.module";
import { SectionModule } from "./section/ko/section.module";

export class EmailsModule implements IInjectorModule {
    public register(injector: IInjector): void {
        injector.bindSingleton("emailService", EmailService);

        injector.bindModule(new LayoutModule());
        injector.bindModule(new ColumnModule());
        injector.bindModule(new RowModule());
        injector.bindModule(new SectionModule());
    }
}