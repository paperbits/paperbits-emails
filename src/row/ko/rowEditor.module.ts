/**
 * @license
 * Copyright Paperbits. All Rights Reserved.
 *
 * Use of this source code is governed by a Commercial license that can be found in the LICENSE file and at https://paperbits.io/license.
 */

import { IInjectorModule, IInjector } from "@paperbits/common/injection";
import { IViewManager } from "@paperbits/common/ui";
import { RowLayoutSelector } from "./rowLayoutSelector";

export class RowEditorModule implements IInjectorModule {
    public register(injector: IInjector): void {
        injector.bindComponent("emailRowLayoutSelector", (ctx: IInjector, params: {}) => {
            const viewManager = ctx.resolve<IViewManager>("viewManager");
            return new RowLayoutSelector(viewManager, params["onSelect"]);
        });
    }
}
