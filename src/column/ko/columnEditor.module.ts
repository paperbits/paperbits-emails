/**
 * @license
 * Copyright Paperbits. All Rights Reserved.
 *
 * Use of this source code is governed by a Commercial license that can be found in the LICENSE file and at https://paperbits.io/license/commercial.
 */

import { IInjectorModule, IInjector } from "@paperbits/common/injection";
import { IWidgetHandler } from "@paperbits/common/editing";
import { ColumnHandlers } from "../columnHandlers";
import { ColumnEditor } from "./columnEditor";

export class ColumnEditorModule implements IInjectorModule {
    public register(injector: IInjector): void {        
        injector.bind("emailColumnEditor", ColumnEditor);
        injector.bindToCollection<IWidgetHandler>("widgetHandlers", ColumnHandlers, "emailColumnHandler");
    }
}