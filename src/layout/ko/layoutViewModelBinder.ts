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
import { IEventManager } from "@paperbits/common/events";
import { ModelBinderSelector } from "@paperbits/common/widgets";
import { EmailService } from "../../emailService";
import { LayoutModelBinder } from "../../layout";
import { Bag } from "@paperbits/common";
// import { EmailContract } from "../emailContract";

export class LayoutViewModelBinder {
    constructor(
        private readonly viewModelBinderSelector: ViewModelBinderSelector,
        private readonly eventManager: IEventManager,
        private readonly emailService: EmailService,
        private readonly modelBinderSelector: ModelBinderSelector,
        private readonly emailLayoutModelBinder: LayoutModelBinder,
    ) {
        this.getLayoutViewModel = this.getLayoutViewModel.bind(this);
    }

    public createBinding(model: LayoutModel, viewModel: LayoutViewModel, emailTemplateKey: string): void {
        let savingTimeout;

        const updateContent = async (): Promise<void> => {
            const emailContent = await this.emailService.getEmailTemplateContent(emailTemplateKey);

            const contentContract = {
                nodes: []
            };

            model.widgets.forEach(section => {
                const modelBinder = this.modelBinderSelector.getModelBinderByModel(section);
                contentContract.nodes.push(modelBinder.modelToContract(section));
            });

            Object.assign(emailContent, contentContract);

            await this.emailService.updateEmailTemplateContent(emailTemplateKey, emailContent);
        };

        const scheduleUpdate = async (): Promise<void> => {
            clearTimeout(savingTimeout);
            savingTimeout = setTimeout(updateContent, 600);
        };

        const binding: IWidgetBinding = {
            name: "email-layout",
            model: model,
            provides: ["static"],
            applyChanges: () => {
                this.modelToViewModel(model, viewModel);
                this.eventManager.dispatchEvent("onContentUpdate");
            },
            onCreate: () => {
                // const metadata = this.routeHandler.getCurrentUrlMetadata();
                this.eventManager.addEventListener("onContentUpdate", scheduleUpdate);
            },
            onDispose: () => this.eventManager.removeEventListener("onContentUpdate", scheduleUpdate)
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

    public async getLayoutViewModel(emailTemplateKey: string): Promise<any> {
        const emailTemplateContract = await this.emailService.getEmailTemplateByKey(emailTemplateKey);
        const layoutModel = await this.emailLayoutModelBinder.contractToModel(emailTemplateContract);
        const layoutViewModel = await this.modelToViewModel(layoutModel);

        if (!layoutViewModel["widgetBinding"]) {
            this.createBinding(layoutModel, layoutViewModel, emailTemplateKey);
        }

        return layoutViewModel;
    }
}
