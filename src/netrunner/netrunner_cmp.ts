import {OnInit, Component, EventEmitter, Input, Output} from '@angular/core';
import {Subscription} from 'rxjs';

import {NetrunnerService} from './netrunner_service';
import {Card} from './types';

import * as _ from 'lodash';
import * as moment from 'moment';

@Component({
    selector: 'netrunner-cmp',
    templateUrl: 'netrunner.ng.html'
})
export class NetrunnerCmp implements OnInit {

    // We don't want to instance make netrunnerDB image loads until the user is probalby done searching
    @Input() imageDelayInSeconds: number = 5;
    public limit: number = 40;
    public showImages = true;
    public lastSearchTime: moment.Moment;

    public matchedCards: Array<Card>;
    public cardSegment: Array<Card>;


    constructor(public _netrunnerService: NetrunnerService) {

    }

    public ngOnInit() {

    }


    // Assume we would like to show the images, so just check a little after
    // the visibility should be present
    public resetVisibleImages() {
        this.showImages = false;
        setTimeout(() => {
            this.showImages = this.showImagesAfterDelay(this.imageDelayInSeconds);
        }, ((this.imageDelayInSeconds * 1000) + 200));
    }

    public showImagesAfterDelay(delayImageLoadInSeconds: number) {
        console.log("Check image delay", this.imageDelayInSeconds);
        if (this.lastSearchTime) {
            let seconds = moment.duration(moment().diff(this.lastSearchTime)).seconds();
            if (seconds >= delayImageLoadInSeconds) {
                return true;
            } else {
                return false;
            }
        }
        return false;
    }

    public changePage(evt) {
        console.log("Change page", evt);
    }

    public onCardsMatch(evt) {
        console.log("On Cards Match", evt);
        this.lastSearchTime = moment();
        this.resetVisibleImages();

        const cards = _.get(evt, 'cards') || [];
        this.matchedCards = cards;
        this.cardSegment = cards.length > this.limit ? cards.slice(0, this.limit) : cards;
    }
}
