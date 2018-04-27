import {OnInit, ViewChild, Component, EventEmitter, Input, Output, HostListener} from '@angular/core';
import {Observable} from 'rxjs/Observable';
import {Subscription} from 'rxjs/Subscription';

import {NetrunnerService} from './netrunner_service';
import {Cycle, Pack, Card} from './types';

import * as _ from 'lodash';
import * as moment from 'moment';

@Component({
    selector: 'netrunner-cmp',
    templateUrl: 'netrunner.ng.html'
})
export class NetrunnerCmp implements OnInit {

    public throttleFilter: Subscription;
    public searchText: string;
    @ViewChild('cardSearch') cardSearch;

    @Input() allCards: Array<Card>;
    @Input() bannedCards: Array<Card>;
    @Input() legalCards: Array<Card>;

    // Should probably assign this shit and not double init packs and cycles... save probably 10ms!
    public cycles: Array<Cycle>;
    public packs: Array<Pack>;
    public matchedCards: Array<Card>;
    public matchedBans: Array<Card>;

    public searchFullText: boolean = false;
    public errMsg: string;

    // We don't want to instance make netrunnerDB image loads until the user is probalby done searching
    @Input() imageDelayInSeconds: number = 5;
    public showImages = false;
    public lastSearchTime: moment.Moment;

    constructor(public _netrunnerService: NetrunnerService) {

    }

    public ngOnInit() {
        console.log("Loading up the netrunner component.", this.cardSearch);
        if (!this.allCards) { // Useful if you want to test specific cases
            this.loadCards();
        }
    }

    public loadCards() {
        this.allCards = this._netrunnerService.getDistinctNamedCards();
    }

    public searchCards(textToFind: string) {
        this.matchedBans = null;
        this.matchedCards = null;

        // Set the last search call, then setup a timeout to check when we should show images.
        this.lastSearchTime = moment();
        this.resetVisibleImages();

        console.log("Search text", textToFind);
        setTimeout(() => {
            if (!_.isString(textToFind) || textToFind.length === 0) {
                return;
            }
            this.matchedCards = this.checkCards(this.allCards, textToFind, 20);
        }, 10);
    }

    // Assume we would like to show the images, so just check a little after the visibility should be present
    public resetVisibleImages() {
        this.showImages = false;
        setTimeout(() => {
            this.loadImageDelay(this.imageDelayInSeconds);
        }, ((this.imageDelayInSeconds * 1000) + 200));
    }

    public loadImageDelay(delayImageLoadInSeconds: number) {
        console.log("Check image delay", this.imageDelayInSeconds);
        if (this.lastSearchTime) {
            let seconds = moment.duration(moment().diff(this.lastSearchTime)).seconds()
            if (seconds >= delayImageLoadInSeconds) {
                this.showImages = true;
            } else {
                this.showImages = false;
            }
        }
    }

    public checkCards(cards: Array<Card>, textToFind: string, limit: number = 20) {
        console.log("Searching for cards with: ", textToFind);
        this.errMsg = null;
        let re = null;
        try {
            re = new RegExp(textToFind, 'igm');
        } catch (err) {
            this.errMsg = 'Invalid Regex';
            console.error("Invalid regex detected in textToFind");
        }
        let matchingCards  = _.filter(cards, card => {
            return card.match(textToFind, re, this.searchFullText);
        });
        return matchingCards && matchingCards.length > limit ? matchingCards.slice(0, limit) : matchingCards;
    }

    public setupFilter() {
        if (!this.throttleFilter && this.cardSearch) {
            this.throttleFilter = this.cardSearch.valueChanges
                .debounceTime(500)
                .subscribe(
                    params => { this.searchCards(_.get(params, 'searchText') || ''); },
                    error => { console.error("Failed to setup the card filter correctly", error); }
                );
        }
    }
}
