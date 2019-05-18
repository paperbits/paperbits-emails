/**
 * @license
 * Copyright Paperbits. All Rights Reserved.
 *
 * Use of this source code is governed by a Commercial license that can be found in the LICENSE file and at https://paperbits.io/license/commercial.
 */

import { IInjectorModule, IInjector } from "@paperbits/common/injection";
import { ViewModelBinder } from "@paperbits/common/widgets";
import { ColumnViewModel } from "./columnViewModel";
import { ColumnModelBinder } from "../columnModelBinder";
import { ColumnViewModelBinder } from "./columnViewModelBinder";
import { IModelBinder } from "@paperbits/common/editing";

export class ColumnModule implements IInjectorModule {
    public register(injector: IInjector): void {
        injector.bind("column", ColumnViewModel);
        injector.bindToCollection("modelBinders", ColumnModelBinder);
        injector.bindToCollection("viewModelBinders", ColumnViewModelBinder);
    }
}