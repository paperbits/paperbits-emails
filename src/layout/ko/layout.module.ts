/**
 * @license
 * Copyright Paperbits. All Rights Reserved.
 *
 * Use of this source code is governed by a Commercial license that can be found in the LICENSE file and at https://paperbits.io/license/commercial.
 */

import { IInjectorModule, IInjector } from "@paperbits/common/injection";
import { ViewModelBinder } from "@paperbits/common/widgets";
import { LayoutViewModel } from "./layoutViewModel";
import { LayoutModelBinder } from "../layoutModelBinder";
import { LayoutViewModelBinder } from "./layoutViewModelBinder";
import { IModelBinder } from "@paperbits/common/editing";

export class LayoutModule implements IInjectorModule {
    public register(injector: IInjector): void {        
        injector.bind("emailLayoutWidget", LayoutViewModel);
        injector.bindToCollection("modelBinders", LayoutModelBinder, "emailLayoutModelBinder");
        injector.bindToCollection("viewModelBinders", LayoutViewModelBinder, "emailLayoutViewModelBinder");
    }
}