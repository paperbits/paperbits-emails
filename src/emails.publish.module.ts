import { EmailPublisher } from "./publishing/emailPublisher";
import { IInjectorModule, IInjector } from "@paperbits/common/injection";

export class EmailsPublishModule implements IInjectorModule {
    public register(injector: IInjector): void {
        injector.bindToCollection("publishers", EmailPublisher);
    }
}

