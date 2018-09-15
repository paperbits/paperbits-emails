/**
 * @license
 * Copyright Paperbits. All Rights Reserved.
 *
 * Use of this source code is governed by a Commercial license that can be found in the LICENSE file and at https://paperbits.io/license.
 */

import { IInjectorModule, IInjector } from "@paperbits/common/injection";
import { IViewModelBinder } from "@paperbits/common/widgets";
import { RowViewModel } from "./rowViewModel";
import { RowModelBinder } from "../rowModelBinder";
import { RowViewModelBinder } from "./rowViewModelBinder";
import { IModelBinder } from "@paperbits/common/editing";


export class RowModule implements IInjectorModule {
    public register(injector: IInjector): void {
        injector.bind("emailRow", RowViewModel);
        injector.bind("emailRowModelBinder", RowModelBinder);
        injector.bind("emailRowViewModelBinder", RowViewModelBinder);

        const modelBinders = injector.resolve<IModelBinder[]>("modelBinders");
        modelBinders.push(injector.resolve("emailRowModelBinder"));
       
        const viewModelBinders = injector.resolve<IViewModelBinder<any, any>[]>("viewModelBinders");
        viewModelBinders.push(injector.resolve("emailRowViewModelBinder"));
    }
}