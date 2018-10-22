/**
 * @license
 * Copyright Paperbits. All Rights Reserved.
 *
 * Use of this source code is governed by a Commercial license that can be found in the LICENSE file and at https://paperbits.io/license.
 */

import { LayoutViewModel } from "./layoutViewModel";
import { LayoutModel } from "../layoutModel";
import { ViewModelBinderSelector } from "@paperbits/core/ko/viewModelBinderSelector";
import { IWidgetBinding } from "@paperbits/common/editing";
import { IEventManager } from "@paperbits/common/events";
import { IRouteHandler } from "@paperbits/common/routing";
import { IFileService } from "@paperbits/common/files";
import { ModelBinderSelector } from "@paperbits/common/widgets";
import { EmailService } from "../../emailService";
import { LayoutModelBinder } from "../../layout";
// import { EmailContract } from "../emailContract";

export class LayoutViewModelBinder {
    constructor(
        private readonly viewModelBinderSelector: ViewModelBinderSelector,
        private readonly eventManager: IEventManager,
        private readonly fileService: IFileService,
        private readonly emailService: EmailService,
        private readonly routeHandler: IRouteHandler,
        private readonly modelBinderSelector: ModelBinderSelector,
        private readonly emailLayoutModelBinder: LayoutModelBinder,
    ) { 
        this.getLayoutViewModel = this.getLayoutViewModel.bind(this);
    }

    public createBinding(model: LayoutModel, viewModel: LayoutViewModel): void {
        let savingTimeout;

        const updateContent = async (): Promise<void> => {
            const emailContract = await this.emailService.getEmailTemplateByKey("emailTemplates/c17ea920-cc6b-b3b5-6da4-ef8d19b758ff");
            const file = await this.fileService.getFileByKey(emailContract.contentKey);

            const contentContract = {
                nodes: []
            };

            model.widgets.forEach(section => {
                const modelBinder = this.modelBinderSelector.getModelBinderByModel(section);
                contentContract.nodes.push(modelBinder.modelToContract(section));
            });

            Object.assign(file, contentContract);

            await this.fileService.updateFile(file);
            console.log("EMAIL");
        };

        const scheduleUpdate = async (): Promise<void> => {
            clearTimeout(savingTimeout);
            savingTimeout = setTimeout(updateContent, 600);
        };

        const binding: IWidgetBinding = {
            name: "email-layout",
            model: model,
            provides: ["static"],
            // handler: LayoutHandlers,
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

    public modelToViewModel(model: LayoutModel, viewModel?: LayoutViewModel): LayoutViewModel {
        if (!viewModel) {
            viewModel = new LayoutViewModel();
        }

        const sectionViewModels = model.widgets
            .map(widgetModel => {
                const widgetViewModelBinder = this.viewModelBinderSelector.getViewModelBinderByModel(widgetModel);

                if (!widgetViewModelBinder) {
                    return null;
                }

                return widgetViewModelBinder.modelToViewModel(widgetModel);
            })
            .filter(x => x !== null);

        viewModel.widgets(sectionViewModels);

        if (!viewModel["widgetBinding"]) {
            this.createBinding(model, viewModel);
        }

        return viewModel;
    }

    public canHandleModel(model: LayoutModel): boolean {
        return model instanceof LayoutModel;
    }

    public async getLayoutViewModel(): Promise<any> {
        const emailTemplateContract = await this.emailService.getEmailTemplateByKey("emailTemplates/c17ea920-cc6b-b3b5-6da4-ef8d19b758ff");
        // const emailTemplate = await this.emailService.getEmailTemplateByKey(emailTemplateKey || "emailTemplates/c17ea920-cc6b-b3b5-6da4-ef8d19b758ff");

        const layoutModel = await this.emailLayoutModelBinder.contractToModel(emailTemplateContract);
        const layoutViewModel = this.modelToViewModel(layoutModel);

        return layoutViewModel;
    }
}
