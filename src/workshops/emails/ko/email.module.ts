/**
 * @license
 * Copyright Paperbits. All Rights Reserved.
 *
 * Use of this source code is governed by a Commercial license that can be found in the LICENSE file and at https://paperbits.io/license.
 */

import { IInjectorModule, IInjector } from "@paperbits/common/injection";
import { IRouteHandler } from "@paperbits/common/routing";
import { IViewManager } from "@paperbits/common/ui";
import { EmailService } from "../../../emailService";
import { EmailsWorkshop } from "./emails";
import { EmailDetailsWorkshop } from "./emailDetails";
import { EmailSelector } from "./emailSelector";

export class EmailWorkshopModule implements IInjectorModule {
    public register(injector: IInjector): void {
        injector.bind("emailsWorkshop", EmailsWorkshop);

        injector.bindComponent("emailDetailsWorkshop", (ctx: IInjector, params) => {
            const emailService = ctx.resolve<EmailService>("emailService");
            const routeHandler = ctx.resolve<IRouteHandler>("routeHandler");
            const viewManager = ctx.resolve<IViewManager>("viewManager");

            return new EmailDetailsWorkshop(emailService, routeHandler, viewManager, params);
        });

        injector.bindComponent("emailSelector", (ctx: IInjector, params: {}) => {
            const emailService = ctx.resolve<EmailService>("emailService");
            return new EmailSelector(emailService, params["onSelect"]);
        });
    }
}