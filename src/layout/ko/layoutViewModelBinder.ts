/**
 * @license
 * Copyright Paperbits. All Rights Reserved.
 *
 * Use of this source code is governed by a Commercial license that can be found in the LICENSE file and at https://paperbits.io/license/commercial.
 */

import { LayoutViewModel } from "./layoutViewModel";
import { LayoutModel } from "../layoutModel";
import { ViewModelBinderSelector } from "@paperbits/core/ko/viewModelBinderSelector";
import { IWidgetBinding } from "@paperbits/common/editing";
import { EventManager } from "@paperbits/common/events";
import { ModelBinderSelector } from "@paperbits/common/widgets";
import { EmailService } from "../../emailService";
import { LayoutModelBinder } from "../../layout";
import { Bag } from "@paperbits/common";
// import { EmailContract } from "../emailContract";

export class LayoutViewModelBinder {
    constructor(
        private readonly viewModelBinderSelector: ViewModelBinderSelector,
        private readonly eventManager: EventManager,
        private readonly emailService: EmailService,
        private readonly modelBinderSelector: ModelBinderSelector,
        private readonly emailLayoutModelBinder: LayoutModelBinder,
    ) {
        this.getLayoutViewModel = this.getLayoutViewModel.bind(this);
    }

    public createBinding(model: LayoutModel, viewModel: LayoutViewModel, emailTemplateKey: string, bindingContext?: Bag<any>): void {
        let savingTimeout;

        const updateContent = async (): Promise<void> => {
            const contentContract = {
                type: "email-layout",
                nodes: []
            };

            model.widgets.forEach(section => {
                const modelBinder = this.modelBinderSelector.getModelBinderByModel(section);
                contentContract.nodes.push(modelBinder.modelToContract(section));
            });

            await this.emailService.updateEmailTemplateContent(emailTemplateKey, contentContract);
        };

        const scheduleUpdate = async (): Promise<void> => {
            clearTimeout(savingTimeout);
            savingTimeout = setTimeout(updateContent, 600);
        };

        const binding: IWidgetBinding<LayoutModel> = {
            name: "email-layout",
            displayName: "Layout",
            readonly: bindingContext ? bindingContext.readonly : false,
            model: model,
            draggable: false,
            applyChanges: async () => {
                await this.modelToViewModel(model, viewModel, bindingContext);
                this.eventManager.dispatchEvent("onContentUpdate");
            },
            onCreate: () => {
                this.eventManager.addEventListener("onContentUpdate", scheduleUpdate);
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
