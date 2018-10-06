/**
 * @license
 * Copyright Paperbits. All Rights Reserved.
 *
 * Use of this source code is governed by a Commercial license that can be found in the LICENSE file and at https://paperbits.io/license.
 */

import { IInjectorModule, IInjector } from "@paperbits/common/injection";
import { IViewModelBinder } from "@paperbits/common/widgets";
import { LayoutViewModel } from "./layoutViewModel";
import { LayoutModelBinder } from "../layoutModelBinder";
import { LayoutViewModelBinder } from "./layoutViewModelBinder";
import { IModelBinder } from "@paperbits/common/editing";

export class LayoutModule implements IInjectorModule {
    public register(injector: IInjector): void {        
        injector.bind("emailLayoutWidget", LayoutViewModel);
        injector.bind("emailLayoutModelBinder", LayoutModelBinder);
        injector.bind("emailLayoutViewModelBinder", LayoutViewModelBinder);


        
        const modelBinders = injector.resolve<IModelBinder[]>("modelBinders");
        modelBinders.push(injector.resolve("emailLayoutModelBinder"));
        
        const viewModelBinders = injector.resolve<IViewModelBinder<any, any>[]>("viewModelBinders");
        viewModelBinders.push(injector.resolve("emailLayoutViewModelBinder"));
    }
}