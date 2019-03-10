/**
 * @license
 * Copyright Paperbits. All Rights Reserved.
 *
 * Use of this source code is governed by a Commercial license that can be found in the LICENSE file and at style-guidehttps://paperbits.io/license/mit.
 */

import * as ko from "knockout";
import template from "./sectionEditor.html";
import { MediaContract } from "@paperbits/common/media/mediaContract";
import { BackgroundModel } from "@paperbits/common/widgets/background/backgroundModel";
import { Component, OnMounted, Param, Event } from "@paperbits/common/ko/decorators";
import { SectionModel } from "../sectionModel";

@Component({
    selector: "email-layout-section-editor",
    template: template,
    injectable: "sectionEditor"
})
export class SectionEditor {
    public readonly layout: ko.Observable<string>;
    public readonly padding: ko.Observable<string>;
    public readonly snap: ko.Observable<string>;
    public readonly backgroundSize: ko.Observable<string>;
    public readonly backgroundPosition: ko.Observable<string>;
    public readonly backgroundColorKey: ko.Observable<string>;
    public readonly backgroundRepeat: ko.Observable<string>;
    public readonly backgroundHasPicture: ko.Computed<boolean>;
    public readonly backgroundHasColor: ko.Computed<boolean>;
    public readonly background: ko.Observable<BackgroundModel>;

    constructor() {
        this.layout = ko.observable<string>();
        this.padding = ko.observable<string>();
        this.snap = ko.observable<string>();
        this.backgroundSize = ko.observable<string>();
        this.backgroundPosition = ko.observable<string>();
        this.backgroundColorKey = ko.observable<string>();
        this.backgroundRepeat = ko.observable<string>();
        this.background = ko.observable<BackgroundModel>();
        
        this.backgroundHasPicture = ko.pureComputed(() =>
            this.background() &&
            this.background().sourceKey &&
            this.background().sourceKey !== null
        );

        this.backgroundHasColor = ko.pureComputed(() =>
            this.background() &&
            this.background().colorKey &&
            this.background().colorKey !== null
        );
    }

    @Param()
    public model: SectionModel;

    @Event()
    public onChange: (model: SectionModel) => void;

    @OnMounted()
    public initialize(): void {
        this.layout(this.model.container);
        this.padding(this.model.padding);
        this.snap(this.model.snap);

        if (this.model.background) {
            this.backgroundColorKey(this.model.background.colorKey);
            this.backgroundPosition(this.model.background.position);
            this.backgroundSize(this.model.background.size);
            this.backgroundRepeat(this.model.background.repeat);
        }

        this.background(this.model.background);

        this.layout.subscribe(this.applyChanges.bind(this));
        this.padding.subscribe(this.applyChanges.bind(this));
        this.snap.subscribe(this.applyChanges.bind(this));
        this.backgroundSize.subscribe(this.applyChanges.bind(this));
        this.backgroundPosition.subscribe(this.applyChanges.bind(this));
        this.backgroundColorKey.subscribe(this.applyChanges.bind(this));
        this.backgroundRepeat.subscribe(this.applyChanges.bind(this));
    }

    /**
     * Collecting changes from the editor UI and invoking callback method.
     */
    private applyChanges(): void {
        this.model.container = this.layout();
        this.model.padding = this.padding();
        this.model.snap = this.snap();

        if (this.model.background) {
            this.model.background.colorKey = this.backgroundColorKey();
            this.model.background.size = this.backgroundSize();
            this.model.background.position = this.backgroundPosition();
            this.model.background.repeat = this.backgroundRepeat();
            this.background(this.model.background);
        }

        this.onChange(this.model);
    }

    public onMediaSelected(media: MediaContract): void {
        this.model.background = this.model.background || {};
        if (media) {
            this.model.background.sourceKey = media.key;
            this.model.background.sourceUrl = media.downloadUrl;
            this.model.background.sourceType = "picture";
        } else {
            this.model.background.sourceKey = undefined;
            this.model.background.sourceUrl = undefined;
            this.model.background.sourceType = undefined;
        }
        this.background(this.model.background);
        this.onChange(this.model);
    }

    public onColorSelected(colorKey: string): void {
        this.model.background = this.model.background || {};
        this.model.background.colorKey = colorKey;

        this.background(this.model.background);
        this.onChange(this.model);
    }

    public clearBackground(): void {
        this.model.background = null;

        this.backgroundColorKey(null);
        this.background(null);
        this.onChange(this.model);
    }

    public comingSoon(): void {
        alert("This feature is coming soon!");
    }
}
