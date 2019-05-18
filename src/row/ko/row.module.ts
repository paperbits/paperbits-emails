/**
 * @license
 * Copyright Paperbits. All Rights Reserved.
 *
 * Use of this source code is governed by a Commercial license that can be found in the LICENSE file and at https://paperbits.io/license/commercial.
 */

import { IInjectorModule, IInjector } from "@paperbits/common/injection";
import { ViewModelBinder } from "@paperbits/common/widgets";
import { RowViewModel } from "./rowViewModel";
import { RowModelBinder } from "../rowModelBinder";
import { RowViewModelBinder } from "./rowViewModelBinder";
import { IModelBinder } from "@paperbits/common/editing";


export class RowModule implements IInjectorModule {
    public register(injector: IInjector): void {
        injector.bind("emailRow", RowViewModel);
        injector.bindToCollection("modelBinders", RowModelBinder);
        injector.bindToCollection("viewModelBinders", RowViewModelBinder);
    }
}