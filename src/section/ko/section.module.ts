/**
 * @license
 * Copyright Paperbits. All Rights Reserved.
 *
 * Use of this source code is governed by a Commercial license that can be found in the LICENSE file and at https://paperbits.io/license.
 */

import { IInjectorModule, IInjector } from "@paperbits/common/injection";
import { IViewModelBinder } from "@paperbits/common/widgets";
import { SectionViewModel } from "./sectionViewModel";
import { SectionModelBinder } from "../sectionModelBinder";
import { SectionViewModelBinder } from "./sectionViewModelBinder";
import { IModelBinder } from "@paperbits/common/editing";

export class SectionModule implements IInjectorModule {
    public register(injector: IInjector): void {
        injector.bind("emailSection", SectionViewModel);
        injector.bind("emailSectionModelBinder", SectionModelBinder);
        injector.bind("emailSectionViewModelBinder", SectionViewModelBinder);

        const modelBinders = injector.resolve<IModelBinder[]>("modelBinders");
        modelBinders.push(injector.resolve("emailSectionModelBinder"));

        const viewModelBinders = injector.resolve<IViewModelBinder<any, any>[]>("viewModelBinders");
        viewModelBinders.push(injector.resolve("emailSectionViewModelBinder"));
    }
}