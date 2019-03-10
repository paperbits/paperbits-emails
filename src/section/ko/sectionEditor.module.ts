/**
 * @license
 * Copyright Paperbits. All Rights Reserved.
 *
 * Use of this source code is governed by a Commercial license that can be found in the LICENSE file and at style-guidehttps://paperbits.io/license/mit.
 */

import { IInjectorModule, IInjector } from "@paperbits/common/injection";
import { IWidgetHandler } from "@paperbits/common/editing";
import { SectionLayoutSelector } from "./sectionLayoutSelector";
import { SectionHandlers } from "../sectionHandlers";
import { SectionEditor } from "./sectionEditor";


export class SectionEditorModule implements IInjectorModule {
    public register(injector: IInjector): void {
        injector.bind("emailSectionLayoutSelector", SectionLayoutSelector);
        injector.bind("emailSectionEditor", SectionEditor);
        injector.bindToCollection<IWidgetHandler>("widgetHandlers", SectionHandlers, "emailSectionHandler");
    }
}