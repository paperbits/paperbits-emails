/**
 * @license
 * Copyright Paperbits. All Rights Reserved.
 *
 * Use of this source code is governed by a Commercial license that can be found in the LICENSE file and at https://paperbits.io/license.
 */

import { IInjectorModule, IInjector } from "@paperbits/common/injection";
import { ModelBinderSelector } from "@paperbits/common/widgets";
import { SectionLayoutSelector } from "./sectionLayoutSelector";
import { SectionEditor } from "./sectionEditor";


export class SectionEditorModule implements IInjectorModule {
    public register(injector: IInjector): void {
        injector.bindComponent("emailSectionLayoutSelector", (ctx: IInjector, params: {}) => {
            const modelBinderSelector = ctx.resolve<ModelBinderSelector>("modelBinderSelector");
            return new SectionLayoutSelector(modelBinderSelector, params["onSelect"]);
        });

        injector.bind("sectionEditor", SectionEditor);
    }
}