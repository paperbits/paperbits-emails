/**
 * @license
 * Copyright Paperbits. All Rights Reserved.
 *
 * Use of this source code is governed by a Commercial license that can be found in the LICENSE file and at https://paperbits.io/license/commercial.
 */

import { LayoutViewModel } from "./layoutViewModel";
import { LayoutModel } from "../layoutModel";
import { ViewModelBinderSelector } from "@paperbits/core/ko/viewModelBinderSelector";
import { CollectionModelBinder, IWidgetBinding } from "@paperbits/common/editing";
import { EventManager, Events } from "@paperbits/common/events";
import { EmailService } from "../../emailService";
import { LayoutModelBinder } from "../../layout";
import { Bag } from "@paperbits/common";


export class LayoutViewModelBinder {
    constructor(
        private readonly viewModelBinderSelector: ViewModelBinderSelector,
        private readonly eventManager: EventManager,
        private readonly emailService: EmailService,
        private readonly containerModelBinder: CollectionModelBinder,
        private readonly emailLayoutModelBinder: LayoutModelBinder,
    ) {
        this.getLayoutViewModel = this.getLayoutViewModel.bind(this);
    }

    public createBinding(model: LayoutModel, viewModel: LayoutViewModel, emailTemplateKey: string, bindingContext?: Bag<any>): void {
        let savingTimeout;

        const updateContent = async (): Promise<void> => {
            const contentContract = {
                type: "email-layout",
                nodes: this.containerModelBinder.getChildContracts(model.widgets)
            };

            await this.emailService.updateEmailTemplateContent(emailTemplateKey, contentContract);
        };

        const scheduleUpdate = async (): Promise<void> => {
            clearTimeout(savingTimeout);
            savingTimeout = setTimeout(updateContent, 600);
        };

        const binding: IWidgetBinding<LayoutModel, LayoutViewModel> = {
            name: "email-layout",
            displayName: "Layout",
            layer: bindingContext?.layer,
            model: model,
            draggable: false,
            applyChanges: async () => {
                await this.modelToViewModel(model, viewModel, bindingContext);
                this.eventManager.dispatchEvent(Events.ContentUpdate);
            },
            onCreate: () => {
                this.eventManager.addEventListener(Events.ContentUpdate, scheduleUpdate);
            },
        };

        viewModel["widgetBinding"] = binding;
    }

    public async modelToViewModel(model: LayoutModel, viewModel?: LayoutViewModel, bindingContext?: Bag<any>): Promise<LayoutViewModel> {
        if (!viewModel) {
            viewModel = new LayoutViewModel();
        }

        const viewModels = [];

        for (const widgetModel of model.widgets) {
            const widgetViewModelBinder = this.viewModelBinderSelector.getViewModelBinderByModel(widgetModel);
            const widgetViewModel = await widgetViewModelBinder.modelToViewModel(widgetModel, null, bindingContext);

            viewModels.push(widgetViewModel);
        }

        viewModel.widgets(viewModels);

        return viewModel;
    }

    public canHandleModel(model: LayoutModel): boolean {
        return model instanceof LayoutModel;
    }

    public async getLayoutViewModel(emailTemplateKey: string, bindingContext?: Bag<any>): Promise<any> {
        const emailTemplateContract = await this.emailService.getEmailTemplateByKey(emailTemplateKey);
        const layoutModel = await this.emailLayoutModelBinder.contractToModel(emailTemplateContract, bindingContext);
        const layoutViewModel = await this.modelToViewModel(layoutModel, null, bindingContext);

        if (!layoutViewModel["widgetBinding"]) {
            this.createBinding(layoutModel, layoutViewModel, emailTemplateKey, bindingContext);
        }

        return layoutViewModel;
    }
}
