/**
 * @license
 * Copyright Paperbits. All Rights Reserved.
 *
 * Use of this source code is governed by a Commercial license that can be found in the LICENSE file and at https://paperbits.io/license/commercial.
 */

import { IInjectorModule, IInjector } from "@paperbits/common/injection";
import { ViewModelBinder } from "@paperbits/common/widgets";
import { SectionViewModel } from "./sectionViewModel";
import { SectionModelBinder } from "../sectionModelBinder";
import { SectionViewModelBinder } from "./sectionViewModelBinder";
import { IModelBinder } from "@paperbits/common/editing";

export class SectionModule implements IInjectorModule {
    public register(injector: IInjector): void {
        injector.bind("emailSection", SectionViewModel);
        injector.bindToCollection("modelBinders", SectionModelBinder);
        injector.bindToCollection("viewModelBinders", SectionViewModelBinder);
    }
}